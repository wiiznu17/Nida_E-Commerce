import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { ImageUploader } from '../media/ImageUploader';
import { BannerPlacement } from '@repo/types';
import type { ApiCmsBanner } from '@repo/types';
import { saveCmsBannerSchema, type SaveCmsBannerDto } from '@repo/validators';
import { useLanguage } from '../../context/LanguageContext';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: ApiCmsBanner | null;
  targetSlot: 1 | 2;
  onSave: (payload: SaveCmsBannerDto) => Promise<void>;
  isLoading?: boolean;
}

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  banner,
  targetSlot,
  onSave,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [slot, setSlot] = useState<1 | 2>(targetSlot);
  const [titleTh, setTitleTh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleTh, setSubtitleTh] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [tagTh, setTagTh] = useState('');
  const [tagEn, setTagEn] = useState('');
  const [imageDesktopUrl, setImageDesktopUrl] = useState('');
  const [ctaPrimaryTextTh, setCtaPrimaryTextTh] = useState('');
  const [ctaPrimaryTextEn, setCtaPrimaryTextEn] = useState('');
  const [ctaPrimaryLink, setCtaPrimaryLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setSlot(targetSlot);
    if (banner) {
      setTitleTh(banner.titleTh ?? '');
      setTitleEn(banner.titleEn ?? '');
      setSubtitleTh(banner.subtitleTh ?? '');
      setSubtitleEn(banner.subtitleEn ?? '');
      setTagTh(banner.tagTh ?? '');
      setTagEn(banner.tagEn ?? '');
      setImageDesktopUrl(banner.imageDesktopUrl ?? '');
      setCtaPrimaryTextTh(banner.ctaPrimaryTextTh ?? '');
      setCtaPrimaryTextEn(banner.ctaPrimaryTextEn ?? '');
      setCtaPrimaryLink(banner.ctaPrimaryLink ?? '');
      setIsActive(banner.isActive ?? true);
    } else {
      const isSlot1 = targetSlot === 1;
      setTitleTh(isSlot1 ? 'เสื้อคลุมสไตล์โมเดิร์น' : 'ชุดสูทและงานเทเลอร์ชั้นเลิศ');
      setTitleEn(isSlot1 ? 'MODERN TAILORED OUTERWEAR' : 'ELEVATED BESPOKE SUITING');
      setSubtitleTh(
        isSlot1
          ? 'งานตัดเย็บโครงร่างประณีตจากผ้าขนแกะบริสุทธิ์เพื่อความสง่างามเหนือกาลเวลา'
          : 'โครงสร้างคมชัดด้วยเส้นสายร่วมสมัยผสมผสานความคลาสสิกเหนือกาลเวลา',
      );
      setSubtitleEn(
        isSlot1
          ? 'Sculpted silhouettes handcrafted in virgin wool for timeless cold-weather grace.'
          : 'Refined structure engineered with fluid modern lines for formal distinction.',
      );
      setTagTh(isSlot1 ? 'คอลเลกชันสตรี' : 'คอลเลกชันบุรุษ');
      setTagEn(isSlot1 ? "WOMEN'S / NEW SEASON" : "MEN'S / EDITORIAL CAPSULE");
      setImageDesktopUrl(
        isSlot1
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85'
          : 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
      );
      setCtaPrimaryTextTh(isSlot1 ? 'เลือกดูคอลเลกชันสตรี' : 'เลือกดูคอลเลกชันบุรุษ');
      setCtaPrimaryTextEn(isSlot1 ? "Explore Women's" : "Explore Men's");
      setCtaPrimaryLink(isSlot1 ? '/collections/women' : '/collections/men');
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [banner, targetSlot, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: SaveCmsBannerDto = {
      placement: BannerPlacement.SEASONAL_SPOTLIGHT,
      titleTh: titleTh.trim() || null,
      titleEn: titleEn.trim() || null,
      subtitleTh: subtitleTh.trim() || null,
      subtitleEn: subtitleEn.trim() || null,
      tagTh: tagTh.trim() || null,
      tagEn: tagEn.trim() || null,
      targetUrl: ctaPrimaryLink.trim() || null,
      imageDesktopUrl: imageDesktopUrl.trim(),
      imageMobileUrl: null,
      ctaPrimaryTextTh: ctaPrimaryTextTh.trim() || null,
      ctaPrimaryTextEn: ctaPrimaryTextEn.trim() || null,
      ctaPrimaryLink: ctaPrimaryLink.trim() || null,
      ctaSecondaryTextTh: null,
      ctaSecondaryTextEn: null,
      ctaSecondaryLink: null,
      couponCode: null,
      sortOrder: slot - 1, // 0 for slot 1, 1 for slot 2
      isActive,
      startDate: null,
      endDate: null,
    };

    const validation = saveCmsBannerSchema.safeParse(payload);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? 'Validation error';
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
        setErrorMsg('Failed to save spotlight story');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xs shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF7F2]">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#2B1810]">
              {banner
                ? t('cms.spotlightModal.editTitle').replace('{slot}', String(slot))
                : t('cms.spotlightModal.createTitle').replace('{slot}', String(slot))}
            </h3>
            <p className="text-[11px] text-stone-500">
              {slot === 1
                ? t('cms.spotlightModal.slot1Hint')
                : t('cms.spotlightModal.slot2Hint')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-xs transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xs flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Slot Selector */}
          <div className="flex items-center space-x-3 p-3 bg-stone-50 border border-stone-200 rounded-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-700">
              {t('cms.spotlightModal.slotLabel')}
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSlot(1)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                  slot === 1
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t('cms.spotlightModal.slot1Btn')}
              </button>
              <button
                type="button"
                onClick={() => setSlot(2)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                  slot === 2
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t('cms.spotlightModal.slot2Btn')}
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
              <ImageIcon size={14} className="text-[#2B1810]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.spotlightModal.secMedia')}
              </h4>
            </div>

            <ImageUploader
              label={t('cms.spotlightModal.image')}
              value={imageDesktopUrl}
              onChange={setImageDesktopUrl}
              description={t('cms.spotlightModal.imageHint')}
            />
          </div>

          {/* Headlines & Tag */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.spotlightModal.secHeadlines')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.spotlightModal.tagEn')}
                </label>
                <input
                  type="text"
                  required
                  value={tagEn}
                  onChange={(e) => setTagEn(e.target.value)}
                  placeholder={t('cms.spotlightModal.tagEnPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.spotlightModal.tagTh')}
                </label>
                <input
                  type="text"
                  value={tagTh}
                  onChange={(e) => setTagTh(e.target.value)}
                  placeholder={t('cms.spotlightModal.tagThPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.spotlightModal.titleEn')}
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder={t('cms.spotlightModal.titleEnPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {t('cms.spotlightModal.titleTh')}
                </label>
                <input
                  type="text"
                  value={titleTh}
                  onChange={(e) => setTitleTh(e.target.value)}
                  placeholder={t('cms.spotlightModal.titleThPlaceholder')}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                {t('cms.spotlightModal.descEn')}
              </label>
              <textarea
                rows={2}
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                placeholder={t('cms.spotlightModal.descEnPlaceholder')}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                {t('cms.spotlightModal.descTh')}
              </label>
              <textarea
                rows={2}
                value={subtitleTh}
                onChange={(e) => setSubtitleTh(e.target.value)}
                placeholder={t('cms.spotlightModal.descThPlaceholder')}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
              <LinkIcon size={14} className="text-[#2B1810]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('cms.spotlightModal.secAction')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-stone-600 mb-1">
                  {t('cms.spotlightModal.btnTextTh')}
                </label>
                <input
                  type="text"
                  value={ctaPrimaryTextTh}
                  onChange={(e) => setCtaPrimaryTextTh(e.target.value)}
                  placeholder={t('cms.spotlightModal.btnTextThPlaceholder')}
                  className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-600 mb-1">
                  {t('cms.spotlightModal.btnTextEn')}
                </label>
                <input
                  type="text"
                  value={ctaPrimaryTextEn}
                  onChange={(e) => setCtaPrimaryTextEn(e.target.value)}
                  placeholder={t('cms.spotlightModal.btnTextEnPlaceholder')}
                  className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-600 mb-1">
                  {t('cms.spotlightModal.btnLink')}
                </label>
                <input
                  type="text"
                  value={ctaPrimaryLink}
                  onChange={(e) => setCtaPrimaryLink(e.target.value)}
                  placeholder="e.g. /collections/women"
                  className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-xs"
                />
              </div>
            </div>
          </div>

          {/* Status Switch */}
          <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xs pt-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#2B1810] block">
                {t('cms.spotlightModal.statusToggle')}
              </span>
              <span className="text-[10px] text-stone-500">
                {t('cms.spotlightModal.statusToggleHint')}
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

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-black uppercase tracking-wider rounded-xs hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {t('cms.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#2B1810] text-white text-xs font-black uppercase tracking-wider rounded-xs hover:bg-[#3D2317] transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {isLoading ? t('cms.saving') : t('cms.spotlightModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
