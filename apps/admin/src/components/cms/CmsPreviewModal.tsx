import React, { useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { CmsLivePreviewCanvas } from './preview/CmsLivePreviewCanvas';
import type { ApiCmsBanner, ApiStoreSettings } from '@repo/types';
import { useLanguage } from '../../context/LanguageContext';

interface CmsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroBanners: ApiCmsBanner[];
  spotlights: ApiCmsBanner[];
  promoRibbon: ApiCmsBanner | null;
  storeSettings: ApiStoreSettings | null;
  onNavigateTab?: (tabKey: 'hero' | 'spotlight' | 'promo' | 'settings') => void;
}

export const CmsPreviewModal: React.FC<CmsPreviewModalProps> = ({
  isOpen,
  onClose,
  heroBanners,
  spotlights,
  promoRibbon,
  storeSettings,
  onNavigateTab,
}) => {
  const { t } = useLanguage();

  const handleNavigateTab = (
    tabKey: 'hero' | 'spotlight' | 'promo' | 'settings',
  ) => {
    if (onNavigateTab) {
      onNavigateTab(tabKey);
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-xs shadow-2xl flex flex-col overflow-hidden border border-stone-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF7F2]">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-[#2B1810] text-white rounded-xs">
              <Eye size={16} />
            </span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-[#2B1810]">
                {t('cms.previewModalTitle')}
              </h3>
              <p className="text-[11px] text-stone-500">
                {t('cms.previewModalSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xs transition-colors"
            title="Close Preview"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Embedded Preview Canvas */}
        <div className="flex-1 overflow-y-auto bg-stone-100 p-4">
          <CmsLivePreviewCanvas
            heroBanners={heroBanners}
            activeHeroIndex={0}
            spotlights={spotlights}
            promoRibbon={promoRibbon}
            storeSettings={storeSettings ?? {}}
            onNavigateTab={handleNavigateTab}
          />
        </div>
      </div>
    </div>
  );
};
