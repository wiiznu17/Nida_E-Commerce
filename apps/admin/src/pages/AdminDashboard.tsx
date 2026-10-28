import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import {
  DashboardHealthStrip,
  DashboardHeroCards,
  DashboardKpiGrid,
  DashboardChartsSection,
  DashboardExportModal,
  INITIAL_OVERVIEW_METRICS,
} from '../components/dashboard';
import { useLanguage } from '../context/LanguageContext';
import { analyticsRequester } from '../api/requester/analyticsRequester';
import type {
  AnalyticsTimeframe,
  AnalyticsOverviewDto,
  AnalyticsRevenuePoint,
  AnalyticsDepartmentShare,
} from '@repo/types';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('7d');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // 100% Real-time analytics state (Zero initial state, populated strictly from DB)
  const [overview, setOverview] = useState<AnalyticsOverviewDto>(
    INITIAL_OVERVIEW_METRICS,
  );
  const [revenuePoints, setRevenuePoints] = useState<AnalyticsRevenuePoint[]>([]);
  const [departmentShares, setDepartmentShares] = useState<
    AnalyticsDepartmentShare[]
  >([]);

  const loadData = useCallback(async (selectedTf: AnalyticsTimeframe) => {
    try {
      const [apiOverview, apiPoints, apiDepts] = await Promise.allSettled([
        analyticsRequester.getOverview(selectedTf),
        analyticsRequester.getRevenueTrend(selectedTf),
        analyticsRequester.getDepartmentShare(selectedTf),
      ]);

      if (apiOverview.status === 'fulfilled' && apiOverview.value) {
        setOverview(apiOverview.value);
      }
      if (apiPoints.status === 'fulfilled') {
        setRevenuePoints(apiPoints.value ?? []);
      }
      if (apiDepts.status === 'fulfilled') {
        setDepartmentShares(apiDepts.value ?? []);
      }
    } catch (err: unknown) {
      console.warn('Failed to load dashboard analytics:', err);
    }
  }, []);

  useEffect(() => {
    loadData(timeframe);
  }, [timeframe, loadData]);

  return (
    <AdminLayout
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
      actionButton={
        <button
          type="button"
          onClick={() => setIsExportOpen(true)}
          className="border border-brand-border bg-white hover:bg-brand-cream text-brand-brown px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 shadow-2xs cursor-pointer"
        >
          <Download size={14} className="text-brand-amber" />
          <span>{t('dashboard.exportBtn')}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Zone 1: Store Health Strip */}
        <DashboardHealthStrip
          data={{
            isStoreOnline: true,
            pendingShipmentCount: overview.pendingShipmentCount,
            lowStockCount: overview.lowStockCount,
            conversionRate: overview.conversionRate,
            activeShoppersCount: overview.activeShoppersCount,
          }}
        />

        {/* Zone 2: Hero Performance Cards */}
        <DashboardHeroCards metrics={overview} />

        {/* Zone 3: Core E-Commerce KPIs */}
        <DashboardKpiGrid metrics={overview} />

        {/* Zone 4: Full-Width Revenue Trend & Balanced Operations Health */}
        <DashboardChartsSection
          data={{
            timeframe,
            onTimeframeChange: setTimeframe,
            revenuePoints,
            departmentShares,
            fulfillmentScore: overview.operationsScore,
            avgHours: overview.averageFulfillmentHours,
            onTimeDispatchPct: overview.onTimeDispatchPct,
          }}
        />

        {/* Zone 5: Data Export Center Modal */}
        <DashboardExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
