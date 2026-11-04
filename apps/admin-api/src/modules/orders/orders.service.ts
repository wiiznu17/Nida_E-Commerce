import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { MailerService } from '../../core/mailer/mailer.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { CouponsService } from '../coupons/coupons.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import type {
  OrderDetailPayload,
  ShipmentWithLogs,
} from './types/orders.payloads.js';
import type {
  ApiOrder,
  ApiOrderItem,
  ApiProductSnapshot,
  ApiOrderAddress,
  ApiShipment,
  ShipmentTimelineEntry,
  TrackingResult,
  CarrierCode,
  PaginatedOrdersResponse,
  AdminOrderStatusCounts,
  PaginatedCancellationsResponse,
  AdminCancellationStatusCounts,
  PaginatedReturnsResponse,
  AdminReturnStatusCounts,
  ApiTaxInvoice,
  ApiTaxInvoiceRequest,
  ApiTaxInvoiceItem,
  ApiTaxInvoiceSeller,
  ApiAdminUser,
} from '@repo/types';
import {
  AuditActionType,
  AdminPermission,
  TaxInvoicePayerType,
  TaxInvoiceBranchType,
} from '@repo/types';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import {
  OrderStatus,
  StockChangeType,
  PaymentStatus,
  ShipmentStatus,
  PaymentMethod,
  CancellationRequestStatus,
  ReturnStatus,
  PointChangeType,
  type Prisma,
} from '@repo/database';

import {
  validateOrderStatusTransition,
  type AdminOrderQueryInput,
  type AdminCancellationQueryInput,
  type AdminReturnQueryInput,
} from '@repo/validators';
import { CarrierMockService } from './carrier/index.js';
import { LogisticsService } from './logistics/index.js';
import { PaymentGatewayService } from './payment-gateway/index.js';
import { OrderLifecycleProducerService } from '../order-lifecycle/order-lifecycle-producer.service.js';
import {
  ORDER_TIMEOUT_MS,
  type ProcessRefundDto,
  type ReviewCancellationRequestDto,
  type ReviewReturnRequestDto,
  type ApiOrderCancellationRequest,
  type ApiReturnRequest,
  type ApiRefundSummary,
} from '@repo/types';

const STANDARD_SHIPPING_FEE = 50;

export const NIDA_SELLER_TAX_INFO: ApiTaxInvoiceSeller = {
  companyName: 'บริษัท นิ ดา แบรนด์ จำกัด (NIDA BRAND CO., LTD.)',
  taxId: '0105566088888',
  branch: 'สำนักงานใหญ่ (Headquarters / 00000)',
  address:
    '888/88 อาคาร นิวานิช ชั้น 18 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110',
  phone: '02-123-4567',
};

