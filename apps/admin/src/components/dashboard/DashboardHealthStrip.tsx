import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Activity,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { DashboardHealthData } from './dashboardTypes';

interface DashboardHealthStripProps {
  data: DashboardHealthData;
}

export function DashboardHealthStrip({ data }: DashboardHealthStripProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {/* Store Status Pill */}
      <div className="bg-white border border-brand-border px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown">
            {t('dashboard.health.storeStatus')}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
          {t('dashboard.health.online')}
        </span>
      </div>

      {/* Pending Shipping */}
      <Link
        to="/admin/orders"
        className="bg-white border border-brand-border hover:border-brand-amber px-3.5 py-2.5 flex items-center justify-between shadow-2xs group transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Package size={14} className="text-brand-amber" />
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown">
            {t('dashboard.health.pendingShipments')}
          </span>
        </div>
        <div className="flex items-center space-x-1">
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
        className="bg-white border border-brand-border hover:border-red-400 px-3.5 py-2.5 flex items-center justify-between shadow-2xs group transition-colors"
      >
        <div className="flex items-center space-x-2">
          <AlertTriangle
            size={14}
            className={
              data.lowStockCount > 0 ? 'text-rose-600' : 'text-gray-400'
            }
          />
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown">
            {t('dashboard.health.lowStockSkus')}
          </span>
        </div>
        <div className="flex items-center space-x-1">
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
      <div className="bg-white border border-brand-border px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2">
          <Activity size={14} className="text-brand-brown" />
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown">
            {t('dashboard.health.conversion')}
          </span>
        </div>
        <span className="text-xs font-black text-brand-brown font-mono">
          {data.conversionRate.toFixed(2)}%
        </span>
      </div>

      {/* Live Pulse Visitors */}
      <div className="col-span-2 md:col-span-1 bg-white border border-brand-border px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2">
          <Users size={14} className="text-brand-brown" />
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-brown">
            {t('dashboard.health.liveShoppers')}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-black text-brand-brown font-mono">
            {data.activeShoppersCount} {t('dashboard.health.active')}
          </span>
        </div>
      </div>
    </div>
  );
}
