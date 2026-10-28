import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Activity,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { InfoTooltip } from '../ui';
import type { DashboardHealthData } from './dashboardTypes';

interface DashboardHealthStripProps {
  data: DashboardHealthData;
}

export function DashboardHealthStrip({ data }: DashboardHealthStripProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
      {/* Store Status Pill */}
      <div className="bg-white border border-brand-border px-3.5 py-2.5 flex items-center justify-between shadow-2xs min-w-0">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown truncate">
            {t('dashboard.health.storeStatus')}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200 shrink-0">
          {t('dashboard.health.online')}
        </span>
      </div>

      {/* Pending Shipping */}
      <Link
        to="/admin/orders"
        className="bg-white border border-brand-border hover:border-brand-amber px-3.5 py-2.5 flex items-center justify-between shadow-2xs group transition-colors min-w-0"
      >
        <div className="flex items-center space-x-1.5 min-w-0 pr-1">
          <Package size={14} className="text-brand-amber shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown truncate">
            {t('dashboard.health.pendingShipments')}
          </span>
          <span onClick={(e) => e.stopPropagation()} className="shrink-0">
            <InfoTooltip
              title={t('dashboard.tooltips.pendingShipmentsTitle')}
              description={t('dashboard.tooltips.pendingShipmentsDesc')}
              formula={t('dashboard.tooltips.pendingShipmentsFormula')}
            />
          </span>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <span className="text-xs font-black text-brand-brown font-mono">
            {data.pendingShipmentCount}
          </span>
          <ArrowUpRight
            size={12}
            className="text-gray-400 group-hover:text-brand-amber transition-colors"
          />
        </div>
      </Link>

      {/* Low Stock Alerts */}
      <Link
        to="/admin/inventory"
        className="bg-white border border-brand-border hover:border-red-400 px-3.5 py-2.5 flex items-center justify-between shadow-2xs group transition-colors min-w-0"
      >
        <div className="flex items-center space-x-1.5 min-w-0 pr-1">
          <AlertTriangle
            size={14}
            className={
              data.lowStockCount > 0 ? 'text-rose-600 shrink-0' : 'text-gray-400 shrink-0'
            }
          />
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown truncate">
            {t('dashboard.health.lowStockSkus')}
          </span>
          <span onClick={(e) => e.stopPropagation()} className="shrink-0">
            <InfoTooltip
              title={t('dashboard.tooltips.lowStockTitle')}
              description={t('dashboard.tooltips.lowStockDesc')}
              formula={t('dashboard.tooltips.lowStockFormula')}
            />
          </span>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <span
            className={`text-xs font-black font-mono ${
              data.lowStockCount > 0 ? 'text-rose-600' : 'text-gray-700'
            }`}
          >
            {data.lowStockCount}
          </span>
          <ArrowUpRight
            size={12}
            className="text-gray-400 group-hover:text-rose-600 transition-colors"
          />
        </div>
      </Link>

      {/* Conversion Rate */}
      <div className="bg-white border border-brand-border px-3.5 py-2.5 flex items-center justify-between shadow-2xs min-w-0">
        <div className="flex items-center space-x-1.5 min-w-0 pr-1">
          <Activity size={14} className="text-brand-brown shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown truncate">
            {t('dashboard.health.conversion')}
          </span>
          <span className="shrink-0">
            <InfoTooltip
              title={t('dashboard.tooltips.conversionTitle')}
              description={t('dashboard.tooltips.conversionDesc')}
              formula={t('dashboard.tooltips.conversionFormula')}
            />
          </span>
        </div>
        <span className="text-xs font-black text-brand-brown font-mono shrink-0">
          {data.conversionRate.toFixed(2)}%
        </span>
      </div>

      {/* Live Pulse Visitors */}
      <div className="sm:col-span-2 lg:col-span-1 bg-white border border-brand-border px-3.5 py-2.5 flex items-center justify-between shadow-2xs min-w-0">
        <div className="flex items-center space-x-1.5 min-w-0 pr-1">
          <Users size={14} className="text-brand-brown shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown truncate">
            {t('dashboard.health.liveShoppers')}
          </span>
          <span className="shrink-0">
            <InfoTooltip
              title={t('dashboard.tooltips.liveShoppersTitle')}
              description={t('dashboard.tooltips.liveShoppersDesc')}
              formula={t('dashboard.tooltips.liveShoppersFormula')}
            />
          </span>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-black text-brand-brown font-mono">
            {data.activeShoppersCount} {t('dashboard.health.active')}
          </span>
        </div>
      </div>
    </div>
  );
}
