import { useState, useEffect } from 'react';
import { MessageSquareQuote, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { ApiReview } from '@repo/types';

export interface AdminReviewReplyModalProps {
  isOpen: boolean;
  review: ApiReview | null;
  onClose: () => void;
  onSubmit: (reviewId: string, reply: string) => Promise<void>;
  isLoading?: boolean;
}

export function AdminReviewReplyModal({
  isOpen,
  review,
  onClose,
  onSubmit,
  isLoading = false,
}: AdminReviewReplyModalProps) {
  const { t } = useLanguage();
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (review) {
      setReplyText(review.adminReply?.comment ?? '');
      setError(null);
    }
  }, [review]);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (trimmed.length < 2) {
      setError(t('reviews.reply.minLenError') ?? 'Reply must be at least 2 characters');
      return;
    }
    if (trimmed.length > 1000) {
      setError(t('reviews.reply.maxLenError') ?? 'Reply cannot exceed 1000 characters');
      return;
    }

    try {
      setError(null);
      await onSubmit(review.id, trimmed);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save reply');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-xs shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                {t('reviews.reply.modalTitle') ?? 'Official Brand Reply'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {review.productName} • {review.authorName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Review Quote Snippet */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span>{review.authorName}</span>
              <span>{review.rating} / 5 Stars</span>
            </div>
            {review.title && (
              <p className="font-bold text-stone-800">{review.title}</p>
            )}
            <p className="text-stone-600 line-clamp-3 italic">
              &ldquo;{review.reviewText || 'No text review'}&rdquo;
            </p>
          </div>

          {/* Reply Textarea */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t('reviews.reply.label') ?? 'Reply from NIDA Official'}
            </label>
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                t('reviews.reply.placeholder') ??
                'Thank the customer, provide helpful guidance, or address concerns...'
              }
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-brand-brown focus:border-brand-brown resize-none"
            />
            <div className="flex justify-between items-center mt-1 text-[10px] text-stone-400">
              <span>Min. 2 characters</span>
              <span>{replyText.length} / 1000</span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-stone-300 rounded-xs text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {t('common.cancel') ?? 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isLoading || replyText.trim().length < 2}
              className="px-5 py-2 bg-brand-brown hover:bg-stone-800 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {isLoading
                ? (t('common.saving') ?? 'Saving...')
                : (t('reviews.reply.saveBtn') ?? 'Save Official Reply')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

