import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerAddressesService } from '../../src/modules/addresses/addresses.service.js';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('CustomerAddressesService', () => {
  let service: CustomerAddressesService;
  let prismaMock: {
    userAddress: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };

  const mockAddress = {
    id: 'addr-1',
    userId: 'user-1',
    recipientName: 'Kallaya W.',
    phone: '0812345678',
    addressLine1: '123 Sukhumvit 55',
    addressLine2: null,
    subdistrict: 'Khlong Tan Nuea',
    district: 'Watthana',
    province: 'Bangkok',
    postalCode: '10110',
    isDefault: true,
    createdAt: new Date('2026-10-01T10:00:00.000Z'),
    updatedAt: new Date('2026-10-01T10:00:00.000Z'),
  };

  beforeEach(() => {
    prismaMock = {
      userAddress: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return callback(prismaMock);
      }),
    };

    service = new CustomerAddressesService(prismaMock as unknown as PrismaService);
  });

  describe('getAddresses', () => {
    it('returns formatted addresses for the user', async () => {
      prismaMock.userAddress.findMany.mockResolvedValueOnce([mockAddress]);

      const result = await service.getAddresses('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('addr-1');
      expect(result[0].recipientName).toBe('Kallaya W.');
      expect(result[0].isDefault).toBe(true);
      expect(prismaMock.userAddress.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
    });
  });

  describe('createAddress', () => {
    const newAddressDto = {
      recipientName: 'Wissanu P.',
      phone: '0899998888',
      addressLine1: '99 Rama 4',
      subdistrict: 'Khlong Toei',
      district: 'Khlong Toei',
      province: 'Bangkok',
      postalCode: '10110',
    };

    it('sets isDefault to true when creating the first address', async () => {
      prismaMock.userAddress.count.mockResolvedValueOnce(0);
      prismaMock.userAddress.create.mockResolvedValueOnce({
        ...mockAddress,
        id: 'addr-new',
        isDefault: true,
      });

      const result = await service.createAddress('user-1', newAddressDto);

      expect(result.id).toBe('addr-new');
      expect(result.isDefault).toBe(true);
      expect(prismaMock.userAddress.updateMany).not.toHaveBeenCalled();
    });

    it('unsets other defaults when a new address is explicitly set as default', async () => {
      prismaMock.userAddress.count.mockResolvedValueOnce(2);
      prismaMock.userAddress.create.mockResolvedValueOnce({
        ...mockAddress,
        id: 'addr-new-default',
        isDefault: true,
      });

      await service.createAddress('user-1', {
        ...newAddressDto,
        isDefault: true,
      });

      expect(prismaMock.userAddress.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { isDefault: false },
      });
    });
  });

  describe('updateAddress', () => {
    it('throws NotFoundException if address does not exist', async () => {
      prismaMock.userAddress.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateAddress('user-1', 'nonexistent', { recipientName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if address belongs to another user', async () => {
      prismaMock.userAddress.findUnique.mockResolvedValueOnce({
        ...mockAddress,
        userId: 'other-user',
      });

      await expect(
        service.updateAddress('user-1', 'addr-1', { recipientName: 'Test' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('updates address fields and unsets others if setting default', async () => {
      prismaMock.userAddress.findUnique.mockResolvedValueOnce(mockAddress);
      prismaMock.userAddress.update.mockResolvedValueOnce({
        ...mockAddress,
        recipientName: 'Updated Name',
        isDefault: true,
      });

      const result = await service.updateAddress('user-1', 'addr-1', {
        recipientName: 'Updated Name',
        isDefault: true,
      });

      expect(result.recipientName).toBe('Updated Name');
      expect(prismaMock.userAddress.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { isDefault: false },
      });
    });
  });

  describe('deleteAddress', () => {
    it('throws NotFoundException if address does not exist', async () => {
      prismaMock.userAddress.findUnique.mockResolvedValueOnce(null);

      await expect(service.deleteAddress('user-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('reassigns default address to next available address when deleting default', async () => {
      prismaMock.userAddress.findUnique.mockResolvedValueOnce({
        ...mockAddress,
        isDefault: true,
      });
      prismaMock.userAddress.findFirst.mockResolvedValueOnce({
        ...mockAddress,
        id: 'addr-2',
        isDefault: false,
      });

      const result = await service.deleteAddress('user-1', 'addr-1');

      expect(result.success).toBe(true);
      expect(prismaMock.userAddress.delete).toHaveBeenCalledWith({
        where: { id: 'addr-1' },
      });
      expect(prismaMock.userAddress.update).toHaveBeenCalledWith({
        where: { id: 'addr-2' },
        data: { isDefault: true },
      });
    });
  });

  describe('setDefaultAddress', () => {
    it('unsets other defaults and sets specified address as default', async () => {
      prismaMock.userAddress.findUnique.mockResolvedValueOnce({
        ...mockAddress,
        id: 'addr-2',
        isDefault: false,
      });
      prismaMock.userAddress.update.mockResolvedValueOnce({
        ...mockAddress,
        id: 'addr-2',
        isDefault: true,
      });

      const result = await service.setDefaultAddress('user-1', 'addr-2');

      expect(result.isDefault).toBe(true);
      expect(prismaMock.userAddress.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { isDefault: false },
      });
    });
  });
});
