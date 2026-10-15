'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { COLOR_NAMES } from './searchConstants';

interface SearchColorFilterProps {
  availableColors: string[];
  selectedColors: string[];
  onToggleColor: (colorHex: string) => void;
}

export function SearchColorFilter({
  availableColors,
  selectedColors,
  onToggleColor,
}: SearchColorFilterProps) {
  const { language } = useLanguage();

  return (
    <div className="mt-3 grid grid-cols-4 gap-2.5">
      {availableColors.map((colorHex) => {
        const isSelected = selectedColors.includes(colorHex);
        const colorInfo = COLOR_NAMES[colorHex];
        const displayName = colorInfo
          ? language === 'th'
            ? colorInfo.th
            : colorInfo.en
          : colorHex;

        const isLight =
          colorHex === '#FFFFFF' || colorHex === '#F59E0B' || colorHex === '#D4B996';

        return (
          <button
            key={colorHex}
            type="button"
            onClick={() => onToggleColor(colorHex)}
            title={displayName}
            className="flex flex-col items-center group py-1 cursor-pointer"
          >
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                isSelected
                  ? 'border-[#2B1810] ring-2 ring-[#2B1810] scale-110'
                  : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: colorHex }}
            >
              {isSelected && (
                <Check
                  size={12}
                  className={isLight ? 'text-black' : 'text-white'}
                />
              )}
            </div>
            <span className="text-[10px] text-gray-500 mt-1 line-clamp-1 text-center font-medium">
              {displayName}
            </span>
          </button>
        );
      })}
    </div>
  );
}
