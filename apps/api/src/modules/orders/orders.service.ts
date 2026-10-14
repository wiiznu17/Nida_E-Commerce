import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { MailerService } from '../../core/mailer/mailer.service.js';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto.js';
import type {
  ApiOrder,
  ApiOrderItem,
  ApiOrderAddress,
  ApiShipment,
  TrackingResult,
  PaymentMethod,
  ShipmentStatus,
  CarrierCode,
} from '@repo/types';
import {
  OrderStatus,
  StockChangeType,
  PaymentStatus,
  DiscountType,
} from '@repo/database';

const FREE_SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING_FEE = 50;

@Injectable()
export class CustomerOrdersService {
  private readonly logger = new Logger(CustomerOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async createOrder(
    dto: CreateCustomerOrderDto,
    authenticatedUserId?: string,
  ): Promise<ApiOrder> {
    const { items, shippingAddress, paymentMethod, couponCode, customerEmail } = dto;
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
      const v = variantMap.get(item.variantId);
      if (!v) {
        throw new NotFoundException(`Product variant "${item.variantId}" not found`);
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
          throw new BadRequestException('You have reached the redemption limit for this coupon');
        }
      }

      const minOrder = Number(coupon.minOrderAmount);
      if (subtotal < minOrder) {
        throw new BadRequestException(`Minimum order amount of ฿${minOrder.toLocaleString()} required for this coupon`);
      }

      couponId = coupon.id;
      const discountVal = Number(coupon.discountValue);
      if (coupon.discountType === DiscountType.PERCENTAGE) {
        discountTotal = (subtotal * discountVal) / 100;
        if (coupon.maxDiscountAmount) {
          discountTotal = Math.min(discountTotal, Number(coupon.maxDiscountAmount));
        }
      } else if (coupon.discountType === DiscountType.FIXED_AMOUNT) {
        discountTotal = Math.min(subtotal, discountVal);
      } else if (coupon.discountType === DiscountType.FREE_SHIPPING) {
        discountTotal = STANDARD_SHIPPING_FEE;
      }

      discountTotal = Math.round(discountTotal * 100) / 100;
    }

    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const totalAmount = Math.max(0, Math.round((subtotal - discountTotal + shippingFee) * 100) / 100);

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
        const itemDiscountShare = subtotal > 0
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
            await tx.inventoryItem.update({
              where: { id: ci.variant.inventoryItem.id },
              data: { preorderBooked: { increment: ci.quantity } },
            });
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
        await tx.couponRedemption.create({
          data: {
            couponId,
            userId: effectiveUserId,
            orderId: order.id,
            discountGranted: discountTotal,
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
          amount: totalAmount,
          currency: 'THB',
          status: PaymentStatus.PENDING,
        },
      });

      return order;
    });

    const recipientEmail = customerEmail ?? null;
    if (recipientEmail) {
      this.mailerService
        .sendOrderConfirmation({
          to: recipientEmail,
          orderNumber: createdOrder.orderNumber,
          totalAmount: Number(createdOrder.totalAmount),
        })
        .catch((err: unknown) => {
          this.logger.error(`Failed to send order confirmation email for ${createdOrder.orderNumber}:`, err);
        });
    }

    return this.getOrderByNumber(createdOrder.orderNumber);
  }

  async getMyOrders(userId: string): Promise<ApiOrder[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: 'desc' },
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
        payment: true,
        shipments: {
          include: {
            logs: { orderBy: { logTimestamp: 'desc' } },
          },
        },
      },
    });

    return orders.map((order) => this.mapOrder(order));
  }

  async getOrderByNumber(orderNumber: string, userId?: string): Promise<ApiOrder> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
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
        payment: true,
        shipments: {
          include: {
            logs: { orderBy: { logTimestamp: 'desc' } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    return this.mapOrder(order);
  }

  async trackOrder(orderNumber: string): Promise<TrackingResult> {
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

    const latestShipment = order.shipments[0];
    const shipment: ApiShipment = latestShipment
      ? {
          id: latestShipment.id,
          courierName: latestShipment.courierName,
          trackingNumber: latestShipment.trackingNumber,
          status: latestShipment.status,
          shippedAt: latestShipment.shippedAt ? latestShipment.shippedAt.toISOString() : undefined,
          estimatedDelivery: latestShipment.estimatedDelivery
            ? latestShipment.estimatedDelivery.toISOString()
            : undefined,
          deliveredAt: latestShipment.deliveredAt ? latestShipment.deliveredAt.toISOString() : undefined,
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
  }): ApiOrder {
    const rawAddr = (order.shippingAddressSnapshot as Record<string, string>) ?? {};
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
        expectedShipDate: i.expectedShipDate ? i.expectedShipDate.toISOString() : undefined,
      };
    });

    const shipments: ApiShipment[] = order.shipments.map((s) => ({
      id: s.id,
      carrierCode: (s.carrierCode as CarrierCode | null) ?? undefined,
      courierName: s.courierName,
      trackingNumber: s.trackingNumber,
      status: s.status,
      shippedAt: s.shippedAt ? s.shippedAt.toISOString() : undefined,
      estimatedDelivery: s.estimatedDelivery ? s.estimatedDelivery.toISOString() : undefined,
      deliveredAt: s.deliveredAt ? s.deliveredAt.toISOString() : undefined,
      timeline: s.logs.map((l) => ({
        id: l.id,
        statusTitle: l.statusTitle,
        statusDescription: l.statusDescription ?? undefined,
        location: l.location ?? undefined,
        timestamp: l.logTimestamp.toISOString(),
      })),
    }));

    return {
      id: order.id,
      orderNumber: order.orderNumber,
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
            paidAt: order.payment.paidAt ? order.payment.paidAt.toISOString() : undefined,
          }
        : undefined,
      shipments,
      placedAt: order.placedAt.toISOString(),
    };
  }
}
