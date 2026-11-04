'use client';

import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiReview } from '@repo/types';

export interface DeleteReviewConfirmModalProps {
  isOpen: boolean;
  review: ApiReview | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteReviewConfirmModal({
  isOpen,
  review,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteReviewConfirmModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-xs shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-red-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Trash2 size={16} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-900">
              {t('product.reviews.deleteTitle') ?? 'Delete Review'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-xs text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3 text-stone-600 text-xs leading-relaxed">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p>
              {t('product.reviews.deleteMessage') ??
                'Are you sure you want to delete your review? Once removed, it will no longer appear on the storefront.'}
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-3 rounded-xs text-xs space-y-1">
            <div className="font-bold text-stone-800">
              {review.title ?? 'Product Review'}
            </div>
            <div className="text-stone-500 line-clamp-2 italic">
              &quot;{review.reviewText}&quot;
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-stone-300 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {t('common.cancel') ?? 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
          >
            {isDeleting
              ? (t('product.reviews.deleting') ?? 'Deleting...')
              : (t('product.reviews.deleteConfirm') ?? 'Delete Review')}
          </button>
        </div>
      </div>
    </div>
  );
}
