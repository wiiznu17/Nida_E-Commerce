import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  Crop,
  AlertCircle,
} from 'lucide-react';
import { uploadApi } from '../../api';
import type { UploadFolder } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { ImageCropModal } from './ImageCropModal';

export interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: 'square' | 'portrait' | 'auto';
  compact?: boolean;
  folder?: UploadFolder;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function ImageUploader({
  value,
  onChange,
  label,
  description,
  aspectRatio = 'portrait',
  compact = false,
  folder = 'temp',
}: ImageUploaderProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Crop modal states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const [cropFileName, setCropFileName] = useState<string>('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);

    // Validate MIME type / extension
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const hasValidExt = /\.(jpg|jpeg|png|webp)$/i.test(fileName);

    if (!ALLOWED_MIME_TYPES.includes(fileType) && !hasValidExt) {
      setErrorMessage(
        isTh
          ? 'จำกัดเฉพาะไฟล์ .jpg, .jpeg, .png, .webp เท่านั้น'
          : 'Allowed formats: .jpg, .jpeg, .png, .webp only',
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size (Max 10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        isTh
          ? `ขนาดไฟล์ ${(file.size / (1024 * 1024)).toFixed(1)}MB เกินกำหนด (สูงสุดไม่เกิน 10MB)`
          : `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds 10MB limit`,
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Read file for Crop Modal
    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropFileName(file.name);
    setIsCropModalOpen(true);
  };

  // Called when user confirms 3:4 crop inside ImageCropModal
  const handleCropConfirmed = async (croppedFile: File) => {
    setIsCropModalOpen(false);

    // Clean up temporary object URL if any
    if (cropImageSrc && cropImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc('');

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const url = await uploadApi.uploadImage(croppedFile, {
        folder,
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });
      onChange(url);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setErrorMessage(
        err.message || (isTh ? 'เกิดข้อผิดพลาดในการอัปโหลดรูป' : 'Failed to upload image'),
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCloseCropModal = () => {
    setIsCropModalOpen(false);
    if (cropImageSrc && cropImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Allow re-cropping current existing image
  const handleOpenCropForCurrent = () => {
    if (!value) return;
    setCropImageSrc(value);
    setCropFileName('current-image.webp');
    setIsCropModalOpen(true);
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
        ? 'aspect-[3/4]'
        : 'min-h-[140px]';

  return (
    <div className="space-y-1.5">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-700 block">{label}</label>
          {value && (
            <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
              <CheckCircle2 size={10} className="mr-0.5 text-emerald-600" />
              {isTh ? 'มีรูปแล้ว' : 'Uploaded'}
            </span>
          )}
        </div>
      )}

      {description && <p className="text-[10px] text-gray-500">{description}</p>}

      {/* Main Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-md overflow-hidden transition-all ${
          isDragging
            ? 'border-[#D97706] bg-amber-50/50 scale-[1.01]'
            : value
              ? 'border-gray-200 bg-[#FAF7F2]'
              : 'border-gray-300 bg-gray-50/50 hover:border-gray-400'
        } ${compact ? 'p-1.5' : 'p-2.5'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isUploading}
        />

        {/* Existing Image Display */}
        {value ? (
          <div className="relative group">
            <div
              className={`w-full ${aspectClass} rounded-xs overflow-hidden bg-white border border-gray-200 flex items-center justify-center`}
            >
              <img
                src={value}
                alt="Product preview"
                className="w-full h-full object-cover object-center transition-transform group-hover:scale-105 duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800';
                }}
              />
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 rounded-xs backdrop-blur-[1px]">
              <button
                type="button"
                onClick={handleOpenCropForCurrent}
                disabled={isUploading}
                className="px-2 py-1 text-[10px] font-bold bg-[#2B1810] text-[#F59E0B] rounded-xs hover:bg-[#3D2317] transition-colors shadow-xs flex items-center space-x-1 cursor-pointer"
                title={isTh ? 'ครอบตัดหรือปรับสัดส่วน 3:4' : 'Crop / Reposition 3:4'}
              >
                <Crop size={11} />
                <span>{isTh ? 'ครอบ 3:4' : 'Crop'}</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2 py-1 text-[10px] font-bold bg-white text-gray-800 rounded-xs hover:bg-[#FAF7F2] transition-colors shadow-xs cursor-pointer"
              >
                {isTh ? 'เปลี่ยนรูป' : 'Change'}
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={isUploading}
                className="p-1 text-red-500 bg-white rounded-xs hover:bg-red-50 transition-colors shadow-xs cursor-pointer"
                title={isTh ? 'ลบรูปภาพ' : 'Remove Image'}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Empty State Dropzone */
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer flex flex-col items-center justify-center text-center ${
              compact ? 'py-3 px-2' : 'py-6 px-3'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 text-[#D97706] flex items-center justify-center mb-1.5 shadow-2xs">
              <UploadCloud size={16} />
            </div>

            <p className="text-xs font-bold text-gray-800">
              {isTh ? 'ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่อเลือก' : 'Drag & drop image or browse'}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {isTh
                ? 'รองรับ JPG, PNG, WebP (สูงสุด 10MB) • ครอบตัด 3:4 อัตโนมัติ'
                : 'JPG, PNG, WebP (Max 10MB) • Auto 3:4 Crop'}
            </p>
          </div>
        )}

        {/* Uploading Spinner Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center z-20 space-y-2">
            <Loader2 size={22} className="text-[#D97706] animate-spin" />
            <span className="text-xs font-bold text-gray-800">
              {isTh ? 'กำลังอัปโหลดรูปภาพ...' : 'Uploading image...'}
            </span>
            {uploadProgress > 0 && (
              <div className="w-28 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#D97706] h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            <span className="text-[10px] font-mono text-gray-500">{uploadProgress}%</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="text-[10px] font-bold text-red-600 flex items-center space-x-1 pt-0.5">
          <AlertCircle size={12} className="flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interactive 3:4 Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        originalFileName={cropFileName}
        onClose={handleCloseCropModal}
        onConfirm={handleCropConfirmed}
      />
    </div>
  );
}
