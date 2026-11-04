'use client';

import React from 'react';
import { Star, PenSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiRatingSummary } from '@repo/types';

export interface RatingSummaryCardProps {
  summary: ApiRatingSummary;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
  onOpenWriteModal: () => void;
}

export function RatingSummaryCard({
  summary,
  selectedRating,
  onSelectRating,
  onOpenWriteModal,
}: RatingSummaryCardProps) {
  const { t, isTh } = useLanguage();

  const totalReviews = summary.totalReviews;
  const averageRating = summary.averageRating.toFixed(1);

  const starLevels: Array<{ star: 5 | 4 | 3 | 2 | 1; count: number; pct: number }> = [
    {
      star: 5,
      count: summary.breakdown[5],
      pct: totalReviews > 0 ? (summary.breakdown[5] / totalReviews) * 100 : 0,
    },
    {
      star: 4,
      count: summary.breakdown[4],
      pct: totalReviews > 0 ? (summary.breakdown[4] / totalReviews) * 100 : 0,
    },
    {
      star: 3,
      count: summary.breakdown[3],
      pct: totalReviews > 0 ? (summary.breakdown[3] / totalReviews) * 100 : 0,
    },
    {
      star: 2,
      count: summary.breakdown[2],
      pct: totalReviews > 0 ? (summary.breakdown[2] / totalReviews) * 100 : 0,
    },
    {
      star: 1,
      count: summary.breakdown[1],
      pct: totalReviews > 0 ? (summary.breakdown[1] / totalReviews) * 100 : 0,
    },
  ];

  return (
    <div className="bg-[#FAF7F2] border border-[#EAE3D9] rounded-xs p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Overall Rating & Write Review Button */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left justify-center lg:border-r lg:border-[#EAE3D9] lg:pr-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">
            {t('product.reviews.subtitle') ?? 'Verified Customer Rating'}
          </span>
          <div className="flex items-baseline space-x-2 my-1">
            <span className="text-5xl font-black text-brand-brown tracking-tight">
              {averageRating}
            </span>
            <span className="text-sm font-semibold text-stone-400">/ 5.0</span>
          </div>

          {/* Star icons */}
          <div className="flex text-amber-400 space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className={
                  summary.averageRating >= star
                    ? 'fill-amber-400 text-amber-400'
                    : summary.averageRating >= star - 0.5
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'text-stone-300'
                }
              />
            ))}
          </div>

          <p className="text-xs text-stone-500 mb-5">
            {totalReviews > 0
              ? `${totalReviews.toLocaleString()} ${isTh ? 'รีวิวจากผู้ซื้อจริง' : 'verified reviews'}`
              : (t('product.reviews.noReviews') ?? 'No reviews yet')}
          </p>

          <button
            type="button"
            onClick={onOpenWriteModal}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#2B1810] hover:bg-stone-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer"
          >
            <PenSquare size={14} />
            <span>{t('product.reviews.writeReview') ?? 'Write a Review'}</span>
          </button>
        </div>

        {/* Right: Star Breakdown Progress Bars */}
        <div className="lg:col-span-8 flex flex-col space-y-2.5">
          {starLevels.map(({ star, count, pct }) => {
            const isSelected = selectedRating === star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => onSelectRating(isSelected ? null : star)}
                className={`group flex items-center space-x-3 text-xs w-full text-left p-1.5 rounded-xs transition-colors cursor-pointer ${
                  isSelected ? 'bg-amber-100/60 font-bold' : 'hover:bg-[#EAE3D9]/40'
                }`}
              >
                <div className="flex items-center space-x-1 w-16 text-stone-700 shrink-0">
                  <span>{star}</span>
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] text-stone-400">
                    ({starLevels.find((s) => s.star === star)?.star})
                  </span>
                </div>

                <div className="flex-1 h-2 bg-stone-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected ? 'bg-amber-500' : 'bg-[#2B1810] group-hover:bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="w-16 text-right font-mono text-[11px] text-stone-500 shrink-0">
                  {count.toLocaleString()}
                </div>
              </button>
            );
          })}

          {selectedRating !== null && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onSelectRating(null)}
                className="text-[11px] font-bold uppercase tracking-wider text-[#2B1810] hover:underline"
              >
                {t('common.all') ?? 'Show All Ratings'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
