import { Injectable, Logger, BadRequestException, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

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
  source: 'cloudinary' | 'local';
}

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);

  onModuleInit() {
    this.cleanupExpiredTempFiles();
    setInterval(() => {
      this.cleanupExpiredTempFiles();
    }, 6 * 60 * 60 * 1000).unref();
  }

  async uploadImage(
    file: UploadedFileDto,
    subFolder: string = 'products',
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const cleanFolder = subFolder
      ? subFolder.trim().replace(/[^a-zA-Z0-9_\-]/g, '').toLowerCase() || 'products'
      : 'products';

    // Ensure .env is loaded
    if (!process.env.CLOUDINARY_CLOUD_NAME && typeof (process as any).loadEnvFile === 'function') {
      const candidates = [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'apps/api/.env'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          try {
            (process as any).loadEnvFile(p);
            break;
          } catch {}
        }
      }
    }

    // Check Cloudinary environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if CLOUDINARY_URL format is used: cloudinary://<api_key>:<api_secret>@<cloud_name>
    let resolvedCloudName = cloudName;
    let resolvedApiKey = apiKey;
    let resolvedApiSecret = apiSecret;

    if (process.env.CLOUDINARY_URL && (!resolvedCloudName || !resolvedApiKey || !resolvedApiSecret)) {
      try {
        const parsed = new URL(process.env.CLOUDINARY_URL);
        resolvedCloudName = parsed.hostname;
        resolvedApiKey = parsed.username;
        resolvedApiSecret = parsed.password;
      } catch (err) {
        this.logger.warn('Failed to parse CLOUDINARY_URL environment variable');
      }
    }

    if (resolvedCloudName && resolvedApiKey && resolvedApiSecret) {
      try {
        const cloudinaryFolder = `nida/${cleanFolder}`;
        const resultUrl = await this.uploadToCloudinaryApi(
          file,
          resolvedCloudName,
          resolvedApiKey,
          resolvedApiSecret,
          cloudinaryFolder,
        );
        this.logger.log(`Successfully uploaded image to Cloudinary (${cloudinaryFolder}): ${resultUrl}`);
        return { url: resultUrl, source: 'cloudinary' };
      } catch (err: any) {
        this.logger.error(`Cloudinary upload failed: ${err.message}`, err.stack);
        // Fallback to local storage if Cloudinary fails
      }
    } else {
      this.logger.warn(
        'Cloudinary credentials not configured in apps/api/.env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Falling back to local storage.',
      );
    }

    // Local Storage Fallback
    const localUrl = await this.saveLocally(file, cleanFolder);
    return { url: localUrl, source: 'local' };
  }

  private async uploadToCloudinaryApi(
    file: UploadedFileDto,
    cloudName: string,
    apiKey: string,
    apiSecret: string,
    folder: string,
  ): Promise<string> {
    const timestamp = Math.round(Date.now() / 1000);

    // Cloudinary signature parameters must be sorted alphabetically: folder, timestamp
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
      throw new Error(`Cloudinary API responded with status ${response.status}: ${errorText}`);
    }

    const json = (await response.json()) as any;
    if (!json.secure_url && !json.url) {
      throw new Error('Cloudinary response did not contain secure_url');
    }

    return json.secure_url || json.url;
  }

  private async saveLocally(file: UploadedFileDto, subFolder: string = 'products'): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', subFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${subFolder}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const targetPath = path.join(uploadDir, filename);

    await fs.promises.writeFile(targetPath, file.buffer);
    const port = process.env.PORT ?? 4000;
    return `http://localhost:${port}/uploads/${subFolder}/${filename}`;
  }

  /**
   * Move a temporary image to permanent storage (e.g. from 'temp' to 'products').
   * If the URL is in /uploads/temp/, moves the file and returns the permanent URL.
   */
  async commitTempImage(url?: string, targetSubFolder: string = 'products'): Promise<string> {
    if (!url || typeof url !== 'string') return url || '';

    if (url.includes('/uploads/temp/')) {
      try {
        const filename = path.basename(url);
        const tempPath = path.join(process.cwd(), 'uploads', 'temp', filename);
        const targetDir = path.join(process.cwd(), 'uploads', targetSubFolder);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const targetPath = path.join(targetDir, filename);

        if (fs.existsSync(tempPath)) {
          await fs.promises.rename(tempPath, targetPath);
          this.logger.log(`[Storage] Committed temp image to ${targetSubFolder}: ${filename}`);
        }

        const port = process.env.PORT ?? 4000;
        return `http://localhost:${port}/uploads/${targetSubFolder}/${filename}`;
      } catch (err: any) {
        this.logger.error(`Failed to commit temp image: ${err.message}`);
        return url;
      }
    }

    return url;
  }

  /**
   * Purge orphaned temporary images older than maxAgeHours (default 24 hours).
   */
  async cleanupExpiredTempFiles(maxAgeHours: number = 24): Promise<number> {
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) return 0;

    let deletedCount = 0;
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    try {
      const files = await fs.promises.readdir(tempDir);
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.promises.stat(filePath);

        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.promises.unlink(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        this.logger.log(`[Storage Cleanup] Purged ${deletedCount} abandoned temp images.`);
      }
    } catch (err: any) {
      this.logger.warn(`Temp cleanup encountered an error: ${err.message}`);
    }

    return deletedCount;
  }
}
