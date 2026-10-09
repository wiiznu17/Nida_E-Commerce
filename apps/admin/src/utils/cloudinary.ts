/**
 * Cloudinary & Upload Utility
 *
 * Re-exports from clean API layer in apps/admin/src/api/upload.api.ts
 */
export { uploadApi, type UploadResponse } from '../api';
export { uploadApi as cloudinaryApi } from '../api';

export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const { uploadApi } = await import('../api');
  return uploadApi.uploadImage(file, onProgress);
}
