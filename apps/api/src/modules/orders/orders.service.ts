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
} from '@repo/types';
import {
  OrderStatus,
  StockChangeType,
  PaymentStatus,
  ShipmentStatus,
} from '@repo/database';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
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

    return this.mapOrder(order);
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
      placedAt: order.placedAt.toISOString(),
    };
  }

  private mapShipment(shipment: ShipmentWithLogs): ApiShipment {
    return {
      id: shipment.id,
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
