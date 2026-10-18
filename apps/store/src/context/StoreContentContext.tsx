'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  ApiCmsBanner,
  ApiStoreSettings,
  ApiHomeContentResponse,
} from '@repo/types';
import { contentRequester } from '@/api/requester/contentRequester';

interface StoreContentContextType {
  heroBanners: ApiCmsBanner[];
  seasonalSpotlights: ApiCmsBanner[];
  promoRibbon: ApiCmsBanner | null;
  storeSettings: ApiStoreSettings;
  isLoading: boolean;
  refreshContent: () => Promise<void>;
}

const defaultStoreSettings: ApiStoreSettings = {
  id: 'default-store-settings',
  announcementActive: true,
  announcementTextTh:
    'FALL SALE: รับส่วนลดสูงสุด 50% | ส่งฟรีเมื่อช้อปครบ ฿1,000',
  announcementTextEn:
    'FALL SALE: UP TO 50% OFF | FREE SHIPPING OVER ฿1,000',
  announcementBadgeTh: 'LIMITED OFFER',
  announcementBadgeEn: 'LIMITED OFFER',
  announcementLink: '/collections',
  freeShippingThreshold: 1000,
  returnWindowDays: 7,
  updatedAt: new Date().toISOString(),
};

const StoreContentContext = createContext<StoreContentContextType | undefined>(
  undefined,
);

export function StoreContentProvider({ children }: { children: ReactNode }) {
  const [heroBanners, setHeroBanners] = useState<ApiCmsBanner[]>([]);
  const [seasonalSpotlights, setSeasonalSpotlights] = useState<ApiCmsBanner[]>([]);
  const [promoRibbon, setPromoRibbon] = useState<ApiCmsBanner | null>(null);
  const [storeSettings, setStoreSettings] =
    useState<ApiStoreSettings>(defaultStoreSettings);
  const [isLoading, setIsLoading] = useState(true);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const data: ApiHomeContentResponse =
        await contentRequester.getHomeContent();
      if (data) {
        setHeroBanners(data.heroBanners ?? []);
        setSeasonalSpotlights(data.seasonalSpotlights ?? []);
        setPromoRibbon(data.promoRibbon ?? null);
        if (data.storeSettings) {
          setStoreSettings(data.storeSettings);
        }
      }
    } catch (err: unknown) {
      console.warn('StoreContentProvider: Failed to load dynamic content, using defaults', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  return (
    <StoreContentContext.Provider
      value={{
        heroBanners,
        seasonalSpotlights,
        promoRibbon,
        storeSettings,
        isLoading,
        refreshContent: loadContent,
      }}
    >
      {children}
    </StoreContentContext.Provider>
  );
}

export function useStoreContent(): StoreContentContextType {
  const context = useContext(StoreContentContext);
  if (!context) {
    throw new Error(
      'useStoreContent must be used within a StoreContentProvider',
    );
  }
  return context;
}
