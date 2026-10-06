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
import type {
  ApiInventoryItem,
  ApiShipment,
  ShipmentTimelineEntry,
} from '@repo/types';
import {
  StockChangeType,
  OrderStatus,
  ShipmentStatus,
  Department,
  Prisma,
} from '@repo/database';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
    const { variantId, quantity, reasonNote, adminId } = dto;

    const inventoryItem = await this.prisma.inventoryItem.findUnique({
      where: { variantId },
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
        `Inventory item for variant "${variantId}" not found`,
      );
    }

    const newBalance = inventoryItem.quantityAvailable + quantity;

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedItem = await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantityAvailable: newBalance,
          lastCountedAt: new Date(),
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

      await tx.stockMovement.create({
        data: {
          variantId,
          adminId: adminId ?? null,
          changeType: StockChangeType.RESTOCK,
          quantityChange: quantity,
          balanceAfter: newBalance,
          reasonNote,
        },
      });

      return updatedItem;
    });

    return this.mapInventoryItem(updated);
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

  private mapInventoryItem(item: InventoryItemWithRelations): ApiInventoryItem {
    const v = item.variant;
    const p = v.product;
    const unitPrice = Number(p.basePrice) + Number(v.priceAdjustment);

    return {
      id: item.id,
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
