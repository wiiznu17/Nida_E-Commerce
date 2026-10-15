import { UploadFolder } from '@repo/types';
import { apiClient } from '../client';

export { UploadFolder };

export interface UploadResponse {
  url: string;
  source?: 'cloudinary' | 'local';
}

export interface UploadOptions {
  folder?: UploadFolder;
  onProgress?: (percent: number) => void;
}

export const uploadRequester = {
  async uploadImage(
    file: File,
    optionsOrProgress?: UploadOptions | ((percent: number) => void),
  ): Promise<string> {
    const options: UploadOptions =
      typeof optionsOrProgress === 'function'
        ? { onProgress: optionsOrProgress }
        : (optionsOrProgress ?? {});

    const { folder = UploadFolder.PRODUCTS, onProgress } = options;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await apiClient.upload<UploadResponse>(
        '/upload',
        formData,
        onProgress,
      );
      return response.url;
    } catch (err) {
      console.warn('Backend upload failed, utilizing client fallback:', err);

      return new Promise<string>((resolve, reject) => {
        let p = 10;
        const interval = setInterval(() => {
          p += 30;
          if (p <= 90 && onProgress) onProgress(p);
        }, 50);

        const reader = new FileReader();
        reader.onloadend = () => {
          clearInterval(interval);
          if (onProgress) onProgress(100);
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read image file'));
          }
        };
        reader.onerror = () => {
          clearInterval(interval);
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    }
  },
};

export const uploadApi = uploadRequester;
