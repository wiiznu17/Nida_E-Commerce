import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { ApiReview } from '@repo/types';

export interface AdminReviewDeleteModalProps {
  isOpen: boolean;
  review: ApiReview | null;
  onClose: () => void;
  onConfirm: (reviewId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AdminReviewDeleteModal({
  isOpen,
  review,
  onClose,
  onConfirm,
  isLoading = false,
}: AdminReviewDeleteModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-xs shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-red-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-900">
                {t('reviews.delete.modalTitle') ?? 'Delete Review'}
              </h3>
              <p className="text-[11px] text-red-700">
                {t('reviews.delete.subTitle') ??
                  'Action will be logged in Admin Audit Trail'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xs text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <p className="text-xs text-stone-600 leading-relaxed">
            {t('reviews.delete.confirmMessage') ??
              'Are you sure you want to remove this review? The review will be soft-deleted and removed from the customer storefront immediately.'}
          </p>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs space-y-1">
            <div className="flex justify-between font-bold text-stone-800">
              <span>{review.authorName}</span>
              <span>{review.rating} / 5 Stars</span>
            </div>
            <p className="text-stone-500 text-[11px]">{review.productName}</p>
            <p className="text-stone-700 italic line-clamp-2">
              &ldquo;{review.reviewText || review.title || 'No text'}&rdquo;
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 px-6 py-4 bg-stone-50 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-stone-300 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {t('common.cancel') ?? 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(review.id)}
            disabled={isLoading}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-2xs flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {isLoading
                ? (t('common.deleting') ?? 'Deleting...')
                : (t('reviews.delete.confirmBtn') ?? 'Delete Review')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
