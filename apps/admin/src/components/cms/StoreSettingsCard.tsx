import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { ApiStoreSettings } from '@repo/types';
import {
  updateStoreSettingsSchema,
  type UpdateStoreSettingsDto,
} from '@repo/validators';
import { useLanguage } from '../../context/LanguageContext';

interface StoreSettingsCardProps {
  settings: ApiStoreSettings | null;
  onSave: (payload: UpdateStoreSettingsDto) => Promise<void>;
  isLoading?: boolean;
}

export const StoreSettingsCard: React.FC<StoreSettingsCardProps> = ({
  settings,
  onSave,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementTextTh, setAnnouncementTextTh] = useState('');
  const [announcementTextEn, setAnnouncementTextEn] = useState('');
  const [announcementBadgeTh, setAnnouncementBadgeTh] = useState('');
  const [announcementBadgeEn, setAnnouncementBadgeEn] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);
  const [returnWindowDays, setReturnWindowDays] = useState(7);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setAnnouncementActive(settings.announcementActive);
      setAnnouncementTextTh(settings.announcementTextTh ?? '');
      setAnnouncementTextEn(settings.announcementTextEn ?? '');
      setAnnouncementBadgeTh(settings.announcementBadgeTh ?? '');
      setAnnouncementBadgeEn(settings.announcementBadgeEn ?? '');
      setAnnouncementLink(settings.announcementLink ?? '');
      setFreeShippingThreshold(settings.freeShippingThreshold);
      setReturnWindowDays(settings.returnWindowDays);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(false);

    const payload: UpdateStoreSettingsDto = {
      announcementActive,
      announcementTextTh: announcementTextTh.trim() || null,
      announcementTextEn: announcementTextEn.trim() || null,
      announcementBadgeTh: announcementBadgeTh.trim() || null,
      announcementBadgeEn: announcementBadgeEn.trim() || null,
      announcementLink: announcementLink.trim() || null,
      freeShippingThreshold: Number(freeShippingThreshold),
      returnWindowDays: Number(returnWindowDays),
    };

    const validation = updateStoreSettingsSchema.safeParse(payload);
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message ?? 'Validation failed');
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
        setErrorMsg('Failed to update settings');
      }
    }
  };

  return (
    <div className="bg-white rounded-xs border border-stone-200 shadow-xs p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            {t('cms.settings.title')}
          </h3>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {t('cms.settings.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-5 py-2 bg-[#2B1810] text-white font-black text-xs uppercase tracking-wider rounded-xs hover:bg-[#3D2317] transition-colors disabled:opacity-50 flex items-center cursor-pointer shadow-xs"
        >
          <Check size={14} className="mr-1.5" />
          {isLoading ? t('cms.saving') : t('cms.settings.saveBtn')}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xs flex items-center space-x-2 text-xs text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center space-x-2 text-xs text-emerald-800">
          <Check size={15} className="shrink-0" />
          <span>{t('cms.settings.saveSuccess')}</span>
        </div>
      )}

      {/* Announcement Bar Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            {t('cms.settings.secAnnouncement')}
          </span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={announcementActive}
              onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2B1810]"></div>
            <span className="ml-2 text-xs font-bold text-stone-700">
              {announcementActive
                ? t('cms.statusActive')
                : t('cms.statusInactive')}
            </span>
          </label>
        </div>

        {/* Badge */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
            {t('cms.settings.badgeLabel')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="block text-[10px] font-bold text-stone-500 mb-1">
                {t('cms.heroModal.th')}
              </span>
              <input
                type="text"
                maxLength={25}
                placeholder="เช่น ข้อเสนอพิเศษ"
                value={announcementBadgeTh}
                onChange={(e) => setAnnouncementBadgeTh(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-stone-500 mb-1">
                {t('cms.heroModal.en')}
              </span>
              <input
                type="text"
                maxLength={25}
                placeholder="e.g. LIMITED OFFER"
                value={announcementBadgeEn}
                onChange={(e) => setAnnouncementBadgeEn(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
            {t('cms.settings.messageLabel')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="block text-[10px] font-bold text-stone-500 mb-1">
                {t('cms.heroModal.th')}
              </span>
              <textarea
                rows={2}
                maxLength={120}
                placeholder="FALL SALE: รับส่วนลดสูงสุด 50% | ส่งฟรีเมื่อช้อปครบ ฿1,000"
                value={announcementTextTh}
                onChange={(e) => setAnnouncementTextTh(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810] resize-none"
              />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-stone-500 mb-1">
                {t('cms.heroModal.en')}
              </span>
              <textarea
                rows={2}
                maxLength={120}
                placeholder="FALL SALE: UP TO 50% OFF | FREE SHIPPING OVER ฿1,000"
                value={announcementTextEn}
                onChange={(e) => setAnnouncementTextEn(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Destination Link */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
            {t('cms.heroModal.link')}
          </label>
          <input
            type="text"
            placeholder="/collections/sale"
            value={announcementLink}
            onChange={(e) => setAnnouncementLink(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xs focus:outline-hidden focus:border-[#2B1810]"
          />
        </div>
      </div>

      {/* Store Policies Section */}
      <div className="space-y-4 pt-4 border-t border-stone-100">
        <span className="text-xs font-black uppercase tracking-wider text-[#2B1810] block border-b border-stone-100 pb-2">
          {t('cms.settings.secPolicies')}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
              {t('cms.settings.freeShippingLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">
                ฿
              </span>
              <input
                type="number"
                min={0}
                step={50}
                value={freeShippingThreshold}
                onChange={(e) =>
                  setFreeShippingThreshold(Number(e.target.value))
                }
                className="w-full h-9 pl-7 pr-3 text-xs border border-stone-300 rounded-xs font-mono font-bold focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
              {t('cms.settings.returnDaysLabel')}
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={90}
                value={returnWindowDays}
                onChange={(e) => setReturnWindowDays(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs border border-stone-300 rounded-xs font-mono font-bold focus:outline-hidden focus:border-[#2B1810]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
