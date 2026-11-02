import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UploadService,
  UploadedFileDto,
} from '../../src/modules/upload/upload.service.js';
import { BadRequestException } from '@nestjs/common';

describe('Admin UploadService (Pure Cloudinary Storage)', () => {
  let service: UploadService;
  const originalEnv = process.env;

  const validJpgFile: UploadedFileDto = {
    fieldname: 'file',
    originalname: 'test-product.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-binary-data'),
  };

  beforeEach(() => {
    service = new UploadService();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('rejects when no file or empty buffer is provided', async () => {
    await expect(
      service.uploadImage(null as unknown as UploadedFileDto),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.uploadImage({
        ...validJpgFile,
        buffer: null as unknown as Buffer,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects unsupported file mime types', async () => {
    const invalidFile: UploadedFileDto = {
      ...validJpgFile,
      originalname: 'document.pdf',
      mimetype: 'application/pdf',
    };

    await expect(service.uploadImage(invalidFile)).rejects.toThrow(
      /Invalid file format/,
    );
  });

  it('rejects files exceeding 10MB size limit', async () => {
    const oversizedFile: UploadedFileDto = {
      ...validJpgFile,
      size: 11 * 1024 * 1024,
    };

    await expect(service.uploadImage(oversizedFile)).rejects.toThrow(
      /File size exceeds 10MB limit/,
    );
  });

  it('uploads to Cloudinary successfully when credentials are provided', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        secure_url:
          'https://res.cloudinary.com/test-cloud/image/upload/v1/nida/products/item.jpg',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await service.uploadImage(validJpgFile, 'products');

    expect(result.source).toBe('cloudinary');
    expect(result.url).toBe(
      'https://res.cloudinary.com/test-cloud/image/upload/v1/nida/products/item.jpg',
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('strictly rejects upload when Cloudinary credentials are not configured', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_URL;

    await expect(service.uploadImage(validJpgFile, 'products')).rejects.toThrow(
      /Cloud storage \(Cloudinary\) credentials are not configured/,
    );
  });

  it('strictly rejects upload if Cloudinary API responds with an error', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Cloudinary server down',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(service.uploadImage(validJpgFile, 'products')).rejects.toThrow(
      /Cloud storage upload failed/,
    );
  });

  it('returns clean image URL during commitTempImage without file system operations', async () => {
    const cloudUrl =
      'https://res.cloudinary.com/test-cloud/image/upload/v1/nida/products/item.jpg';
    const result = await service.commitTempImage(cloudUrl, 'products');

    expect(result).toBe(cloudUrl);
  });
});
