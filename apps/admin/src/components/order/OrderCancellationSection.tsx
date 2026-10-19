import React, { useState } from 'react';
import { Ban, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { orderRequester } from '../../api/requester/orderRequester';
import type { ApiOrderCancellationRequest } from '@repo/types';

interface OrderCancellationSectionProps {
  cancellationRequests: ApiOrderCancellationRequest[];
  onReviewed: () => void;
  onShowToast: (msg: string) => void;
}

const formatSlaRemaining = (createdAt: string, isTh: boolean): string => {
  const diff = new Date(createdAt).getTime() + 48 * 60 * 60 * 1000 - Date.now();
  if (diff <= 0) return isTh ? 'ครบกำหนดแล้ว' : 'Due now';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return isTh ? `${hours} ชม. ${minutes} นาที` : `${hours}h ${minutes}m`;
};

const isAutoApproved = (adminNote?: string | null): boolean => {
  if (!adminNote) return false;
  const note = adminNote.toLowerCase();
  return note.includes('auto-approved') || note.includes('48-hour');
};

export const OrderCancellationSection: React.FC<OrderCancellationSectionProps> = ({
  cancellationRequests,
  onReviewed,
  onShowToast,
}) => {
  const { t, isTh } = useLanguage();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeReview, setActiveReview] = useState<{ id: string; action: 'APPROVE' | 'REJECT' } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [restockInventory, setRestockInventory] = useState(true);

  if (!cancellationRequests || cancellationRequests.length === 0) return null;

  const handleConfirmReview = async () => {
    if (!activeReview) return;
    setProcessingId(activeReview.id);
    try {
      const res = await orderRequester.reviewCancellationRequest(
        activeReview.id,
        {
          action: activeReview.action,
          adminNote: adminNote.trim() || undefined,
          restockInventory,
        },
      );
      onShowToast(res.message);
      setActiveReview(null);
      setAdminNote('');
      onReviewed();
    } catch (err: unknown) {
      onShowToast(
        err instanceof Error
          ? err.message
          : isTh
            ? 'เกิดข้อผิดพลาดในการตรวจสอบคำขอ'
            : 'Failed to review request',
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-md shadow-2xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-brand-border bg-stone-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ban className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold text-stone-900 tracking-wider uppercase">
            {t('orders.cancellation.sectionTitle')}
          </h3>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {cancellationRequests.map((req) => (
          <div
            key={req.id}
            className="p-4 border border-brand-border rounded-xs bg-stone-50/30 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-stone-800">
                {req.requestNumber}
              </span>
              <div className="flex items-center space-x-1.5">
                {req.status === 'APPROVED' && isAutoApproved(req.adminNote) && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center space-x-1 bg-stone-100 text-stone-700 border border-stone-300">
                    <ShieldCheck className="w-3 h-3 mr-1 text-stone-500" />
                    {t('orders.cancellation.autoApprovedBadge')}
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center space-x-1 ${
                    req.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {req.status === 'PENDING' ? (
                    <Clock className="w-3 h-3 mr-1" />
                  ) : req.status === 'APPROVED' ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {t(`orders.cancellation.status.${req.status}`)}
                </span>
              </div>
            </div>

            {req.status === 'PENDING' && (
              <div className="flex items-center space-x-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-xs border border-amber-200">
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                <span>
                  {t('orders.cancellation.slaRemaining').replace(
                    '{time}',
                    formatSlaRemaining(req.createdAt, isTh),
                  )}
                </span>
              </div>
            )}

            <div className="text-xs space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-stone-500 font-semibold">
                  {t('orders.cancellation.reason')}:
                </span>
                <span className="text-stone-800 font-medium">{req.reason}</span>
              </div>
              {req.customerNote && (
                <div className="flex items-baseline space-x-2">
                  <span className="text-stone-500 font-semibold">
                    {t('orders.cancellation.customerNote')}:
                  </span>
                  <span className="text-stone-700 italic">
                    {req.customerNote}
                  </span>
                </div>
              )}
              {req.adminNote && (
                <div className="flex items-baseline space-x-2">
                  <span className="text-stone-500 font-semibold">
                    {t('orders.cancellation.adminNote')}:
                  </span>
                  <span className="text-stone-700">{req.adminNote}</span>
                </div>
              )}
            </div>

            {req.status === 'PENDING' && (
              <div className="pt-2 border-t border-brand-border/60">
                {activeReview?.id === req.id ? (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block">
                        {activeReview.action === 'APPROVE'
                          ? t('orders.cancellation.approveNoteLabel')
                          : t('orders.cancellation.rejectNoteLabel')}
                      </label>
                      <input
                        type="text"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder={t('orders.cancellation.notePlaceholder')}
                        className="w-full px-3 py-1.5 border border-brand-border rounded-xs text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
                      />
                    </div>

                    {activeReview.action === 'APPROVE' && (
                      <label className="flex items-center space-x-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={restockInventory}
                          onChange={(e) => setRestockInventory(e.target.checked)}
                          className="w-3.5 h-3.5 text-brand-dark-brown border-brand-border rounded-xs focus:ring-brand-dark-brown"
                        />
                        <span className="text-stone-700 font-medium">
                          {t('orders.refund.restockCheckbox')}
                        </span>
                      </label>
                    )}

                    <div className="flex space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveReview(null)}
                        disabled={processingId === req.id}
                        className="px-3 py-1 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmReview}
                        disabled={processingId === req.id}
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-xs transition-colors cursor-pointer ${
                          activeReview.action === 'APPROVE'
                            ? 'bg-emerald-700 hover:bg-emerald-800'
                            : 'bg-rose-700 hover:bg-rose-800'
                        }`}
                      >
                        {processingId === req.id
                          ? t('orders.refund.processing')
                          : t('orders.cancellation.confirmAction')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReview({ id: req.id, action: 'REJECT' });
                        setAdminNote('');
                      }}
                      className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                    >
                      {t('orders.cancellation.rejectButton')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReview({ id: req.id, action: 'APPROVE' });
                        setAdminNote('');
                      }}
                      className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                    >
                      {t('orders.cancellation.approveButton')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
