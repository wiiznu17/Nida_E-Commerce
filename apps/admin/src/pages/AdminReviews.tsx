import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquareQuote, CheckCircle2, EyeOff, Star } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { StatCard, Pagination, ApiErrorModal } from '../components/ui';
import {
  ReviewFilterBar,
  ReviewTable,
  AdminReviewReplyModal,
  AdminReviewDeleteModal,
  type ReviewFilterState,
} from '../components/review';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { reviewRequester } from '../api/requester/reviewRequester';
import type { ApiReview } from '@repo/types';

export default function AdminReviews() {
  const { t } = useLanguage();
  const toast = useToast();

  const [searchParams, setSearchParams] = useSearchParams();

  // Read search & filter params from URL
  const urlSearch = searchParams.get('search') ?? '';
  const urlStatus = (searchParams.get('status') as ReviewFilterState['status']) || 'ALL';
  const urlRatingParam = searchParams.get('rating');
  const urlRating = urlRatingParam ? Number(urlRatingParam) : '';
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10) || 1;
  const pageSize = parseInt(searchParams.get('limit') ?? '20', 10) || 20;

  // Local draft inputs for filter form (only applied when clicking Search button or submitting)
  const [draftFilters, setDraftFilters] = useState<ReviewFilterState>({
    search: urlSearch,
    status: urlStatus,
    rating: urlRating,
  });

  // Sync draft form state when URL searchParams change
  useEffect(() => {
    setDraftFilters({
      search: urlSearch,
      status: urlStatus,
      rating: urlRating,
    });
  }, [urlSearch, urlStatus, urlRating]);

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<ApiReview | null>(null);
  const [selectedReviewForDelete, setSelectedReviewForDelete] = useState<ApiReview | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await reviewRequester.getReviews({
        page: currentPage,
        limit: pageSize,
        search: urlSearch || undefined,
        status: urlStatus !== 'ALL' ? urlStatus : undefined,
        rating: urlRating ? Number(urlRating) : undefined,
      });

      setReviews(res.data);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.total || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, urlSearch, urlStatus, urlRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle Search Submission (updates URL searchParams, resets page to 1)
  const handleFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newParams = new URLSearchParams();
    if (draftFilters.search.trim()) {
      newParams.set('search', draftFilters.search.trim());
    }
    if (draftFilters.status && draftFilters.status !== 'ALL') {
      newParams.set('status', draftFilters.status);
    }
    if (draftFilters.rating) {
      newParams.set('rating', String(draftFilters.rating));
    }
    newParams.set('page', '1');
    newParams.set('limit', String(pageSize));

    setSearchParams(newParams);
  };

  // Handle Reset Filter
  const handleFilterReset = () => {
    setDraftFilters({
      search: '',
      status: 'ALL',
      rating: '',
    });
    setSearchParams(new URLSearchParams({ page: '1', limit: String(pageSize) }));
  };

  // Handle Page Change
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
  };

  // Toggle review visibility (Approve / Hide)
  const handleToggleStatus = async (review: ApiReview) => {
    const nextStatus = !review.isApproved;
    try {
      await reviewRequester.toggleReviewStatus(review.id, nextStatus);
      toast.success(
        nextStatus
          ? (t('reviews.toast.approved') ?? 'Review approved and published.')
          : (t('reviews.toast.hidden') ?? 'Review hidden from storefront.')
      );
      fetchReviews();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update review status';
      toast.error(msg);
    }
  };

  // Submit official admin reply
  const handleSubmitReply = async (replyText: string) => {
    if (!selectedReviewForReply) return;
    setIsSubmittingReply(true);
    try {
      await reviewRequester.replyToReview(selectedReviewForReply.id, replyText);
      toast.success(t('reviews.toast.replied') ?? 'Official reply posted successfully.');
      setSelectedReviewForReply(null);
      fetchReviews();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to post reply';
      toast.error(msg);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Confirm soft delete review
  const handleConfirmDelete = async () => {
    if (!selectedReviewForDelete) return;
    setIsSubmittingDelete(true);
    try {
      await reviewRequester.deleteReview(selectedReviewForDelete.id);
      toast.success(t('reviews.toast.deleted') ?? 'Review removed successfully.');
      setSelectedReviewForDelete(null);
      fetchReviews();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review';
      toast.error(msg);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Compute summary stats from current view
  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const hiddenCount = reviews.filter((r) => !r.isApproved).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <AdminLayout title={t('reviews.title', 'Product Reviews & Ratings')}>
      <div className="space-y-5">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title={t('reviews.stats.total') ?? 'Total Reviews'}
            value={totalItems}
            icon={<MessageSquareQuote className="w-5 h-5 text-stone-600" />}
          />
          <StatCard
            title={t('reviews.stats.approved') ?? 'Approved in View'}
            value={approvedCount}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title={t('reviews.stats.hidden') ?? 'Hidden in View'}
            value={hiddenCount}
            icon={<EyeOff className="w-5 h-5 text-amber-600" />}
          />
          <StatCard
            title={t('reviews.stats.avgRating') ?? 'Avg Rating in View'}
            value={avgRating}
            icon={<Star className="w-5 h-5 text-amber-500 fill-amber-400" />}
          />
        </div>

        {/* Filter Bar */}
        <ReviewFilterBar
          filters={draftFilters}
          onChange={(patch) => setDraftFilters((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleFilterSubmit}
          onReset={handleFilterReset}
        />

        {/* Review Table */}
        <ReviewTable
          reviews={reviews}
          isLoading={isLoading}
          onToggleStatus={handleToggleStatus}
          onOpenReply={(rev) => setSelectedReviewForReply(rev)}
          onOpenDelete={(rev) => setSelectedReviewForDelete(rev)}
        />

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="bg-white border border-stone-200 rounded-xs p-4 shadow-2xs">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Reply Modal */}
        <AdminReviewReplyModal
          isOpen={Boolean(selectedReviewForReply)}
          review={selectedReviewForReply}
          isLoading={isSubmittingReply}
          onClose={() => setSelectedReviewForReply(null)}
          onSubmit={async (_id, replyText) => handleSubmitReply(replyText)}
        />

        {/* Delete Confirmation Modal */}
        <AdminReviewDeleteModal
          isOpen={Boolean(selectedReviewForDelete)}
          review={selectedReviewForDelete}
          isLoading={isSubmittingDelete}
          onClose={() => setSelectedReviewForDelete(null)}
          onConfirm={async (_id) => handleConfirmDelete()}
        />

        {/* API Error Modal */}
        <ApiErrorModal
          isOpen={Boolean(apiError)}
          errorMessage={apiError ?? ''}
          onClose={() => setApiError(null)}
        />
      </div>
    </AdminLayout>
  );
}
