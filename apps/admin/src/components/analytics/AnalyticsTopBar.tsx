import type { AnalyticsPageTimeframe } from '@repo/types';
import { Calendar, Filter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DropdownSelect } from '../ui';
import { ANALYTICS_TABS, ANALYTICS_TIMEFRAME_OPTIONS } from './analyticsConstants';
import type { AnalyticsTab, DateRangeState } from './analyticsTypes';

interface AnalyticsTopBarProps {
  activeTab: AnalyticsTab;
  onTabChange: (tab: AnalyticsTab) => void;
  timeframe: AnalyticsPageTimeframe;
  onTimeframeChange: (timeframe: AnalyticsPageTimeframe) => void;
  isCustomRange: boolean;
  onToggleCustomRange: (isCustom: boolean) => void;
  dateRange: DateRangeState;
  onDateRangeChange: (range: DateRangeState) => void;
}

export function AnalyticsTopBar({
  activeTab,
  onTabChange,
  timeframe,
  onTimeframeChange,
  isCustomRange,
  onToggleCustomRange,
  dateRange,
  onDateRangeChange,
}: AnalyticsTopBarProps) {
  const { t } = useLanguage();

  const selectOptions = ANALYTICS_TIMEFRAME_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  const currentValue = isCustomRange ? 'custom' : timeframe;

  const handleSelectChange = (val: string) => {
    if (val === 'custom') {
      onToggleCustomRange(true);
    } else {
      onToggleCustomRange(false);
      onTimeframeChange(val as AnalyticsPageTimeframe);
    }
  };

  // Hide timeframe controls on Export tab since each export section has its own date range
  const showTimeframeControl = activeTab !== 'export' && activeTab !== 'slow-moving';

  return (
    <div className="bg-white border border-brand-border rounded-xs shadow-xs p-3 mb-6 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto gap-1 border-b lg:border-b-0 border-gray-100 pb-2 lg:pb-0 scrollbar-none">
          {ANALYTICS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xs whitespace-nowrap transition-colors select-none ${
                  isActive
                    ? 'bg-brand-brown text-white shadow-2xs'
                    : 'text-stone-600 hover:text-brand-brown hover:bg-stone-50'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Timeframe or Custom Date Range Controls */}
        {showTimeframeControl && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-stone-500 text-xs">
              <Filter size={13} className="text-stone-400" />
            </div>

            <div className="w-40">
              <DropdownSelect
                value={currentValue}
                onChange={handleSelectChange}
                options={selectOptions}
              />
            </div>

            {isCustomRange && (
              <div className="flex items-center gap-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1 bg-stone-50 border border-brand-border rounded-xs px-2 py-1">
                  <Calendar size={13} className="text-stone-400" />
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      onDateRangeChange({
                        ...dateRange,
                        startDate: e.target.value,
                      })
                    }
                    className="text-xs text-stone-700 bg-transparent border-none outline-none"
                  />
                  <span className="text-stone-400 text-xs">-</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      onDateRangeChange({
                        ...dateRange,
                        endDate: e.target.value,
                      })
                    }
                    className="text-xs text-stone-700 bg-transparent border-none outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
