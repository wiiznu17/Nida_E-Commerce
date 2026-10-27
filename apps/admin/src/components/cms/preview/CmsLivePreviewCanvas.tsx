import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Globe,
  Layers,
  Megaphone,
  Sliders,
  ShieldCheck,
  Sparkles,
  Ticket,
  MousePointer,
} from 'lucide-react';
import { HeroBillboardPreview } from './HeroBillboardPreview';
import { TopAnnouncementPreview } from './TopAnnouncementPreview';
import { PromoRibbonPreview } from './PromoRibbonPreview';
import { ValuePropsPreview } from './ValuePropsPreview';
import { SplitEditorialPreview } from './SplitEditorialPreview';
import { PreviewSectionHighlight } from './PreviewSectionHighlight';
import type { ApiCmsBanner, ApiStoreSettings } from '@repo/types';
import { useLanguage } from '../../../context/LanguageContext';

interface CmsLivePreviewCanvasProps {
  heroBanners: Partial<ApiCmsBanner>[];
  activeHeroIndex?: number;
  onSelectHeroIndex?: (index: number) => void;
  spotlights?: Partial<ApiCmsBanner>[];
  promoRibbon: Partial<ApiCmsBanner> | null;
  storeSettings: Partial<ApiStoreSettings>;
  onNavigateTab?: (tabKey: 'hero' | 'spotlight' | 'promo' | 'settings') => void;
}

