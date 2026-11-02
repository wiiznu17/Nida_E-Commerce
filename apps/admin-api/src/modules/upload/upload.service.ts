import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';

export interface UploadedFileDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface UploadResult {
  url: string;
  source: 'cloudinary';
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  url?: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml',
  ]);
  private readonly maxFileSizeBytes = 10 * 1024 * 1024; // 10MB limit

  async uploadImage(
    file: UploadedFileDto,
    subFolder: string = 'products',
  ): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided or file buffer is empty');
    }

    if (!this.allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file format: ${file.mimetype}. Allowed formats: JPG, PNG, WebP, AVIF, SVG`,
      );
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `File size exceeds 10MB limit (provided: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      );
    }

    const cleanFolder = subFolder
      .trim()
      .replace(/[^a-zA-Z0-9_\-]/g, '')
      .toLowerCase();
    const targetFolder = cleanFolder.length > 0 ? cleanFolder : 'products';

    const cloudinaryConfig = this.resolveCloudinaryConfig();
    if (!cloudinaryConfig) {
      this.logger.error('Cloud storage (Cloudinary) is not configured.');
      throw new BadRequestException(
        'Cloud storage (Cloudinary) credentials are not configured in environment variables.',
      );
    }

    try {
      const cloudinaryFolder = `nida/${targetFolder}`;
      const resultUrl = await this.uploadToCloudinaryApi(
        file,
        cloudinaryConfig,
        cloudinaryFolder,
      );
      this.logger.log(
        `Successfully uploaded image to Cloudinary (${cloudinaryFolder}): ${resultUrl}`,
      );
      return { url: resultUrl, source: 'cloudinary' };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Cloudinary upload failed: ${errMsg}`);
      throw new BadRequestException(`Cloud storage upload failed: ${errMsg}`);
    }
  }

  private resolveCloudinaryConfig(): CloudinaryConfig | null {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      return { cloudName, apiKey, apiSecret };
    }

    if (process.env.CLOUDINARY_URL) {
      try {
        const parsed = new URL(process.env.CLOUDINARY_URL);
        if (parsed.hostname && parsed.username && parsed.password) {
          return {
            cloudName: parsed.hostname,
            apiKey: parsed.username,
            apiSecret: parsed.password,
          };
        }
      } catch {
        this.logger.warn('Failed to parse CLOUDINARY_URL environment variable');
      }
    }

    return null;
  }

  private async uploadToCloudinaryApi(
    file: UploadedFileDto,
    config: CloudinaryConfig,
    folder: string,
  ): Promise<string> {
    const { cloudName, apiKey, apiSecret } = config;
    const timestamp = Math.round(Date.now() / 1000);

    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cloudinary API responded with status ${response.status}: ${errorText}`,
      );
    }

    const json = (await response.json()) as CloudinaryUploadResponse;
    const resultUrl = json.secure_url ?? json.url;
    if (!resultUrl) {
      throw new Error('Cloudinary response did not contain secure_url');
    }

    return resultUrl;
  }

  async commitTempImage(
    url?: string,
    _targetSubFolder: string = 'products',
  ): Promise<string> {
    return url ?? '';
  }
}
