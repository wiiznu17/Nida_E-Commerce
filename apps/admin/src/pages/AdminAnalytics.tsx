import { useCallback, useEffect, useState } from 'react';
import type {
  AnalyticsCouponRoiSummary,
  AnalyticsDepartmentShare,
  AnalyticsOverviewDto,
  AnalyticsPageTimeframe,
  AnalyticsSlowMovingProduct,
  AnalyticsTopProduct,
} from '@repo/types';
import { analyticsRequester } from '../api/requester/analyticsRequester';
import {
  AnalyticsCouponRoi,
  AnalyticsDeptBreakdown,
  AnalyticsExportCenter,
  AnalyticsOverviewPanel,
  AnalyticsSlowMoving,
  AnalyticsTopBar,
  AnalyticsTopProducts,
  type AnalyticsTab,
  type DateRangeState,
} from '../components/analytics';
import { DEFAULT_OVERVIEW_METRICS } from '../components/dashboard';
import { AdminLayout } from '../components/layout';
import { useLanguage } from '../context/LanguageContext';

export default function AdminAnalytics() {
  const { t } = useLanguage();

  // Navigation State
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');

  // Filter State
  const [timeframe, setTimeframe] = useState<AnalyticsPageTimeframe>('month');
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeState>(() => {
    const today = new Date().toISOString().split('T')[0];
    const past30 = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .split('T')[0];
    return { startDate: past30, endDate: today };
  });

  const [slowMovingDays, setSlowMovingDays] = useState(30);

  // Data States
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState<AnalyticsOverviewDto>(
    DEFAULT_OVERVIEW_METRICS,
  );
  const [departmentShares, setDepartmentShares] = useState<
    AnalyticsDepartmentShare[]
  >([]);
  const [topProducts, setTopProducts] = useState<AnalyticsTopProduct[]>([]);
  const [slowMoving, setSlowMoving] = useState<AnalyticsSlowMovingProduct[]>([]);
  const [couponRoi, setCouponRoi] = useState<AnalyticsCouponRoiSummary>({
    totalUsage: 0,
    totalDiscount: 0,
    netRevenueGenerated: 0,
    avgRoiPercent: 0,
    items: [],
  });

  const fetchTabData = useCallback(async () => {
    if (activeTab === 'export') {
      return;
    }

    setIsLoading(true);
    const filterParams = isCustomRange
      ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
      : { timeframe };

    try {
      switch (activeTab) {
        case 'overview': {
          const res = await analyticsRequester.getOverview(filterParams);
          setOverview(res);
          break;
        }
        case 'department': {
          const res = await analyticsRequester.getDepartmentShare(filterParams);
          setDepartmentShares(res);
          break;
        }
        case 'products': {
          const res = await analyticsRequester.getTopProducts({
            ...filterParams,
            limit: 15,
          });
          setTopProducts(res);
          break;
        }
        case 'slow-moving': {
          const res = await analyticsRequester.getSlowMovingProducts({
            days: slowMovingDays,
            limit: 20,
          });
          setSlowMoving(res);
          break;
        }
        case 'coupon': {
          const res = await analyticsRequester.getCouponRoi(filterParams);
          setCouponRoi(res);
          break;
        }
      }
    } catch {
      // In-page graceful state preservation
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, timeframe, isCustomRange, dateRange, slowMovingDays]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  return (
    <AdminLayout
      title={t('analytics.title')}
      subtitle={t('analytics.subtitle')}
    >
      <AnalyticsTopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        isCustomRange={isCustomRange}
        onToggleCustomRange={setIsCustomRange}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {activeTab === 'overview' && (
        <AnalyticsOverviewPanel overview={overview} isLoading={isLoading} />
      )}

      {activeTab === 'department' && (
        <AnalyticsDeptBreakdown
          departments={departmentShares}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'products' && (
        <AnalyticsTopProducts products={topProducts} isLoading={isLoading} />
      )}

      {activeTab === 'slow-moving' && (
        <AnalyticsSlowMoving
          products={slowMoving}
          days={slowMovingDays}
          onDaysChange={setSlowMovingDays}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'coupon' && (
        <AnalyticsCouponRoi summary={couponRoi} isLoading={isLoading} />
      )}

      {activeTab === 'export' && <AnalyticsExportCenter />}
    </AdminLayout>
  );
}
