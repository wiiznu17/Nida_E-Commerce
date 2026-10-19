import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { MailerService } from '../../core/mailer/mailer.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { OmiseService } from './omise.service.js';
import { OrderLifecycleProducerService } from '../order-lifecycle/order-lifecycle-producer.service.js';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto.js';
import {
  ORDER_TIMEOUT_MS,
  type ApiOrder,
  ApiOrderItem,
  ApiOrderAddress,
  ApiShipment,
  TrackingResult,
  ShipmentStatus,
  CarrierCode,
  CancellationRequestStatus,
  RefundStatus,
  ApiOrderCancellationRequest,
  ApiReturnRequest,
  ApiRefundSummary,
  CreateCancellationRequestDto,
  CreateReturnRequestDto,
  SubmitReturnShipmentDto,
} from '@repo/types';
import {
  OrderStatus,
  StockChangeType,
  PaymentStatus,
  DiscountType,
  ReturnStatus,
  PaymentMethod,
  PointChangeType,
} from '@repo/database';

const FREE_SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING_FEE = 50;

const CUSTOMER_ORDER_INCLUDE = {
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
  shipments: {
    include: {
      logs: { orderBy: { logTimestamp: 'desc' as const } },
    },
  },
  cancellationRequests: {
    orderBy: { createdAt: 'desc' as const },
  },
  returnRequests: {
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
  refunds: {
    orderBy: { createdAt: 'desc' as const },
  },
};

@Injectable()
export class CustomerOrdersService {
  private readonly logger = new Logger(CustomerOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly omiseService: OmiseService,
    private readonly orderLifecycleProducer: OrderLifecycleProducerService,
    private readonly redisService: RedisService,
  ) {}

  async createOrder(
    dto: CreateCustomerOrderDto,
    authenticatedUserId?: string,
  ): Promise<ApiOrder> {
    const { items, shippingAddress, paymentMethod, couponCode, customerEmail } =
      dto;
    const effectiveUserId = authenticatedUserId ?? null;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const variantIds = items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        inventoryItem: true,
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    for (const item of items) {
      let v = variantMap.get(item.variantId);
      if (!v) {
        const fallback = await this.prisma.productVariant.findFirst({
          where: {
            OR: [
              { id: item.variantId },
              { productId: item.variantId },
              { product: { slug: item.variantId } },
            ],
          },
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
            inventoryItem: true,
          },
        });
        if (fallback) {
          v = fallback;
          variantMap.set(item.variantId, fallback);
        }
      }

      if (!v) {
        throw new NotFoundException(
          `Product variant "${item.variantId}" not found`,
        );
      }

      if (!v.product.isPreorder) {
        const available = v.inventoryItem?.quantityAvailable ?? 0;
        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${v.product.name} (${v.colorName}/${v.size})". Available: ${available}, Requested: ${item.quantity}`,
          );
        }
      }
    }

    let subtotal = 0;
    const computedItems = items.map((item) => {
      const v = variantMap.get(item.variantId)!;
      const unitPrice = Number(v.product.basePrice) + Number(v.priceAdjustment);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;
      return {
        variant: v,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
        isPreorder: v.product.isPreorder,
      };
    });

    let discountTotal = 0;
    let couponId: string | null = null;
    let normalizedCouponCode: string | null = null;

    if (couponCode) {
      normalizedCouponCode = couponCode.toUpperCase().trim();
      const coupon = await this.prisma.promotionCoupon.findUnique({
        where: { code: normalizedCouponCode },
      });

      const now = new Date();
      if (!coupon || !coupon.isActive) {
        throw new BadRequestException('Coupon code is invalid or inactive');
      }
      if (coupon.startsAt > now) {
        throw new BadRequestException('Coupon is not yet active');
      }
      if (coupon.expiresAt < now) {
        throw new BadRequestException('Coupon has expired');
      }
      if (coupon.currentUsageCount >= coupon.totalUsageLimit) {
        throw new BadRequestException('Coupon usage limit reached');
      }
      if (effectiveUserId && coupon.userUsageLimit > 0) {
        const userRedemptions = await this.prisma.couponRedemption.count({
          where: { couponId: coupon.id, userId: effectiveUserId },
        });
        if (userRedemptions >= coupon.userUsageLimit) {
          throw new BadRequestException(
            'You have reached the redemption limit for this coupon',
          );
        }
      }

      const minOrder = Number(coupon.minOrderAmount);
      if (subtotal < minOrder) {
        throw new BadRequestException(
          `Minimum order amount of ฿${minOrder.toLocaleString()} required for this coupon`,
        );
      }

      couponId = coupon.id;
      const discountVal = Number(coupon.discountValue);
      if (coupon.discountType === DiscountType.PERCENTAGE) {
        discountTotal = (subtotal * discountVal) / 100;
        if (coupon.maxDiscountAmount) {
          discountTotal = Math.min(
            discountTotal,
            Number(coupon.maxDiscountAmount),
          );
        }
      } else if (coupon.discountType === DiscountType.FIXED_AMOUNT) {
        discountTotal = Math.min(subtotal, discountVal);
      } else if (coupon.discountType === DiscountType.FREE_SHIPPING) {
        discountTotal = STANDARD_SHIPPING_FEE;
      }

      discountTotal = Math.round(discountTotal * 100) / 100;
    }

    const shippingFee =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const totalAmount = Math.max(
      0,
      Math.round((subtotal - discountTotal + shippingFee) * 100) / 100,
    );

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `NIDA-${datePart}-${randomPart}`;
    const hasPreorderItems = computedItems.some((ci) => ci.isPreorder);

    const createdOrder = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: effectiveUserId,
          status: OrderStatus.PENDING,
          hasPreorderItems,
          subtotal,
          discountTotal,
          shippingFee,
          taxAmount: 0,
          totalAmount,
          currency: 'THB',
          shippingAddressSnapshot: JSON.parse(JSON.stringify(shippingAddress)),
          promoCodeUsed: normalizedCouponCode,
          couponId,
        },
      });

      for (const ci of computedItems) {
        const itemDiscountShare =
          subtotal > 0
            ? Math.round((ci.subtotal / subtotal) * discountTotal * 100) / 100
            : 0;
        const itemNetPrice = Math.max(0, ci.subtotal - itemDiscountShare);

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: ci.variant.id,
            productNameSnapshot: ci.variant.product.name,
            variantInfoSnapshot: `${ci.variant.colorName} / ${ci.variant.size}`,
            unitPrice: ci.unitPrice,
            quantity: ci.quantity,
            subtotal: ci.subtotal,
            discountShare: itemDiscountShare,
            netPrice: itemNetPrice,
            isPreorder: ci.isPreorder,
            expectedShipDate: ci.variant.product.preorderReleaseDate ?? null,
          },
        });

        if (ci.isPreorder) {
          if (ci.variant.inventoryItem) {
            if (ci.variant.preorderLimit && ci.variant.preorderLimit > 0) {
              const maxAllowedBooked = ci.variant.preorderLimit - ci.quantity;
              const updateResult = await tx.inventoryItem.updateMany({
                where: {
                  id: ci.variant.inventoryItem.id,
                  preorderBooked: { lte: maxAllowedBooked },
                },
                data: { preorderBooked: { increment: ci.quantity } },
              });
              if (updateResult.count === 0) {
                throw new BadRequestException(
                  `Pre-order quota exceeded for "${ci.variant.product.name} (${ci.variant.colorName}/${ci.variant.size})"`,
                );
              }
            } else {
              await tx.inventoryItem.update({
                where: { id: ci.variant.inventoryItem.id },
                data: { preorderBooked: { increment: ci.quantity } },
              });
            }
          }
        } else if (ci.variant.inventoryItem) {
          const updateResult = await tx.inventoryItem.updateMany({
            where: {
              id: ci.variant.inventoryItem.id,
              quantityAvailable: { gte: ci.quantity },
            },
            data: {
              quantityAvailable: { decrement: ci.quantity },
            },
          });

          if (updateResult.count === 0) {
            throw new BadRequestException(
              `Insufficient stock for "${ci.variant.product.name} (${ci.variant.colorName}/${ci.variant.size})"`,
            );
          }

          const updatedInv = await tx.inventoryItem.findUnique({
            where: { id: ci.variant.inventoryItem.id },
            select: { quantityAvailable: true },
          });

          await tx.stockMovement.create({
            data: {
              variantId: ci.variant.id,
              changeType: StockChangeType.ORDER_DEDUCT,
              quantityChange: -ci.quantity,
              balanceAfter: updatedInv?.quantityAvailable ?? 0,
              reasonNote: `Storefront Order #${orderNumber}`,
            },
          });
        }
      }

      if (couponId) {
        const couponDef = await tx.promotionCoupon.findUnique({
          where: { id: couponId },
          select: { userUsageLimit: true, totalUsageLimit: true, isActive: true },
        });

        if (!couponDef || !couponDef.isActive) {
          throw new BadRequestException('Coupon code is invalid or inactive');
        }

        if (effectiveUserId && couponDef.userUsageLimit > 0) {
          const userRedemptions = await tx.couponRedemption.count({
            where: { couponId, userId: effectiveUserId },
          });
          if (userRedemptions >= couponDef.userUsageLimit) {
            throw new BadRequestException(
              'You have reached the redemption limit for this coupon',
            );
          }
        }

        const couponUpdate = await tx.promotionCoupon.updateMany({
          where: {
            id: couponId,
            currentUsageCount: { lt: couponDef.totalUsageLimit },
            isActive: true,
          },
          data: { currentUsageCount: { increment: 1 } },
        });

        if (couponUpdate.count === 0) {
          throw new BadRequestException('Coupon usage limit reached');
        }

        await tx.couponRedemption.create({
          data: {
            couponId,
            userId: effectiveUserId,
            orderId: order.id,
            discountGranted: discountTotal,
          },
        });
      }

      const orderExpiresAt = new Date(
        Date.now() + ORDER_TIMEOUT_MS.STOREFRONT_UNPAID,
      );

      let omiseChargeId: string | undefined;
      let omiseQrUri: string | undefined;
      let omiseQrExpiresAt: string | undefined;

      if (paymentMethod === PaymentMethod.PROMPTPAY && totalAmount > 0) {
        try {
          const qrResult = await this.omiseService.createPromptPayCharge(
            orderNumber,
            totalAmount,
            orderExpiresAt,
          );
          omiseChargeId = qrResult.chargeId;
          omiseQrUri = qrResult.qrDownloadUri;
          omiseQrExpiresAt = qrResult.expiresAt;
        } catch (err: unknown) {
          this.logger.warn(`Failed to generate initial Omise PromptPay QR for #${orderNumber}: ${err}`);
        }
      }

      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethod,
          amount: totalAmount,
          currency: 'THB',
          status: PaymentStatus.PENDING,
          transactionReference: omiseChargeId,
          rawWebhookPayload: {
            qrDownloadUri: omiseQrUri,
            qrExpiresAt: omiseQrExpiresAt,
          },
        },
      });

      return order;
    });

    await this.orderLifecycleProducer.scheduleOrderTimeout(
      createdOrder.id,
      createdOrder.orderNumber,
      ORDER_TIMEOUT_MS.STOREFRONT_UNPAID,
    );

    const recipientEmail = customerEmail ?? null;
    if (recipientEmail) {
      this.mailerService
        .sendOrderConfirmation({
          to: recipientEmail,
          orderNumber: createdOrder.orderNumber,
          totalAmount: Number(createdOrder.totalAmount),
        })
        .catch((err: unknown) => {
          this.logger.error(
            `Failed to send order confirmation email for ${createdOrder.orderNumber}:`,
            err,
          );
        });
    }

    return this.getOrderByNumber(createdOrder.orderNumber);
  }

  async getMyOrders(userId: string): Promise<ApiOrder[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: 'desc' },
      include: CUSTOMER_ORDER_INCLUDE,
    });

    return orders.map((order) => this.mapOrder(order));
  }

  async getOrderByNumber(
    orderNumber: string,
    userId?: string,
  ): Promise<ApiOrder> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: CUSTOMER_ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    return this.mapOrder(order);
  }

  async requestCancellation(
    orderNumber: string,
    dto: CreateCancellationRequestDto,
    userId?: string,
  ): Promise<ApiOrder> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        cancellationRequests: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    const eligibleStatuses: OrderStatus[] = [
      OrderStatus.PAID,
      OrderStatus.PREORDER_AWAITING_STOCK,
      OrderStatus.PROCESSING,
    ];

    if (!eligibleStatuses.includes(order.status)) {
      if (order.status === OrderStatus.PENDING) {
        throw new BadRequestException(
          'คำสั่งซื้อนี้ยังไม่ได้ชำระเงิน หากไม่ต้องการสินค้าสามารถปล่อยให้หมดเวลาชำระเงินได้',
        );
      }
      if (
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED
      ) {
        throw new BadRequestException(
          'คำสั่งซื้ออยู่ในขั้นตอนจัดส่งหรือสำเร็จแล้ว ไม่สามารถขอยกเลิกได้ หากต้องการคืนสินค้ากรุณาใช้เมนูขอคืนสินค้า',
        );
      }
      throw new BadRequestException(
        'คำสั่งซื้อนี้ไม่สามารถขอยกเลิกได้ในสถานะปัจจุบัน',
      );
    }

    const hasPending = order.cancellationRequests.some(
      (req) => req.status === 'PENDING',
    );
    if (hasPending) {
      throw new BadRequestException(
        'มีคำขอยกเลิกสำหรับคำสั่งซื้อนี้ที่กำลังรอเจ้าหน้าที่ตรวจสอบอยู่แล้ว',
      );
    }

    const effectiveUserId = userId ?? order.userId;
    if (!effectiveUserId) {
      throw new BadRequestException(
        'กรุณาเข้าสู่ระบบเพื่อดำเนินการขอยกเลิกคำสั่งซื้อ',
      );
    }

    const count = order.cancellationRequests.length;
    const requestNumber = `CAN-${order.orderNumber}-${count + 1}`;

    const newRequest = await this.prisma.orderCancellationRequest.create({
      data: {
        requestNumber,
        orderId: order.id,
        userId: effectiveUserId,
        reason: dto.reason,
        customerNote: dto.customerNote ?? null,
        status: 'PENDING',
      },
    });

    await this.orderLifecycleProducer.scheduleCancellationReviewTimeout(
      order.id,
      newRequest.id,
      order.orderNumber,
      ORDER_TIMEOUT_MS.CANCELLATION_REVIEW,
    );

    return this.getOrderByNumber(orderNumber, userId);
  }

  async acceptOrder(
    orderNumber: string,
    userId?: string,
  ): Promise<ApiOrder> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (order.status === OrderStatus.COMPLETED) {
      return this.getOrderByNumber(orderNumber, userId);
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'สามารถกดยอมรับสินค้าได้เฉพาะคำสั่งซื้อที่จัดส่งสำเร็จ (DELIVERED) แล้วเท่านั้น',
      );
    }

    const activeReturn = await this.prisma.returnRequest.findFirst({
      where: {
        orderId: order.id,
        status: {
          in: [
            ReturnStatus.REQUESTED,
            ReturnStatus.APPROVED,
            ReturnStatus.SHIPPED,
          ],
        },
      },
    });
    if (activeReturn) {
      throw new BadRequestException(
        'ไม่สามารถกดยอมรับสินค้าได้เนื่องจากมีคำขอคืนสินค้าอยู่ระหว่างดำเนินการ',
      );
    }

    const now = new Date();
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt: now,
      },
    });

    await this.orderLifecycleProducer.cancelDeliveryCompletion(order.id);

    if (order.userId) {
      const pointsToEarn = Math.floor(Number(order.totalAmount) / 100);
      if (pointsToEarn > 0) {
        try {
          const existingPoints = await this.prisma.pointTransaction.findFirst({
            where: {
              orderId: order.id,
              changeType: PointChangeType.EARNED_ORDER,
            },
          });

          if (!existingPoints) {
            const user = await this.prisma.user.findUnique({
              where: { id: order.userId },
              select: { points: true },
            });
            const currentPoints = user?.points ?? 0;
            const newBalance = currentPoints + pointsToEarn;

            await this.prisma.pointTransaction.create({
              data: {
                userId: order.userId,
                orderId: order.id,
                changeType: PointChangeType.EARNED_ORDER,
                pointsChange: pointsToEarn,
                balanceAfter: newBalance,
                description: `Loyalty points earned from completed order #${order.orderNumber}`,
              },
            });

            await this.prisma.user.update({
              where: { id: order.userId },
              data: {
                points: newBalance,
              },
            });
          }
        } catch (err: unknown) {
          console.warn('[CustomerOrdersService] Loyalty points error:', err);
        }
      }
    }

    return this.getOrderByNumber(orderNumber, userId);
  }

  async requestReturn(
    orderNumber: string,
    dto: CreateReturnRequestDto,
    userId?: string,
  ): Promise<ApiOrder> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        shipments: true,
        returnRequests: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    const isDeliveredOrCompleted =
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.COMPLETED;

    if (!isDeliveredOrCompleted) {
      throw new BadRequestException(
        'สามารถขอคืนสินค้าได้เฉพาะคำสั่งซื้อที่จัดส่งสำเร็จแล้วเท่านั้น',
      );
    }

    const RETURN_WINDOW_DAYS = 7;
    const deliveredShipment = order.shipments?.find(
      (s) => s.status === 'DELIVERED',
    );
    const deliveryDate = deliveredShipment?.updatedAt ?? order.updatedAt;
    const isExpired =
      Date.now() - new Date(deliveryDate).getTime() >
      RETURN_WINDOW_DAYS * 86400 * 1000;

    if (isExpired) {
      throw new BadRequestException(
        'คำสั่งซื้อนี้หมดระยะเวลาการยื่นคำร้องขอคืนสินค้าแล้ว (เกิน 7 วันหลังส่งมอบ)',
      );
    }

    const hasActiveReturn = order.returnRequests.some(
      (req) =>
        req.status === ReturnStatus.REQUESTED ||
        req.status === ReturnStatus.APPROVED ||
        req.status === ReturnStatus.SHIPPED,
    );
    if (hasActiveReturn) {
      throw new BadRequestException(
        'มีคำขอคืนสินค้าสำหรับคำสั่งซื้อนี้ที่อยู่ระหว่างดำเนินการแล้ว',
      );
    }

    const effectiveUserId = userId ?? order.userId;
    if (!effectiveUserId) {
      throw new BadRequestException(
        'กรุณาเข้าสู่ระบบเพื่อดำเนินการขอคืนสินค้า',
      );
    }

    const orderItemIds = new Set(order.items.map((i) => i.id));
    for (const item of dto.items) {
      if (!orderItemIds.has(item.orderItemId)) {
        throw new BadRequestException(
          `ไม่พบรายการสินค้า ${item.orderItemId} ในคำสั่งซื้อนี้`,
        );
      }
      const existingItem = order.items.find((i) => i.id === item.orderItemId);
      if (existingItem && item.quantity > existingItem.quantity) {
        throw new BadRequestException(
          `จำนวนชิ้นที่ขอคืน (${item.quantity}) เกินจำนวนที่สั่งซื้อ (${existingItem.quantity})`,
        );
      }
    }

    const count = order.returnRequests.length;
    const requestNumber = `RET-${order.orderNumber}-${count + 1}`;

    await this.prisma.returnRequest.create({
      data: {
        requestNumber,
        orderId: order.id,
        userId: effectiveUserId,
        reason: dto.reason,
        customerNote: dto.customerNote ?? null,
        status: ReturnStatus.REQUESTED,
        items: {
          create: dto.items.map((i) => ({
            orderItemId: i.orderItemId,
            quantity: i.quantity,
          })),
        },
      },
    });

    return this.getOrderByNumber(orderNumber, userId);
  }

  async submitReturnShipment(
    orderNumber: string,
    returnRequestId: string,
    dto: SubmitReturnShipmentDto,
    userId?: string,
  ): Promise<ApiOrder> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        returnRequests: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    const returnReq = order.returnRequests.find((r) => r.id === returnRequestId);
    if (!returnReq) {
      throw new NotFoundException(
        `Return request ${returnRequestId} not found for this order`,
      );
    }

    if (returnReq.status !== ReturnStatus.APPROVED) {
      throw new BadRequestException(
        'สามารถแจ้งเลขพัสดุได้เฉพาะคำขอคืนสินค้าที่ได้รับอนุมัติแล้วเท่านั้น (Status must be APPROVED)',
      );
    }

    await this.prisma.returnRequest.update({
      where: { id: returnRequestId },
      data: {
        status: ReturnStatus.SHIPPED,
        returnCarrier: dto.returnCarrier.trim(),
        returnTrackingNumber: dto.returnTrackingNumber.trim(),
        returnShippingFee:
          dto.returnShippingFee !== undefined ? dto.returnShippingFee : null,
        returnShippingReceiptUrl: dto.returnShippingReceiptUrl?.trim() || null,
        shippedAt: new Date(),
      },
    });

    // Cancel 7-day auto-void timer as customer dispatched the parcel
    await this.orderLifecycleProducer.cancelReturnDeadline(returnRequestId);

    return this.getOrderByNumber(orderNumber, userId);
  }

  async updatePaymentMethod(
    orderNumber: string,
    paymentMethod: PaymentMethod,
    userId?: string,
  ): Promise<ApiOrder> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'สามารถเปลี่ยนวิธีชำระเงินได้เฉพาะคำสั่งซื้อที่ยังไม่ได้ชำระเงินเท่านั้น',
      );
    }

    const orderExpiresAt = new Date(
      order.placedAt.getTime() + ORDER_TIMEOUT_MS.STOREFRONT_UNPAID,
    );
    const remainingMs = orderExpiresAt.getTime() - Date.now();

    if (remainingMs <= 60_000) {
      throw new BadRequestException(
        'คำสั่งซื้อนี้ใกล้หมดเวลาชำระเงินแล้ว ไม่สามารถสลับช่องทางได้ กรุณาสั่งซื้อใหม่อีกครั้ง',
      );
    }

    const rateLimit = await this.redisService.checkRateLimit(
      `switch-payment:${orderNumber}`,
      1,
      2,
    );
    if (!rateLimit.allowed) {
      throw new BadRequestException(
        'กรุณารอ 2 วินาทีก่อนเปลี่ยนช่องทางชำระเงินอีกครั้ง (Please wait 2 seconds before switching payment method again)',
      );
    }

    if (order.payment && order.payment.paymentMethod === paymentMethod) {
      return this.getOrderByNumber(orderNumber, userId);
    }

    const rawMeta =
      order.payment?.rawWebhookPayload &&
      typeof order.payment.rawWebhookPayload === 'object' &&
      !Array.isArray(order.payment.rawWebhookPayload)
        ? (order.payment.rawWebhookPayload as Record<string, unknown>)
        : {};

    let newQrUri: string | undefined;
    let newExpiresAt: string | undefined;
    let newChargeId: string | undefined;

    if (paymentMethod === PaymentMethod.PROMPTPAY) {
      try {
        const qrResult = await this.omiseService.createPromptPayCharge(
          orderNumber,
          Number(order.totalAmount),
          orderExpiresAt,
        );
        newQrUri = qrResult.qrDownloadUri;
        newExpiresAt = qrResult.expiresAt;
        newChargeId = qrResult.chargeId;
      } catch (err: unknown) {
        this.logger.warn(`Failed to create Omise PromptPay QR on method switch: ${err}`);
      }
    }

    if (order.payment) {
      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          paymentMethod,
          transactionReference: newChargeId ?? order.payment.transactionReference,
          rawWebhookPayload: {
            ...rawMeta,
            lastSwitchedAt: new Date().toISOString(),
            qrDownloadUri: newQrUri,
            qrExpiresAt: newExpiresAt,
            failureMessage: null,
          },
        },
      });
    }

    return this.getOrderByNumber(orderNumber, userId);
  }

  async payOrder(
    orderNumber: string,
    userId?: string,
    payload?: {
      paymentMethod?: PaymentMethod;
      omiseToken?: string;
      cardLast4?: string;
      cardBrand?: string;
    },
  ): Promise<{
    order: ApiOrder;
    authorizeUri?: string | null;
    qrDownloadUri?: string | null;
    expiresAt?: string | null;
  }> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      const current = await this.getOrderByNumber(orderNumber, userId);
      return { order: current };
    }

    const targetMethod =
      payload?.paymentMethod ??
      order.payment?.paymentMethod ??
      PaymentMethod.PROMPTPAY;

    // Credit Card Charge with Omise Token (supports 3-D Secure OTP)
    if (targetMethod === PaymentMethod.CREDIT_CARD) {
      if (!payload?.omiseToken) {
        throw new BadRequestException(
          'กรุณาระบุ omiseToken สำหรับการชำระเงินผ่านบัตรเครดิต',
        );
      }

      const charge = await this.omiseService.createCreditCardCharge(
        orderNumber,
        Number(order.totalAmount),
        payload.omiseToken,
      );

      if (charge.status === 'failed') {
        if (order.payment) {
          const rawMeta =
            (order.payment.rawWebhookPayload as Record<string, unknown> | null) ?? {};
          await this.prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              rawWebhookPayload: {
                ...rawMeta,
                failureMessage: charge.failureMessage,
              },
            },
          });
        }
        throw new BadRequestException(
          charge.failureMessage || 'การชำระเงินผ่านบัตรไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัตรหรือลองใหม่อีกครั้ง',
        );
      }

      if (charge.status === 'pending' && charge.authorizeUri) {
        if (order.payment) {
          await this.prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              transactionReference: charge.chargeId,
              cardBrand: charge.cardBrand,
              cardLast4: charge.cardLast4,
              paymentMethod: PaymentMethod.CREDIT_CARD,
            },
          });
        }
        const updatedOrder = await this.getOrderByNumber(orderNumber, userId);
        return { order: updatedOrder, authorizeUri: charge.authorizeUri };
      }

      if (charge.status === 'successful') {
        const nextStatus = order.hasPreorderItems
          ? OrderStatus.PREORDER_AWAITING_STOCK
          : OrderStatus.PAID;

        await this.prisma.$transaction(async (tx) => {
          if (order.payment) {
            await tx.payment.update({
              where: { id: order.payment.id },
              data: {
                paymentMethod: PaymentMethod.CREDIT_CARD,
                transactionReference: charge.chargeId,
                cardLast4: charge.cardLast4,
                cardBrand: charge.cardBrand,
                status: PaymentStatus.CAPTURED,
                paidAt: new Date(),
              },
            });
          }

          await tx.order.update({
            where: { id: order.id },
            data: { status: nextStatus },
          });
        });

        await this.orderLifecycleProducer.cancelOrderTimeout(order.id);

        const updatedOrder = await this.getOrderByNumber(orderNumber, userId);
        return { order: updatedOrder };
      }
    }

    // PromptPay Refresh/Creation
    if (targetMethod === PaymentMethod.PROMPTPAY) {
      const orderExpiresAt = new Date(
        order.placedAt.getTime() + ORDER_TIMEOUT_MS.STOREFRONT_UNPAID,
      );
      if (Date.now() >= orderExpiresAt.getTime()) {
        throw new BadRequestException(
          'คำสั่งซื้อนี้หมดเวลาชำระเงินแล้ว กรุณาสั่งซื้อใหม่อีกครั้ง',
        );
      }

      let qrDownloadUri: string | undefined;
      let expiresAt: string | undefined;

      try {
        const qrResult = await this.omiseService.createPromptPayCharge(
          orderNumber,
          Number(order.totalAmount),
          orderExpiresAt,
        );
        qrDownloadUri = qrResult.qrDownloadUri;
        expiresAt = qrResult.expiresAt;

        if (order.payment) {
          const rawMeta =
            (order.payment.rawWebhookPayload as Record<string, unknown> | null) ?? {};
          await this.prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              paymentMethod: PaymentMethod.PROMPTPAY,
              transactionReference: qrResult.chargeId,
              rawWebhookPayload: {
                ...rawMeta,
                qrDownloadUri,
                qrExpiresAt: expiresAt,
                failureMessage: null,
              },
            },
          });
        }
      } catch (err: unknown) {
        this.logger.warn(`Failed to generate Omise PromptPay QR for #${orderNumber}: ${err}`);
      }

      const updatedOrder = await this.getOrderByNumber(orderNumber, userId);
      return { order: updatedOrder, qrDownloadUri, expiresAt };
    }

    throw new BadRequestException(
      `วิธีการชำระเงินไม่ถูกต้อง หรือยังไม่รองรับ: ${targetMethod}`,
    );
  }

  async syncOmiseChargeStatus(
    orderNumber: string,
    userId?: string,
  ): Promise<{ order: ApiOrder; chargeStatus?: string; failureMessage?: string }> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    const chargeId = order.payment?.transactionReference;
    if (!chargeId || !chargeId.startsWith('chrg_')) {
      const current = await this.getOrderByNumber(orderNumber, userId);
      return { order: current };
    }

    try {
      const charge = await this.omiseService.getCharge(chargeId);
      const rawMeta =
        (order.payment?.rawWebhookPayload as Record<string, unknown> | null) ?? {};

      if (charge.paid || charge.status === 'successful') {
        const nextStatus = order.hasPreorderItems
          ? OrderStatus.PREORDER_AWAITING_STOCK
          : OrderStatus.PAID;

        await this.prisma.$transaction(async (tx) => {
          if (order.payment) {
            await tx.payment.update({
              where: { id: order.payment.id },
              data: {
                status: PaymentStatus.CAPTURED,
                paidAt: new Date(),
                rawWebhookPayload: {
                  ...rawMeta,
                  failureMessage: null,
                },
              },
            });
          }

          await tx.order.update({
            where: { id: order.id },
            data: { status: nextStatus },
          });
        });

        await this.orderLifecycleProducer.cancelOrderTimeout(order.id);
      } else if (charge.status === 'failed') {
        if (order.payment) {
          await this.prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              rawWebhookPayload: {
                ...rawMeta,
                failureMessage: charge.failure_message,
              },
            },
          });
        }
      }

      const updated = await this.getOrderByNumber(orderNumber, userId);
      return {
        order: updated,
        chargeStatus: charge.status,
        failureMessage: charge.failure_message ?? undefined,
      };
    } catch (err: unknown) {
      this.logger.warn(`Failed to sync Omise charge #${chargeId}: ${err}`);
      const current = await this.getOrderByNumber(orderNumber, userId);
      return { order: current };
    }
  }

  async simulateOmisePay(
    orderNumber: string,
    userId?: string,
  ): Promise<ApiOrder> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    const chargeId = order.payment?.transactionReference;
    if (chargeId && chargeId.startsWith('chrg_test_')) {
      try {
        await this.omiseService.simulateMarkAsPaid(chargeId);
      } catch (err: unknown) {
        this.logger.warn(`Could not mark charge as paid in Omise: ${err}`);
      }
    }

    const nextStatus = order.hasPreorderItems
      ? OrderStatus.PREORDER_AWAITING_STOCK
      : OrderStatus.PAID;

    await this.prisma.$transaction(async (tx) => {
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: PaymentStatus.CAPTURED,
            paidAt: new Date(),
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: nextStatus },
      });
    });

    await this.orderLifecycleProducer.cancelOrderTimeout(order.id);

    return this.getOrderByNumber(orderNumber, userId);
  }

  async handleOmiseWebhook(event: Record<string, unknown>): Promise<{ received: boolean }> {
    const eventKey = event.key as string;
    const data = event.data as Record<string, unknown> | undefined;

    if (eventKey === 'charge.complete' && data) {
      const chargeId = data.id as string;
      const status = data.status as string;
      const metadata = data.metadata as Record<string, unknown> | undefined;
      const orderNumber = metadata?.orderNumber as string | undefined;

      this.logger.log(`Received Omise charge.complete for charge ${chargeId}, status: ${status}, orderNumber: ${orderNumber}`);

      if (orderNumber) {
        const order = await this.prisma.order.findUnique({
          where: { orderNumber },
          include: { payment: true },
        });

        if (order && order.status === OrderStatus.PENDING) {
          if (status === 'successful') {
            const nextStatus = order.hasPreorderItems
              ? OrderStatus.PREORDER_AWAITING_STOCK
              : OrderStatus.PAID;

            await this.prisma.$transaction(async (tx) => {
              if (order.payment) {
                await tx.payment.update({
                  where: { id: order.payment.id },
                  data: {
                    status: PaymentStatus.CAPTURED,
                    paidAt: new Date(),
                  },
                });
              }

              await tx.order.update({
                where: { id: order.id },
                data: { status: nextStatus },
              });
            });

            await this.orderLifecycleProducer.cancelOrderTimeout(order.id);
          } else if (status === 'failed' && order.payment) {
            const rawMeta =
              (order.payment.rawWebhookPayload as Record<string, unknown> | null) ?? {};
            await this.prisma.payment.update({
              where: { id: order.payment.id },
              data: {
                rawWebhookPayload: {
                  ...rawMeta,
                  failureMessage: typeof data.failure_message === 'string' ? data.failure_message : null,
                },
              },
            });
          }
        }
      }
    }

    return { received: true };
  }

  async trackOrder(
    orderNumber: string,
    phone?: string,
  ): Promise<TrackingResult> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        shipments: {
          include: {
            logs: { orderBy: { logTimestamp: 'asc' } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (phone && phone.trim()) {
      const snap = (order.shippingAddressSnapshot as Record<string, unknown>) ?? {};
      const snapPhone = String(snap.phone ?? '').replace(/\D/g, '');
      const queryPhone = phone.trim().replace(/\D/g, '');
      if (
        snapPhone &&
        queryPhone &&
        !snapPhone.endsWith(queryPhone) &&
        !queryPhone.endsWith(snapPhone)
      ) {
        throw new NotFoundException(
          'ไม่พบข้อมูลคำสั่งซื้อ หรือเบอร์โทรศัพท์ไม่ตรงกับข้อมูลจัดส่ง',
        );
      }
    }

    const latestShipment = order.shipments[0];
    const shipment: ApiShipment = latestShipment
      ? {
          id: latestShipment.id,
          courierName: latestShipment.courierName,
          trackingNumber: latestShipment.trackingNumber,
          status: latestShipment.status,
          shippedAt: latestShipment.shippedAt
            ? latestShipment.shippedAt.toISOString()
            : undefined,
          estimatedDelivery: latestShipment.estimatedDelivery
            ? latestShipment.estimatedDelivery.toISOString()
            : undefined,
          deliveredAt: latestShipment.deliveredAt
            ? latestShipment.deliveredAt.toISOString()
            : undefined,
          timeline: latestShipment.logs.map((log) => ({
            id: log.id,
            statusTitle: log.statusTitle,
            statusDescription: log.statusDescription ?? undefined,
            location: log.location ?? undefined,
            timestamp: log.logTimestamp.toISOString(),
          })),
        }
      : {
          id: 'pending',
          courierName: 'FLASH_EXPRESS',
          trackingNumber: 'PENDING',
          status: 'LABEL_CREATED',
          timeline: [
            {
              id: '1',
              statusTitle: 'คำสั่งซื้อได้รับการบันทึก',
              statusDescription: 'ร้านค้ากำลังเตรียมบรรจุสินค้าเพื่อจัดส่ง',
              location: 'Nida Fulfillment Hub, Bangkok',
              timestamp: order.placedAt.toISOString(),
            },
          ],
        };

    return {
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      shipment,
    };
  }

  private mapOrder(order: {
    id: string;
    orderNumber: string;
    userId: string | null;
    status: OrderStatus;
    hasPreorderItems: boolean;
    subtotal: { toNumber(): number } | number;
    discountTotal: { toNumber(): number } | number;
    shippingFee: { toNumber(): number } | number;
    taxAmount: { toNumber(): number } | number;
    totalAmount: { toNumber(): number } | number;
    currency: string;
    shippingAddressSnapshot: unknown;
    promoCodeUsed: string | null;
    placedAt: Date;
    completedAt?: Date | null;
    updatedAt?: Date;
    items: Array<{
      id: string;
      variantId: string;
      productNameSnapshot: string;
      variantInfoSnapshot: string;
      unitPrice: { toNumber(): number } | number;
      quantity: number;
      subtotal: { toNumber(): number } | number;
      discountShare: { toNumber(): number } | number;
      netPrice: { toNumber(): number } | number;
      isPreorder: boolean;
      expectedShipDate: Date | null;
      variant?: {
        skuCode: string;
        product?: {
          images?: Array<{ imageUrl: string }>;
        };
      };
    }>;
    payment: {
      paymentMethod: PaymentMethod;
      amount: { toNumber(): number } | number;
      currency: string;
      status: PaymentStatus;
      cardLast4?: string | null;
      cardBrand?: string | null;
      paidAt: Date | null;
      rawWebhookPayload?: unknown;
    } | null;
    shipments: Array<{
      id: string;
      carrierCode?: CarrierCode | null;
      courierName: string;
      trackingNumber: string;
      status: ShipmentStatus;
      shippedAt: Date | null;
      estimatedDelivery: Date | null;
      deliveredAt: Date | null;
      logs: Array<{
        id: string;
        statusTitle: string;
        statusDescription: string | null;
        location: string | null;
        logTimestamp: Date;
      }>;
    }>;
    cancellationRequests?: Array<{
      id: string;
      requestNumber: string;
      orderId: string;
      userId: string;
      reason: string;
      customerNote: string | null;
      adminNote: string | null;
      status: string;
      reviewedAt: Date | null;
      reviewedBy: string | null;
      createdAt: Date;
    }>;
    returnRequests?: Array<{
      id: string;
      requestNumber: string;
      orderId: string;
      userId: string;
      reason: string;
      customerNote: string | null;
      adminNote: string | null;
      status: string;
      returnCarrier?: string | null;
      returnTrackingNumber?: string | null;
      returnShippingFee?: { toNumber(): number } | number | null;
      returnShippingReceiptUrl?: string | null;
      shippedAt?: Date | null;
      items?: Array<{
        id: string;
        orderItemId: string;
        quantity: number;
      }>;
      reviewedAt: Date | null;
      reviewedBy: string | null;
      createdAt: Date;
    }>;
    refunds?: Array<{
      id: string;
      refundNumber: string;
      orderId: string;
      paymentId: string;
      amount: { toNumber(): number } | number;
      reason: string | null;
      gatewayRefundId: string | null;
      status: string;
      createdAdminId: string | null;
      createdAt: Date;
    }>;
  }): ApiOrder {
    const rawAddr =
      (order.shippingAddressSnapshot as Record<string, string>) ?? {};
    const shippingAddress: ApiOrderAddress = {
      recipientName: rawAddr.recipientName ?? '',
      phone: rawAddr.phone ?? '',
      addressLine1: rawAddr.addressLine1 ?? '',
      addressLine2: rawAddr.addressLine2,
      subdistrict: rawAddr.subdistrict ?? '',
      district: rawAddr.district ?? '',
      province: rawAddr.province ?? '',
      postalCode: rawAddr.postalCode ?? '',
    };

    const items: ApiOrderItem[] = order.items.map((i) => {
      const firstImage = i.variant?.product?.images?.[0]?.imageUrl;
      return {
        id: i.id,
        productName: i.productNameSnapshot,
        variantInfo: i.variantInfoSnapshot,
        imageUrl: firstImage,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
        discountShare: Number(i.discountShare),
        netPrice: Number(i.netPrice),
        isPreorder: i.isPreorder,
        expectedShipDate: i.expectedShipDate
          ? i.expectedShipDate.toISOString()
          : undefined,
      };
    });

    const shipments: ApiShipment[] = order.shipments.map((s) => ({
      id: s.id,
      carrierCode: (s.carrierCode as CarrierCode | null) ?? undefined,
      courierName: s.courierName,
      trackingNumber: s.trackingNumber,
      status: s.status,
      shippedAt: s.shippedAt ? s.shippedAt.toISOString() : undefined,
      estimatedDelivery: s.estimatedDelivery
        ? s.estimatedDelivery.toISOString()
        : undefined,
      deliveredAt: s.deliveredAt ? s.deliveredAt.toISOString() : undefined,
      timeline: (s.logs ?? []).map((l) => ({
        id: l.id,
        statusTitle: l.statusTitle,
        statusDescription: l.statusDescription ?? undefined,
        location: l.location ?? undefined,
        timestamp: l.logTimestamp.toISOString(),
      })),
    }));

    const cancellationRequests: ApiOrderCancellationRequest[] = (
      order.cancellationRequests ?? []
    ).map((c) => ({
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
    }));

    const returnRequests: ApiReturnRequest[] = (
      order.returnRequests ?? []
    ).map((r) => ({
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
      returnShippingFee: r.returnShippingFee ? Number(r.returnShippingFee) : undefined,
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
    }));

    const refunds: ApiRefundSummary[] = (order.refunds ?? []).map((rf) => ({
      id: rf.id,
      refundNumber: rf.refundNumber,
      orderId: rf.orderId,
      paymentId: rf.paymentId,
      amount: Number(rf.amount),
      reason: rf.reason ?? undefined,
      gatewayRefundId: rf.gatewayRefundId ?? undefined,
      status: rf.status as RefundStatus,
      createdAdminId: rf.createdAdminId ?? undefined,
      createdAt: rf.createdAt.toISOString(),
    }));

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId ?? undefined,
      status: order.status,
      hasPreorderItems: order.hasPreorderItems,
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      shippingFee: Number(order.shippingFee),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      shippingAddress,
      promoCodeUsed: order.promoCodeUsed ?? undefined,
      items,
      payment: order.payment
        ? {
            paymentMethod: order.payment.paymentMethod,
            status: order.payment.status,
            cardLast4: order.payment.cardLast4 ?? undefined,
            cardBrand: order.payment.cardBrand ?? undefined,
            paidAt: order.payment.paidAt
              ? order.payment.paidAt.toISOString()
              : undefined,
            qrDownloadUri:
              order.payment.rawWebhookPayload &&
              typeof order.payment.rawWebhookPayload === 'object' &&
              !Array.isArray(order.payment.rawWebhookPayload) &&
              typeof (order.payment.rawWebhookPayload as Record<string, unknown>).qrDownloadUri === 'string'
                ? ((order.payment.rawWebhookPayload as Record<string, unknown>).qrDownloadUri as string)
                : undefined,
            qrExpiresAt:
              order.payment.rawWebhookPayload &&
              typeof order.payment.rawWebhookPayload === 'object' &&
              !Array.isArray(order.payment.rawWebhookPayload) &&
              typeof (order.payment.rawWebhookPayload as Record<string, unknown>).qrExpiresAt === 'string'
                ? ((order.payment.rawWebhookPayload as Record<string, unknown>).qrExpiresAt as string)
                : undefined,
            failureMessage:
              order.payment.rawWebhookPayload &&
              typeof order.payment.rawWebhookPayload === 'object' &&
              !Array.isArray(order.payment.rawWebhookPayload) &&
              typeof (order.payment.rawWebhookPayload as Record<string, unknown>).failureMessage === 'string'
                ? ((order.payment.rawWebhookPayload as Record<string, unknown>).failureMessage as string)
                : undefined,
          }
        : undefined,
      shipments,
      cancellationRequests,
      returnRequests,
      refunds,
      placedAt: order.placedAt.toISOString(),
      completedAt: order.completedAt ? order.completedAt.toISOString() : null,
      updatedAt: order.updatedAt?.toISOString(),
    };
  }
}
