import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UploadService,
  UploadedFileDto,
} from '../../src/modules/upload/upload.service.js';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: vi.fn().mockReturnValue(true),
      mkdirSync: vi.fn(),
      promises: {
        ...actual.promises,
        writeFile: vi.fn().mockResolvedValue(undefined),
        rename: vi.fn().mockResolvedValue(undefined),
      },
    },
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    promises: {
      ...actual.promises,
      writeFile: vi.fn().mockResolvedValue(undefined),
      rename: vi.fn().mockResolvedValue(undefined),
    },
  };
});

describe('Admin UploadService', () => {
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

  it('saves locally in development mode when Cloudinary is not configured', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_URL;
    process.env.NODE_ENV = 'development';
    process.env.API_PUBLIC_URL = 'http://localhost:4001';

    const result = await service.uploadImage(validJpgFile, 'banners');

    expect(result.source).toBe('local');
    expect(result.url).toMatch(
      /^http:\/\/localhost:4001\/uploads\/banners\/banners-/,
    );
  });

  it('strictly rejects upload and prohibits local storage in production mode when Cloudinary is missing', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_URL;
    process.env.NODE_ENV = 'production';

    await expect(service.uploadImage(validJpgFile, 'products')).rejects.toThrow(
      /Cloud storage \(Cloudinary\) is not configured in production environment/,
    );
  });

  it('strictly rejects upload in production mode if Cloudinary upload fails', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';
    process.env.NODE_ENV = 'production';

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

  it('commits temp image when URL is local path', async () => {
    const tempUrl = 'http://localhost:4000/uploads/temp/item-temp-123.jpg';
    const result = await service.commitTempImage(tempUrl, 'products');

    expect(fs.promises.rename).toHaveBeenCalled();
    expect(result).toContain('/uploads/products/item-temp-123.jpg');
  });

  it('leaves Cloudinary URLs untouched during commitTempImage', async () => {
    const cloudUrl =
      'https://res.cloudinary.com/test-cloud/image/upload/v1/nida/products/item.jpg';
    const result = await service.commitTempImage(cloudUrl, 'products');

    expect(result).toBe(cloudUrl);
  });
});
