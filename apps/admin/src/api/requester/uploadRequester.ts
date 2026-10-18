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

    const response = await apiClient.upload<UploadResponse>(
      '/upload',
      formData,
      onProgress,
    );
    return response.url;
  },
};

export const uploadApi = uploadRequester;