export const CmsLivePreviewCanvas: React.FC<CmsLivePreviewCanvasProps> = ({
  heroBanners,
  activeHeroIndex,
  onSelectHeroIndex,
  spotlights = [],
  promoRibbon,
  storeSettings,
  onNavigateTab,
}) => {
  const { t } = useLanguage();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [lang, setLang] = useState<'th' | 'en'>('th');
  const [internalHeroIndex, setInternalHeroIndex] = useState(0);

  const effectiveHeroIndex = activeHeroIndex ?? internalHeroIndex;

  const handleSelectHero = (index: number) => {
    setInternalHeroIndex(index);
    onSelectHeroIndex?.(index);
  };

  const currentHero = heroBanners[effectiveHeroIndex] ?? heroBanners[0] ?? null;

  return (
    <div className="bg-white rounded-xs border border-stone-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Canvas Top Bar */}
      <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            Live Interactive Preview
          </span>
          <span className="text-[10px] text-stone-500 font-mono">
            {device === 'desktop' ? '1440px Canvas' : '375px Mobile Frame'}
          </span>
          <span className="hidden sm:inline-flex items-center text-[10px] text-stone-500 font-medium px-2 py-0.5 bg-stone-200/60 rounded-xs border border-stone-300">
            <MousePointer size={11} className="mr-1 text-stone-600" />
            {t('cms.preview.hoverHint')}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Slide Switcher */}
          {heroBanners.length > 1 && (
            <div className="flex items-center space-x-1 bg-white border border-stone-200 rounded-xs p-0.5 text-xs">
              <Layers size={13} className="text-stone-500 ml-1.5" />
              <span className="text-[10px] text-stone-500 font-bold px-1">
                Slide:
              </span>
              {heroBanners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectHero(i)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-xs transition-colors cursor-pointer ${
                    effectiveHeroIndex === i
                      ? 'bg-[#2B1810] text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Language Switcher */}
          <div className="flex items-center bg-white border border-stone-200 rounded-xs p-0.5 text-xs">
            <Globe size={13} className="text-stone-500 ml-1.5 mr-1" />
            <button
              type="button"
              onClick={() => setLang('th')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-xs transition-colors ${
                lang === 'th'
                  ? 'bg-[#E6C687] text-[#2B1810]'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              TH
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-xs transition-colors ${
                lang === 'en'
                  ? 'bg-[#E6C687] text-[#2B1810]'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              EN
            </button>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center bg-white border border-stone-200 rounded-xs p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-xs transition-colors ${
                device === 'desktop'
                  ? 'bg-[#2B1810] text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
              title="Desktop View"
            >
              <Monitor size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-xs transition-colors ${
                device === 'mobile'
                  ? 'bg-[#2B1810] text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
              title="Mobile View"
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Body */}
      <div className="flex-1 bg-stone-100 p-4 lg:p-6 overflow-y-auto flex justify-center items-start min-h-[540px]">
        {device === 'desktop' ? (
          <div className="w-full bg-white shadow-md border border-stone-300 rounded-xs overflow-hidden transition-all duration-300 divide-y divide-stone-100">
            {/* 1. Top Announcement Bar */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.topAnnouncement')}
              titleEn={t('cms.preview.topAnnouncementEn')}
              tabKey="settings"
              tabLabel={t('cms.tabSettings')}
              icon={Megaphone}
              onNavigateTab={onNavigateTab}
              isMobileView={false}
            >
              <TopAnnouncementPreview
                settings={storeSettings}
                lang={lang}
                isMobileView={false}
              />
            </PreviewSectionHighlight>

            {/* 2. Hero Billboard Carousel */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.heroBillboard')}
              titleEn={t('cms.preview.heroBillboardEn')}
              tabKey="hero"
              tabLabel={t('cms.tabHero')}
              icon={Sliders}
              onNavigateTab={onNavigateTab}
              isMobileView={false}
            >
              <HeroBillboardPreview
                banner={currentHero}
                banners={heroBanners}
                currentIndex={effectiveHeroIndex}
                onSelectIndex={handleSelectHero}
                lang={lang}
                isMobileView={false}
              />
            </PreviewSectionHighlight>

            {/* 3. Brand Value Propositions */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.valueProps')}
              titleEn={t('cms.preview.valuePropsEn')}
              tabKey="settings"
              tabLabel={t('cms.tabSettings')}
              icon={ShieldCheck}
              onNavigateTab={onNavigateTab}
              isMobileView={false}
            >
              <ValuePropsPreview
                settings={storeSettings}
                lang={lang}
                isMobileView={false}
              />
            </PreviewSectionHighlight>

            {/* 4. Seasonal Spotlight Bento */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.seasonalSpotlight')}
              titleEn={t('cms.preview.seasonalSpotlightEn')}
              tabKey="spotlight"
              tabLabel={t('cms.tabSpotlight')}
              icon={Sparkles}
              onNavigateTab={onNavigateTab}
              isMobileView={false}
            >
              <SplitEditorialPreview
                spotlights={spotlights}
                lang={lang}
                isMobileView={false}
              />
            </PreviewSectionHighlight>

            {/* 5. Promotional Ribbon */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.promoRibbon')}
              titleEn={t('cms.preview.promoRibbonEn')}
              tabKey="promo"
              tabLabel={t('cms.tabPromoRibbon')}
              icon={Ticket}
              onNavigateTab={onNavigateTab}
              isMobileView={false}
            >
              <PromoRibbonPreview
                banner={promoRibbon}
                lang={lang}
                isMobileView={false}
              />
            </PreviewSectionHighlight>
          </div>
        ) : (
          <div className="w-[375px] max-w-full bg-white shadow-xl border-4 border-stone-800 rounded-2xl overflow-hidden transition-all duration-300">
            {/* Phone Speaker Notch */}
            <div className="bg-stone-800 h-4 flex items-center justify-center">
              <div className="w-12 h-1 bg-stone-700 rounded-full" />
            </div>

            {/* 1. Top Announcement Bar */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.topAnnouncement')}
              titleEn={t('cms.preview.topAnnouncementEn')}
              tabKey="settings"
              tabLabel={t('cms.tabSettings')}
              icon={Megaphone}
              onNavigateTab={onNavigateTab}
              isMobileView={true}
            >
              <TopAnnouncementPreview
                settings={storeSettings}
                lang={lang}
                isMobileView={true}
              />
            </PreviewSectionHighlight>

            {/* 2. Hero Billboard Carousel */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.heroBillboard')}
              titleEn={t('cms.preview.heroBillboardEn')}
              tabKey="hero"
              tabLabel={t('cms.tabHero')}
              icon={Sliders}
              onNavigateTab={onNavigateTab}
              isMobileView={true}
            >
              <HeroBillboardPreview
                banner={currentHero}
                banners={heroBanners}
                currentIndex={effectiveHeroIndex}
                onSelectIndex={handleSelectHero}
                lang={lang}
                isMobileView={true}
              />
            </PreviewSectionHighlight>

            {/* 3. Brand Value Propositions */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.valueProps')}
              titleEn={t('cms.preview.valuePropsEn')}
              tabKey="settings"
              tabLabel={t('cms.tabSettings')}
              icon={ShieldCheck}
              onNavigateTab={onNavigateTab}
              isMobileView={true}
            >
              <ValuePropsPreview
                settings={storeSettings}
                lang={lang}
                isMobileView={true}
              />
            </PreviewSectionHighlight>

            {/* 4. Seasonal Spotlight Bento */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.seasonalSpotlight')}
              titleEn={t('cms.preview.seasonalSpotlightEn')}
              tabKey="spotlight"
              tabLabel={t('cms.tabSpotlight')}
              icon={Sparkles}
              onNavigateTab={onNavigateTab}
              isMobileView={true}
            >
              <SplitEditorialPreview
                spotlights={spotlights}
                lang={lang}
                isMobileView={true}
              />
            </PreviewSectionHighlight>

            {/* 5. Promotional Ribbon */}
            <PreviewSectionHighlight
              titleTh={t('cms.preview.promoRibbon')}
              titleEn={t('cms.preview.promoRibbonEn')}
              tabKey="promo"
              tabLabel={t('cms.tabPromoRibbon')}
              icon={Ticket}
              onNavigateTab={onNavigateTab}
              isMobileView={true}
            >
              <PromoRibbonPreview
                banner={promoRibbon}
                lang={lang}
                isMobileView={true}
              />
            </PreviewSectionHighlight>

            {/* Phone Bottom Home Bar */}
            <div className="bg-stone-800 h-3 flex items-center justify-center">
              <div className="w-24 h-1 bg-stone-600 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
