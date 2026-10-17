import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
  ApiOrderAddress,
  ApiShipment,
  ShipmentTimelineEntry,
  TrackingResult,
  CarrierCode,
} from '@repo/types';
import {
  OrderStatus,
  StockChangeType,
  PaymentStatus,
  ShipmentStatus,
  PaymentMethod,
  CancellationRequestStatus,
  ReturnStatus,
} from '@repo/database';

import { validateOrderStatusTransition } from '@repo/validators';
import { CarrierMockService } from './carrier/index.js';
import { LogisticsService } from './logistics/index.js';
import { PaymentGatewayService } from './payment-gateway/index.js';
import type {
  ProcessRefundDto,
  ReviewCancellationRequestDto,
  ReviewReturnRequestDto,
  ApiOrderCancellationRequest,
  ApiReturnRequest,
  ApiRefundSummary,
} from '@repo/types';

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
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
    private readonly carrierMockService: CarrierMockService,
    private readonly logisticsService: LogisticsService,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<ApiOrder> {
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
        product: { include: { images: { take: 1 } } },
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

    const createdOrder = await this.prisma.$transaction(async (tx) => {
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

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: userId ?? null,
          status: OrderStatus.PENDING,
          hasPreorderItems,
          subtotal: calc.subtotal,
          discountTotal: calc.discountTotal,
          shippingFee: calc.shippingFee,
          taxAmount: calc.taxAmount,
          totalAmount: calc.totalAmount,
          currency: 'THB',
          shippingAddressSnapshot: JSON.parse(JSON.stringify(shippingAddress)),
          promoCodeUsed: calc.couponApplied?.code ?? null,
          couponId,
        },
      });

      for (const calcItem of calc.items) {
        const v = variantMap.get(calcItem.variantId)!;
        const isPreorder = v.product.isPreorder;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: v.id,
            productNameSnapshot: calcItem.productName,
            variantInfoSnapshot: calcItem.variantInfo,
            unitPrice: calcItem.unitPrice,
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
    });

    return this.getOrderByNumber(createdOrder.orderNumber);
  }

  async getOrderByNumber(orderNumber: string): Promise<ApiOrder> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    return this.mapOrder(order as unknown as OrderDetailPayload);
  }

  async getOrders(): Promise<ApiOrder[]> {
    const orders = await this.prisma.order.findMany({
      include: ORDER_INCLUDE,
      orderBy: { placedAt: 'desc' },
    });

    return orders.map((o) => this.mapOrder(o as unknown as OrderDetailPayload));
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    courierName?: string,
    trackingNumber?: string,
    transactionReference?: string,
    overrideReason?: string,
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
      }

      return tx.order.update({
        where: { id: existing.id },
        data: { status },
        include: {
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

    return this.mapOrder(updated as unknown as OrderDetailPayload);
  }

  async fulfillWithCarrier(
    id: string,
    carrierCode: CarrierCode,
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

  private mapOrder(order: OrderDetailPayload): ApiOrder {
    const address = order.shippingAddressSnapshot as unknown as ApiOrderAddress;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as OrderStatus,
      hasPreorderItems: order.hasPreorderItems,
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      shippingFee: Number(order.shippingFee),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      promoCodeUsed: order.promoCodeUsed ?? undefined,
      items: order.items.map((item): ApiOrderItem => ({
        id: item.id,
        productName: item.productNameSnapshot,
        variantInfo: item.variantInfoSnapshot,
        imageUrl: item.variant?.product?.images?.[0]?.imageUrl ?? undefined,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        discountShare: Number(item.discountShare),
        netPrice: Number(item.netPrice),
        isPreorder: item.isPreorder,
        expectedShipDate: item.expectedShipDate?.toISOString() ?? undefined,
      })),
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
      refunds: (order.refunds ?? []).map(
        (rf): ApiRefundSummary => ({
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
        }),
      ),
      placedAt: order.placedAt.toISOString(),
    };
  }

  async processRefund(
    id: string,
    dto: ProcessRefundDto,
    adminId?: string,
  ): Promise<ApiOrder> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const order = await this.prisma.order.findFirst({
      where: isUuid ? { OR: [{ id }, { orderNumber: id }] } : { orderNumber: id },
      include: {
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
      throw new BadRequestException('คำสั่งซื้อนี้ได้รับการคืนเงินเต็มจำนวนไปแล้ว');
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

    await this.prisma.$transaction(async (tx) => {
      const refundCount = await tx.refund.count({ where: { orderId: order.id } });
      const refundNumber = `REF-${order.orderNumber}-${refundCount + 1}`;

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

      const isFullRefund = alreadyRefunded + refundAmount >= totalPaid;
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
          const user = await tx.user.findUnique({ where: { id: order.userId } });
          const newBalance = Math.max(0, (user?.points ?? 0) - earnedTx.pointsChange);

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
    });

    return this.getOrderByNumber(order.orderNumber);
  }

  async getCancellationRequests(status?: CancellationRequestStatus) {
    return this.prisma.orderCancellationRequest.findMany({
      where: status ? { status } : undefined,
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
      orderBy: { createdAt: 'desc' },
    });
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
          include: { payment: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Cancellation request "${requestId}" not found`);
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

    await this.processRefund(
      request.orderId,
      {
        reason: `อนุมัติคำขอยกเลิก: ${request.reason}`,
        restockInventory: dto.restockInventory ?? true,
      },
      adminId,
    );

    return { success: true, message: 'อนุมัติคำขอยกเลิกและดำเนินการคืนเงินสำเร็จ' };
  }

  async getReturnRequests(status?: ReturnStatus) {
    return this.prisma.returnRequest.findMany({
      where: status ? { status } : undefined,
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
      orderBy: { createdAt: 'desc' },
    });
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
      return { success: true, message: 'อนุมัติคำขอคืนสินค้า ลูกค้าสามารถส่งสินค้ากลับได้' };
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

    await this.processRefund(
      request.orderId,
      {
        amount: dto.refundAmount,
        reason: `ตรวจรับสินค้าคืน: ${request.reason}`,
        restockInventory: dto.restockInventory ?? true,
      },
      adminId,
    );

    return { success: true, message: 'ตรวจรับสินค้าคืนและดำเนินการคืนเงินสำเร็จ' };
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
}
