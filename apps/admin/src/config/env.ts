export const ENV = {
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1',
  STOREFRONT_URL: import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000',
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '',
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '',
} as const;

export const API_BASE_URL = ENV.API_URL;
export const STOREFRONT_URL = ENV.STOREFRONT_URL;
