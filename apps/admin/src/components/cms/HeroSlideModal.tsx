import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { ImageUploader } from '../media/ImageUploader';
import { BannerPlacement } from '@repo/types';
import type { ApiCmsBanner } from '@repo/types';
import { saveCmsBannerSchema, type SaveCmsBannerDto } from '@repo/validators';
import { useLanguage } from '../../context/LanguageContext';

interface HeroSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: ApiCmsBanner | null;
  onSave: (payload: SaveCmsBannerDto) => Promise<void>;
  isLoading?: boolean;
}

export const HeroSlideModal: React.FC<HeroSlideModalProps> = ({
  isOpen,
  onClose,
  banner,
  onSave,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [titleTh, setTitleTh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleTh, setSubtitleTh] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [tagTh, setTagTh] = useState('');
  const [tagEn, setTagEn] = useState('');
  const [imageDesktopUrl, setImageDesktopUrl] = useState('');
  const [imageMobileUrl, setImageMobileUrl] = useState('');
  const [ctaPrimaryTextTh, setCtaPrimaryTextTh] = useState('');
  const [ctaPrimaryTextEn, setCtaPrimaryTextEn] = useState('');
  const [ctaPrimaryLink, setCtaPrimaryLink] = useState('');
  const [ctaSecondaryTextTh, setCtaSecondaryTextTh] = useState('');
  const [ctaSecondaryTextEn, setCtaSecondaryTextEn] = useState('');
  const [ctaSecondaryLink, setCtaSecondaryLink] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setTitleTh(banner.titleTh ?? '');
      setTitleEn(banner.titleEn ?? '');
      setSubtitleTh(banner.subtitleTh ?? '');
      setSubtitleEn(banner.subtitleEn ?? '');
      setTagTh(banner.tagTh ?? '');
      setTagEn(banner.tagEn ?? '');
      setImageDesktopUrl(banner.imageDesktopUrl ?? '');
      setImageMobileUrl(banner.imageMobileUrl ?? '');
      setCtaPrimaryTextTh(banner.ctaPrimaryTextTh ?? '');
      setCtaPrimaryTextEn(banner.ctaPrimaryTextEn ?? '');
      setCtaPrimaryLink(banner.ctaPrimaryLink ?? '');
      setCtaSecondaryTextTh(banner.ctaSecondaryTextTh ?? '');
      setCtaSecondaryTextEn(banner.ctaSecondaryTextEn ?? '');
      setCtaSecondaryLink(banner.ctaSecondaryLink ?? '');
      setSortOrder(banner.sortOrder ?? 0);
      setIsActive(banner.isActive ?? true);
    } else {
      setTitleTh('');
      setTitleEn('');
      setSubtitleTh('');
      setSubtitleEn('');
      setTagTh('สินค้ามาใหม่');
      setTagEn('NEW ARRIVALS');
      setImageDesktopUrl('');
      setImageMobileUrl('');
      setCtaPrimaryTextTh('ช้อปคอลเลกชันสตรี');
      setCtaPrimaryTextEn('Shop Women');
      setCtaPrimaryLink('/collections/women');
      setCtaSecondaryTextTh('ช้อปคอลเลกชันบุรุษ');
      setCtaSecondaryTextEn('Shop Men');
      setCtaSecondaryLink('/collections/men');
      setSortOrder(0);
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [banner, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: SaveCmsBannerDto = {
      placement: BannerPlacement.HERO_HOME,
      titleTh: titleTh.trim() || null,
      titleEn: titleEn.trim() || null,
      subtitleTh: subtitleTh.trim() || null,
      subtitleEn: subtitleEn.trim() || null,
      tagTh: tagTh.trim() || null,
      tagEn: tagEn.trim() || null,
      targetUrl: ctaPrimaryLink.trim() || null,
      imageDesktopUrl: imageDesktopUrl.trim(),
      imageMobileUrl: imageMobileUrl.trim() || null,
      ctaPrimaryTextTh: ctaPrimaryTextTh.trim() || null,
      ctaPrimaryTextEn: ctaPrimaryTextEn.trim() || null,
      ctaPrimaryLink: ctaPrimaryLink.trim() || null,
      ctaSecondaryTextTh: ctaSecondaryTextTh.trim() || null,
      ctaSecondaryTextEn: ctaSecondaryTextEn.trim() || null,
      ctaSecondaryLink: ctaSecondaryLink.trim() || null,
      couponCode: null,
      sortOrder: Number(sortOrder),
      isActive,
      startDate: null,
      endDate: null,
    };

    const validation = saveCmsBannerSchema.safeParse(payload);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง';
      setErrorMsg(firstError);
      return;
    }

    try {
      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to save hero slide');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xs shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF7F2]">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#2B1810]">
              {banner ? t('cms.heroModal.editTitle') : t('cms.heroModal.newTitle')}
            </h3>
            <p className="text-[11px] text-stone-500">
              {t('cms.heroModal.desc')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-xs transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xs flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Visual Media */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
              <ImageIcon size={14} className="text-[#2B1810]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.heroModal.secMedia')}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ImageUploader
                  label={t('cms.heroModal.desktopImage')}
                  value={imageDesktopUrl}
                  onChange={setImageDesktopUrl}
                  description={t('cms.heroModal.desktopImageHint')}
                />
              </div>
              <div>
                <ImageUploader
                  label={t('cms.heroModal.mobileImage')}
                  value={imageMobileUrl}
                  onChange={setImageMobileUrl}
                  description={t('cms.heroModal.mobileImageHint')}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Headlines & Tag */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.heroModal.secHeadlines')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.heroModal.titleTh')}
                </label>
                <input
                  type="text"
                  value={titleTh}
                  onChange={(e) => setTitleTh(e.target.value)}
                  placeholder={t('cms.heroModal.titleThPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.heroModal.titleEn')}
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder={t('cms.heroModal.titleEnPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.heroModal.subtitleTh')}
                </label>
                <input
                  type="text"
                  value={subtitleTh}
                  onChange={(e) => setSubtitleTh(e.target.value)}
                  placeholder={t('cms.heroModal.subtitleThPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.heroModal.subtitleEn')}
                </label>
                <input
                  type="text"
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                  placeholder={t('cms.heroModal.subtitleEnPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.heroModal.tagTh')}
                </label>
                <input
                  type="text"
                  value={tagTh}
                  onChange={(e) => setTagTh(e.target.value)}
                  placeholder={t('cms.heroModal.tagThPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.heroModal.tagEn')}
                </label>
                <input
                  type="text"
                  value={tagEn}
                  onChange={(e) => setTagEn(e.target.value)}
                  placeholder={t('cms.heroModal.tagEnPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dual Action Buttons */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
              <LinkIcon size={14} className="text-[#2B1810]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.heroModal.secActions')}
              </h4>
            </div>

            {/* Primary CTA */}
            <div className="p-3 bg-[#FAF7F2] border border-stone-200 rounded-xs space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2B1810] block">
                {t('cms.heroModal.btn1Label')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-600 mb-1">{t('cms.heroModal.btn1TextTh')}</label>
                  <input
                    type="text"
                    value={ctaPrimaryTextTh}
                    onChange={(e) => setCtaPrimaryTextTh(e.target.value)}
                    placeholder={t('cms.heroModal.btn1TextThPlaceholder')}
                    className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-600 mb-1">{t('cms.heroModal.btn1TextEn')}</label>
                  <input
                    type="text"
                    value={ctaPrimaryTextEn}
                    onChange={(e) => setCtaPrimaryTextEn(e.target.value)}
                    placeholder={t('cms.heroModal.btn1TextEnPlaceholder')}
                    className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-600 mb-1">{t('cms.heroModal.btn1Link')}</label>
                  <input
                    type="text"
                    value={ctaPrimaryLink}
                    onChange={(e) => setCtaPrimaryLink(e.target.value)}
                    placeholder="e.g. /collections/women"
                    className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="p-3 bg-white border border-stone-200 rounded-xs space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 block">
                {t('cms.heroModal.btn2Label')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-600 mb-1">{t('cms.heroModal.btn2TextTh')}</label>
                  <input
                    type="text"
                    value={ctaSecondaryTextTh}
                    onChange={(e) => setCtaSecondaryTextTh(e.target.value)}
                    placeholder={t('cms.heroModal.btn2TextThPlaceholder')}
                    className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-600 mb-1">{t('cms.heroModal.btn2TextEn')}</label>
                  <input
                    type="text"
                    value={ctaSecondaryTextEn}
                    onChange={(e) => setCtaSecondaryTextEn(e.target.value)}
                    placeholder={t('cms.heroModal.btn2TextEnPlaceholder')}
                    className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-600 mb-1">{t('cms.heroModal.btn2Link')}</label>
                  <input
                    type="text"
                    value={ctaSecondaryLink}
                    onChange={(e) => setCtaSecondaryLink(e.target.value)}
                    placeholder="e.g. /collections/men"
                    className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Display Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                {t('cms.heroModal.sortOrder')}
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xs self-start">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#2B1810] block">
                  {t('cms.heroModal.statusToggle')}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2B1810]" />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-black uppercase tracking-wider rounded-xs hover:bg-stone-50 transition-colors"
            >
              {t('cms.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#2B1810] text-white text-xs font-black uppercase tracking-wider rounded-xs hover:bg-[#3D2317] transition-colors disabled:opacity-50 shadow-xs"
            >
              {isLoading ? t('cms.saving') : t('cms.heroModal.saveSlide')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
