'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiEligibleReviewItem } from '@repo/types';

export interface WriteReviewModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  eligibleItems: ApiEligibleReviewItem[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    orderId: string;
    rating: number;
    title?: string;
    reviewText?: string;
  }) => Promise<void>;
}

export function WriteReviewModal({
  isOpen,
  productId,
  productName,
  eligibleItems,
  isSubmitting = false,
  onClose,
  onSubmit,
}: WriteReviewModalProps) {
  const { t } = useLanguage();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize selected order ID when items are provided
  useEffect(() => {
    if (eligibleItems.length > 0) {
      setSelectedOrderId(eligibleItems[0].orderId);
    }
  }, [eligibleItems]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      setError(
        t('product.reviews.orderRequired') ??
          'Please select an eligible order.',
      );
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setError(
        t('product.reviews.ratingRequired') ??
          'Please select a star rating between 1 and 5.',
      );
      return;
    }
    if (!reviewText.trim()) {
      setError(
        t('product.reviews.reviewRequired') ??
          'Please write your review feedback.',
      );
      return;
    }

    try {
      setError(null);
      await onSubmit({
        orderId: selectedOrderId,
        rating,
        title: title.trim() || undefined,
        reviewText: reviewText.trim() || undefined,
      });
      // Reset form
      setTitle('');
      setReviewText('');
      setRating(5);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to submit review';
      setError(msg);
    }
  };

  const activeStarDisplay = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-xs shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF7F2]">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
              {t('product.reviews.modalTitle') ?? 'Write a Review'}
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5 truncate max-w-xs sm:max-w-md">
              {productName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-xs text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              {t('product.reviews.ratingLabel') ?? 'Overall Rating *'}
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex text-amber-400 space-x-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
                  >
                    <Star
                      size={24}
                      className={
                        activeStarDisplay >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-200'
                      }
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-stone-600 ml-2">
                {activeStarDisplay} / 5
              </span>
            </div>
          </div>

          {/* Eligible Order Selection */}
          {eligibleItems.length > 1 ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {t('product.reviews.orderLabel') ?? 'Referenced Order *'}
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full text-xs border border-stone-300 rounded-xs px-3 py-2 bg-white text-stone-800 focus:outline-hidden focus:border-[#2B1810]"
              >
                {eligibleItems.map((item) => (
                  <option key={item.orderId} value={item.orderId}>
                    {item.orderNumber} - {item.productName} ({item.variantInfo})
                  </option>
                ))}
              </select>
            </div>
          ) : eligibleItems.length === 1 ? (
            <div className="text-xs text-stone-500 bg-stone-50 border border-stone-200 p-2.5 rounded-xs flex items-center justify-between">
              <span className="font-bold text-stone-700">
                {t('product.reviews.orderLabel') ?? 'Order'}:
              </span>
              <span className="font-mono text-stone-600">
                {eligibleItems[0].orderNumber}
              </span>
            </div>
          ) : null}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t('product.reviews.titleLabel') ?? 'Review Title (Optional)'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder={
                t('product.reviews.titlePlaceholder') ??
                'e.g. Excellent tailoring and premium fabric'
              }
              className="w-full text-xs border border-stone-300 rounded-xs px-3 py-2 bg-white text-stone-800 focus:outline-hidden focus:border-[#2B1810]"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t('product.reviews.commentLabel') ?? 'Review Message *'}
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder={
                t('product.reviews.commentPlaceholder') ??
                'Share your experience, fabric quality, and fit (min 10 characters)...'
              }
              className="w-full text-xs border border-stone-300 rounded-xs p-3 bg-white text-stone-800 focus:outline-hidden focus:border-[#2B1810] resize-none"
            />
            <div className="flex justify-end text-[10px] text-stone-400 mt-1">
              {reviewText.length}/1000
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-stone-300 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {t('common.cancel') ?? 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reviewText.trim()}
              className="px-5 py-2 bg-[#2B1810] hover:bg-stone-800 disabled:opacity-50 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
            >
              {isSubmitting
                ? (t('product.reviews.submitting') ?? 'Submitting...')
                : (t('product.reviews.submit') ?? 'Submit Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
