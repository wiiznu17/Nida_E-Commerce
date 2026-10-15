import {
  Injectable,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
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
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);

  onModuleInit() {
    this.cleanupExpiredTempFiles();
    setInterval(
      () => {
        this.cleanupExpiredTempFiles();
      },
      6 * 60 * 60 * 1000,
    ).unref();
  }

  async uploadImage(
    file: UploadedFileDto,
    subFolder: string = 'products',
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const cleanFolder = subFolder
      .trim()
      .replace(/[^a-zA-Z0-9_\-]/g, '')
      .toLowerCase();
    const targetFolder = cleanFolder.length > 0 ? cleanFolder : 'products';

    const cloudinaryConfig = this.resolveCloudinaryConfig();
    if (cloudinaryConfig) {
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
      }
    } else {
      this.logger.warn(
        'Cloudinary credentials not configured in apps/admin-api/.env. Falling back to local storage.',
      );
    }

    const localUrl = await this.saveLocally(file, targetFolder);
    return { url: localUrl, source: 'local' };
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

  private buildLocalUrl(subFolder: string, filename: string): string {
    const port = process.env.PORT ?? 4000;
    return `http://localhost:${port}/uploads/${subFolder}/${filename}`;
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

  private async saveLocally(
    file: UploadedFileDto,
    subFolder: string = 'products',
  ): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', subFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const parsedExt = path.extname(file.originalname);
    const ext = parsedExt.length > 0 ? parsedExt : '.jpg';
    const filename = `${subFolder}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const targetPath = path.join(uploadDir, filename);

    await fs.promises.writeFile(targetPath, file.buffer);
    return this.buildLocalUrl(subFolder, filename);
  }

  async commitTempImage(
    url?: string,
    targetSubFolder: string = 'products',
  ): Promise<string> {
    if (!url || typeof url !== 'string') {
      return url ?? '';
    }

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
          this.logger.log(
            `[Storage] Committed temp image to ${targetSubFolder}: ${filename}`,
          );
        }

        return this.buildLocalUrl(targetSubFolder, filename);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to commit temp image: ${errMsg}`);
        return url;
      }
    }

    return url;
  }

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
        this.logger.log(
          `[Storage Cleanup] Purged ${deletedCount} abandoned temp images.`,
        );
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Temp cleanup encountered an error: ${errMsg}`);
    }

    return deletedCount;
  }
}
