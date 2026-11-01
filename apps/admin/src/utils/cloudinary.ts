/**
 * Cloudinary & Upload Utility
 *
 * Direct delegation to uploadRequester
 */
import {
  uploadRequester,
  type UploadResponse,
} from '../api/requester/uploadRequester';

export {
  uploadRequester as uploadApi,
  uploadRequester as cloudinaryApi,
  type UploadResponse,
};

export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return uploadRequester.uploadImage(file, onProgress);
}
