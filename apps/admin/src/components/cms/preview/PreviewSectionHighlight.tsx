import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface PreviewSectionHighlightProps {
  titleTh: string;
  titleEn: string;
  tabKey: 'hero' | 'spotlight' | 'promo' | 'settings';
  tabLabel: string;
  icon: LucideIcon;
  children: React.ReactNode;
  onNavigateTab?: (tabKey: 'hero' | 'spotlight' | 'promo' | 'settings') => void;
  isMobileView?: boolean;
}

export const PreviewSectionHighlight: React.FC<
  PreviewSectionHighlightProps
> = ({
  titleTh,
  titleEn,
  tabKey,
  tabLabel,
  icon: Icon,
  children,
  onNavigateTab,
  isMobileView = false,
}) => {
  const { t } = useLanguage();

  const handleClick = (e: React.MouseEvent) => {
    if (onNavigateTab) {
      e.stopPropagation();
      onNavigateTab(tabKey);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative group transition-all duration-200 cursor-pointer"
      title={`${t('cms.preview.clickToEditTab')} "${tabLabel}"`}
    >
      {/* Target Content */}
      <div className="transition-opacity duration-200 group-hover:opacity-95">
        {children}
      </div>

      {/* Hover Outline & Glow */}
      <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-[#2B1810] group-hover:ring-2 group-hover:ring-[#2B1810]/20 transition-all duration-150 z-20" />

      {/* Subtle Tint on Hover */}
      <div className="absolute inset-0 pointer-events-none bg-[#2B1810]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10" />

      {/* Floating Section Identification Badge */}
      <div
        className={`absolute top-2 left-2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 pointer-events-none shadow-xl ${
          isMobileView ? 'max-w-[90%]' : ''
        }`}
      >
        <div className="bg-[#2B1810] text-white px-2.5 py-1.5 rounded-xs border border-stone-600 flex items-center space-x-2">
          <div className="p-1 bg-[#E6C687] text-[#2B1810] rounded-xs shrink-0">
            <Icon size={12} className="stroke-[2.5]" />
          </div>
          <div className="truncate">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FAF7F2] truncate">
                {titleTh}
              </span>
              <span className="text-[9px] text-[#E6C687] font-mono tracking-wide uppercase font-bold shrink-0">
                ({titleEn})
              </span>
            </div>
            <div className="text-[9px] text-stone-300 flex items-center space-x-1 mt-0.5">
              <span className="text-emerald-400 font-bold">● {tabLabel}</span>
              {onNavigateTab && (
                <>
                  <span className="text-stone-500">•</span>
                  <span className="flex items-center text-amber-200 hover:underline">
                    {t('cms.preview.clickToEdit')}{' '}
                    <ExternalLink size={9} className="ml-0.5 inline" />
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
