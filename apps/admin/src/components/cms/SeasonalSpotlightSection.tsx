import React, { useState } from 'react';
import { Edit2, RotateCcw, ArrowRight } from 'lucide-react';
import type { ApiCmsBanner } from '@repo/types';
import type { SaveCmsBannerDto } from '@repo/validators';
import { SpotlightModal } from './SpotlightModal';
import { useLanguage } from '../../context/LanguageContext';

interface SeasonalSpotlightSectionProps {
  banners: ApiCmsBanner[];
  onSave: (payload: SaveCmsBannerDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const SeasonalSpotlightSection: React.FC<SeasonalSpotlightSectionProps> = ({
  banners,
  onSave,
  onDelete,
  isLoading = false,
}) => {
  const { t, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<1 | 2>(1);
  const [editingBanner, setEditingBanner] = useState<ApiCmsBanner | null>(null);

  const isTh = language === 'th';

  const spotlightBanners = banners.filter(
    (b) => b.placement === 'SEASONAL_SPOTLIGHT',
  );

  const slot1Banner = spotlightBanners.find((b) => b.sortOrder === 0) ?? spotlightBanners[0] ?? null;
  const slot2Banner = spotlightBanners.find((b) => b.sortOrder === 1) ?? (spotlightBanners[1] ? spotlightBanners[1] : null);

  const handleOpenEditSlot = (slot: 1 | 2) => {
    setSelectedSlot(slot);
    setEditingBanner(slot === 1 ? slot1Banner : slot2Banner);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: SaveCmsBannerDto) => {
    await onSave(payload);
  };

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="p-4 bg-white border border-stone-200 rounded-xs">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            {t('cms.spotlight.title')}
          </h3>
        </div>
        <p className="text-[11px] text-stone-500 mt-1">
          {t('cms.spotlight.subtitle')}
        </p>
      </div>

      {/* 2-Column Bento Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Slot 1: Left (Women) */}
        <div className="flex flex-col bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF7F2] border-b border-stone-200 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#2B1810] text-white text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <span className="font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.spotlight.slot1Title')}
              </span>
            </div>
            {slot1Banner ? (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  slot1Banner.isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {slot1Banner.isActive ? t('cms.statusConfigured') : t('cms.statusHidden')}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                {t('cms.statusDefault')}
              </span>
            )}
          </div>

          {/* Visual Preview */}
          <div className="relative aspect-4/3 bg-stone-100 overflow-hidden group">
            <img
              src={
                slot1Banner?.imageDesktopUrl ??
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85'
              }
              alt="Slot 1 Spotlight"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#EAE3D9] mb-1">
                {isTh
                  ? slot1Banner?.tagTh || slot1Banner?.tagEn || 'คอลเลกชันสตรี'
                  : slot1Banner?.tagEn || slot1Banner?.tagTh || "WOMEN'S / NEW SEASON"}
              </span>
              <h4 className="text-base font-black uppercase tracking-tight line-clamp-1">
                {isTh
                  ? slot1Banner?.titleTh || slot1Banner?.titleEn || 'เสื้อคลุมสไตล์โมเดิร์น'
                  : slot1Banner?.titleEn || slot1Banner?.titleTh || 'MODERN TAILORED OUTERWEAR'}
              </h4>
              <p className="text-[11px] text-stone-300 line-clamp-2 mt-1">
                {isTh
                  ? slot1Banner?.subtitleTh || slot1Banner?.subtitleEn || 'งานตัดเย็บโครงร่างประณีตจากผ้าขนแกะบริสุทธิ์เพื่อความสง่างามเหนือกาลเวลา'
                  : slot1Banner?.subtitleEn || slot1Banner?.subtitleTh || 'Sculpted silhouettes handcrafted in virgin wool for timeless cold-weather grace.'}
              </p>
              <div className="mt-3 flex items-center space-x-1 text-xs font-bold text-white underline underline-offset-4">
                <span>
                  {isTh
                    ? slot1Banner?.ctaPrimaryTextTh || slot1Banner?.ctaPrimaryTextEn || 'เลือกดูคอลเลกชันสตรี'
                    : slot1Banner?.ctaPrimaryTextEn || slot1Banner?.ctaPrimaryTextTh || "Explore Women's"}
                </span>
                <ArrowRight size={12} />
              </div>
            </div>
          </div>

          {/* Card Info & Actions */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
            <div className="text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">{t('cms.spotlight.targetUrlLabel')}</span>
                <span className="font-mono text-stone-700 font-bold">
                  {slot1Banner?.ctaPrimaryLink ?? '/collections/women'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => handleOpenEditSlot(1)}
                className="flex-1 py-2 bg-[#2B1810] text-white text-xs font-black uppercase tracking-wider rounded-xs hover:bg-[#3D2317] transition-colors flex items-center justify-center shadow-xs"
              >
                <Edit2 size={13} className="mr-1.5" />
                {slot1Banner ? t('cms.spotlight.editSlot1') : t('cms.spotlight.createSlot1')}
              </button>
              {slot1Banner && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('cms.spotlight.resetConfirm'))) {
                      onDelete(slot1Banner.id);
                    }
                  }}
                  className="p-2 border border-stone-300 text-stone-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-xs transition-colors"
                  title={t('cms.spotlight.resetDefault')}
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Slot 2: Right (Men) */}
        <div className="flex flex-col bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF7F2] border-b border-stone-200 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#2B1810] text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
              <span className="font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.spotlight.slot2Title')}
              </span>
            </div>
            {slot2Banner ? (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  slot2Banner.isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {slot2Banner.isActive ? t('cms.statusConfigured') : t('cms.statusHidden')}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                {t('cms.statusDefault')}
              </span>
            )}
          </div>

