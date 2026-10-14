import { useLanguage } from '../../context/LanguageContext';
import type { CategoryStats } from './categoryTypes';

export interface CategoryStatsCardsProps {
  stats: CategoryStats;
}

export function CategoryStatsCards({ stats }: CategoryStatsCardsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white border border-brand-border p-4.5 rounded-xs shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
          {t('category.statsTotal')}
        </span>
        <span className="text-2xl font-black text-brand-dark-brown font-mono">
          {stats.total}
        </span>
      </div>

      <div className="bg-white border border-brand-border p-4.5 rounded-xs shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
          {t('category.statsMain')}
        </span>
        <span className="text-2xl font-black text-brand-brown font-mono">
          {stats.main}
        </span>
      </div>

      <div className="bg-white border border-brand-border p-4.5 rounded-xs shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
          {t('category.statsSub')}
        </span>
        <span className="text-2xl font-black text-stone-700 font-mono">
          {stats.sub}
        </span>
      </div>

      <div className="bg-white border border-brand-border p-4.5 rounded-xs shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
          {t('category.statsActive')}
        </span>
        <span className="text-2xl font-black text-emerald-600 font-mono">
          {stats.active}
        </span>
      </div>
    </div>
  );
}
