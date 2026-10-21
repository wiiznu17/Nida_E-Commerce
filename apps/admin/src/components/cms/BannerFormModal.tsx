import React, { useState, useEffect } from 'react';
import {
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react';
import { ImageUploader } from '../media/ImageUploader';
import { BannerPlacement } from '@repo/types';
import type { ApiCmsBanner } from '@repo/types';
import { saveCmsBannerSchema, type SaveCmsBannerDto } from '@repo/validators';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: ApiCmsBanner | null;
  onSave: (payload: SaveCmsBannerDto) => Promise<void>;
  isLoading?: boolean;
}

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  isOpen,
  onClose,
  banner,
  onSave,
  isLoading = false,
}) => {
  const [placement, setPlacement] = useState<BannerPlacement>(
    BannerPlacement.HERO_HOME,
  );
  const [titleTh, setTitleTh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleTh, setSubtitleTh] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [tagTh, setTagTh] = useState('');
  const [tagEn, setTagEn] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageDesktopUrl, setImageDesktopUrl] = useState('');
  const [imageMobileUrl, setImageMobileUrl] = useState('');
  const [ctaPrimaryTextTh, setCtaPrimaryTextTh] = useState('');
  const [ctaPrimaryTextEn, setCtaPrimaryTextEn] = useState('');
  const [ctaPrimaryLink, setCtaPrimaryLink] = useState('');
  const [ctaSecondaryTextTh, setCtaSecondaryTextTh] = useState('');
  const [ctaSecondaryTextEn, setCtaSecondaryTextEn] = useState('');
  const [ctaSecondaryLink, setCtaSecondaryLink] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setPlacement(banner.placement);
      setTitleTh(banner.titleTh ?? '');
      setTitleEn(banner.titleEn ?? banner.title ?? '');
      setSubtitleTh(banner.subtitleTh ?? '');
      setSubtitleEn(banner.subtitleEn ?? banner.subtitle ?? '');
      setTagTh(banner.tagTh ?? '');
      setTagEn(banner.tagEn ?? '');
      setTargetUrl(banner.targetUrl ?? '');
      setImageDesktopUrl(banner.imageDesktopUrl ?? '');
      setImageMobileUrl(banner.imageMobileUrl ?? '');
      setCtaPrimaryTextTh(banner.ctaPrimaryTextTh ?? '');
      setCtaPrimaryTextEn(banner.ctaPrimaryTextEn ?? '');
      setCtaPrimaryLink(banner.ctaPrimaryLink ?? '');
      setCtaSecondaryTextTh(banner.ctaSecondaryTextTh ?? '');
      setCtaSecondaryTextEn(banner.ctaSecondaryTextEn ?? '');
      setCtaSecondaryLink(banner.ctaSecondaryLink ?? '');
      setCouponCode(banner.couponCode ?? '');
      setSortOrder(banner.sortOrder ?? 0);
      setIsActive(banner.isActive ?? true);
      setStartDate(banner.startDate ? banner.startDate.substring(0, 16) : '');
      setEndDate(banner.endDate ? banner.endDate.substring(0, 16) : '');
    } else {
      setPlacement(BannerPlacement.HERO_HOME);
      setTitleTh('');
      setTitleEn('');
      setSubtitleTh('');
      setSubtitleEn('');
      setTagTh('');
      setTagEn('');
      setTargetUrl('');
      setImageDesktopUrl('');
      setImageMobileUrl('');
      setCtaPrimaryTextTh('');
      setCtaPrimaryTextEn('');
      setCtaPrimaryLink('');
      setCtaSecondaryTextTh('');
      setCtaSecondaryTextEn('');
      setCtaSecondaryLink('');
      setCouponCode('');
      setSortOrder(0);
      setIsActive(true);
      setStartDate('');
      setEndDate('');
    }
    setErrorMsg(null);
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: SaveCmsBannerDto = {
      placement,
      titleTh: titleTh.trim() || null,
      titleEn: titleEn.trim() || null,
      subtitleTh: subtitleTh.trim() || null,
      subtitleEn: subtitleEn.trim() || null,
      tagTh: tagTh.trim() || null,
      tagEn: tagEn.trim() || null,
      targetUrl: targetUrl.trim() || null,
      imageDesktopUrl: imageDesktopUrl.trim(),
      imageMobileUrl: imageMobileUrl.trim() || null,
      ctaPrimaryTextTh: ctaPrimaryTextTh.trim() || null,
      ctaPrimaryTextEn: ctaPrimaryTextEn.trim() || null,
      ctaPrimaryLink: ctaPrimaryLink.trim() || null,
      ctaSecondaryTextTh: ctaSecondaryTextTh.trim() || null,
      ctaSecondaryTextEn: ctaSecondaryTextEn.trim() || null,
      ctaSecondaryLink: ctaSecondaryLink.trim() || null,
      couponCode: couponCode.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };

    const validation = saveCmsBannerSchema.safeParse(payload);
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message ?? 'Validation failed');
      return;
    }

    try {
      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to save banner');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xs max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-[#2B1810]">
              {banner ? 'Edit Banner Slide' : 'Add New Banner Slide'}
            </h3>
            <p className="text-xs text-stone-500">
              Configure banner visuals, responsive assets, and bilingual copy
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xs flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Placement & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                Placement Section
              </label>
              <select
                value={placement}
                onChange={(e) =>
                  setPlacement(e.target.value as BannerPlacement)
                }
                className="w-full h-9 px-3 text-xs border border-stone-300 rounded-xs bg-white text-stone-900 focus:outline-hidden focus:border-[#2B1810]"
              >
                <option value={BannerPlacement.HERO_HOME}>
                  Hero Billboard (Top)
                </option>
                <option value={BannerPlacement.SEASONAL_SPOTLIGHT}>
                  Seasonal Spotlight (Bento Cards)
                </option>
                <option value={BannerPlacement.PROMO_RIBBON}>
                  Promo Ribbon (Middle)
                </option>
                <option value={BannerPlacement.COLLECTION_TOP}>
                  Collection Header
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                Display Sort Order
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs border border-stone-300 rounded-xs bg-white text-stone-900 focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                Active Status
              </label>
              <div className="flex items-center h-9 space-x-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#2B1810] border-stone-300 rounded-xs focus:ring-[#2B1810]"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-xs text-stone-700 font-bold"
                >
                  {isActive ? 'Published & Active' : 'Draft / Disabled'}
                </label>
              </div>
            </div>
          </div>

          {/* Desktop & Mobile Image Row */}
          <div className="space-y-4 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810] flex items-center">
              <ImageIcon size={14} className="mr-1.5 text-stone-500" />
              Banner Media Assets
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Desktop Image (21:9 or 16:9) *
                </label>
                <ImageUploader
                  value={imageDesktopUrl}
                  onChange={setImageDesktopUrl}
                  aspectRatio="landscape"
                  compact
                  folder="banners"
                  description="Recommended: 1920x1080px (16:9 Landscape)"
                />
                <input
                  type="text"
                  placeholder="Or paste Direct Image URL..."
                  value={imageDesktopUrl}
                  onChange={(e) => setImageDesktopUrl(e.target.value)}
                  className="w-full mt-2 h-8 px-2.5 text-[11px] border border-stone-200 rounded-xs text-stone-700 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Mobile Image (Optional 4:5 or 1:1)
                </label>
                <ImageUploader
                  value={imageMobileUrl}
                  onChange={setImageMobileUrl}
                  aspectRatio="portrait"
                  compact
                  folder="banners"
                  description="Recommended: 1080x1350px (Mobile Frame)"
                />
                <input
                  type="text"
                  placeholder="Or paste Mobile Image URL..."
                  value={imageMobileUrl}
                  onChange={(e) => setImageMobileUrl(e.target.value)}
                  className="w-full mt-2 h-8 px-2.5 text-[11px] border border-stone-200 rounded-xs text-stone-700 bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Campaign Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  Campaign Tag (TH)
                </label>
                <span className="text-[10px] text-stone-400">
                  {tagTh.length}/30
                </span>
              </div>
              <input
                type="text"
                maxLength={30}
                placeholder="เช่น คอลเลกชันใหม่ / สิทธิพิเศษ"
                value={tagTh}
                onChange={(e) => setTagTh(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-stone-300 rounded-xs bg-white text-stone-900 focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  Campaign Tag (EN)
                </label>
                <span className="text-[10px] text-stone-400">
                  {tagEn.length}/30
                </span>
              </div>
              <input
                type="text"
                maxLength={30}
                placeholder="e.g. NEW ARRIVALS / EXCLUSIVE"
                value={tagEn}
                onChange={(e) => setTagEn(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-stone-300 rounded-xs bg-white text-stone-900 focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
          </div>

          {/* Main Headline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  Headline (TH)
                </label>
                <span className="text-[10px] text-stone-400">
                  {titleTh.length}/70
                </span>
              </div>
              <input
                type="text"
                maxLength={70}
                placeholder="ความสง่างามร่วมสมัย"
                value={titleTh}
                onChange={(e) => setTitleTh(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-stone-300 rounded-xs bg-white text-stone-900 focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  Headline (EN)
                </label>
                <span className="text-[10px] text-stone-400">
                  {titleEn.length}/70
                </span>
              </div>
              <input
                type="text"
                maxLength={70}
                placeholder="MODERN HERITAGE APPAREL"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-stone-300 rounded-xs bg-white text-stone-900 focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
          </div>

          {/* Subtitle / Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  Subtitle / Description (TH)
                </label>
                <span className="text-[10px] text-stone-400">
                  {subtitleTh.length}/160
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={160}
                placeholder="คำอธิบายสั้นกระชับสำหรับแคมเปญ"
                value={subtitleTh}
                onChange={(e) => setSubtitleTh(e.target.value)}
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xs bg-white text-stone-900 focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  Subtitle / Description (EN)
                </label>
                <span className="text-[10px] text-stone-400">
                  {subtitleEn.length}/160
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={160}
                placeholder="Brief campaign description"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xs bg-white text-stone-900 focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810] flex items-center">
              <LinkIcon size={14} className="mr-1.5 text-stone-500" />
              Call-to-Action Buttons & Links
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Primary CTA Label (TH)
                </label>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="เช่น ช้อปคอลเลกชันใหม่"
                  value={ctaPrimaryTextTh}
                  onChange={(e) => setCtaPrimaryTextTh(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-stone-300 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Primary CTA Label (EN)
                </label>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="e.g. SHOP NEW ARRIVALS"
                  value={ctaPrimaryTextEn}
                  onChange={(e) => setCtaPrimaryTextEn(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-stone-300 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Primary CTA Link URL
                </label>
                <input
                  type="text"
                  placeholder="/collections/women"
                  value={ctaPrimaryLink}
                  onChange={(e) => setCtaPrimaryLink(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-stone-300 rounded-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Secondary CTA Label (TH)
                </label>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="เช่น สำรวจแบรนด์"
                  value={ctaSecondaryTextTh}
                  onChange={(e) => setCtaSecondaryTextTh(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-stone-300 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Secondary CTA Label (EN)
                </label>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="e.g. ABOUT THE MAISON"
                  value={ctaSecondaryTextEn}
                  onChange={(e) => setCtaSecondaryTextEn(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-stone-300 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Secondary CTA Link URL
                </label>
                <input
                  type="text"
                  placeholder="/about"
                  value={ctaSecondaryLink}
                  onChange={(e) => setCtaSecondaryLink(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-stone-300 rounded-xs"
                />
              </div>
            </div>
          </div>

          {/* Promo Code & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1 flex items-center">
                <Tag size={12} className="mr-1 text-stone-500" />
                Attached Coupon Code
              </label>
              <input
                type="text"
                placeholder="e.g. NIDA20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full h-9 px-3 text-xs font-mono font-bold uppercase border border-stone-300 rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1 flex items-center">
                <Calendar size={12} className="mr-1 text-stone-500" />
                Schedule Start (Optional)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-9 px-2.5 text-xs border border-stone-300 rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1 flex items-center">
                <Calendar size={12} className="mr-1 text-stone-500" />
                Schedule End (Optional)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-9 px-2.5 text-xs border border-stone-300 rounded-xs"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 text-stone-700 font-bold text-xs rounded-xs hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-[#2B1810] text-white font-black text-xs uppercase tracking-wider rounded-xs hover:bg-[#3D2317] transition-colors disabled:opacity-50 flex items-center"
          >
            <Check size={14} className="mr-1.5" />
            {isLoading ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </div>
    </div>
  );
};
