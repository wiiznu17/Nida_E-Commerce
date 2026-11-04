'use client';

import React from 'react';
import { Star, CheckCircle2, Trash2, MessageSquareQuote } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiReview } from '@repo/types';

export interface ReviewItemCardProps {
  review: ApiReview;
  onDelete?: (review: ApiReview) => void;
}

export function ReviewItemCard({ review, onDelete }: ReviewItemCardProps) {
  const { t, language } = useLanguage();
  const isTh = language === 'th';

  const formattedDate = new Date(review.createdAt).toLocaleDateString(
    isTh ? 'th-TH' : 'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  );

  const replyFormattedDate = review.adminReply?.repliedAt
    ? new Date(review.adminReply.repliedAt).toLocaleDateString(
        isTh ? 'th-TH' : 'en-US',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        },
      )
    : null;

  return (
    <div className="bg-white border border-stone-200/80 rounded-xs p-5 sm:p-6 shadow-2xs hover:border-stone-300 transition-colors">
      {/* Top Header: Author, Rating, Date & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-xs text-[#2B1810]">
            {review.authorName ? review.authorName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-stone-900">
                {review.authorName ?? 'Verified Customer'}
              </span>
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={10} />
                  <span>{t('product.reviews.verifiedBuyer') ?? 'Verified Buyer'}</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={
                      review.rating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-200'
                    }
                  />
                ))}
              </div>
              <span className="text-[11px] text-stone-400">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Action: Delete own review */}
        {review.isOwnReview && onDelete && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onDelete(review)}
              className="inline-flex items-center space-x-1 text-[11px] font-bold text-stone-400 hover:text-red-600 transition-colors p-1 rounded-xs cursor-pointer"
              title={t('product.reviews.deleteReview') ?? 'Delete Review'}
            >
              <Trash2 size={13} />
              <span>{t('common.delete') ?? 'Delete'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Review Content */}
      <div className="pt-3">
        {review.title && (
          <h4 className="text-xs sm:text-sm font-bold text-[#2B1810] mb-1.5">
            {review.title}
          </h4>
        )}
        {review.reviewText && (
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
            {review.reviewText}
          </p>
        )}
      </div>

      {/* Official Brand Response */}
      {review.adminReply && (
        <div className="mt-4 bg-[#FAF7F2] border-l-2 border-[#2B1810] p-3.5 rounded-r-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5 font-bold text-[#2B1810]">
              <MessageSquareQuote size={13} />
              <span className="uppercase tracking-wider">
                {t('product.reviews.brandResponse') ?? 'Nida Official Response'}
              </span>
            </div>
            {replyFormattedDate && (
              <span className="text-[10px] text-stone-400">
                {replyFormattedDate}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
            {review.adminReply.comment}
          </p>
        </div>
      )}
    </div>
  );
}
