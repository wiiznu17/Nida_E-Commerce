import React, { useState, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  originalFileName?: string;
  aspectRatio?: number; // width / height, default 3/4 = 0.75
  onClose: () => void;
  onConfirm: (croppedFile: File) => void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  originalFileName = 'product-image.webp',
  aspectRatio = 3 / 4,
  onClose,
  onConfirm,
}: ImageCropModalProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Transform states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Viewport dimensions (3:4 ratio: 300w x 400h px)
  const VIEWPORT_HEIGHT = 400;
  const VIEWPORT_WIDTH = Math.round(VIEWPORT_HEIGHT * aspectRatio); // 300px for 3:4

  // Calculate base scale so image always completely covers the 3:4 viewport
  const getBaseScale = useCallback(
    (currentRotation: number = rotation) => {
      if (!naturalSize.width || !naturalSize.height) return 1;
      const isRotated = currentRotation === 90 || currentRotation === 270;
      const effectiveW = isRotated ? naturalSize.height : naturalSize.width;
      const effectiveH = isRotated ? naturalSize.width : naturalSize.height;

      return Math.max(VIEWPORT_WIDTH / effectiveW, VIEWPORT_HEIGHT / effectiveH);
    },
    [naturalSize, rotation, VIEWPORT_WIDTH, VIEWPORT_HEIGHT],
  );

  // Calculate boundary limits: image can NEVER be dragged past its borders
  const getPanLimits = useCallback(
    (currentZoom: number, currentRotation: number) => {
      if (!naturalSize.width || !naturalSize.height) return { maxPanX: 0, maxPanY: 0, baseScale: 1, currentScale: 1 };

      const isRotated = currentRotation === 90 || currentRotation === 270;
      const effectiveW = isRotated ? naturalSize.height : naturalSize.width;
      const effectiveH = isRotated ? naturalSize.width : naturalSize.height;

      const baseScale = Math.max(VIEWPORT_WIDTH / effectiveW, VIEWPORT_HEIGHT / effectiveH);
      const currentScale = baseScale * currentZoom;

      const scaledW = effectiveW * currentScale;
      const scaledH = effectiveH * currentScale;

      // Max allowable offset from center while keeping viewport 100% inside the image
      const maxPanX = Math.max(0, (scaledW - VIEWPORT_WIDTH) / 2);
      const maxPanY = Math.max(0, (scaledH - VIEWPORT_HEIGHT) / 2);

      return { maxPanX, maxPanY, baseScale, currentScale };
    },
    [naturalSize, VIEWPORT_WIDTH, VIEWPORT_HEIGHT],
  );

  // Clamp pan coordinates within strict image boundaries
  const clampPan = useCallback(
    (x: number, y: number, currentZoom: number, currentRotation: number) => {
      const { maxPanX, maxPanY } = getPanLimits(currentZoom, currentRotation);
      return {
        x: Math.min(maxPanX, Math.max(-maxPanX, x)),
        y: Math.min(maxPanY, Math.max(-maxPanY, y)),
      };
    },
    [getPanLimits],
  );

  // Reset transforms when new image is loaded
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
  }, [isOpen, imageSrc]);

  // Handle Drag / Pan (Strictly clamped to image borders)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rawX = e.clientX - dragStart.x;
    const rawY = e.clientY - dragStart.y;
    setPan(clampPan(rawX, rawY, zoom, rotation));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile/trackpad
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rawX = touch.clientX - dragStart.x;
    const rawY = touch.clientY - dragStart.y;
    setPan(clampPan(rawX, rawY, zoom, rotation));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom handler with boundary recalculation
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3, newZoom));
    setZoom(clampedZoom);
    setPan((prevPan) => clampPan(prevPan.x, prevPan.y, clampedZoom, rotation));
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    handleZoomChange(+(zoom + delta).toFixed(2));
  };

  // Rotate 90 degrees clockwise with boundary clamping
  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    setPan((prevPan) => clampPan(prevPan.x, prevPan.y, zoom, nextRotation));
  };

  // Reset to default
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Generate cropped WebP Blob using HTML5 Canvas
  const handleConfirmCrop = async () => {
    if (!imageLoaded) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Target high-resolution canvas (900 x 1200 px)
      const targetHeight = 1200;
      const targetWidth = Math.round(targetHeight * aspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Scale multiplier from preview viewport to export canvas
      const outputScaleMultiplier = targetWidth / VIEWPORT_WIDTH;
      const baseScale = getBaseScale(rotation);
      const currentScale = baseScale * zoom * outputScaleMultiplier;

      // Ensure clamped coordinates before drawing
      const finalPan = clampPan(pan.x, pan.y, zoom, rotation);

      ctx.save();
      // Move to center of canvas
      ctx.translate(targetWidth / 2, targetHeight / 2);

      // Apply Pan (scaled to target resolution)
      ctx.translate(finalPan.x * outputScaleMultiplier, finalPan.y * outputScaleMultiplier);

      // Apply Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply Scale
      ctx.scale(currentScale, currentScale);

      // Draw image centered
      ctx.drawImage(
        img,
        -naturalSize.width / 2,
        -naturalSize.height / 2,
        naturalSize.width,
        naturalSize.height,
      );

      ctx.restore();

      // Convert to WebP format (Quality: 88%)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }

          const baseName = originalFileName.replace(/\.[^/.]+$/, '');
          const newFileName = `${baseName || 'product'}-3x4-${Date.now().toString().slice(-4)}.webp`;
          const croppedFile = new File([blob], newFileName, { type: 'image/webp' });

          setIsProcessing(false);
          onConfirm(croppedFile);
        },
        'image/webp',
        0.88,
      );
    } catch (err) {
      console.error('Failed to crop image:', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const baseScale = getBaseScale(rotation);
  const currentScale = baseScale * zoom;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white border-b border-[#EAE3D9] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706]">
              <Crop size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {isTh ? 'ครอบตัดรูปภาพสินค้า (3:4)' : 'Crop Product Image (3:4)'}
              </h3>
              <p className="text-[10px] text-gray-500">
                {isTh
                  ? 'ลากจัดกึ่งกลางและซูมตามต้องการ'
                  : 'Pan and zoom as needed'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Crop Interactive Stage */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className="relative w-full h-[450px] bg-[#140B07] overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
        >
          {/* Background image layer showing the full image */}
          {imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src={imageSrc}
                alt="Target to crop"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${currentScale})`,
                  transformOrigin: 'center center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
                className="transition-transform duration-75 ease-out select-none"
              />
            </div>
          )}

          {/* 3:4 Crop Frame & Translucent Mask Overlay */}
          <div
            style={{
              width: `${VIEWPORT_WIDTH}px`,
              height: `${VIEWPORT_HEIGHT}px`,
              boxShadow: '0 0 0 9999px rgba(18, 9, 5, 0.60)',
            }}
            className="relative pointer-events-none rounded-sm border-2 border-[#F59E0B] shadow-2xl flex items-center justify-center"
          >
            {/* Rule of Thirds Guide Grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div />
            </div>

            {/* Viewfinder Corner Accents */}
            <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white pointer-events-none" />
            <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-white pointer-events-none" />
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="px-5 py-3 bg-white border-t border-[#EAE3D9] space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleZoomChange(+(zoom - 0.1).toFixed(2))}
              className="p-1 text-gray-500 hover:text-gray-900 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer"
              title={isTh ? 'ซูมออก' : 'Zoom Out'}
            >
              <ZoomOut size={16} />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 accent-[#D97706] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => handleZoomChange(+(zoom + 0.1).toFixed(2))}
              className="p-1 text-gray-500 hover:text-gray-900 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer"
              title={isTh ? 'ซูมเข้า' : 'Zoom In'}
            >
              <ZoomIn size={16} />
            </button>

            <span className="text-[11px] font-mono font-bold text-gray-600 w-10 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Quick Actions (Rotate & Reset) */}
          <div className="flex items-center space-x-2 pt-0.5">
            <button
              type="button"
              onClick={handleRotate}
              className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <RotateCw size={13} />
              <span>{isTh ? 'หมุน 90°' : 'Rotate'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>{isTh ? 'กึ่งกลาง' : 'Center'}</span>
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-3 bg-[#FAF7F2] border-t border-[#EAE3D9] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {isTh ? 'ยกเลิก' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleConfirmCrop}
              disabled={isProcessing || !imageLoaded}
              className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#1E110A] bg-[#F59E0B] hover:bg-[#D97706] rounded-md shadow-xs transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <span>{isTh ? 'กำลังครอบตัดและแปลงไฟล์...' : 'Processing...'}</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>{isTh ? 'ครอบตัด & บันทึกรูป 3:4' : 'Apply 3:4 Crop'}</span>
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
}
