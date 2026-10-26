import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../ui';
import type { CategoryStats } from './categoryTypes';

export interface CategoryStatsCardsProps {
  stats: CategoryStats;
}

export function CategoryStatsCards({ stats }: CategoryStatsCardsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title={t('category.statsTotal')}
        value={stats.total}
        valueClassName="text-brand-dark-brown"
      />
      <StatCard
        title={t('category.statsMain')}
        value={stats.main}
        valueClassName="text-brand-brown"
      />
      <StatCard
        title={t('category.statsSub')}
        value={stats.sub}
        valueClassName="text-stone-700"
      />
      <StatCard
        title={t('category.statsActive')}
        value={stats.active}
        valueClassName="text-emerald-600"
      />
    </div>
  );
}
