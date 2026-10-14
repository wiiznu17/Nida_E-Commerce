import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { RestockInventoryDto } from './dto/restock-inventory.dto.js';
import { FulfillOrderDto } from './dto/fulfill-order.dto.js';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto.js';
import type { InventoryItemWithRelations } from './types/admin.payloads.js';
import {
  AuditActionType,
  AdminPermission,
  type ApiInventoryItem,
  type ApiStockMovement,
  type ApiShipment,
  type ApiOrder,
  type ShipmentTimelineEntry,
} from '@repo/types';
import {
  StockChangeType,
  OrderStatus,
  ShipmentStatus,
  Department,
  Prisma,
} from '@repo/database';
import { AuditLogService } from '../audit-log/audit-log.service.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog?: AuditLogService,
  ) {}

  async getInventory(
    department?: Department,
    lowStockOnly?: boolean,
  ): Promise<ApiInventoryItem[]> {
    const where: Prisma.InventoryItemWhereInput = {};

    if (department) {
      where.variant = {
        product: {
          category: { department },
        },
      };
    }

    const items = await this.prisma.inventoryItem.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let mapped = items.map((item) => this.mapInventoryItem(item));

    if (lowStockOnly) {
      mapped = mapped.filter((item) => item.isLowStock);
    }

    return mapped;
  }

  async restock(dto: RestockInventoryDto): Promise<ApiInventoryItem> {
    const { variantId, sku, quantity, reasonNote, adminId, changeType } = dto;

    if (quantity === 0) {
      throw new BadRequestException('Quantity change cannot be zero');
    }

    const identifier = (variantId || sku || '').trim();
    if (!identifier) {
      throw new BadRequestException('Variant identifier or SKU is required');
    }

    const isUuid = UUID_REGEX.test(identifier);

    const inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: isUuid
        ? {
            OR: [{ variantId: identifier }, { id: identifier }],
          }
        : {
            OR: [
              { variant: { skuCode: identifier } },
              ...(sku ? [{ variant: { skuCode: sku.trim() } }] : []),
            ],
          },
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!inventoryItem) {
      throw new NotFoundException(
        `Inventory item for "${identifier}" not found`,
      );
    }

    const resolvedChangeType =
      changeType ??
      (quantity >= 0
        ? StockChangeType.RESTOCK
        : StockChangeType.MANUAL_ADJUSTMENT);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (quantity < 0) {
        const absQty = Math.abs(quantity);
        const updateResult = await tx.inventoryItem.updateMany({
          where: {
            id: inventoryItem.id,
            quantityAvailable: { gte: absQty },
          },
          data: {
            quantityAvailable: { decrement: absQty },
            lastCountedAt: new Date(),
          },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException(
            `Cannot reduce stock below zero. Current stock: ${inventoryItem.quantityAvailable}, adjustment: ${quantity}`,
          );
        }
      } else {
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantityAvailable: { increment: quantity },
            lastCountedAt: new Date(),
          },
        });
      }

      const updatedItem = await tx.inventoryItem.findUnique({
        where: { id: inventoryItem.id },
        include: {
          variant: {
            include: {
              product: {
                include: {
                  category: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
      });

      if (!updatedItem) {
        throw new NotFoundException(`Inventory item for "${identifier}" not found`);
      }

      await tx.stockMovement.create({
        data: {
          variantId: inventoryItem.variantId,
          adminId: adminId ?? null,
          changeType: resolvedChangeType,
          quantityChange: quantity,
          balanceAfter: updatedItem.quantityAvailable,
          reasonNote,
        },
      });

      return updatedItem;
    });

    void this.auditLog?.recordLog({
      adminId: adminId ?? null,
      actionType: AuditActionType.UPDATE,
      targetTable: 'inventory_items',
      targetId: updated.id,
      permission: AdminPermission.INVENTORY_ADJUST,
      oldValuesJson: {
        quantityAvailable: inventoryItem.quantityAvailable,
        sku: inventoryItem.variant.skuCode,
      },
      newValuesJson: {
        quantityAvailable: updated.quantityAvailable,
        quantityChange: quantity,
        changeType: resolvedChangeType,
        reasonNote,
      },
    });

    return this.mapInventoryItem(updated);
  }

  async getStockMovements(): Promise<ApiStockMovement[]> {
    const movements = await this.prisma.stockMovement.findMany({
      include: {
        variant: {
          include: {
            product: true,
          },
        },
        admin: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return movements.map((m) => ({
      id: m.id,
      sku: m.variant.skuCode,
      productName: m.variant.product.name,
      variantInfo: `${m.variant.colorName} / ${m.variant.size}`,
      changeType: m.changeType as ApiStockMovement['changeType'],
      quantityChange: m.quantityChange,
      balanceAfter: m.balanceAfter,
      reason: m.reasonNote,
      adminName: m.admin ? m.admin.fullName : undefined,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  async fulfillOrder(identifier: string, dto: FulfillOrderDto) {
    const isUuid = UUID_REGEX.test(identifier);
    const order = await this.prisma.order.findFirst({
      where: isUuid
        ? { OR: [{ id: identifier }, { orderNumber: identifier }] }
        : { orderNumber: identifier },
    });

    if (!order) {
      throw new NotFoundException(`Order "${identifier}" not found`);
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.REFUNDED
    ) {
      throw new BadRequestException(
        `Cannot fulfill order in ${order.status} status`,
      );
    }

    const shipment = await this.prisma.$transaction(async (tx) => {
      const createdShipment = await tx.shipment.create({
        data: {
          orderId: order.id,
          courierName: dto.courierName,
          trackingNumber: dto.trackingNumber,
          status: ShipmentStatus.LABEL_CREATED,
          shippedAt: new Date(),
          estimatedDelivery: dto.estimatedDelivery
            ? new Date(dto.estimatedDelivery)
            : null,
        },
      });

      await tx.shipmentLog.create({
        data: {
          shipmentId: createdShipment.id,
          statusTitle:
            dto.initialStatusTitle ??
            'สร้างหมายเลขพัสดุและเตรียมส่งมอบให้ขนส่งเรียบร้อย',
          statusDescription: `ขนส่งโดย ${dto.courierName} หมายเลขติดตาม: ${dto.trackingNumber}`,
          location: 'คลังสินค้าหลัก (กรุงเทพมหานคร)',
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.SHIPPED },
      });

      return createdShipment;
    });

    void this.auditLog?.recordLog({
      actionType: AuditActionType.STATUS_CHANGE,
      targetTable: 'orders',
      targetId: order.id,
      permission: AdminPermission.ORDERS_FULFILL,
      oldValuesJson: {
        status: order.status,
      },
      newValuesJson: {
        status: OrderStatus.SHIPPED,
        courierName: dto.courierName,
        trackingNumber: dto.trackingNumber,
      },
    });

    return {
      message: 'Order fulfilled successfully',
      orderNumber: order.orderNumber,
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      orderStatus: OrderStatus.SHIPPED,
    };
  }

  async updateShipmentStatus(
    shipmentId: string,
    dto: UpdateShipmentStatusDto,
  ): Promise<ApiShipment> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { order: true },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with id "${shipmentId}" not found`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const isDelivered = dto.status === ShipmentStatus.DELIVERED;

      const updatedShipment = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: dto.status,
          deliveredAt: isDelivered ? new Date() : undefined,
        },
        include: {
          logs: { orderBy: { logTimestamp: 'desc' } },
        },
      });

      await tx.shipmentLog.create({
        data: {
          shipmentId,
          statusTitle: dto.statusTitle,
          statusDescription: dto.statusDescription ?? null,
          location: dto.location ?? null,
        },
      });

      if (isDelivered) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: OrderStatus.DELIVERED },
        });
      }

      return updatedShipment;
    });

    void this.auditLog?.recordLog({
      actionType: AuditActionType.STATUS_CHANGE,
      targetTable: 'shipments',
      targetId: updated.id,
      permission: AdminPermission.ORDERS_FULFILL,
      oldValuesJson: {
        status: shipment.status,
      },
      newValuesJson: {
        status: dto.status,
        statusTitle: dto.statusTitle,
      },
    });

    const freshLogs = await this.prisma.shipmentLog.findMany({
      where: { shipmentId },
      orderBy: { logTimestamp: 'desc' },
    });

    return {
      id: updated.id,
      courierName: updated.courierName,
      trackingNumber: updated.trackingNumber,
      status: updated.status as ShipmentStatus,
      shippedAt: updated.shippedAt?.toISOString() ?? undefined,
      estimatedDelivery: updated.estimatedDelivery?.toISOString() ?? undefined,
      deliveredAt: updated.deliveredAt?.toISOString() ?? undefined,
      timeline: freshLogs.map((log): ShipmentTimelineEntry => ({
        id: log.id,
        statusTitle: log.statusTitle,
        statusDescription: log.statusDescription ?? undefined,
        location: log.location ?? undefined,
        timestamp: log.logTimestamp.toISOString(),
      })),
    };
  }

  async getOrders(): Promise<ApiOrder[]> {
    const orders = await this.prisma.order.findMany({
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
      orderBy: { placedAt: 'desc' },
    });

    return orders.map((order): ApiOrder => {
      const address = (order.shippingAddressSnapshot as Record<string, unknown>) ?? {};
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
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productNameSnapshot,
          variantInfo: item.variantInfoSnapshot,
          imageUrl: item.variant?.product?.images?.[0]?.imageUrl ?? undefined,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
          discountShare: Number(item.discountShare),
          netPrice: Number(item.netPrice),
          isPreorder: false,
        })),
        shippingAddress: {
          recipientName: String(address['recipientName'] ?? ''),
          phone: String(address['phone'] ?? ''),
          addressLine1: String(address['addressLine1'] ?? ''),
          addressLine2: address['addressLine2'] ? String(address['addressLine2']) : undefined,
          subdistrict: String(address['subdistrict'] ?? ''),
          district: String(address['district'] ?? ''),
          province: String(address['province'] ?? ''),
          postalCode: String(address['postalCode'] ?? ''),
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
        shipments: order.shipments.map((s) => ({
          id: s.id,
          courierName: s.courierName,
          trackingNumber: s.trackingNumber,
          status: s.status as ShipmentStatus,
          shippedAt: s.shippedAt?.toISOString() ?? undefined,
          estimatedDelivery: s.estimatedDelivery?.toISOString() ?? undefined,
          deliveredAt: s.deliveredAt?.toISOString() ?? undefined,
          timeline: s.logs.map((log) => ({
            id: log.id,
            statusTitle: log.statusTitle,
            statusDescription: log.statusDescription ?? undefined,
            location: log.location ?? undefined,
            timestamp: log.logTimestamp.toISOString(),
          })),
        })),
        placedAt: order.placedAt.toISOString(),
      };
    });
  }

  private mapInventoryItem(item: InventoryItemWithRelations): ApiInventoryItem {
    const v = item.variant;
    const p = v.product;
    const unitPrice = Number(p.basePrice) + Number(v.priceAdjustment);

    return {
      id: item.id,
      variantId: item.variantId,
      sku: v.skuCode,
      productId: p.id,
      productName: p.name,
      department: p.category.department as Department,
      categoryName: p.category.name,
      size: v.size,
      colorName: v.colorName,
      colorHex: v.colorHex,
      imageUrl: p.images?.[0]?.imageUrl ?? undefined,
      price: unitPrice,
      quantityAvailable: item.quantityAvailable,
      quantityReserved: item.quantityReserved,
      preorderBooked: item.preorderBooked,
      lowStockThreshold: item.lowStockThreshold,
      isLowStock: item.quantityAvailable <= item.lowStockThreshold,
      lastCountedAt: item.lastCountedAt?.toISOString() ?? undefined,
    };
  }
}
