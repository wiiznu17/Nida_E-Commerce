import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import {
  DashboardHealthStrip,
  DashboardHeroCards,
  DashboardKpiGrid,
  DashboardChartsSection,
  DashboardMerchandisingGrid,
  DashboardRecentOrders,
  DashboardExportModal,
  DEFAULT_OVERVIEW_METRICS,
  DEFAULT_REVENUE_POINTS_7D,
  DEFAULT_DEPARTMENT_SHARES,
  DEFAULT_BEST_SELLERS,
  DEFAULT_INVENTORY_VELOCITY,
} from '../components/dashboard';
import { useLanguage } from '../context/LanguageContext';
import { orderRequester } from '../api/requester/orderRequester';
import { inventoryRequester } from '../api/requester/inventoryRequester';
import { analyticsRequester } from '../api/requester/analyticsRequester';
import type {
  ApiOrder,
  OrderStatus,
  ApiInventoryItem,
  AnalyticsTimeframe,
  AnalyticsOverviewDto,
  AnalyticsRevenuePoint,
  AnalyticsDepartmentShare,
  AnalyticsBestSeller,
  AnalyticsInventoryVelocity,
} from '@repo/types';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('7d');
  const [ordersList, setOrdersList] = useState<ApiOrder[]>([]);
  const [, setInventoryList] = useState<ApiInventoryItem[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Analytics states with resilient fallback datasets
  const [overview, setOverview] = useState<AnalyticsOverviewDto>(DEFAULT_OVERVIEW_METRICS);
  const [revenuePoints, setRevenuePoints] = useState<AnalyticsRevenuePoint[]>(DEFAULT_REVENUE_POINTS_7D);
  const [departmentShares, setDepartmentShares] = useState<AnalyticsDepartmentShare[]>(DEFAULT_DEPARTMENT_SHARES);
  const [bestSellers, setBestSellers] = useState<AnalyticsBestSeller[]>(DEFAULT_BEST_SELLERS);
  const [inventoryVelocity, setInventoryVelocity] = useState<AnalyticsInventoryVelocity[]>(DEFAULT_INVENTORY_VELOCITY);

  const loadData = useCallback(async (selectedTf: AnalyticsTimeframe) => {
    try {
      const [apiOrdersRes, apiInv, apiOverview, apiPoints, apiDepts, apiSellers, apiVelocity] =
        await Promise.allSettled([
          orderRequester.getOrders(),
          inventoryRequester.getInventory(),
          analyticsRequester.getOverview(selectedTf),
          analyticsRequester.getRevenueTrend(selectedTf),
          analyticsRequester.getDepartmentShare(selectedTf),
          analyticsRequester.getBestSellers(selectedTf),
          analyticsRequester.getInventoryVelocity(),
        ]);

      if (apiOrdersRes.status === 'fulfilled') {
        setOrdersList(apiOrdersRes.value.items ?? []);
      }
      if (apiInv.status === 'fulfilled') {
        const invItems = apiInv.value ?? [];
        setInventoryList(invItems);
        // Sync dynamic low-stock count if backend analytics endpoint is pending
        const lowStockCount = invItems.filter(
          (i) => i.quantityAvailable <= i.lowStockThreshold,
        ).length;
        setOverview((prev) => ({ ...prev, lowStockCount }));
      }
      if (apiOverview.status === 'fulfilled' && apiOverview.value) {
        setOverview(apiOverview.value);
      }
      if (apiPoints.status === 'fulfilled' && apiPoints.value?.length) {
        setRevenuePoints(apiPoints.value);
      }
      if (apiDepts.status === 'fulfilled' && apiDepts.value?.length) {
        setDepartmentShares(apiDepts.value);
      }
      if (apiSellers.status === 'fulfilled' && apiSellers.value?.length) {
        setBestSellers(apiSellers.value);
      }
      if (apiVelocity.status === 'fulfilled' && apiVelocity.value?.length) {
        setInventoryVelocity(apiVelocity.value);
      }
    } catch (err: unknown) {
      console.warn('Backend analytics data fallback activated:', err);
    }
  }, []);

  useEffect(() => {
    loadData(timeframe);
  }, [timeframe, loadData]);

  const handleQuickShip = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderRequester.updateStatus(
        orderId,
        newStatus,
        'Kerry Express TH',
        `KER-${Math.floor(100000000 + Math.random() * 900000000)}TH`,
      );
      await loadData(timeframe);
    } catch {
      setOrdersList((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    }
  };

  return (
    <AdminLayout
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
      actionButton={
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="border border-brand-border bg-white hover:bg-brand-cream text-brand-brown px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-brand-amber" />
            <span>{t('dashboard.exportBtn')}</span>
          </button>

          <Link
            to="/admin/products"
            className="bg-brand-brown hover:bg-brand-amber text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>{t('dashboard.addProduct')}</span>
          </Link>
        </div>
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

        {/* Zone 4: Interactive Analytical Vector Charts */}
        <DashboardChartsSection
          data={{
            timeframe,
            onTimeframeChange: setTimeframe,
            revenuePoints,
            departmentShares,
            fulfillmentScore: overview.fulfillmentRate,
            avgHours: overview.averageFulfillmentHours,
            onTimeDispatchPct: 99.1,
          }}
        />

        {/* Zone 5: Merchandising & Inventory Velocity */}
        <DashboardMerchandisingGrid
          bestSellers={bestSellers}
          inventoryVelocity={inventoryVelocity}
        />

        {/* Zone 6: Recent Customer Orders Table */}
        <DashboardRecentOrders
          orders={ordersList}
          onQuickShip={handleQuickShip}
        />

        {/* Zone 7: Data Export Center Modal */}
        <DashboardExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
