'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquareQuote, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { reviewRequester } from '@/api';
import { RatingSummaryCard } from './RatingSummaryCard';
import { ReviewItemCard } from './ReviewItemCard';
import { WriteReviewModal } from './WriteReviewModal';
import { DeleteReviewConfirmModal } from './DeleteReviewConfirmModal';
import type {
  ApiReview,
  ApiRatingSummary,
  ApiEligibleReviewItem,
} from '@repo/types';

export interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export function ProductReviewsSection({
  productId,
  productName,
}: ProductReviewsSectionProps) {
  const { t } = useLanguage();
  const { token, isAuthenticated, openAuthDrawer } = useAuth();

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [summary, setSummary] = useState<ApiRatingSummary | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & action states
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [eligibleItems, setEligibleItems] = useState<ApiEligibleReviewItem[]>([]);
  const [selectedReviewForDelete, setSelectedReviewForDelete] =
    useState<ApiReview | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [isDeletingReview, setIsDeletingReview] = useState<boolean>(false);

  // Feedback notifications
  const [notice, setNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reviewRequester.getProductReviews(
        productId,
        {
          page,
          limit: 10,
          rating: selectedRating ?? undefined,
        },
        token,
      );

      if (res) {
        setReviews(res.reviews);
        setSummary(res.summary);
        setTotalPages(res.pagination.totalPages);
      }
    } catch {
      // Non-blocking catch
    } finally {
      setIsLoading(false);
    }
  }, [productId, page, selectedRating, token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle Write Review Click
  const handleOpenWriteReview = async () => {
    setNotice(null);
    if (!isAuthenticated || !token) {
      openAuthDrawer('signin');
      return;
    }

    try {
      const items = await reviewRequester.getEligibleItems(token);
      // Filter eligible items strictly for this product
      const productEligible = items.filter((it) => it.productId === productId);

      if (productEligible.length === 0) {
        setNotice({
          type: 'info',
          message:
            t('product.reviews.onlyVerified') ??
            'Only customers who have purchased and received this product can write a review.',
        });
        return;
      }

      setEligibleItems(productEligible);
      setIsWriteModalOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to check eligibility';
      setNotice({ type: 'error', message: msg });
    }
  };

  // Submit Review Handler
  const handleSubmitReview = async (payload: {
    orderId: string;
    rating: number;
    title?: string;
    reviewText?: string;
  }) => {
    if (!token) return;
    setIsSubmittingReview(true);
    try {
      await reviewRequester.createReview(
        productId,
        {
          orderId: payload.orderId,
          rating: payload.rating,
          title: payload.title,
          reviewText: payload.reviewText,
        },
        token,
      );

      setIsWriteModalOpen(false);
      setNotice({
        type: 'success',
        message:
          t('product.reviews.successSubmitted') ??
          'Your review has been submitted successfully. Thank you for your feedback!',
      });
      fetchReviews();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      throw new Error(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Delete Review Handler
  const handleConfirmDelete = async () => {
    if (!token || !selectedReviewForDelete) return;
    setIsDeletingReview(true);
    try {
      await reviewRequester.deleteReview(selectedReviewForDelete.id, token);
      setSelectedReviewForDelete(null);
      setNotice({
        type: 'success',
        message:
          t('product.reviews.successDeleted') ??
          'Your review has been deleted successfully.',
      });
      fetchReviews();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review';
      setNotice({ type: 'error', message: msg });
    } finally {
      setIsDeletingReview(false);
    }
  };

  return (
    <div className="py-12 border-t border-stone-200" id="product-reviews">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-stone-500 text-xs font-black uppercase tracking-widest mb-1.5">
              <MessageSquareQuote size={15} />
              <span>{t('product.customerReviews') ?? 'Customer Reviews'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-[#2B1810] tracking-tight">
              {t('product.reviews.title') ?? 'Verified Reviews & Ratings'}
            </h2>
          </div>
        </div>

        {/* Global Notice Alert */}
        {notice && (
          <div
            className={`p-4 rounded-xs border text-xs flex items-start space-x-2.5 transition-all ${
              notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : notice.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{notice.message}</div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="font-bold underline text-[11px] ml-2 cursor-pointer"
            >
              {t('common.close') ?? 'Close'}
            </button>
          </div>
        )}

        {/* Rating Breakdown Card */}
        {summary && (
          <RatingSummaryCard
            summary={summary}
            selectedRating={selectedRating}
            onSelectRating={(r) => {
              setSelectedRating(r);
              setPage(1);
            }}
            onOpenWriteModal={handleOpenWriteReview}
          />
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-stone-400 animate-pulse bg-stone-50 rounded-xs">
              {t('common.loading') ?? 'Loading customer reviews...'}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center bg-stone-50/50 border border-stone-200/80 rounded-xs space-y-3">
              <Star size={24} className="mx-auto text-stone-300" />
              <p className="text-xs text-stone-500">
                {selectedRating
                  ? (t('product.reviews.noRatingReviews') ??
                    `No ${selectedRating}-star reviews yet for this product.`)
                  : (t('product.reviews.noReviews') ??
                    'There are no reviews for this product yet. Be the first to share your experience!')}
              </p>
              <button
                type="button"
                onClick={handleOpenWriteReview}
                className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2B1810] hover:underline cursor-pointer"
              >
                <span>{t('product.reviews.writeReview') ?? 'Write a Review'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <ReviewItemCard
                  key={rev.id}
                  review={rev}
                  onDelete={(target) => setSelectedReviewForDelete(target)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-stone-300 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-700 disabled:opacity-40 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {t('pagination.prevPage') ?? 'Previous'}
              </button>
              <span className="text-xs font-medium text-stone-500 px-2">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-stone-300 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-700 disabled:opacity-40 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {t('pagination.nextPage') ?? 'Next'}
              </button>
            </div>
          )}
        </div>

        {/* Write Review Modal */}
        <WriteReviewModal
          isOpen={isWriteModalOpen}
          productId={productId}
          productName={productName}
          eligibleItems={eligibleItems}
          isSubmitting={isSubmittingReview}
          onClose={() => setIsWriteModalOpen(false)}
          onSubmit={handleSubmitReview}
        />

        {/* Delete Review Confirm Modal */}
        <DeleteReviewConfirmModal
          isOpen={Boolean(selectedReviewForDelete)}
          review={selectedReviewForDelete}
          isDeleting={isDeletingReview}
          onClose={() => setSelectedReviewForDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}
