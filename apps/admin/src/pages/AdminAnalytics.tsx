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
  const [slowMovingPage, setSlowMovingPage] = useState(1);
  const [slowMovingPageSize, setSlowMovingPageSize] = useState(10);
  const [slowMovingTotal, setSlowMovingTotal] = useState(0);
  const [slowMovingTotalPages, setSlowMovingTotalPages] = useState(1);

  const [topProductsPage, setTopProductsPage] = useState(1);
  const [topProductsPageSize, setTopProductsPageSize] = useState(10);
  const [topProductsTotal, setTopProductsTotal] = useState(0);
  const [topProductsTotalPages, setTopProductsTotalPages] = useState(1);

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

  const handleSlowMovingDaysChange = (days: number) => {
    setSlowMovingDays(days);
    setSlowMovingPage(1);
  };

  const handleSlowMovingPageSizeChange = (newSize: number) => {
    setSlowMovingPageSize(newSize);
    setSlowMovingPage(1);
  };

  const handleTopProductsPageSizeChange = (newSize: number) => {
    setTopProductsPageSize(newSize);
    setTopProductsPage(1);
  };

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
            page: topProductsPage,
            limit: topProductsPageSize,
          });
          setTopProducts(res.items);
          setTopProductsTotal(res.total);
          setTopProductsTotalPages(res.totalPages);
          break;
        }
        case 'slow-moving': {
          const res = await analyticsRequester.getSlowMovingProducts({
            days: slowMovingDays,
            page: slowMovingPage,
            limit: slowMovingPageSize,
          });
          setSlowMoving(res.items);
          setSlowMovingTotal(res.total);
          setSlowMovingTotalPages(res.totalPages);
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
  }, [
    activeTab,
    timeframe,
    isCustomRange,
    dateRange,
    slowMovingDays,
    slowMovingPage,
    slowMovingPageSize,
    topProductsPage,
    topProductsPageSize,
  ]);

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
        onTimeframeChange={(tf) => {
          setTimeframe(tf);
          setTopProductsPage(1);
        }}
        isCustomRange={isCustomRange}
        onToggleCustomRange={(custom) => {
          setIsCustomRange(custom);
          setTopProductsPage(1);
        }}
        dateRange={dateRange}
        onDateRangeChange={(range) => {
          setDateRange(range);
          setTopProductsPage(1);
        }}
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
        <AnalyticsTopProducts
          products={topProducts}
          isLoading={isLoading}
          currentPage={topProductsPage}
          totalPages={topProductsTotalPages}
          pageSize={topProductsPageSize}
          totalItems={topProductsTotal}
          onPageChange={setTopProductsPage}
          onPageSizeChange={handleTopProductsPageSizeChange}
        />
      )}

      {activeTab === 'slow-moving' && (
        <AnalyticsSlowMoving
          products={slowMoving}
          days={slowMovingDays}
          onDaysChange={handleSlowMovingDaysChange}
          isLoading={isLoading}
          currentPage={slowMovingPage}
          totalPages={slowMovingTotalPages}
          pageSize={slowMovingPageSize}
          totalItems={slowMovingTotal}
          onPageChange={setSlowMovingPage}
          onPageSizeChange={handleSlowMovingPageSizeChange}
        />
      )}

      {activeTab === 'coupon' && (
        <AnalyticsCouponRoi summary={couponRoi} isLoading={isLoading} />
      )}

      {activeTab === 'export' && <AnalyticsExportCenter />}
    </AdminLayout>
  );
}
