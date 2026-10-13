import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CatalogService } from '../../src/modules/catalog/catalog.service.js';

describe('CatalogService - toggleProductStatus', () => {
  let service: CatalogService;
  let prismaMock: any;
  let uploadServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      product: {
        update: vi.fn(),
      },
    };

    uploadServiceMock = {};

    service = new CatalogService(prismaMock, uploadServiceMock);
  });

  it('toggles product status to published (isActive: true)', async () => {
    prismaMock.product.update.mockResolvedValue({
      id: 'prod-123',
      isActive: true,
    });

    const result = await service.toggleProductStatus('prod-123', true);

    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-123' },
      data: { isActive: true },
      select: { id: true, isActive: true },
    });

    expect(result).toEqual({
      success: true,
      id: 'prod-123',
      isActive: true,
    });
  });

  it('toggles product status to draft (isActive: false)', async () => {
    prismaMock.product.update.mockResolvedValue({
      id: 'prod-123',
      isActive: false,
    });

    const result = await service.toggleProductStatus('prod-123', false);

    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-123' },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });

    expect(result).toEqual({
      success: true,
      id: 'prod-123',
      isActive: false,
    });
  });

  it('propagates error when product id is invalid or not found', async () => {
    prismaMock.product.update.mockRejectedValue(new Error('Record to update not found'));

    await expect(service.toggleProductStatus('non-existent-id', true)).rejects.toThrow(
      'Record to update not found',
    );
  });
});