const ORDER_INCLUDE = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      },
    },
  },
  payment: true,
  refunds: { orderBy: { createdAt: 'desc' as const } },
  cancellationRequests: { orderBy: { createdAt: 'desc' as const } },
  returnRequests: {
    include: { items: true },
    orderBy: { createdAt: 'desc' as const },
  },
  shipments: {
    include: {
      logs: { orderBy: { logTimestamp: 'desc' as const } },
    },
  },
  taxInvoice: true,
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
    private readonly carrierMockService: CarrierMockService,
    private readonly logisticsService: LogisticsService,
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly orderLifecycleProducer: OrderLifecycleProducerService,
    @Optional() private readonly auditLog?: AuditLogService,
    @Optional() private readonly mailerService?: MailerService,
  ) {}

  async createOrder(dto: CreateOrderDto, adminId?: string): Promise<ApiOrder> {
    const { items, shippingAddress, paymentMethod, couponCode, userId } = dto;

    const calc = await this.couponsService.calculateCheckout({
      items,
      couponCode,
      userId,
    });

    const variantIds = items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          include: {
            category: true,
            images: true,
          },
        },
        inventoryItem: true,
      },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const hasPreorderItems = variants.some((v) => v.product.isPreorder);

    for (const item of items) {
      const v = variantMap.get(item.variantId)!;
      if (!v.product.isPreorder) {
        const available = v.inventoryItem?.quantityAvailable ?? 0;
        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${v.product.name} (${v.colorName}/${v.size})". Available: ${available}, Requested: ${item.quantity}`,
          );
        }
      }
    }

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `NIDA-${datePart}-${randomPart}`;

    const createdOrder = await this.prisma.$transaction(
      async (tx) => {
        let couponId: string | null = null;
        if (calc.couponApplied) {
          const c = await tx.promotionCoupon.findUnique({
            where: { code: calc.couponApplied.code },
          });
          if (c) {
            if (c.currentUsageCount >= c.totalUsageLimit) {
              throw new BadRequestException('Coupon usage limit reached');
            }
            couponId = c.id;
          }
        }

        const originalShippingFee = STANDARD_SHIPPING_FEE;
        const shippingDiscount = Math.max(
          0,
          originalShippingFee - calc.shippingFee,
        );

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: userId ?? null,
            status: OrderStatus.PENDING,
            hasPreorderItems,
            subtotal: calc.subtotal,
            discountTotal: calc.discountTotal,
            originalShippingFee,
            shippingDiscount,
            shippingFee: calc.shippingFee,
            taxAmount: calc.taxAmount,
            totalAmount: calc.totalAmount,
            currency: 'THB',
            shippingAddressSnapshot: JSON.parse(
              JSON.stringify(shippingAddress),
            ),
            promoCodeUsed: calc.couponApplied?.code ?? null,
            couponId,
          },
        });

        for (const calcItem of calc.items) {
          const v = variantMap.get(calcItem.variantId)!;
          const isPreorder = v.product.isPreorder;

          const primaryImage =
            v.product.images?.find((img) => img.isPrimary)?.imageUrl ??
            v.product.images?.[0]?.imageUrl ??
            null;
          const productSnapshot: ApiProductSnapshot = {
            productId: v.product.id,
            name: v.product.name,
            nameTh: v.product.nameTh,
            slug: v.product.slug,
            department: v.product.category?.department,
            categoryName: v.product.category?.name,
            colorName: v.colorName,
            colorNameTh: v.colorNameTh,
            colorHex: v.colorHex,
            size: v.size,
            basePrice: Number(v.product.basePrice),
            originalPrice: v.product.originalPrice
              ? Number(v.product.originalPrice)
              : null,
            materialsCare: v.product.materialsCare,
            materialsCareTh: v.product.materialsCareTh,
            description: v.product.description,
            descriptionTh: v.product.descriptionTh,
          };

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              variantId: v.id,
              productNameSnapshot: calcItem.productName,
              variantInfoSnapshot: calcItem.variantInfo,
              imageUrlSnapshot: primaryImage,
              skuCodeSnapshot: v.skuCode,
              productSnapshot: JSON.parse(JSON.stringify(productSnapshot)),
              unitPrice: calcItem.unitPrice,
              expectedPrice: calcItem.unitPrice,
              quantity: calcItem.quantity,
              subtotal: calcItem.subtotal,
              discountShare: calcItem.discountShare,
              netPrice: calcItem.netPrice,
              isPreorder,
              expectedShipDate: v.product.preorderReleaseDate ?? null,
            },
          });

          if (isPreorder) {
            if (v.inventoryItem) {
              await tx.inventoryItem.update({
                where: { id: v.inventoryItem.id },
                data: { preorderBooked: { increment: calcItem.quantity } },
              });
            }
          } else if (v.inventoryItem) {
            const updateResult = await tx.inventoryItem.updateMany({
              where: {
                id: v.inventoryItem.id,
                quantityAvailable: { gte: calcItem.quantity },
              },
              data: {
                quantityAvailable: { decrement: calcItem.quantity },
              },
            });

            if (updateResult.count === 0) {
              throw new BadRequestException(
                `Insufficient stock for "${v.product.name} (${v.colorName}/${v.size})"`,
              );
            }

            const updatedInv = await tx.inventoryItem.findUnique({
              where: { id: v.inventoryItem.id },
              select: { quantityAvailable: true },
            });

            await tx.stockMovement.create({
              data: {
                variantId: v.id,
                changeType: StockChangeType.ORDER_DEDUCT,
                quantityChange: -calcItem.quantity,
                balanceAfter: updatedInv?.quantityAvailable ?? 0,
                reasonNote: `Order #${orderNumber}`,
              },
            });
          }
        }

        if (couponId && calc.couponApplied) {
          await tx.couponRedemption.create({
            data: {
              couponId,
              userId: userId ?? null,
              orderId: order.id,
              discountGranted: calc.couponApplied.discountAmount,
            },
          });

          await tx.promotionCoupon.update({
            where: { id: couponId },
            data: { currentUsageCount: { increment: 1 } },
          });
        }

        await tx.payment.create({
          data: {
            orderId: order.id,
            paymentMethod,
            amount: calc.totalAmount,
            currency: 'THB',
            status: PaymentStatus.PENDING,
          },
        });

        return order;
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    void this.auditLog?.recordLog({
      adminId: adminId ?? null,
      actionType: AuditActionType.CREATE,
      targetTable: 'orders',
      targetId: createdOrder.id,
      permission: AdminPermission.ORDERS_FULFILL,
      newValuesJson: {
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        totalAmount: Number(createdOrder.totalAmount),
        currency: createdOrder.currency,
      },
    });

    return this.getOrderByNumber(createdOrder.orderNumber);
  }

  async getOrderByNumber(orderNumber: string): Promise<ApiOrder> {
    let order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      order = await this.prisma.order.findUnique({
        where: { id: orderNumber },
        include: ORDER_INCLUDE,
      });
    }

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    return this.mapOrder(order as unknown as OrderDetailPayload);
  }

  async getOrders(
    query?: AdminOrderQueryInput,
  ): Promise<PaginatedOrdersResponse> {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.OrderWhereInput = {};

    if (query?.status && query.status !== 'ALL') {
      if (query.status === 'CANCELLATIONS') {
        where.cancellationRequests = {
          some: { status: 'PENDING' },
        };
      } else if (query.status === 'RETURNS') {
        where.returnRequests = {
          some: { status: { in: ['REQUESTED', 'APPROVED'] } },
        };
      } else {
        where.status = query.status as OrderStatus;
      }
    }

    if (query?.paymentMethod && query.paymentMethod !== 'ALL') {
      where.payment = {
        paymentMethod: query.paymentMethod as PaymentMethod,
      };
    }

    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: 'insensitive' } },
        { promoCodeUsed: { contains: s, mode: 'insensitive' } },
        { user: { email: { contains: s, mode: 'insensitive' } } },
        { user: { firstName: { contains: s, mode: 'insensitive' } } },
        { user: { lastName: { contains: s, mode: 'insensitive' } } },
        {
          shipments: {
            some: {
              trackingNumber: { contains: s, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    let orderBy: Prisma.OrderOrderByWithRelationInput = { placedAt: 'desc' };
    if (query?.sortBy === 'oldest') {
      orderBy = { placedAt: 'asc' };
    } else if (query?.sortBy === 'amount_desc') {
      orderBy = { totalAmount: 'desc' };
    } else if (query?.sortBy === 'amount_asc') {
      orderBy = { totalAmount: 'asc' };
    }

    const [orders, total, groupedStatus, pendingCancellations, pendingReturns] =
      await Promise.all([
        this.prisma.order.findMany({
          where,
          include: ORDER_INCLUDE,
          orderBy,
          skip,
          take,
        }),
        this.prisma.order.count({ where }),
        this.prisma.order.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.orderCancellationRequest.count({
          where: { status: 'PENDING' },
        }),
        this.prisma.returnRequest.count({
          where: { status: { in: ['REQUESTED', 'APPROVED'] } },
        }),
      ]);

    const statusMap = Object.fromEntries(
      groupedStatus.map((g) => [g.status, g._count.id]),
    );

    const totalOrdersCount = groupedStatus.reduce(
      (sum, g) => sum + g._count.id,
      0,
    );

    const statusCounts: AdminOrderStatusCounts = {
      all: totalOrdersCount,
      paid: statusMap['PAID'] ?? 0,
      processing: statusMap['PROCESSING'] ?? 0,
      shipped: statusMap['SHIPPED'] ?? 0,
      delivered: statusMap['DELIVERED'] ?? 0,
      completed: statusMap['COMPLETED'] ?? 0,
      cancelled: statusMap['CANCELLED'] ?? 0,
      pendingCancellations,
      pendingReturns,
    };

    return {
      items: orders.map((o) =>
        this.mapOrder(o as unknown as OrderDetailPayload),
      ),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
      statusCounts,
    };
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    courierName?: string,
    trackingNumber?: string,
    transactionReference?: string,
    overrideReason?: string,
    adminId?: string,
  ): Promise<ApiOrder> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );
    const existing = await this.prisma.order.findFirst({
      where: isUuid
        ? { OR: [{ id }, { orderNumber: id }] }
        : { orderNumber: id },
      include: {
        shipments: {
          orderBy: { createdAt: 'desc' },
        },
        payment: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Order "${id}" not found`);
    }

    const hasTracking = Boolean(
      trackingNumber?.trim() ||
      existing.shipments?.some((s) => Boolean(s.trackingNumber?.trim())),
    );

    const validation = validateOrderStatusTransition(
      existing.status as OrderStatus,
      status,
      hasTracking,
    );

    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    if (courierName && trackingNumber) {
      const existingShipment = existing.shipments?.[0];
      if (existingShipment) {
        await this.prisma.shipment.update({
          where: { id: existingShipment.id },
          data: {
            courierName,
            trackingNumber: trackingNumber.trim(),
            status: ShipmentStatus.LABEL_CREATED,
          },
        });
      } else {
        await this.prisma.shipment.create({
          data: {
            orderId: existing.id,
            courierName,
            trackingNumber: trackingNumber.trim(),
            status: ShipmentStatus.LABEL_CREATED,
          },
        });
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (status === OrderStatus.PAID) {
        const effectiveRef =
          transactionReference?.trim() ||
          existing.payment?.transactionReference ||
          undefined;

        if (existing.payment) {
          await tx.payment.update({
            where: { id: existing.payment.id },
            data: {
              status: PaymentStatus.CAPTURED,
              paidAt: new Date(),
              transactionReference: effectiveRef,
            },
          });
        } else {
          await tx.payment.create({
            data: {
              orderId: existing.id,
              paymentMethod: PaymentMethod.CREDIT_CARD,
              amount: existing.totalAmount,
              currency: existing.currency,
              status: PaymentStatus.CAPTURED,
              paidAt: new Date(),
              transactionReference: effectiveRef,
            },
          });
        }

        if (existing.taxInvoiceRequest) {
          await this.issueTaxInvoiceForOrder(tx, existing.id);
        }
      }

      if (status === OrderStatus.COMPLETED && existing.userId) {
        const pointsToEarn = Math.floor(Number(existing.totalAmount) / 100);
        if (pointsToEarn > 0) {
          try {
            const existingPoints = await tx.pointTransaction.findFirst({
              where: {
                orderId: existing.id,
                changeType: PointChangeType.EARNED_ORDER,
              },
            });
            if (!existingPoints) {
              const user = await tx.user.findUnique({
                where: { id: existing.userId },
                select: { points: true },
              });
              const currentPoints = user?.points ?? 0;
              const newBalance = currentPoints + pointsToEarn;

              await tx.pointTransaction.create({
                data: {
                  userId: existing.userId,
                  orderId: existing.id,
                  changeType: PointChangeType.EARNED_ORDER,
                  pointsChange: pointsToEarn,
                  balanceAfter: newBalance,
                  description: `Loyalty points earned from completed order #${existing.orderNumber}`,
                },
              });

              await tx.user.update({
                where: { id: existing.userId },
                data: {
                  points: newBalance,
                },
              });
            }
          } catch (err: unknown) {
            console.warn('[AdminOrdersService] Loyalty points error:', err);
          }
        }
      }

      if (status === OrderStatus.CANCELLED) {
        const itemsWithVariant = await tx.orderItem.findMany({
          where: { orderId: existing.id },
        });
        for (const item of itemsWithVariant) {
          if (!item.variantId) continue;
          await tx.inventoryItem.updateMany({
            where: { variantId: item.variantId },
            data: { quantityAvailable: { increment: item.quantity } },
          });
          const updatedInv = await tx.inventoryItem.findUnique({
            where: { variantId: item.variantId },
            select: { quantityAvailable: true },
          });
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              changeType: StockChangeType.RESTOCK,
              quantityChange: item.quantity,
              balanceAfter: updatedInv?.quantityAvailable ?? 0,
              reasonNote:
                overrideReason?.trim() ||
                `Admin order cancellation #${existing.orderNumber}`,
            },
          });
        }

        if (existing.couponId) {
          await tx.couponRedemption.deleteMany({
            where: { orderId: existing.id },
          });

          await tx.promotionCoupon.update({
            where: { id: existing.couponId },
            data: { currentUsageCount: { decrement: 1 } },
          });
        }
      }

      if (status === OrderStatus.DELIVERED) {
        const activeShipment = existing.shipments?.[0];
        if (activeShipment) {
          await tx.shipment.update({
            where: { id: activeShipment.id },
            data: {
              status: ShipmentStatus.DELIVERED,
              deliveredAt: new Date(),
            },
          });

          const recipientCity =
            (existing.shippingAddressSnapshot as Record<string, string>)
              ?.city ??
            (existing.shippingAddressSnapshot as Record<string, string>)
              ?.province ??
            'ปลายทางของผู้รับ';

          if (tx.shipmentLog) {
            await tx.shipmentLog.create({
              data: {
                shipmentId: activeShipment.id,
                statusTitle: 'พัสดุจัดส่งสำเร็จและส่งมอบให้ผู้รับเรียบร้อยแล้ว',
                statusDescription:
                  overrideReason?.trim() ||
                  'ยืนยันการนำส่งสำเร็จโดยเจ้าหน้าที่ร้านค้า',
                location: recipientCity,
              },
            });
          }
        }
      }

      return tx.order.update({
        where: { id: existing.id },
        data: {
          status,
          ...(status === OrderStatus.COMPLETED && !existing.completedAt
            ? { completedAt: new Date() }
            : {}),
        },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { where: { isPrimary: true }, take: 1 },
                    },
                  },
                },
              },
            },
          },
          shipments: {
            include: { logs: { orderBy: { logTimestamp: 'desc' } } },
            orderBy: { createdAt: 'desc' },
          },
          payment: true,
        },
      });
    });

    if (status === OrderStatus.DELIVERED) {
      await this.orderLifecycleProducer.scheduleDeliveryCompletion(
        existing.id,
        existing.orderNumber,
        ORDER_TIMEOUT_MS.DELIVERY_COMPLETION,
      );
    } else if (status === OrderStatus.COMPLETED) {
      await this.orderLifecycleProducer.cancelDeliveryCompletion(existing.id);
    } else if (status === OrderStatus.CANCELLED) {
      await this.orderLifecycleProducer.cancelOrderTimeout(existing.id);
    }

    void this.auditLog?.recordLog({
      adminId: adminId ?? null,
      actionType: AuditActionType.STATUS_CHANGE,
      targetTable: 'orders',
      targetId: existing.id,
      permission: AdminPermission.ORDERS_FULFILL,
      oldValuesJson: {
        orderNumber: existing.orderNumber,
        status: existing.status,
      },
      newValuesJson: {
        orderNumber: existing.orderNumber,
        status: updated.status,
        courierName,
        trackingNumber,
        overrideReason,
      },
    });

    if (
      status === OrderStatus.SHIPPED &&
      (trackingNumber || updated.shipments?.[0]?.trackingNumber)
    ) {
      const activeShipment = updated.shipments?.[0];
      const effectiveCourier =
        courierName?.trim() || activeShipment?.courierName || 'Standard Express';
      const effectiveTracking =
        trackingNumber?.trim() || activeShipment?.trackingNumber || '';

      if (effectiveTracking) {
        this.dispatchOrderShippedNotification(
          updated,
          effectiveCourier,
          effectiveTracking,
        );
      }
    }

    if (status === OrderStatus.CANCELLED) {
      const address =
        (updated.shippingAddressSnapshot as Record<string, unknown> | null) ?? {};
      const recipientEmail =
        updated.user?.email ??
        (address.email ? String(address.email) : null) ??
        null;

      if (this.mailerService && recipientEmail) {
        const storefrontUrl = process.env.STOREFRONT_URL || 'https://nida.co';
        this.mailerService
          .sendOrderCancelledEmail({
            to: recipientEmail,
            orderNumber: updated.orderNumber,
            reason:
              overrideReason?.trim() ||
              'คำสั่งซื้อได้รับการยกเลิกโดยผู้ดูแลระบบ',
            storefrontUrl,
          })
          .catch((err: unknown) => {
            this.logger.error(
              `Failed to send order cancelled email for #${updated.orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
            );
          });
      }
    }

    return this.mapOrder(updated as unknown as OrderDetailPayload);
  }

  async fulfillWithCarrier(
    id: string,
    carrierCode: CarrierCode,
    adminId?: string,
  ): Promise<ApiOrder> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );
    const existing = await this.prisma.order.findFirst({
      where: isUuid
        ? { OR: [{ id }, { orderNumber: id }] }
        : { orderNumber: id },
      include: {
        shipments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Order "${id}" not found`);
    }

    const validation = validateOrderStatusTransition(
      existing.status as OrderStatus,
      OrderStatus.SHIPPED,
      true,
    );

    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    const address =
      (existing.shippingAddressSnapshot as Record<string, unknown>) ?? {};
    const booking = await this.logisticsService.createShipment({
      orderId: existing.id,
      orderNumber: existing.orderNumber,
      recipientName: String(address.recipientName ?? 'Customer'),
      recipientPhone: String(address.phone ?? ''),
      shippingAddress: {
        addressLine1: String(address.addressLine1 ?? ''),
        addressLine2: address.addressLine2
          ? String(address.addressLine2)
          : undefined,
        subdistrict: String(address.subdistrict ?? ''),
        district: String(address.district ?? ''),
        province: String(address.province ?? ''),
        postalCode: String(address.postalCode ?? ''),
      },
      carrierCode,
    });

    await this.prisma.shipment.create({
      data: {
        orderId: existing.id,
        carrierCode,
        courierName: booking.courierName,
        trackingNumber: booking.trackingNumber,
        status: ShipmentStatus.LABEL_CREATED,
        estimatedDelivery: booking.estimatedDelivery,
        logs: {
          create: {
            statusTitle: booking.initialLog.statusTitle,
            statusDescription: booking.initialLog.statusDescription,
            location: booking.initialLog.location,
            logTimestamp: booking.initialLog.logTimestamp,
          },
        },
      },
    });

    const updated = await this.prisma.order.update({
      where: { id: existing.id },
      data: { status: OrderStatus.SHIPPED },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
        shipments: {
          include: { logs: { orderBy: { logTimestamp: 'desc' } } },
        },
        payment: true,
      },
    });

    void this.auditLog?.recordLog({
      adminId: adminId ?? null,
      actionType: AuditActionType.STATUS_CHANGE,
      targetTable: 'orders',
      targetId: existing.id,
      permission: AdminPermission.ORDERS_FULFILL,
      oldValuesJson: {
        orderNumber: existing.orderNumber,
        status: existing.status,
      },
      newValuesJson: {
        orderNumber: existing.orderNumber,
        status: OrderStatus.SHIPPED,
        carrierCode,
        trackingNumber: booking.trackingNumber,
      },
    });

    this.dispatchOrderShippedNotification(
      updated,
      booking.courierName || 'Standard Express',
      booking.trackingNumber,
      carrierCode,
    );

    return this.mapOrder(updated as unknown as OrderDetailPayload);
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    const shipment = await this.prisma.shipment.findFirst({
      where: {
        OR: [
          { trackingNumber: trackingNumber.trim() },
          { order: { orderNumber: trackingNumber.trim() } },
        ],
      },
      include: {
        order: true,
        logs: { orderBy: { logTimestamp: 'desc' } },
      },
    });

    if (!shipment) {
      throw new NotFoundException(
        `Shipment or order with reference "${trackingNumber}" not found`,
      );
    }

    return {
      orderNumber: shipment.order.orderNumber,
      orderStatus: shipment.order.status as OrderStatus,
      shipment: this.mapShipment(shipment),
    };
  }

  private dispatchOrderShippedNotification(
    order: {
      orderNumber: string;
      shippingAddressSnapshot: unknown;
      user?: { email: string | null; firstName?: string | null } | null;
      items?: Array<{
        quantity: number;
        unitPrice: unknown;
        productSnapshot?: unknown;
        variant?: {
          colorName?: string | null;
          size?: string | null;
          product?: { name?: string | null } | null;
        } | null;
      }>;
    },
    courierName: string,
    trackingNumber: string,
    carrierCode?: string,
  ): void {
    if (!this.mailerService) {
      return;
    }

    const address =
      (order.shippingAddressSnapshot as Record<string, unknown> | null) ?? {};
    const recipientEmail =
      order.user?.email ??
      (address.email ? String(address.email) : null) ??
      null;

    if (!recipientEmail) {
      return;
    }

    const storefrontUrl = process.env.STOREFRONT_URL || 'https://nida.co';
    let trackingUrl = `${storefrontUrl}/track-order?trackingNumber=${encodeURIComponent(trackingNumber)}`;

    const carrierUpper = (carrierCode ?? courierName).toUpperCase();
    if (carrierUpper.includes('FLASH')) {
      trackingUrl = `https://www.flashexpress.co.th/tracking/?se=${encodeURIComponent(trackingNumber)}`;
    } else if (carrierUpper.includes('KERRY')) {
      trackingUrl = `https://th.kerryexpress.com/th/track/?track=${encodeURIComponent(trackingNumber)}`;
    } else if (
      carrierUpper.includes('THAI') ||
      carrierUpper.includes('POST') ||
      courierName.includes('ไปรษณีย์')
    ) {
      trackingUrl = `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(trackingNumber)}`;
    } else if (carrierUpper.includes('DHL')) {
      trackingUrl = `https://www.dhl.com/th-th/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(trackingNumber)}`;
    }

    const addressParts = [
      address.addressLine1,
      address.subdistrict,
      address.district,
      address.province,
      address.postalCode,
    ]
      .map((p) => (p ? String(p).trim() : ''))
      .filter(Boolean);

    const itemsSummary = (order.items ?? []).map((it) => {
      const snap = it.productSnapshot as Record<string, unknown> | null;
      const color =
        (snap?.colorName as string | undefined) ??
        it.variant?.colorName ??
        undefined;
      const size =
        (snap?.size as string | undefined) ?? it.variant?.size ?? undefined;
      const variantSummary = [color, size].filter(Boolean).join(' / ');

      return {
        title:
          (snap?.name as string | undefined) ??
          it.variant?.product?.name ??
          'NIDA Product',
        variantSummary: variantSummary || undefined,
        quantity: it.quantity,
        price: Number(it.unitPrice),
      };
    });

    this.mailerService
      .sendOrderShippedEmail({
        to: recipientEmail,
        orderNumber: order.orderNumber,
        recipientName: String(
          address.recipientName ??
            order.user?.firstName ??
            'Customer',
        ),
        courierName,
        trackingNumber,
        trackingUrl,
        items: itemsSummary,
        shippingAddressSummary:
          addressParts.length > 0 ? addressParts.join(' ') : undefined,
      })
      .catch((err: unknown) => {
        this.logger.error(
          `Failed to dispatch order shipped notification for #${order.orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
        );
      });
  }

  private mapOrder(order: OrderDetailPayload): ApiOrder {
    const address =
      (order.shippingAddressSnapshot as unknown as ApiOrderAddress) ??
      ({} as ApiOrderAddress);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as OrderStatus,
      hasPreorderItems: order.hasPreorderItems,
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      originalShippingFee:
        order.originalShippingFee !== undefined
          ? Number(order.originalShippingFee)
          : Number(order.shippingFee) === 0
            ? 50
            : Number(order.shippingFee),
      shippingDiscount:
        order.shippingDiscount !== undefined
          ? Number(order.shippingDiscount)
          : Number(order.shippingFee) === 0
            ? 50
            : 0,
      shippingFee: Number(order.shippingFee),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      promoCodeUsed: order.promoCodeUsed ?? undefined,
      items: order.items.map((item): ApiOrderItem => {
        const fallbackImage = item.variant?.product?.images?.[0]?.imageUrl;
        const imageUrl = item.imageUrlSnapshot ?? fallbackImage;
        const skuCode = item.skuCodeSnapshot ?? item.variant?.skuCode;
        const productSnapshot =
          item.productSnapshot && typeof item.productSnapshot === 'object'
            ? (item.productSnapshot as unknown as ApiProductSnapshot)
            : null;

        return {
          id: item.id,
          productName: item.productNameSnapshot,
          variantInfo: item.variantInfoSnapshot,
          imageUrl: imageUrl ?? undefined,
          skuCode: skuCode ?? undefined,
          imageUrlSnapshot: item.imageUrlSnapshot ?? null,
          skuCodeSnapshot: item.skuCodeSnapshot ?? null,
          productSnapshot,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
          discountShare: Number(item.discountShare),
          netPrice: Number(item.netPrice),
          isPreorder: item.isPreorder,
          expectedShipDate: item.expectedShipDate?.toISOString() ?? undefined,
        };
      }),
      shippingAddress: {
        recipientName: address.recipientName ?? '',
        phone: address.phone ?? '',
        addressLine1: address.addressLine1 ?? '',
        addressLine2: address.addressLine2,
        subdistrict: address.subdistrict ?? '',
        district: address.district ?? '',
        province: address.province ?? '',
        postalCode: address.postalCode ?? '',
      },
      payment: order.payment
        ? {
            paymentMethod: order.payment.paymentMethod,
            status: order.payment.status,
            cardLast4: order.payment.cardLast4 ?? undefined,
            cardBrand: order.payment.cardBrand ?? undefined,
            paidAt: order.payment.paidAt?.toISOString() ?? undefined,
          }
        : undefined,
      shipments: (order.shipments ?? []).map((s) => this.mapShipment(s)),
      cancellationRequests: (order.cancellationRequests ?? []).map(
        (c): ApiOrderCancellationRequest => ({
          id: c.id,
          requestNumber: c.requestNumber,
          orderId: c.orderId,
          userId: c.userId,
          reason: c.reason,
          customerNote: c.customerNote ?? undefined,
          adminNote: c.adminNote ?? undefined,
          status: c.status as CancellationRequestStatus,
          reviewedAt: c.reviewedAt?.toISOString() ?? undefined,
          reviewedBy: c.reviewedBy ?? undefined,
          createdAt: c.createdAt.toISOString(),
        }),
      ),
      returnRequests: (order.returnRequests ?? []).map(
        (r): ApiReturnRequest => ({
          id: r.id,
          requestNumber: r.requestNumber,
          orderId: r.orderId,
          userId: r.userId,
          reason: r.reason,
          customerNote: r.customerNote ?? undefined,
          adminNote: r.adminNote ?? undefined,
          status: r.status as ReturnStatus,
          returnCarrier: r.returnCarrier ?? undefined,
          returnTrackingNumber: r.returnTrackingNumber ?? undefined,
          returnShippingFee: r.returnShippingFee
            ? Number(r.returnShippingFee)
            : undefined,
          returnShippingReceiptUrl: r.returnShippingReceiptUrl ?? undefined,
          shippedAt: r.shippedAt?.toISOString() ?? undefined,
          items: (r.items ?? []).map((i) => ({
            id: i.id,
            orderItemId: i.orderItemId,
            quantity: i.quantity,
          })),
          reviewedAt: r.reviewedAt?.toISOString() ?? undefined,
          reviewedBy: r.reviewedBy ?? undefined,
          createdAt: r.createdAt.toISOString(),
        }),
      ),
      refunds: (order.refunds ?? []).map((rf): ApiRefundSummary => ({
        id: rf.id,
        refundNumber: rf.refundNumber,
        orderId: rf.orderId,
        paymentId: rf.paymentId,
        amount: Number(rf.amount),
        reason: rf.reason ?? undefined,
        gatewayRefundId: rf.gatewayRefundId ?? undefined,
        status: rf.status,
        createdAdminId: rf.createdAdminId ?? undefined,
        createdAt: rf.createdAt.toISOString(),
      })),
      taxInvoiceRequest: order.taxInvoiceRequest
        ? (order.taxInvoiceRequest as unknown as ApiTaxInvoiceRequest)
        : null,
      taxInvoice: order.taxInvoice
        ? {
            id: order.taxInvoice.id,
            orderId: order.taxInvoice.orderId,
            orderNumber: order.orderNumber,
            invoiceNumber: order.taxInvoice.invoiceNumber,
            payerType: order.taxInvoice.payerType as TaxInvoicePayerType,
            taxId: order.taxInvoice.taxId,
            name: order.taxInvoice.name,
            branchType:
              (order.taxInvoice.branchType as TaxInvoiceBranchType) ?? null,
            branchCode: order.taxInvoice.branchCode ?? null,
            address: order.taxInvoice.address,
            subtotal: Number(order.taxInvoice.subtotal),
            discount: Number(order.taxInvoice.discount),
            shippingFee: Number(order.taxInvoice.shippingFee),
            totalAmount: Number(order.taxInvoice.totalAmount),
            preVatAmount: Number(order.taxInvoice.preVatAmount),
            vatAmount: Number(order.taxInvoice.vatAmount),
            itemsSnapshot:
              (order.taxInvoice
                .itemsSnapshot as unknown as ApiTaxInvoiceItem[]) ?? [],
            issuedAt: order.taxInvoice.issuedAt.toISOString(),
          }
        : null,
      placedAt: order.placedAt
        ? order.placedAt.toISOString()
        : new Date().toISOString(),
      completedAt: order.completedAt ? order.completedAt.toISOString() : null,
    };
  }

  async processRefund(
    id: string,
    dto: ProcessRefundDto,
    adminId?: string,
  ): Promise<ApiOrder> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );
    const order = await this.prisma.order.findFirst({
      where: isUuid
        ? { OR: [{ id }, { orderNumber: id }] }
        : { orderNumber: id },
      include: {
        user: { select: { email: true, firstName: true } },
        payment: true,
        items: {
          include: {
            variant: {
              include: { inventoryItem: true },
            },
          },
        },
        refunds: true,
        pointTransactions: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order "${id}" not found`);
    }

    if (!order.payment) {
      throw new BadRequestException('ไม่พบข้อมูลการชำระเงินของคำสั่งซื้อนี้');
    }

    if (
      order.status === OrderStatus.REFUNDED &&
      order.payment.status === PaymentStatus.REFUNDED
    ) {
      throw new BadRequestException(
        'คำสั่งซื้อนี้ได้รับการคืนเงินเต็มจำนวนไปแล้ว',
      );
    }

    const totalPaid = Number(order.payment.amount);
    const alreadyRefunded = order.refunds
      .filter((r) => r.status === 'SUCCEEDED')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const maxRefundable = Math.max(0, totalPaid - alreadyRefunded);

    const refundAmount =
      dto.amount !== undefined ? Number(dto.amount) : maxRefundable;

    if (refundAmount <= 0) {
      throw new BadRequestException('ยอดเงินคืนต้องมากกว่า 0 บาท');
    }

    if (refundAmount > maxRefundable) {
      throw new BadRequestException(
        `ยอดเงินคืน (฿${refundAmount.toLocaleString()}) เกินยอดคงเหลือที่สามารถคืนได้ (฿${maxRefundable.toLocaleString()})`,
      );
    }

    let gatewayRefundId: string | undefined;
    if (order.payment.transactionReference) {
      const refundResult = await this.paymentGatewayService.createRefund({
        transactionReference: order.payment.transactionReference,
        amount: refundAmount,
        reason: dto.reason,
      });
      gatewayRefundId = refundResult.gatewayRefundId;
    } else {
      gatewayRefundId = `rfnd_manual_${Date.now()}`;
    }

    let isFullRefund = false;
    let issuedRefundNumber = '';
    await this.prisma.$transaction(async (tx) => {
      const refundCount = await tx.refund.count({
        where: { orderId: order.id },
      });
      const refundNumber = `REF-${order.orderNumber}-${refundCount + 1}`;
      issuedRefundNumber = refundNumber;

      await tx.refund.create({
        data: {
          refundNumber,
          orderId: order.id,
          paymentId: order.payment!.id,
          amount: refundAmount,
          reason: dto.reason,
          gatewayRefundId,
          status: 'SUCCEEDED',
          createdAdminId: adminId ?? null,
        },
      });

      isFullRefund = alreadyRefunded + refundAmount >= totalPaid;
      if (isFullRefund) {
        await tx.payment.update({
          where: { id: order.payment!.id },
          data: { status: PaymentStatus.REFUNDED },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.REFUNDED },
        });
      }

      if (dto.restockInventory !== false) {
        for (const item of order.items) {
          const inv = item.variant.inventoryItem;
          if (!inv) continue;

          if (item.isPreorder) {
            await tx.inventoryItem.update({
              where: { id: inv.id },
              data: {
                preorderBooked: {
                  decrement: Math.min(inv.preorderBooked, item.quantity),
                },
              },
            });
          } else {
            const updatedInv = await tx.inventoryItem.update({
              where: { id: inv.id },
              data: {
                quantityAvailable: { increment: item.quantity },
              },
            });

            await tx.stockMovement.create({
              data: {
                variantId: item.variant.id,
                changeType: StockChangeType.RETURNED,
                quantityChange: item.quantity,
                balanceAfter: updatedInv.quantityAvailable,
                reasonNote: `Refund: ${dto.reason} (#${order.orderNumber})`,
                adminId: adminId ?? null,
              },
            });
          }
        }
      }

      if (order.userId) {
        const earnedTx = order.pointTransactions?.find(
          (pt) => pt.changeType === 'EARNED_ORDER',
        );
        const alreadyReversed = order.pointTransactions?.some(
          (pt) => pt.changeType === 'REFUND_CANCEL',
        );

        if (earnedTx && !alreadyReversed && earnedTx.pointsChange > 0) {
          const user = await tx.user.findUnique({
            where: { id: order.userId },
          });
          const newBalance = Math.max(
            0,
            (user?.points ?? 0) - earnedTx.pointsChange,
          );

          await tx.user.update({
            where: { id: order.userId },
            data: { points: newBalance },
          });

          await tx.pointTransaction.create({
            data: {
              userId: order.userId,
              changeType: 'REFUND_CANCEL',
              pointsChange: -earnedTx.pointsChange,
              balanceAfter: newBalance,
              orderId: order.id,
              description: `Deducted points from refund on Order #${order.orderNumber}`,
            },
          });
        }
      }

      if (order.couponId) {
        await tx.couponRedemption.deleteMany({
          where: { orderId: order.id },
        });

        await tx.promotionCoupon.update({
          where: { id: order.couponId },
          data: { currentUsageCount: { decrement: 1 } },
        });
      }
    });

    void this.auditLog?.recordLog({
      adminId: adminId ?? null,
      actionType: AuditActionType.REFUND,
      targetTable: 'orders',
      targetId: order.id,
      permission: AdminPermission.ORDERS_FULFILL,
      oldValuesJson: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.payment.status,
      },
      newValuesJson: {
        orderNumber: order.orderNumber,
        refundAmount,
        reason: dto.reason,
        isFullRefund,
        status: isFullRefund ? OrderStatus.REFUNDED : order.status,
        paymentStatus: isFullRefund
          ? PaymentStatus.REFUNDED
          : order.payment.status,
      },
    });

    const address =
      (order.shippingAddressSnapshot as Record<string, unknown> | null) ?? {};
    const recipientEmail =
      order.user?.email ??
      (address.email ? String(address.email) : null) ??
      null;

    if (this.mailerService && recipientEmail) {
      const channel =
        order.payment?.paymentMethod === 'CREDIT_CARD'
          ? 'บัตรเครดิต (Credit Card via Omise)'
          : order.payment?.paymentMethod === 'PROMPTPAY'
            ? 'พร้อมเพย์ (PromptPay)'
            : String(order.payment?.paymentMethod ?? 'Online Payment');

      const timeline =
        order.payment?.paymentMethod === 'CREDIT_CARD'
          ? 'ยอดเงินจะปรับปรุงคืนเข้าบัญชีบัตรเครดิตภายใน 7–14 วันทำการ ขึ้นอยู่กับรอบบิลของธนาคาร'
          : 'ยอดเงินจะปรับปรุงคืนเข้าบัญชีภายใน 1–3 วันทำการ';

      const storefrontUrl = process.env.STOREFRONT_URL || 'https://nida.co';

      this.mailerService
        .sendRefundProcessedEmail({
          to: recipientEmail,
          orderNumber: order.orderNumber,
          refundNumber: issuedRefundNumber,
          amount: refundAmount,
          reason: dto.reason,
          paymentMethod: channel,
          estimatedTimeline: timeline,
          storefrontUrl,
        })
        .catch((err: unknown) => {
          this.logger.error(
            `Failed to send refund processed email for #${order.orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
          );
        });
    }

    return this.getOrderByNumber(order.orderNumber);
  }

  async getCancellationRequests(
    query?: AdminCancellationQueryInput,
  ): Promise<PaginatedCancellationsResponse> {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.OrderCancellationRequestWhereInput = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as CancellationRequestStatus;
    }

    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { requestNumber: { contains: s, mode: 'insensitive' } },
        { order: { orderNumber: { contains: s, mode: 'insensitive' } } },
        { user: { email: { contains: s, mode: 'insensitive' } } },
        { user: { firstName: { contains: s, mode: 'insensitive' } } },
        { user: { lastName: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const orderBy: Prisma.OrderCancellationRequestOrderByWithRelationInput = {
      createdAt: query?.sortBy === 'oldest' ? 'asc' : 'desc',
    };

    const [requests, total, groupedStatus] = await Promise.all([
      this.prisma.orderCancellationRequest.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              placedAt: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.orderCancellationRequest.count({ where }),
      this.prisma.orderCancellationRequest.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const statusMap = Object.fromEntries(
      groupedStatus.map((g) => [g.status, g._count.id]),
    );

    const totalCount = groupedStatus.reduce((sum, g) => sum + g._count.id, 0);

    const statusCounts: AdminCancellationStatusCounts = {
      all: totalCount,
      pending: statusMap['PENDING'] ?? 0,
      approved: statusMap['APPROVED'] ?? 0,
      rejected: statusMap['REJECTED'] ?? 0,
    };

    return {
      items: requests.map((r) => ({
        id: r.id,
        requestNumber: r.requestNumber,
        orderId: r.orderId,
        userId: r.userId,
        reason: r.reason,
        customerNote: r.customerNote ?? undefined,
        adminNote: r.adminNote ?? undefined,
        status: r.status as CancellationRequestStatus,
        reviewedAt: r.reviewedAt?.toISOString(),
        reviewedBy: r.reviewedBy ?? undefined,
        createdAt: r.createdAt.toISOString(),
        order: r.order
          ? {
              id: r.order.id,
              orderNumber: r.order.orderNumber,
              status: r.order.status as OrderStatus,
              totalAmount: Number(r.order.totalAmount),
              placedAt: r.order.placedAt.toISOString(),
            }
          : undefined,
        user: r.user
          ? {
              id: r.user.id,
              email: r.user.email,
              firstName: r.user.firstName,
              lastName: r.user.lastName,
            }
          : undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
      statusCounts,
    };
  }

  async reviewCancellationRequest(
    requestId: string,
    dto: ReviewCancellationRequestDto,
    adminId?: string,
  ) {
    const request = await this.prisma.orderCancellationRequest.findUnique({
      where: { id: requestId },
      include: {
        order: {
          include: {
            payment: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(
        `Cancellation request "${requestId}" not found`,
      );
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('คำขอนี้ได้รับการพิจารณาไปแล้ว');
    }

    if (dto.action === 'REJECT') {
      await this.prisma.orderCancellationRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          adminNote: dto.adminNote,
          reviewedAt: new Date(),
          reviewedBy: adminId ?? null,
        },
      });
      await this.orderLifecycleProducer.cancelCancellationReviewTimeout(
        requestId,
      );
      void this.auditLog?.recordLog({
        adminId: adminId ?? null,
        actionType: AuditActionType.STATUS_CHANGE,
        targetTable: 'orders',
        targetId: request.orderId,
        permission: AdminPermission.ORDERS_FULFILL,
        oldValuesJson: {
          orderNumber: request.order.orderNumber,
          cancellationStatus: 'PENDING',
        },
        newValuesJson: {
          orderNumber: request.order.orderNumber,
          cancellationStatus: 'REJECTED',
          adminNote: dto.adminNote,
        },
      });

      const address =
        (request.order.shippingAddressSnapshot as Record<string, unknown> | null) ?? {};
      const recipientEmail =
        request.order.user?.email ??
        (address.email ? String(address.email) : null) ??
        null;

      if (this.mailerService && recipientEmail) {
        this.mailerService
          .sendOrderCancelledEmail({
            to: recipientEmail,
            orderNumber: request.order.orderNumber,
            reason: `คำขอยกเลิกคำสั่งซื้อไม่ได้รับการอนุมัติ: ${dto.adminNote || 'เนื่องจากสินค้าอยู่ระหว่างขั้นตอนการจัดส่ง'}`,
          })
          .catch((err: unknown) => {
            this.logger.error(
              `Failed to send cancellation rejection email for #${request.order.orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
            );
          });
      }

      return { success: true, message: 'ปฏิเสธคำขอยกเลิกเรียบร้อย' };
    }

    await this.prisma.orderCancellationRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        adminNote: dto.adminNote,
        reviewedAt: new Date(),
        reviewedBy: adminId ?? null,
      },
    });

    await this.orderLifecycleProducer.cancelCancellationReviewTimeout(
      requestId,
    );

    await this.processRefund(
      request.orderId,
      {
        reason: `อนุมัติคำขอยกเลิก: ${request.reason}`,
        restockInventory: dto.restockInventory ?? true,
      },
      adminId,
    );

    return {
      success: true,
      message: 'อนุมัติคำขอยกเลิกและดำเนินการคืนเงินสำเร็จ',
    };
  }

  async getReturnRequests(
    query?: AdminReturnQueryInput,
  ): Promise<PaginatedReturnsResponse> {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.ReturnRequestWhereInput = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as ReturnStatus;
    }

    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { requestNumber: { contains: s, mode: 'insensitive' } },
        { order: { orderNumber: { contains: s, mode: 'insensitive' } } },
        { user: { email: { contains: s, mode: 'insensitive' } } },
        { user: { firstName: { contains: s, mode: 'insensitive' } } },
        { user: { lastName: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const orderBy: Prisma.ReturnRequestOrderByWithRelationInput = {
      createdAt: query?.sortBy === 'oldest' ? 'asc' : 'desc',
    };

    const [requests, total, groupedStatus] = await Promise.all([
      this.prisma.returnRequest.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              placedAt: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              orderItem: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.returnRequest.count({ where }),
      this.prisma.returnRequest.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const statusMap = Object.fromEntries(
      groupedStatus.map((g) => [g.status, g._count.id]),
    );

    const totalCount = groupedStatus.reduce((sum, g) => sum + g._count.id, 0);

    const statusCounts: AdminReturnStatusCounts = {
      all: totalCount,
      requested: statusMap['REQUESTED'] ?? 0,
      approved: statusMap['APPROVED'] ?? 0,
      shipped: statusMap['SHIPPED'] ?? 0,
      completed: statusMap['COMPLETED'] ?? 0,
      rejected: statusMap['REJECTED'] ?? 0,
    };

    return {
      items: requests.map((r) => ({
        id: r.id,
        requestNumber: r.requestNumber,
        orderId: r.orderId,
        userId: r.userId,
        reason: r.reason,
        customerNote: r.customerNote ?? undefined,
        adminNote: r.adminNote ?? undefined,
        status: r.status as ReturnStatus,
        returnCarrier: r.returnCarrier ?? undefined,
        returnTrackingNumber: r.returnTrackingNumber ?? undefined,
        returnShippingFee: r.returnShippingFee
          ? Number(r.returnShippingFee)
          : undefined,
        returnShippingReceiptUrl: r.returnShippingReceiptUrl ?? undefined,
        shippedAt: r.shippedAt?.toISOString(),
        reviewedAt: r.reviewedAt?.toISOString(),
        reviewedBy: r.reviewedBy ?? undefined,
        createdAt: r.createdAt.toISOString(),
        order: r.order
          ? {
              id: r.order.id,
              orderNumber: r.order.orderNumber,
              status: r.order.status as OrderStatus,
              totalAmount: Number(r.order.totalAmount),
              placedAt: r.order.placedAt.toISOString(),
            }
          : undefined,
        user: r.user
          ? {
              id: r.user.id,
              email: r.user.email,
              firstName: r.user.firstName,
              lastName: r.user.lastName,
            }
          : undefined,
        items: r.items.map((item) => ({
          id: item.id,
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          productName: item.orderItem.productNameSnapshot,
          variantInfo: item.orderItem.variantInfoSnapshot,
          unitPrice: Number(item.orderItem.unitPrice),
        })),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
      statusCounts,
    };
  }

  async reviewReturnRequest(
    requestId: string,
    dto: ReviewReturnRequestDto,
    adminId?: string,
  ) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id: requestId },
      include: {
        order: {
          include: { payment: true },
        },
        items: {
          include: { orderItem: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Return request "${requestId}" not found`);
    }

    if (request.status === 'COMPLETED' || request.status === 'REJECTED') {
      throw new BadRequestException('คำขอนี้เสร็จสิ้นหรือถูกปฏิเสธไปแล้ว');
    }

    if (dto.action === 'REJECT') {
      await this.prisma.returnRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          adminNote: dto.adminNote,
          reviewedAt: new Date(),
          reviewedBy: adminId ?? null,
        },
      });
      await this.orderLifecycleProducer.cancelReturnDeadline(requestId);
      void this.auditLog?.recordLog({
        adminId: adminId ?? null,
        actionType: AuditActionType.STATUS_CHANGE,
        targetTable: 'orders',
        targetId: request.orderId,
        permission: AdminPermission.ORDERS_FULFILL,
        oldValuesJson: {
          orderNumber: request.order.orderNumber,
          returnStatus: request.status,
        },
        newValuesJson: {
          orderNumber: request.order.orderNumber,
          returnStatus: 'REJECTED',
          adminNote: dto.adminNote,
        },
      });
      return { success: true, message: 'ปฏิเสธคำขอคืนสินค้าเรียบร้อย' };
    }

    if (dto.action === 'APPROVE') {
      await this.prisma.returnRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          adminNote: dto.adminNote,
          reviewedAt: new Date(),
          reviewedBy: adminId ?? null,
        },
      });
      await this.orderLifecycleProducer.scheduleReturnDeadline(
        request.orderId,
        request.id,
        request.order.orderNumber,
        ORDER_TIMEOUT_MS.RETURN_SHIPMENT_DEADLINE,
      );
      void this.auditLog?.recordLog({
        adminId: adminId ?? null,
        actionType: AuditActionType.STATUS_CHANGE,
        targetTable: 'orders',
        targetId: request.orderId,
        permission: AdminPermission.ORDERS_FULFILL,
        oldValuesJson: {
          orderNumber: request.order.orderNumber,
          returnStatus: request.status,
        },
        newValuesJson: {
          orderNumber: request.order.orderNumber,
          returnStatus: 'APPROVED',
          adminNote: dto.adminNote,
        },
      });
      return {
        success: true,
        message: 'อนุมัติคำขอคืนสินค้า ลูกค้าสามารถส่งสินค้ากลับได้',
      };
    }

    if (!request.returnTrackingNumber || request.status !== 'SHIPPED') {
      throw new BadRequestException(
        'ไม่สามารถตรวจรับหรือคืนเงินได้ เนื่องจากลูกค้ายังไม่ได้แจ้งข้อมูลการจัดส่งสินค้าคืน',
      );
    }

    await this.prisma.returnRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        adminNote: dto.adminNote,
        reviewedAt: new Date(),
        reviewedBy: adminId ?? null,
      },
    });

    await this.orderLifecycleProducer.cancelReturnDeadline(requestId);

    const itemsTotal = (request.items ?? []).reduce(
      (sum, item) =>
        sum + Number(item.orderItem?.unitPrice ?? 0) * item.quantity,
      0,
    );
    const shippingFee = request.returnShippingFee
      ? Number(request.returnShippingFee)
      : 0;
    const finalRefundAmount = dto.refundAmount ?? itemsTotal + shippingFee;

    await this.processRefund(
      request.orderId,
      {
        amount: finalRefundAmount,
        reason: `ตรวจรับสินค้าคืน: ${request.reason}`,
        restockInventory: dto.restockInventory ?? true,
      },
      adminId,
    );

    return {
      success: true,
      message: 'ตรวจรับสินค้าคืนและดำเนินการคืนเงินสำเร็จ',
    };
  }

  private mapShipment(shipment: ShipmentWithLogs): ApiShipment {
    return {
      id: shipment.id,
      carrierCode: (shipment.carrierCode as CarrierCode | null) ?? undefined,
      courierName: shipment.courierName,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status as ShipmentStatus,
      shippedAt: shipment.shippedAt?.toISOString() ?? undefined,
      estimatedDelivery: shipment.estimatedDelivery?.toISOString() ?? undefined,
      deliveredAt: shipment.deliveredAt?.toISOString() ?? undefined,
      timeline: (shipment.logs ?? []).map((log): ShipmentTimelineEntry => ({
        id: log.id,
        statusTitle: log.statusTitle,
        statusDescription: log.statusDescription ?? undefined,
        location: log.location ?? undefined,
        timestamp: log.logTimestamp.toISOString(),
      })),
    };
  }

  calculateVatBreakdown(totalAmount: number): {
    preVatAmount: number;
    vatAmount: number;
  } {
    const preVatAmount = Math.round((totalAmount / 1.07) * 100) / 100;
    const vatAmount = Math.round((totalAmount - preVatAmount) * 100) / 100;
    return { preVatAmount, vatAmount };
  }

  async generateSequentialInvoiceNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `INV-${year}${month}-`;

    const lastInvoice = await tx.taxInvoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let sequence = 1;
    if (lastInvoice?.invoiceNumber) {
      const parts = lastInvoice.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    const seqStr = String(sequence).padStart(5, '0');
    return `${prefix}${seqStr}`;
  }

  async issueTaxInvoiceForOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
  ): Promise<Prisma.TaxInvoiceGetPayload<object> | null> {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, taxInvoice: true },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    if (order.taxInvoice) {
      return order.taxInvoice;
    }

    if (!order.taxInvoiceRequest) {
      return null;
    }

    const req = order.taxInvoiceRequest as unknown as ApiTaxInvoiceRequest;
    const totalAmount = Number(order.totalAmount);
    const subtotal = Number(order.subtotal);
    const discount = Number(order.discountTotal);
    const shippingFee = Number(order.shippingFee);

    const { preVatAmount, vatAmount } = this.calculateVatBreakdown(totalAmount);
    const invoiceNumber = await this.generateSequentialInvoiceNumber(tx);

    const itemsSnapshot: ApiTaxInvoiceItem[] = order.items.map((item) => ({
      id: item.id,
      productName: item.productNameSnapshot,
      variantInfo: item.variantInfoSnapshot,
      skuCode: item.skuCodeSnapshot,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      discountShare: Number(item.discountShare),
      netPrice: Number(item.netPrice),
    }));

    return tx.taxInvoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        payerType: req.payerType ?? TaxInvoicePayerType.PERSONAL,
        taxId: req.taxId,
        name: req.name,
        branchType:
          req.branchType ??
          (req.payerType === TaxInvoicePayerType.COMPANY
            ? TaxInvoiceBranchType.HEADQUARTERS
            : null),
        branchCode:
          req.branchCode ??
          (req.payerType === TaxInvoicePayerType.COMPANY ? '00000' : null),
        address: req.address,
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        preVatAmount,
        vatAmount,
        itemsSnapshot: JSON.parse(JSON.stringify(itemsSnapshot)),
        issuedAt: new Date(),
      },
    });
  }

  async getOrderTaxInvoice(
    id: string,
    admin?: ApiAdminUser,
  ): Promise<ApiTaxInvoice> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );
    const order = await this.prisma.order.findFirst({
      where: isUuid
        ? { OR: [{ id }, { orderNumber: id }] }
        : { orderNumber: id },
      include: {
        items: true,
        taxInvoice: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order "${id}" not found`);
    }

    let taxInvoice = order.taxInvoice;

    if (
      !taxInvoice &&
      order.taxInvoiceRequest &&
      (order.status === OrderStatus.PAID ||
        order.status === OrderStatus.COMPLETED ||
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED)
    ) {
      taxInvoice = await this.prisma.$transaction(async (tx) => {
        return this.issueTaxInvoiceForOrder(tx, order.id);
      });
    }

    if (!taxInvoice) {
      throw new NotFoundException(
        `ใบกำกับภาษียังไม่ได้ออกสำหรับคำสั่งซื้อ #${order.orderNumber} (Tax invoice not found or not requested)`,
      );
    }

    void this.auditLog?.recordLog({
      adminId: admin?.id ?? null,
      actionType: AuditActionType.READ,
      targetTable: 'tax_invoices',
      targetId: taxInvoice.id,
      permission: AdminPermission.ORDERS_READ,
      newValuesJson: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        invoiceNumber: taxInvoice.invoiceNumber,
      },
    });

    return {
      id: taxInvoice.id,
      orderId: taxInvoice.orderId,
      orderNumber: order.orderNumber,
      invoiceNumber: taxInvoice.invoiceNumber,
      payerType: taxInvoice.payerType as TaxInvoicePayerType,
      taxId: taxInvoice.taxId,
      name: taxInvoice.name,
      branchType: (taxInvoice.branchType as TaxInvoiceBranchType) ?? null,
      branchCode: taxInvoice.branchCode ?? null,
      address: taxInvoice.address,
      subtotal: Number(taxInvoice.subtotal),
      discount: Number(taxInvoice.discount),
      shippingFee: Number(taxInvoice.shippingFee),
      totalAmount: Number(taxInvoice.totalAmount),
      preVatAmount: Number(taxInvoice.preVatAmount),
      vatAmount: Number(taxInvoice.vatAmount),
      itemsSnapshot:
        (taxInvoice.itemsSnapshot as unknown as ApiTaxInvoiceItem[]) ?? [],
      sellerSnapshot: NIDA_SELLER_TAX_INFO,
      issuedAt: taxInvoice.issuedAt.toISOString(),
    };
  }
}
