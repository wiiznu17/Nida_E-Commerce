import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck } from 'lucide-react';
import { InfoTooltip } from '../ui';

interface FulfillmentGaugeChartProps {
  score?: number | null; // e.g. 98.4
  avgHours?: number | null; // e.g. 3.8
  onTimeDispatchPct?: number | null; // e.g. 99.1
}

export function FulfillmentGaugeChart({
  score,
  avgHours,
  onTimeDispatchPct,
}: FulfillmentGaugeChartProps) {
  const { t } = useLanguage();

  const safeScore =
    typeof score === 'number' && !Number.isNaN(score) ? score : 100;
  const safeAvgHours =
    typeof avgHours === 'number' && !Number.isNaN(avgHours) ? avgHours : 0;
  const safeOnTimePct =
    typeof onTimeDispatchPct === 'number' && !Number.isNaN(onTimeDispatchPct)
      ? onTimeDispatchPct
      : 100;

  const radius = 80;
  const strokeWidth = 16;
  const arcLength = Math.PI * radius; // Half circumference for semi-circle (~251.3)
  const strokeDashoffset = arcLength - (safeScore / 100) * arcLength;

  return (
    <div className="bg-white border border-brand-border p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1.5">
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
              {t('dashboard.charts.operationsTitle')}
            </h3>
            <InfoTooltip
              title={t('dashboard.tooltips.operationsScoreTitle')}
              description={t('dashboard.tooltips.operationsScoreDesc')}
              formula={t('dashboard.tooltips.operationsScoreFormula')}
            />
          </div>
          <p className="text-xs text-gray-500">
            {t('dashboard.charts.operationsSub')}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <ShieldCheck size={18} />
        </div>
      </div>

      {/* Semi-Circle Gauge SVG (Enlarged & Responsive) */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <svg
          viewBox="0 0 220 120"
          className="w-48 sm:w-52 xl:w-56 h-auto overflow-visible select-none"
        >
          {/* Background Track Arc */}
          <path
            d="M 30 108 A 80 80 0 0 1 190 108"
            fill="none"
            stroke="#FAF7F2"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Foreground Score Arc */}
          <path
            d="M 30 108 A 80 80 0 0 1 190 108"
            fill="none"
            stroke="#059669"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Readout & Optimal Health Badge */}
        <div className="absolute bottom-1 flex flex-col items-center text-center">
          <span className="text-3xl sm:text-4xl font-black font-mono text-brand-brown tracking-tight">
            {safeScore}%
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-xs border border-emerald-300 mt-1 shadow-2xs">
            {t('dashboard.charts.operationsOptimal')}
          </span>
        </div>
      </div>

      {/* Operational Breakdown Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-gray-50 pt-3 text-xs">
        <div className="bg-brand-cream/50 p-2 border border-brand-border">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
              {t('dashboard.charts.onTimeDispatch')}
            </span>
            <InfoTooltip
              title={t('dashboard.tooltips.onTimeDispatchTitle')}
              description={t('dashboard.tooltips.onTimeDispatchDesc')}
              formula={t('dashboard.tooltips.onTimeDispatchFormula')}
            />
          </div>
          <span className="font-mono font-bold text-brand-brown">
            {safeOnTimePct}%
          </span>
        </div>
        <div className="bg-brand-cream/50 p-2 border border-brand-border">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
              {t('dashboard.charts.avgProcessing')}
            </span>
            <InfoTooltip
              title={t('dashboard.tooltips.avgFulfillmentTitle')}
              description={t('dashboard.tooltips.avgFulfillmentDesc')}
              formula={t('dashboard.tooltips.avgFulfillmentFormula')}
            />
          </div>
          <span className="font-mono font-bold text-brand-brown">
            {safeAvgHours} {t('dashboard.hero.hours')}
          </span>
        </div>
      </div>
    </div>
  );
}