          {/* Visual Preview */}
          <div className="relative aspect-4/3 bg-stone-100 overflow-hidden group">
            <img
              src={
                slot2Banner?.imageDesktopUrl ??
                'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85'
              }
              alt="Slot 2 Spotlight"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#EAE3D9] mb-1">
                {isTh
                  ? slot2Banner?.tagTh || slot2Banner?.tagEn || 'คอลเลกชันบุรุษ'
                  : slot2Banner?.tagEn || slot2Banner?.tagTh || "MEN'S / EDITORIAL CAPSULE"}
              </span>
              <h4 className="text-base font-black uppercase tracking-tight line-clamp-1">
                {isTh
                  ? slot2Banner?.titleTh || slot2Banner?.titleEn || 'ชุดสูทและงานเทเลอร์ชั้นเลิศ'
                  : slot2Banner?.titleEn || slot2Banner?.titleTh || 'ELEVATED BESPOKE SUITING'}
              </h4>
              <p className="text-[11px] text-stone-300 line-clamp-2 mt-1">
                {isTh
                  ? slot2Banner?.subtitleTh || slot2Banner?.subtitleEn || 'โครงสร้างคมชัดด้วยเส้นสายร่วมสมัยผสมผสานความคลาสสิกเหนือกาลเวลา'
                  : slot2Banner?.subtitleEn || slot2Banner?.subtitleTh || 'Refined structure engineered with fluid modern lines for formal distinction.'}
              </p>
              <div className="mt-3 flex items-center space-x-1 text-xs font-bold text-white underline underline-offset-4">
                <span>
                  {isTh
                    ? slot2Banner?.ctaPrimaryTextTh || slot2Banner?.ctaPrimaryTextEn || 'เลือกดูคอลเลกชันบุรุษ'
                    : slot2Banner?.ctaPrimaryTextEn || slot2Banner?.ctaPrimaryTextTh || "Explore Men's"}
                </span>
                <ArrowRight size={12} />
              </div>
            </div>
          </div>

          {/* Card Info & Actions */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
            <div className="text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">{t('cms.spotlight.targetUrlLabel')}</span>
                <span className="font-mono text-stone-700 font-bold">
                  {slot2Banner?.ctaPrimaryLink ?? '/collections/men'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => handleOpenEditSlot(2)}
                className="flex-1 py-2 bg-[#2B1810] text-white text-xs font-black uppercase tracking-wider rounded-xs hover:bg-[#3D2317] transition-colors flex items-center justify-center shadow-xs"
              >
                <Edit2 size={13} className="mr-1.5" />
                {slot2Banner ? t('cms.spotlight.editSlot2') : t('cms.spotlight.createSlot2')}
              </button>
              {slot2Banner && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('cms.spotlight.resetConfirm'))) {
                      onDelete(slot2Banner.id);
                    }
                  }}
                  className="p-2 border border-stone-300 text-stone-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-xs transition-colors"
                  title={t('cms.spotlight.resetDefault')}
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spotlight Modal */}
      <SpotlightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={editingBanner}
        targetSlot={selectedSlot}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};
