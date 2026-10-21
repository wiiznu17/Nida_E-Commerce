import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import type { ApiCmsBanner } from '@repo/types';
import { BannerPlacement, UploadFolder } from '@repo/types';
import { saveCmsBannerSchema, type SaveCmsBannerDto } from '@repo/validators';
import { ImageUploader } from '../media/ImageUploader';
import { useLanguage } from '../../context/LanguageContext';

interface PromoRibbonSectionProps {
  banner: ApiCmsBanner | null;
  onSave: (payload: SaveCmsBannerDto) => Promise<void>;
  isLoading?: boolean;
}

export const PromoRibbonSection: React.FC<PromoRibbonSectionProps> = ({
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
  const [couponCode, setCouponCode] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageDesktopUrl, setImageDesktopUrl] = useState('');
  const [imageMobileUrl, setImageMobileUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setTitleTh(banner.titleTh ?? '');
      setTitleEn(banner.titleEn ?? '');
      setSubtitleTh(banner.subtitleTh ?? '');
      setSubtitleEn(banner.subtitleEn ?? '');
      setTagTh(banner.tagTh ?? '');
      setTagEn(banner.tagEn ?? '');
      setCouponCode(banner.couponCode ?? '');
      setTargetUrl(banner.targetUrl ?? '');
      setImageDesktopUrl(banner.imageDesktopUrl ?? '');
      setImageMobileUrl(banner.imageMobileUrl ?? '');
      setIsActive(banner.isActive ?? true);
    } else {
      setTitleTh('สิทธิพิเศษสำหรับสมาชิก NIDA CLUB');
      setTitleEn('EXCLUSIVE NIDA PRIVILEGE');
      setSubtitleTh('รับส่วนลด 20% ทันทีเมื่อสั่งซื้อครบ ฿2,000');
      setSubtitleEn(
        'Receive 20% privilege on orders over ฿2,000 with private code',
      );
      setTagTh('ข้อเสนอพิเศษ');
      setTagEn('EXCLUSIVE PRIVILEGE');
      setCouponCode('NIDA20');
      setTargetUrl('/collections');
      setImageDesktopUrl(
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
      );
      setImageMobileUrl('');
      setIsActive(true);
    }
    setErrorMsg(null);
    setSuccessMsg(false);
  }, [banner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(false);

    const payload: SaveCmsBannerDto = {
      placement: BannerPlacement.PROMO_RIBBON,
      titleTh: titleTh.trim() || null,
      titleEn: titleEn.trim() || null,
      subtitleTh: subtitleTh.trim() || null,
      subtitleEn: subtitleEn.trim() || null,
      tagTh: tagTh.trim() || null,
      tagEn: tagEn.trim() || null,
      couponCode: couponCode.trim().toUpperCase() || null,
      targetUrl: targetUrl.trim() || null,
      imageDesktopUrl: imageDesktopUrl.trim(),
      imageMobileUrl: imageMobileUrl.trim() || null,
      ctaPrimaryTextTh: null,
      ctaPrimaryTextEn: null,
      ctaPrimaryLink: null,
      ctaSecondaryTextTh: null,
      ctaSecondaryTextEn: null,
      ctaSecondaryLink: null,
      sortOrder: 0,
      isActive,
      startDate: null,
      endDate: null,
    };

    const validation = saveCmsBannerSchema.safeParse(payload);
    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message ?? 'Validation failed';
      setErrorMsg(firstError);
      return;
    }

    try {
      await onSave(payload);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to save promo ribbon');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white border border-stone-200 rounded-xs">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
          {t('cms.promo.title')}
        </h3>
        <p className="text-[11px] text-stone-500 mt-0.5">
          {t('cms.promo.subtitle')}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xs flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center space-x-2 text-xs text-emerald-800">
              <Check size={15} className="shrink-0" />
              <span>{t('cms.promo.saveSuccess')}</span>
            </div>
          )}

          {/* Active Switch & Coupon Code Highlight Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 bg-[#FAF7F2] border border-stone-200 rounded-xs">
            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#2B1810] block">
                  {t('cms.promo.statusActive')}
                </span>
                <span className="text-[10px] text-stone-500">
                  {t('cms.promo.statusActiveHint')}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2B1810]" />
              </label>
            </div>

            {/* Coupon Code Input */}
            <div className="border-t md:border-t-0 md:border-l border-stone-200 pt-3 md:pt-0 md:pl-4">
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                {t('cms.promo.codeLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NIDA20"
                  className="w-full text-sm font-mono font-black tracking-widest px-3 py-2 bg-white border border-stone-300 rounded-xs uppercase text-[#2B1810] focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>
            </div>
          </div>

          {/* Ribbon Images */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
              <ImageIcon size={14} className="text-[#2B1810]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.promo.secMedia')}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ImageUploader
                  label={t('cms.promo.desktopImage')}
                  value={imageDesktopUrl}
                  onChange={setImageDesktopUrl}
                  description={t('cms.promo.desktopImageHint')}
                  aspectRatio="landscape"
                  folder={UploadFolder.BANNERS}
                />
              </div>
              <div>
                <ImageUploader
                  label={t('cms.promo.mobileImage')}
                  value={imageMobileUrl}
                  onChange={setImageMobileUrl}
                  description="800x600 px"
                  aspectRatio="landscape"
                  folder={UploadFolder.BANNERS}
                />
              </div>
            </div>
          </div>

          {/* Headlines & Copy */}
          <div className="space-y-4">
            <div className="border-b border-stone-200 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.promo.secHeadlines')}
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
                      placeholder="เช่น สิทธิพิเศษสำหรับสมาชิก NIDA CLUB"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                    />
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
                      placeholder="e.g. EXCLUSIVE NIDA PRIVILEGE"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                    />
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
                      placeholder="เช่น รับส่วนลด 20% ทันทีเมื่อสั่งซื้อครบ ฿2,000"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810] resize-none"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-stone-500 mb-1">
                      {t('cms.heroModal.en')}
                    </span>
                    <textarea
                      rows={2}
                      value={subtitleEn}
                      onChange={(e) => setSubtitleEn(e.target.value)}
                      placeholder="e.g. Receive 20% privilege on orders over ฿2,000"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810] resize-none"
                    />
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
                      placeholder="เช่น ข้อเสนอพิเศษ"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-stone-500 mb-1">
                      {t('cms.heroModal.en')}
                    </span>
                    <input
                      type="text"
                      value={tagEn}
                      onChange={(e) => setTagEn(e.target.value)}
                      placeholder="e.g. EXCLUSIVE PRIVILEGE"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Target Link */}
          <div className="space-y-4">
            <div className="border-b border-stone-200 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.heroModal.link')}
              </h4>
            </div>

            <div>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="e.g. /collections"
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#2B1810] text-white text-xs font-black uppercase tracking-wider rounded-xs hover:bg-[#3D2317] transition-colors disabled:opacity-50 shadow-xs flex items-center cursor-pointer"
            >
              <Check size={14} className="mr-1.5" />
              {isLoading ? t('cms.saving') : t('cms.promo.saveBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
