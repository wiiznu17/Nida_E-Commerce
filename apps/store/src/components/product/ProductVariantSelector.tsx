import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ProductColor } from './productTypes';

interface ProductVariantSelectorProps {
  availableColors: ProductColor[];
  selectedColor: string;
  onSelectColor: (colorName: string) => void;
  sizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export function ProductVariantSelector({
  availableColors,
  selectedColor,
  onSelectColor,
  sizes,
  selectedSize,
  onSelectSize,
}: ProductVariantSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Color Selection */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-brand-brown">
            {t('product.selectColor')}:{' '}
            <span className="font-semibold text-gray-600">
              {selectedColor}
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {availableColors.map((col, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectColor(col.name)}
              className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                selectedColor === col.name
                  ? 'border-brand-brown scale-110 ring-2 ring-brand-amber'
                  : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: col.hex }}
              title={col.name}
            >
              {selectedColor === col.name && (
                <Check
                  size={14}
                  className={
                    col.hex === '#FFFFFF' ||
                    col.hex === '#FAF7F2' ||
                    col.hex === '#F59E0B'
                      ? 'text-black'
                      : 'text-white'
                  }
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-brand-brown">
            {t('product.selectSize')}
          </span>
          <button
            type="button"
            className="text-xs font-bold text-brand-brown hover:text-brand-amber underline tracking-wider cursor-pointer"
          >
            {t('product.sizeGuide')}
          </button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onSelectSize(size)}
              className={`py-3 text-xs font-black tracking-wider uppercase border transition-all cursor-pointer ${
                selectedSize === size
                  ? 'bg-brand-brown text-white border-brand-brown shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-brown'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
