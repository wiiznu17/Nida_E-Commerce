import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { ImageUploader } from '../media/ImageUploader';
import { BannerPlacement, UploadFolder } from '@repo/types';
import type { ApiCmsBanner } from '@repo/types';
import { saveCmsBannerSchema, type SaveCmsBannerDto } from '@repo/validators';
import { useLanguage } from '../../context/LanguageContext';
import { InlineError, ApiErrorModal } from '../ui';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

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
    setFieldErrors({});
    setApiError(null);
  }, [banner, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setApiError(null);

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
      const errMap: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = String(issue.path[0] ?? '');
        if (fieldName && !errMap[fieldName]) {
          errMap[fieldName] = issue.message;
        }
      }
      setFieldErrors(errMap);
      return;
    }

    try {
      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save hero slide';
      setApiError(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xs shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF7F2]">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#2B1810]">
              {banner
                ? t('cms.heroModal.editTitle')
                : t('cms.heroModal.newTitle')}
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Section 1: Visual Media */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
              <ImageIcon size={14} className="text-[#2B1810]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.heroModal.secMedia')}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[9fr_4fr] gap-5 items-stretch">
              <div className="h-full">
                <ImageUploader
                  label={t('cms.heroModal.desktopImage')}
                  value={imageDesktopUrl}
                  onChange={setImageDesktopUrl}
                  description={t('cms.heroModal.desktopImageHint')}
                  folder={UploadFolder.BANNERS}
                  aspectRatio="landscape"
                />
                <InlineError message={fieldErrors.imageDesktopUrl} />
              </div>
              <div className="h-full">
                <ImageUploader
                  label={t('cms.heroModal.mobileImage')}
                  value={imageMobileUrl}
                  onChange={setImageMobileUrl}
                  description={t('cms.heroModal.mobileImageHint')}
                  folder={UploadFolder.BANNERS}
                  aspectRatio="portrait"
                />
                <InlineError message={fieldErrors.imageMobileUrl} />
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

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.heroModal.title')}{' '}
                  <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-bold text-stone-500 mb-1">
                      {t('cms.heroModal.th')}
                    </span>
                    <input
                      type="text"
                      value={titleTh}
                      onChange={(e) => setTitleTh(e.target.value)}
                      placeholder={t('cms.heroModal.titleThPlaceholder')}
                      className={`w-full text-xs px-3 py-2 border rounded-xs focus:outline-hidden ${
                        fieldErrors.titleTh
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-stone-300 focus:border-[#2B1810]'
                      }`}
                    />
                    <InlineError message={fieldErrors.titleTh} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-stone-500 mb-1">
                      {t('cms.heroModal.en')} *
                    </span>
                    <input
                      type="text"
                      required
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder={t('cms.heroModal.titleEnPlaceholder')}
                      className={`w-full text-xs px-3 py-2 border rounded-xs focus:outline-hidden ${
                        fieldErrors.titleEn
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-stone-300 focus:border-[#2B1810]'
                      }`}
                    />
                    <InlineError message={fieldErrors.titleEn} />
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.heroModal.subtitle')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-bold text-stone-500 mb-1">
                      {t('cms.heroModal.th')}
                    </span>
                    <textarea
                      rows={2}
                      value={subtitleTh}
                      onChange={(e) => setSubtitleTh(e.target.value)}
                      placeholder={t('cms.heroModal.subtitleThPlaceholder')}
                      className={`w-full text-xs px-3 py-2 border rounded-xs focus:outline-hidden resize-none ${
                        fieldErrors.subtitleTh
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-stone-300 focus:border-[#2B1810]'
                      }`}
                    />
                    <InlineError message={fieldErrors.subtitleTh} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-stone-500 mb-1">
                      {t('cms.heroModal.en')}
                    </span>
                    <textarea
                      rows={2}
                      value={subtitleEn}
                      onChange={(e) => setSubtitleEn(e.target.value)}
                      placeholder={t('cms.heroModal.subtitleEnPlaceholder')}
                      className={`w-full text-xs px-3 py-2 border rounded-xs focus:outline-hidden resize-none ${
                        fieldErrors.subtitleEn
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-stone-300 focus:border-[#2B1810]'
                      }`}
                    />
                    <InlineError message={fieldErrors.subtitleEn} />
                  </div>
                </div>
              </div>

              {/* Micro Tag */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.heroModal.tag')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-bold text-stone-500 mb-1">
                      {t('cms.heroModal.th')}
                    </span>
                    <input
                      type="text"
                      value={tagTh}
                      onChange={(e) => setTagTh(e.target.value)}
                      placeholder={t('cms.heroModal.tagThPlaceholder')}
                      className={`w-full text-xs px-3 py-2 border rounded-xs focus:outline-hidden ${
                        fieldErrors.tagTh
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-stone-300 focus:border-[#2B1810]'
                      }`}
                    />
                    <InlineError message={fieldErrors.tagTh} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-stone-500 mb-1">
                      {t('cms.heroModal.en')}
                    </span>
                    <input
                      type="text"
                      value={tagEn}
                      onChange={(e) => setTagEn(e.target.value)}
                      placeholder={t('cms.heroModal.tagEnPlaceholder')}
                      className={`w-full text-xs px-3 py-2 border rounded-xs focus:outline-hidden ${
                        fieldErrors.tagEn
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-stone-300 focus:border-[#2B1810]'
                      }`}
                    />
                    <InlineError message={fieldErrors.tagEn} />
                  </div>
                </div>
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
            <div className="p-3.5 bg-[#FAF7F2] border border-stone-200 rounded-xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2B1810] block">
                {t('cms.heroModal.btn1Label')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    {t('cms.heroModal.th')}
                  </label>
                  <input
                    type="text"
                    value={ctaPrimaryTextTh}
                    onChange={(e) => setCtaPrimaryTextTh(e.target.value)}
                    placeholder={t('cms.heroModal.btn1TextThPlaceholder')}
                    className={`w-full text-xs px-2.5 py-1.5 border rounded-xs bg-white ${
                      fieldErrors.ctaPrimaryTextTh
                        ? 'border-rose-400'
                        : 'border-stone-300'
                    }`}
                  />
                  <InlineError message={fieldErrors.ctaPrimaryTextTh} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    {t('cms.heroModal.en')}
                  </label>
                  <input
                    type="text"
                    value={ctaPrimaryTextEn}
                    onChange={(e) => setCtaPrimaryTextEn(e.target.value)}
                    placeholder={t('cms.heroModal.btn1TextEnPlaceholder')}
                    className={`w-full text-xs px-2.5 py-1.5 border rounded-xs bg-white ${
                      fieldErrors.ctaPrimaryTextEn
                        ? 'border-rose-400'
                        : 'border-stone-300'
                    }`}
                  />
                  <InlineError message={fieldErrors.ctaPrimaryTextEn} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    {t('cms.heroModal.link')}
                  </label>
                  <input
                    type="text"
                    value={ctaPrimaryLink}
                    onChange={(e) => setCtaPrimaryLink(e.target.value)}
                    placeholder="e.g. /collections/women"
                    className={`w-full text-xs px-2.5 py-1.5 border rounded-xs bg-white ${
                      fieldErrors.ctaPrimaryLink
                        ? 'border-rose-400'
                        : 'border-stone-300'
                    }`}
                  />
                  <InlineError message={fieldErrors.ctaPrimaryLink} />
                </div>
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="p-3.5 bg-white border border-stone-200 rounded-xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 block">
                {t('cms.heroModal.btn2Label')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    {t('cms.heroModal.th')}
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryTextTh}
                    onChange={(e) => setCtaSecondaryTextTh(e.target.value)}
                    placeholder={t('cms.heroModal.btn2TextThPlaceholder')}
                    className={`w-full text-xs px-2.5 py-1.5 border rounded-xs ${
                      fieldErrors.ctaSecondaryTextTh
                        ? 'border-rose-400'
                        : 'border-stone-300'
                    }`}
                  />
                  <InlineError message={fieldErrors.ctaSecondaryTextTh} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    {t('cms.heroModal.en')}
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryTextEn}
                    onChange={(e) => setCtaSecondaryTextEn(e.target.value)}
                    placeholder={t('cms.heroModal.btn2TextEnPlaceholder')}
                    className={`w-full text-xs px-2.5 py-1.5 border rounded-xs ${
                      fieldErrors.ctaSecondaryTextEn
                        ? 'border-rose-400'
                        : 'border-stone-300'
                    }`}
                  />
                  <InlineError message={fieldErrors.ctaSecondaryTextEn} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    {t('cms.heroModal.link')}
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryLink}
                    onChange={(e) => setCtaSecondaryLink(e.target.value)}
                    placeholder="e.g. /collections/men"
                    className={`w-full text-xs px-2.5 py-1.5 border rounded-xs ${
                      fieldErrors.ctaSecondaryLink
                        ? 'border-rose-400'
                        : 'border-stone-300'
                    }`}
                  />
                  <InlineError message={fieldErrors.ctaSecondaryLink} />
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

      {/* API Error Modal */}
      <ApiErrorModal
        isOpen={Boolean(apiError)}
        onClose={() => setApiError(null)}
        errorMessage={apiError ?? ''}
      />
    </div>
  );
};
