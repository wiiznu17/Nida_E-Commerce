/**
 * Upload Requester for Nida Admin
 *
 * Dedicated requester functions for media and asset uploads.
 */
import { apiClient } from './client';

export interface UploadResponse {
  url: string;
  source?: 'cloudinary' | 'local';
}

export type UploadFolder =
  | 'products'
  | 'categories'
  | 'banners'
  | 'avatars'
  | 'reviews'
  | 'slips'
  | 'temp'
  | (string & {});

export interface UploadOptions {
  folder?: UploadFolder;
  onProgress?: (percent: number) => void;
}

export const uploadApi = {
  /**
   * Upload an image file via the backend upload endpoint (Cloudinary / Local media store).
   *
   * @param file File object from input or dropzone
   * @param optionsOrProgress Options object with folder and progress callback, or progress callback function
   * @returns Promise resolving to the image URL
   */
  async uploadImage(
    file: File,
    optionsOrProgress?: UploadOptions | ((percent: number) => void),
  ): Promise<string> {
    const options: UploadOptions =
      typeof optionsOrProgress === 'function'
        ? { onProgress: optionsOrProgress }
        : optionsOrProgress || {};

    const { folder = 'products', onProgress } = options;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await apiClient.upload<UploadResponse>(
        `/upload?folder=${encodeURIComponent(folder)}`,
        formData,
        onProgress,
      );
      return response.url;
    } catch (err) {
      console.warn('Backend upload failed, utilizing client fallback:', err);

      // Client Data URL fallback if backend is temporarily unreachable
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

  /**
   * Upload multiple images concurrently with individual or batch progress.
   */
  async uploadMultiple(
    files: File[],
    optionsOrProgress?:
      | UploadOptions
      | ((index: number, percent: number) => void),
  ): Promise<string[]> {
    const isProgressFn = typeof optionsOrProgress === 'function';
    const folder = !isProgressFn ? optionsOrProgress?.folder : undefined;
    const onProgress = isProgressFn ? optionsOrProgress : undefined;

    return Promise.all(
      files.map((file, idx) =>
        uploadApi.uploadImage(file, {
          folder,
          onProgress: (p) => onProgress?.(idx, p),
        }),
      ),
    );
  },
};
