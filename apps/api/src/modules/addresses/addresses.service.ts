import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import type { ApiAddress } from '@repo/types';
import type { UserAddress } from '@repo/database';

@Injectable()
export class CustomerAddressesService {
  private readonly logger = new Logger(CustomerAddressesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapToApiAddress(addr: UserAddress): ApiAddress {
    return {
      id: addr.id,
      recipientName: addr.recipientName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? undefined,
      subdistrict: addr.subdistrict,
      district: addr.district,
      province: addr.province,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt.toISOString(),
      updatedAt: addr.updatedAt.toISOString(),
    };
  }

  async getAddresses(userId: string): Promise<ApiAddress[]> {
    const addresses = await this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((addr) => this.mapToApiAddress(addr));
  }

  async createAddress(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<ApiAddress> {
    const existingCount = await this.prisma.userAddress.count({
      where: { userId },
    });

    const shouldBeDefault = existingCount === 0 || Boolean(dto.isDefault);

    return this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault && existingCount > 0) {
        await tx.userAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const created = await tx.userAddress.create({
        data: {
          userId,
          recipientName: dto.recipientName.trim(),
          phone: dto.phone.trim(),
          addressLine1: dto.addressLine1.trim(),
          addressLine2: dto.addressLine2?.trim() ?? null,
          subdistrict: dto.subdistrict.trim(),
          district: dto.district.trim(),
          province: dto.province.trim(),
          postalCode: dto.postalCode.trim(),
          isDefault: shouldBeDefault,
        },
      });

      return this.mapToApiAddress(created);
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<ApiAddress> {
    const existing = await this.prisma.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this address',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.userAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const updated = await tx.userAddress.update({
        where: { id: addressId },
        data: {
          recipientName: dto.recipientName?.trim(),
          phone: dto.phone?.trim(),
          addressLine1: dto.addressLine1?.trim(),
          addressLine2:
            dto.addressLine2 !== undefined
              ? (dto.addressLine2?.trim() ?? null)
              : undefined,
          subdistrict: dto.subdistrict?.trim(),
          district: dto.district?.trim(),
          province: dto.province?.trim(),
          postalCode: dto.postalCode?.trim(),
          isDefault: dto.isDefault !== undefined ? dto.isDefault : undefined,
        },
      });

      return this.mapToApiAddress(updated);
    });
  }

  async deleteAddress(
    userId: string,
    addressId: string,
  ): Promise<{ success: boolean }> {
    const existing = await this.prisma.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this address',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userAddress.delete({
        where: { id: addressId },
      });

      if (existing.isDefault) {
        const nextAddress = await tx.userAddress.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (nextAddress) {
          await tx.userAddress.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return { success: true };
  }

  async setDefaultAddress(
    userId: string,
    addressId: string,
  ): Promise<ApiAddress> {
    const existing = await this.prisma.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this address',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      const updated = await tx.userAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      return this.mapToApiAddress(updated);
    });
  }
}
