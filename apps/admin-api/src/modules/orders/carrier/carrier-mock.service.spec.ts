import { describe, it, expect, beforeEach } from 'vitest';
import { CarrierMockService } from './carrier-mock.service.js';
import type { CarrierCode } from '@repo/types';

describe('CarrierMockService', () => {
  let service: CarrierMockService;

  beforeEach(() => {
    service = new CarrierMockService();
  });

  describe('getCourierName', () => {
    it('returns official display name for KERRY_EXPRESS', () => {
      expect(service.getCourierName('KERRY_EXPRESS')).toBe('Kerry Express TH');
    });

    it('returns official display name for FLASH_EXPRESS', () => {
      expect(service.getCourierName('FLASH_EXPRESS')).toBe('Flash Express');
    });

    it('returns official display name for THAILAND_POST_EMS', () => {
      expect(service.getCourierName('THAILAND_POST_EMS')).toBe(
        'Thailand Post EMS',
      );
    });

    it('returns official display name for DHL_EXPRESS', () => {
      expect(service.getCourierName('DHL_EXPRESS')).toBe(
        'DHL Express International',
      );
    });

    it('throws BadRequestException for unsupported carrier', () => {
      expect(() =>
        service.getCourierName('INVALID_CARRIER' as unknown as CarrierCode),
      ).toThrow();
    });
  });

  describe('bookConsignment', () => {
    it('generates realistic Kerry Express tracking number and estimated delivery', async () => {
      const result = await service.bookConsignment(
        'NIDA-20261014-TEST',
        'KERRY_EXPRESS',
      );

      expect(result.courierName).toBe('Kerry Express TH');
      expect(result.trackingNumber).toMatch(/^KEX\d{8}$/);
      expect(result.estimatedDelivery).toBeInstanceOf(Date);
      expect(result.initialLocation).toContain('Kerry');
      expect(result.initialLogTitle).toBe(
        'Shipment Electronic Information Received',
      );
    });

    it('generates realistic Flash Express tracking number', async () => {
      const result = await service.bookConsignment(
        'NIDA-20261014-TEST',
        'FLASH_EXPRESS',
      );

      expect(result.courierName).toBe('Flash Express');
      expect(result.trackingNumber).toMatch(/^TH\d{10}[ABKS]$/);
      expect(result.initialLocation).toContain('Flash');
    });

    it('generates realistic Thailand Post EMS tracking number', async () => {
      const result = await service.bookConsignment(
        'NIDA-20261014-TEST',
        'THAILAND_POST_EMS',
      );

      expect(result.courierName).toBe('Thailand Post EMS');
      expect(result.trackingNumber).toMatch(/^ED\d{9}TH$/);
      expect(result.initialLocation).toContain('Thailand Post');
    });

    it('generates realistic DHL tracking number', async () => {
      const result = await service.bookConsignment(
        'NIDA-20261014-TEST',
        'DHL_EXPRESS',
      );

      expect(result.courierName).toBe('DHL Express International');
      expect(result.trackingNumber).toMatch(/^DHL\d{10}$/);
      expect(result.initialLocation).toContain('DHL');
    });
  });
});
