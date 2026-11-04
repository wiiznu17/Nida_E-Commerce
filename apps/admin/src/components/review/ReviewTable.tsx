import {
  Star,
  MessageSquareQuote,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EmptyState } from '../ui';
import type { ApiReview } from '@repo/types';

export interface ReviewTableProps {
  reviews: ApiReview[];
  isLoading?: boolean;
  onToggleStatus: (review: ApiReview) => void;
  onOpenReply: (review: ApiReview) => void;
  onOpenDelete: (review: ApiReview) => void;
}

export function ReviewTable({
  reviews,
  isLoading = false,
  onToggleStatus,
  onOpenReply,
  onOpenDelete,
}: ReviewTableProps) {
  const { t, language } = useLanguage();
  const isTh = language === 'th';

  if (isLoading) {
    return (
      <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
        <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-stone-400 animate-pulse">
          {t('common.loading') ?? 'Loading reviews...'}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden p-8">
        <EmptyState
          title={t('reviews.empty.title') ?? 'No Reviews Found'}
          subtitle={
            t('reviews.empty.desc') ??
            'There are no customer reviews matching your search criteria.'
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/75 text-[10px] font-black uppercase tracking-wider text-stone-500">
              <th className="py-3 px-4 w-60">
                {t('reviews.table.product') ?? 'PRODUCT'}
              </th>
              <th className="py-3 px-4 w-36">
                {t('reviews.table.customer') ?? 'CUSTOMER'}
              </th>
              <th className="py-3 px-4 w-28 text-center">
                {t('reviews.table.rating') ?? 'RATING'}
              </th>
              <th className="py-3 px-4">
                {t('reviews.table.review') ?? 'REVIEW CONTENT'}
              </th>
              <th className="py-3 px-4 w-32 text-center">
                {t('reviews.table.reply') ?? 'BRAND REPLY'}
              </th>
              <th className="py-3 px-4 w-28 text-center">
                {t('reviews.table.status') ?? 'STATUS'}
              </th>
              <th className="py-3 px-4 w-32 text-right">
                {t('reviews.table.actions') ?? 'ACTIONS'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {reviews.map((rev) => (
              <tr
                key={rev.id}
                className="hover:bg-stone-50/60 transition-colors group"
              >
                {/* Product Column */}
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-start space-x-3">
                    {rev.productImage ? (
                      <img
                        src={rev.productImage}
                        alt={rev.productName ?? 'Product'}
                        className="w-10 h-12 object-cover rounded-xs border border-stone-200 shrink-0 bg-stone-100"
                      />
                    ) : (
                      <div className="w-10 h-12 rounded-xs border border-stone-200 shrink-0 bg-stone-100 flex items-center justify-center text-[9px] text-stone-400 font-bold uppercase">
                        NIDA
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 line-clamp-1">
                        {rev.productName ?? 'Product'}
                      </p>
                      {rev.productSlug && (
                        <p className="text-[10px] text-stone-400 font-mono line-clamp-1">
                          /{rev.productSlug}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Customer Column */}
                <td className="py-3.5 px-4 align-top">
                  <p className="font-bold text-stone-900">{rev.authorName}</p>
                  <p className="text-[10px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString(
                      isTh ? 'th-TH' : 'en-US',
                      { year: 'numeric', month: 'short', day: 'numeric' },
                    )}
                  </p>
                </td>

                {/* Rating Column */}
                <td className="py-3.5 px-4 align-top text-center">
                  <div className="inline-flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-stone-900 text-xs">
                      {rev.rating}.0
                    </span>
                  </div>
                </td>

                {/* Review Content Column */}
                <td className="py-3.5 px-4 align-top space-y-1">
                  <div className="flex items-center space-x-2">
                    {rev.title && (
                      <span className="font-bold text-stone-900 line-clamp-1">
                        {rev.title}
                      </span>
                    )}
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-2xs bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>
                          {t('reviews.badge.verified') ?? 'Verified Buyer'}
                        </span>
                      </span>
                    )}
                  </div>
                  {rev.reviewText && (
                    <p className="text-stone-600 line-clamp-2 leading-relaxed text-[11px]">
                      {rev.reviewText}
                    </p>
                  )}
                </td>

                {/* Brand Reply Status */}
                <td className="py-3.5 px-4 align-top text-center">
                  {rev.adminReply ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                      {t('reviews.reply.statusReplied') ?? 'Replied'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400">
                      {t('reviews.reply.statusNoReply') ?? '—'}
                    </span>
                  )}
                </td>

                {/* Status Column */}
                <td className="py-3.5 px-4 align-top text-center">
                  <span
                    className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      rev.isApproved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-stone-500 border-stone-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        rev.isApproved ? 'bg-emerald-500' : 'bg-stone-400'
                      }`}
                    />
                    <span>
                      {rev.isApproved
                        ? (t('reviews.status.approved') ?? 'Approved')
                        : (t('reviews.status.hidden') ?? 'Hidden')}
                    </span>
                  </span>
                </td>

                {/* Actions Column */}
                <td className="py-3.5 px-4 align-top text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {/* Toggle Approve / Hide */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus(rev)}
                      title={
                        rev.isApproved
                          ? (t('reviews.action.hide') ?? 'Hide Review')
                          : (t('reviews.action.approve') ?? 'Approve Review')
                      }
                      className="p-1.5 rounded-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      {rev.isApproved ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>

                    {/* Official Reply */}
                    <button
                      type="button"
                      onClick={() => onOpenReply(rev)}
                      title={t('reviews.action.reply') ?? 'Official Reply'}
                      className="p-1.5 rounded-xs text-stone-500 hover:text-brand-brown hover:bg-amber-50 transition-colors cursor-pointer"
                    >
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onOpenDelete(rev)}
                      title={t('reviews.action.delete') ?? 'Delete Review'}
                      className="p-1.5 rounded-xs text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
