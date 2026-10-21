import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@repo/database';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { OrderStatus, ShipmentStatus } from '@repo/types';
import { InternalLogisticsProvider } from './internal-logistics.provider.js';
import { ShippopLogisticsProvider } from './shippop-logistics.provider.js';
import type {
  ILogisticsProvider,
  CreateShipmentInput,
  CreateShipmentResult,
  TrackingTimelineResult,
} from './logistics.interface.js';

@Injectable()
export class LogisticsService {
  private readonly logger = new Logger(LogisticsService.name);
  private activeProvider: ILogisticsProvider;

  constructor(
    private readonly internalProvider: InternalLogisticsProvider,
    private readonly shippopProvider: ShippopLogisticsProvider,
    private readonly prisma: PrismaService,
  ) {
    const providerName = process.env.LOGISTICS_PROVIDER ?? 'internal';

    if (providerName.toLowerCase() === 'shippop') {
      this.activeProvider = this.shippopProvider;
      this.logger.log('Logistics Service initialized with SHIPPOP Provider');
    } else {
      this.activeProvider = this.internalProvider;
      this.logger.log(
        'Logistics Service initialized with Internal Mock Provider',
      );
    }
  }

  getActiveProviderName(): string {
    return this.activeProvider.providerName;
  }

  async createShipment(
    input: CreateShipmentInput,
  ): Promise<CreateShipmentResult> {
    return this.activeProvider.createShipment(input);
  }

  async getTrackingTimeline(
    trackingNumber: string,
  ): Promise<TrackingTimelineResult> {
    return this.activeProvider.getTrackingTimeline(trackingNumber);
  }

  async getShippingLabelUrl(trackingNumber: string): Promise<string> {
    return this.activeProvider.getShippingLabelUrl(trackingNumber);
  }

  async handleWebhook(
    payload: unknown,
    headers: Record<string, string | string[] | undefined> = {},
  ): Promise<{ success: boolean; message: string }> {
    const parsed = await this.activeProvider.parseWebhook(payload, headers);
    if (!parsed) {
      return {
        success: false,
        message: 'Invalid or unsupported webhook payload',
      };
    }

    const shipment = await this.prisma.shipment.findFirst({
      where: { trackingNumber: parsed.trackingNumber },
      include: {
        order: true,
      },
    });

    if (!shipment) {
      this.logger.warn(
        `Webhook received for unknown tracking number: ${parsed.trackingNumber}`,
      );
      return { success: false, message: 'Shipment not found' };
    }

    // Deduplication check: Avoid inserting exact same event twice
    const existingLog = await this.prisma.shipmentLog.findFirst({
      where: {
        shipmentId: shipment.id,
        statusTitle: parsed.statusTitle,
        logTimestamp: parsed.eventTimestamp,
      },
    });

    if (existingLog) {
      return { success: true, message: 'Duplicate log event skipped' };
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.shipmentLog.create({
        data: {
          shipmentId: shipment.id,
          statusTitle: parsed.statusTitle,
          statusDescription: parsed.statusDescription ?? null,
          location: parsed.location ?? null,
          logTimestamp: parsed.eventTimestamp,
        },
      });

      const updateData: {
        status?: ShipmentStatus;
        deliveredAt?: Date;
      } = {
        status: parsed.shipmentStatus,
      };

      if (parsed.isDelivered) {
        updateData.deliveredAt = parsed.eventTimestamp;
      }

      await tx.shipment.update({
        where: { id: shipment.id },
        data: updateData,
      });

      if (
        parsed.isDelivered &&
        shipment.order.status !== OrderStatus.DELIVERED
      ) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: OrderStatus.DELIVERED },
        });
      }
    });

    return { success: true, message: 'Shipment log ingested successfully' };
  }
}
