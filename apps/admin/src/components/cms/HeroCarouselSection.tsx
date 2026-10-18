import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Sliders, Image as ImageIcon } from 'lucide-react';
import type { ApiCmsBanner } from '@repo/types';
import type { SaveCmsBannerDto } from '@repo/validators';
import { HeroSlideModal } from './HeroSlideModal';
import { EmptyState } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

interface HeroCarouselSectionProps {
  banners: ApiCmsBanner[];
  onSave: (payload: SaveCmsBannerDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const HeroCarouselSection: React.FC<HeroCarouselSectionProps> = ({
  banners,
  onSave,
  onDelete,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<ApiCmsBanner | null>(null);

  const heroBanners = banners.filter((b) => b.placement === 'HERO_HOME');

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: ApiCmsBanner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSaveSlide = async (payload: SaveCmsBannerDto) => {
    await onSave(payload);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-stone-200 rounded-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-[#2B1810] text-white rounded-xs">
              <Sliders size={14} />
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
              {t('cms.hero.title')}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full font-bold">
              {heroBanners.length} {t('cms.hero.countBadge')}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {t('cms.hero.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#2B1810] text-white font-black text-xs uppercase tracking-wider rounded-xs hover:bg-[#3D2317] transition-colors flex items-center shadow-xs self-start sm:self-auto shrink-0"
        >
          <Plus size={14} className="mr-1.5" />
          {t('cms.hero.addNew')}
        </button>
      </div>

      {/* Table / List */}
      {heroBanners.length === 0 ? (
        <EmptyState
          title={t('cms.hero.emptyTitle')}
          subtitle={t('cms.hero.emptySubtitle')}
          action={{
            label: t('cms.hero.createFirst'),
            onClick: handleOpenAdd,
          }}
        />
      ) : (
        <div className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/75 border-b border-stone-200 text-[10px] font-black uppercase tracking-wider text-stone-500">
                  <th className="py-3 px-4 w-16 text-center">{t('cms.hero.thOrder')}</th>
                  <th className="py-3 px-4 w-28">{t('cms.hero.thPreview')}</th>
                  <th className="py-3 px-4">{t('cms.hero.thHeadline')}</th>
                  <th className="py-3 px-4 w-48">{t('cms.hero.thActions')}</th>
                  <th className="py-3 px-4 w-24 text-center">{t('cms.hero.thStatus')}</th>
                  <th className="py-3 px-4 w-24 text-right">{t('cms.hero.thManage')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {heroBanners.map((slide, idx) => (
                  <tr key={slide.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-500">
                      {slide.sortOrder ?? idx}
                    </td>

                    <td className="py-3 px-4">
                      {slide.imageDesktopUrl ? (
                        <div className="w-24 h-12 rounded-xs overflow-hidden bg-stone-100 border border-stone-200">
                          <img
                            src={slide.imageDesktopUrl}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-12 rounded-xs bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        {slide.tagEn && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[#FAF7F2] border border-stone-300 text-stone-700 rounded-xs">
                            {slide.tagEn}
                          </span>
                        )}
                        <span className="font-bold text-[#2B1810]">
                          {slide.titleEn ?? slide.title}
                        </span>
                      </div>
                      {slide.titleTh && (
                        <p className="text-[11px] text-stone-500">{slide.titleTh}</p>
                      )}
                      {slide.subtitleEn && (
                        <p className="text-[10px] text-stone-400 italic">{slide.subtitleEn}</p>
                      )}
                    </td>

                    <td className="py-3 px-4 space-y-1">
                      {slide.ctaPrimaryLink && (
                        <div className="text-[10px] truncate max-w-[180px]">
                          <span className="font-bold text-stone-700">{t('cms.hero.btn1')} </span>
                          <span className="text-stone-500 font-mono">
                            {slide.ctaPrimaryTextEn ?? slide.ctaPrimaryTextTh ?? 'Link'}
                          </span>
                        </div>
                      )}
                      {slide.ctaSecondaryLink && (
                        <div className="text-[10px] truncate max-w-[180px]">
                          <span className="font-bold text-stone-500">{t('cms.hero.btn2')} </span>
                          <span className="text-stone-400 font-mono">
                            {slide.ctaSecondaryTextEn ?? slide.ctaSecondaryTextTh ?? 'Link'}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          slide.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            slide.isActive ? 'bg-emerald-500' : 'bg-stone-400'
                          }`}
                        />
                        {slide.isActive ? t('cms.statusActive') : t('cms.statusHidden')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(slide)}
                          className="p-1.5 text-stone-600 hover:text-[#2B1810] hover:bg-stone-100 rounded-xs transition-colors"
                          title={t('cms.hero.edit')}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(t('cms.hero.deleteConfirm'))) {
                              onDelete(slide.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                          title={t('cms.hero.delete')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide Modal */}
      <HeroSlideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={editingBanner}
        onSave={handleSaveSlide}
        isLoading={isLoading}
      />
    </div>
  );
};
