import { Injectable, BadRequestException } from '@nestjs/common';
import type { CarrierCode } from '@repo/types';

export interface CarrierBookingOutput {
  carrierCode: CarrierCode;
  courierName: string;
  trackingNumber: string;
  estimatedDelivery: Date;
  initialLogTitle: string;
  initialLogDescription: string;
  initialLocation: string;
}

@Injectable()
export class CarrierMockService {
  private readonly CARRIER_CONFIG: Record<
    CarrierCode,
    {
      name: string;
      slaDays: number;
      hubLocation: string;
      generateTracking: () => string;
    }
  > = {
    KERRY_EXPRESS: {
      name: 'Kerry Express TH',
      slaDays: 2,
      hubLocation: 'Kerry BKK Central Sort Hub (Bangna)',
      generateTracking: () => {
        const rand = Math.floor(10000000 + Math.random() * 90000000);
        return `KEX${rand}`;
      },
    },
    FLASH_EXPRESS: {
      name: 'Flash Express',
      slaDays: 2,
      hubLocation: 'Flash Central Distribution Center (Wangnoi)',
      generateTracking: () => {
        const digits = Math.floor(1000000000 + Math.random() * 9000000000);
        const suffix = ['A', 'B', 'K', 'S'][Math.floor(Math.random() * 4)];
        return `TH${digits}${suffix}`;
      },
    },
    THAILAND_POST_EMS: {
      name: 'Thailand Post EMS',
      slaDays: 3,
      hubLocation: 'Thailand Post Mail Processing Center (Laksi)',
      generateTracking: () => {
        const digits = Math.floor(100000000 + Math.random() * 900000000);
        return `ED${digits}TH`;
      },
    },
    DHL_EXPRESS: {
      name: 'DHL Express International',
      slaDays: 2,
      hubLocation: 'DHL Gateway Hub (Suvarnabhumi)',
      generateTracking: () => {
        const digits = Math.floor(1000000000 + Math.random() * 9000000000);
        return `DHL${digits}`;
      },
    },
  };

  getCourierName(carrierCode: CarrierCode): string {
    const config = this.CARRIER_CONFIG[carrierCode];
    if (!config) {
      throw new BadRequestException(
        `Unsupported carrier code "${carrierCode}"`,
      );
    }
    return config.name;
  }

  async bookConsignment(
    orderNumber: string,
    carrierCode: CarrierCode,
  ): Promise<CarrierBookingOutput> {
    const config = this.CARRIER_CONFIG[carrierCode];
    if (!config) {
      throw new BadRequestException(
        `Unsupported carrier code "${carrierCode}"`,
      );
    }

    const trackingNumber = config.generateTracking();
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + config.slaDays);

    return {
      carrierCode,
      courierName: config.name,
      trackingNumber,
      estimatedDelivery,
      initialLogTitle: 'Shipment Electronic Information Received',
      initialLogDescription: `Consignment booked successfully via ${config.name} Gateway API for Order #${orderNumber}. Barcode generated.`,
      initialLocation: config.hubLocation,
    };
  }
}
