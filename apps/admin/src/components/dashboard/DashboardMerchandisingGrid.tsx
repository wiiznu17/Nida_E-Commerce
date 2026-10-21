import { Link } from 'react-router-dom';
import { ArrowUpRight, Award, Boxes, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice } from '../../utils';
import type {
  AnalyticsBestSeller,
  AnalyticsInventoryVelocity,
} from '@repo/types';

interface DashboardMerchandisingGridProps {
  bestSellers: AnalyticsBestSeller[];
  inventoryVelocity: AnalyticsInventoryVelocity[];
}

export function DashboardMerchandisingGrid({
  bestSellers,
  inventoryVelocity,
}: DashboardMerchandisingGridProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Column 1: Top 5 Best Sellers */}
      <div className="bg-white border border-brand-border p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center space-x-2">
              <Award size={16} className="text-brand-amber" />
              <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
                {t('dashboard.merch.bestSellersTitle')}
              </h3>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-bold uppercase tracking-wider text-brand-amber hover:underline flex items-center"
            >
              <span>{t('dashboard.merch.allCatalog')}</span>
              <ArrowUpRight size={12} className="ml-0.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {bestSellers.slice(0, 5).map((item, idx) => (
              <div
                key={item.productId}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-brand-cream text-brand-brown text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-brand-brown truncate">
                      {item.productName}
                    </h4>
                    <span className="text-[10px] font-mono text-gray-400 block truncate">
                      {item.skuCode}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-brand-brown block">
                    {formatPrice(item.revenue)}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {item.unitsSold} {t('dashboard.merch.unitsSold')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column 2: Inventory Velocity & Restock Forecast */}
      <div className="bg-white border border-brand-border p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center space-x-2">
              <Boxes size={16} className="text-brand-amber" />
              <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
                {t('dashboard.merch.velocityTitle')}
              </h3>
            </div>
            <Link
              to="/admin/inventory"
              className="text-xs font-bold uppercase tracking-wider text-brand-amber hover:underline flex items-center"
            >
              <span>{t('dashboard.merch.adjustStock')}</span>
              <ArrowUpRight size={12} className="ml-0.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {inventoryVelocity.map((item) => {
              const isCritical = item.urgency === 'CRITICAL';
              const isWarning = item.urgency === 'WARNING';

              return (
                <div
                  key={item.skuCode}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      {isCritical && (
                        <AlertCircle
                          size={13}
                          className="text-rose-600 flex-shrink-0"
                        />
                      )}
                      <h4 className="text-xs font-bold text-brand-brown truncate">
                        {item.productName}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                      <span className="font-mono">{item.skuCode}</span>
                      <span>•</span>
                      <span>
                        {t('dashboard.merch.burnRate')}: {item.dailyVelocity}
                        /day
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-xs block ${
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isWarning
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.daysRemaining} {t('dashboard.merch.daysRemaining')}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      +{item.suggestedRestock}{' '}
                      {t('dashboard.merch.suggestedRestock')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
