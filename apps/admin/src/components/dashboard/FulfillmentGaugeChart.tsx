import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck } from 'lucide-react';

interface FulfillmentGaugeChartProps {
  score: number; // e.g. 98.4
  avgHours: number; // e.g. 3.8
  onTimeDispatchPct: number; // e.g. 99.1
}

export function FulfillmentGaugeChart({
  score,
  avgHours,
  onTimeDispatchPct,
}: FulfillmentGaugeChartProps) {
  const { t } = useLanguage();

  const radius = 64;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius; // Half circumference for semi-circle
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  return (
    <div className="bg-white border border-brand-border p-5 shadow-xs flex flex-col justify-between">
      <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
            {t('dashboard.charts.operationsTitle')}
          </h3>
          <p className="text-xs text-gray-500">
            {t('dashboard.charts.operationsSub')}
          </p>
        </div>
        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <ShieldCheck size={15} />
        </div>
      </div>

      {/* Semi-Circle Gauge SVG */}
      <div className="flex flex-col items-center justify-center my-3 relative">
        <svg width="180" height="100" viewBox="0 0 180 100" className="overflow-visible">
          {/* Background Track Arc */}
          <path
            d="M 20 90 A 64 64 0 0 1 160 90"
            fill="none"
            stroke="#FAF7F2"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Foreground Score Arc */}
          <path
            d="M 20 90 A 64 64 0 0 1 160 90"
            fill="none"
            stroke="#059669"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute bottom-1 flex flex-col items-center text-center">
          <span className="text-2xl font-black font-mono text-brand-brown tracking-tight">
            {score}%
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200 mt-0.5">
            {t('dashboard.charts.operationsOptimal')}
          </span>
        </div>
      </div>

      {/* Operational Breakdown Badges */}
      <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-3 text-xs">
        <div className="bg-brand-cream/50 p-2 border border-brand-border">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
            {t('dashboard.charts.onTimeDispatch')}
          </span>
          <span className="font-mono font-bold text-brand-brown">
            {onTimeDispatchPct}%
          </span>
        </div>
        <div className="bg-brand-cream/50 p-2 border border-brand-border">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
            {t('dashboard.charts.avgProcessing')}
          </span>
          <span className="font-mono font-bold text-brand-brown">
            {avgHours} {t('dashboard.hero.hours')}
          </span>
        </div>
      </div>
    </div>
  );
}
