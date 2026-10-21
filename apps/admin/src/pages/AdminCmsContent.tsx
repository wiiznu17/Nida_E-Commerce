import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  Sparkles,
  Ticket,
  Megaphone,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import {
  HeroCarouselSection,
  SeasonalSpotlightSection,
  PromoRibbonSection,
  StoreSettingsCard,
  CmsPreviewModal,
} from '../components/cms';
import { contentRequester } from '../api';
import type { ApiCmsBanner, ApiStoreSettings } from '@repo/types';
import type {
  SaveCmsBannerDto,
  UpdateStoreSettingsDto,
} from '@repo/validators';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { ApiErrorModal } from '../components/ui';

export const AdminCmsContent: React.FC = () => {
  const { t } = useLanguage();
  const [heroBanners, setHeroBanners] = useState<ApiCmsBanner[]>([]);
  const [spotlights, setSpotlights] = useState<ApiCmsBanner[]>([]);
  const [allBanners, setAllBanners] = useState<ApiCmsBanner[]>([]);
  const [promoRibbon, setPromoRibbon] = useState<ApiCmsBanner | null>(null);
  const [storeSettings, setStoreSettings] = useState<ApiStoreSettings | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  // Dedicated Tab State
  const [activeTab, setActiveTab] = useState<
    'hero' | 'spotlight' | 'promo' | 'settings'
  >('hero');

  // Preview Modal State (Hidden by default, opened on demand)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const [homeData, bannersList] = await Promise.all([
        contentRequester.getHomeContent(),
        contentRequester.getAllBanners(),
      ]);

      setHeroBanners(homeData.heroBanners);
      setSpotlights(homeData.seasonalSpotlights ?? []);
      setAllBanners(bannersList);
      setPromoRibbon(homeData.promoRibbon ?? null);
      setStoreSettings(homeData.storeSettings);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Failed to load storefront content');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSaveBanner = async (
    bannerId: string | undefined,
    payload: SaveCmsBannerDto,
  ) => {
    setIsSaving(true);
    try {
      if (bannerId) {
        await contentRequester.updateBanner(bannerId, payload);
      } else {
        await contentRequester.createBanner(payload);
      }
      await fetchContent();
      toast.success(t('cms.bannerSaved') ?? 'Banner saved successfully');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    setIsSaving(true);
    try {
      await contentRequester.deleteBanner(id);
      await fetchContent();
      toast.success(t('cms.bannerDeleted') ?? 'Banner deleted successfully');
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to delete banner',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStoreSettings = async (payload: UpdateStoreSettingsDto) => {
    setIsSaving(true);
    try {
      const updated = await contentRequester.updateStoreSettings(payload);
      setStoreSettings(updated);
      toast.success(
        t('cms.settingsSaved') ?? 'Store settings updated successfully',
      );
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to save store settings',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-[#2B1810]">
              {t('cms.pageTitle')}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {t('cms.pageSubtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Preview Button */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#2B1810] font-black text-xs uppercase tracking-wider rounded-xs border border-stone-300 shadow-xs transition-colors flex items-center"
            >
              <Eye size={14} className="mr-1.5 text-stone-700" />
              {t('cms.previewStorefront')}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchContent}
              disabled={isLoading}
              className="p-2 border border-stone-300 text-stone-700 rounded-xs hover:bg-stone-50 transition-colors disabled:opacity-50"
              title="Refresh Content"
            >
              <RefreshCw
                size={14}
                className={isLoading ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>

        {/* Modular Navigation Tabs (Separated Per Feature) */}
        <div className="flex flex-wrap border-b border-stone-200 bg-white rounded-t-xs">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'hero'
                ? 'border-[#2B1810] text-[#2B1810]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Sliders size={14} />
            <span>{t('cms.tabHero')}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded-full font-bold">
              {heroBanners.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spotlight')}
            className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'spotlight'
                ? 'border-[#2B1810] text-[#2B1810]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Sparkles size={14} />
            <span>{t('cms.tabSpotlight')}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded-full font-bold">
              {t('cms.slotsCount')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promo')}
            className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'promo'
                ? 'border-[#2B1810] text-[#2B1810]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Ticket size={14} />
            <span>{t('cms.tabPromoRibbon')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'settings'
                ? 'border-[#2B1810] text-[#2B1810]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Megaphone size={14} />
            <span>{t('cms.tabSettings')}</span>
          </button>
        </div>

        {/* Tab 1: Hero Carousel Billboard */}
        {activeTab === 'hero' && (
          <HeroCarouselSection
            banners={allBanners}
            onSave={(payload) => {
              const existing = allBanners.find(
                (b) =>
                  b.placement === 'HERO_HOME' &&
                  b.sortOrder === payload.sortOrder,
              );
              return handleSaveBanner(existing?.id, payload);
            }}
            onDelete={handleDeleteBanner}
            isLoading={isSaving}
          />
        )}

        {/* Tab 2: Seasonal Spotlight Bento (2 Stories) */}
        {activeTab === 'spotlight' && (
          <SeasonalSpotlightSection
            banners={allBanners}
            onSave={(payload) => {
              const existing = allBanners.find(
                (b) =>
                  b.placement === 'SEASONAL_SPOTLIGHT' &&
                  b.sortOrder === payload.sortOrder,
              );
              return handleSaveBanner(existing?.id, payload);
            }}
            onDelete={handleDeleteBanner}
            isLoading={isSaving}
          />
        )}

        {/* Tab 3: Promotional Ribbon & Voucher Code */}
        {activeTab === 'promo' && (
          <PromoRibbonSection
            banner={promoRibbon}
            onSave={(payload) => handleSaveBanner(promoRibbon?.id, payload)}
            isLoading={isSaving}
          />
        )}

        {/* Tab 4: Store Policies & Announcement Bar */}
        {activeTab === 'settings' && (
          <StoreSettingsCard
            settings={storeSettings}
            onSave={handleSaveStoreSettings}
            isLoading={isSaving}
          />
        )}
      </div>

      {/* On-Demand Storefront Live Preview Modal */}
      <CmsPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        heroBanners={heroBanners}
        spotlights={spotlights}
        promoRibbon={promoRibbon}
        storeSettings={storeSettings}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* API Error Modal */}
      <ApiErrorModal
        isOpen={Boolean(apiError)}
        onClose={() => setApiError(null)}
        errorMessage={apiError ?? ''}
        onRetry={fetchContent}
      />
    </AdminLayout>
  );
};

export default AdminCmsContent;
