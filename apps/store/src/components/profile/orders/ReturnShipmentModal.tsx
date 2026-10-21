'use client';

import React, { useState } from 'react';
import { X, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api/requester/orderRequester';
import { DropdownSelect, DropdownOption } from '@/components/ui';
import type { ApiOrder, ApiReturnRequest } from '@repo/types';

interface ReturnShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  returnRequest: ApiReturnRequest;
  onSuccess: (updatedOrder: ApiOrder) => void;
}

const COMMON_COURIERS = [
  'Flash Express',
  'Kerry Express',
  'ไปรษณีย์ไทย (Thailand Post EMS)',
  'J&T Express',
  'Ninja Van',
  'DHL Express',
  'Other',
];

const COURIER_OPTIONS: DropdownOption[] = COMMON_COURIERS.map((c) => ({
  id: c,
  label: c,
}));

export function ReturnShipmentModal({
  isOpen,
  onClose,
  orderNumber,
  returnRequest,
  onSuccess,
}: ReturnShipmentModalProps) {
  const { t, isTh } = useLanguage();
  const { token } = useAuth();

  const [courierSelect, setCourierSelect] = useState('Flash Express');
  const [customCourier, setCustomCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingFee, setShippingFee] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const resolvedCarrier =
      courierSelect === 'Other' ? customCourier.trim() : courierSelect;

    if (!resolvedCarrier) {
      setError(
        isTh ? 'กรุณาระบุชื่อบริษัทขนส่ง' : 'Please provide courier name',
      );
      return;
    }

    if (!trackingNumber.trim()) {
      setError(
        isTh
          ? 'กรุณาระบุหมายเลขพัสดุส่งคืน'
          : 'Please provide return tracking number',
      );
      return;
    }

    const parsedFee = shippingFee.trim() ? parseFloat(shippingFee) : undefined;
    if (parsedFee !== undefined && (isNaN(parsedFee) || parsedFee < 0)) {
      setError(
        isTh
          ? 'กรุณาระบุค่าจัดส่งเป็นตัวเลขที่ถูกต้อง'
          : 'Please enter a valid shipping fee amount',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedOrder = await orderRequester.submitReturnShipment(
        orderNumber,
        returnRequest.id,
        {
          returnCarrier: resolvedCarrier,
          returnTrackingNumber: trackingNumber.trim(),
          returnShippingFee: parsedFee,
          returnShippingReceiptUrl: receiptUrl.trim() || undefined,
        },
        token,
      );
      onSuccess(updatedOrder);
      onClose();
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : isTh
            ? 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการส่งคืน'
            : 'Failed to submit return shipment details';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1810]/50 backdrop-blur-xs font-sans">
      <div className="bg-white border border-brand-border max-w-lg w-full p-6 shadow-2xl relative rounded-xs space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-stone-200">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-amber block">
              {t('orderDetail.returnCard.submitModalTitle')}
            </span>
            <h3 className="text-sm font-bold text-stone-900 mt-0.5">
              {returnRequest.requestNumber}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs flex items-center space-x-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Policy Guidance Card */}
        <div className="p-3 rounded-xs border border-blue-200/80 bg-blue-50/70 text-blue-900 text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[10px]">
            <Truck size={13} className="text-blue-700" />
            <span>
              {isTh ? 'นโยบายการจัดส่งสินค้าคืน' : 'Return Shipping Policy'}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {t('orderDetail.returnCard.shippingCoverNotice')}
          </p>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Courier Selection */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-700">
              {t('orderDetail.returnCard.courierLabel')} *
            </label>
            <DropdownSelect
              value={courierSelect}
              onChange={(val) => setCourierSelect(val)}
              options={COURIER_OPTIONS}
              className="w-full"
              buttonClassName="normal-case font-medium text-xs font-sans tracking-normal"
            />
            {courierSelect === 'Other' && (
              <input
                type="text"
                value={customCourier}
                onChange={(e) => setCustomCourier(e.target.value)}
                placeholder={
                  isTh
                    ? 'ระบุชื่อผู้ให้บริการขนส่ง'
                    : 'Specify courier company name'
                }
                className="w-full mt-2 px-3 py-2 border border-brand-border rounded-xs text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
                required
              />
            )}
          </div>

          {/* Tracking Number Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-700">
              {t('orderDetail.returnCard.trackingLabel')} *
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              placeholder="e.g. TH0123456789"
              className="w-full px-3 py-2 border border-brand-border rounded-xs font-mono font-bold text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
              required
            />
          </div>

          {/* Shipping Fee */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-700">
              {t('orderDetail.returnCard.shippingFeeLabel')}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-brand-border rounded-xs font-mono font-bold text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
            />
            <span className="text-[10px] text-stone-500 block">
              {t('orderDetail.returnCard.shippingFeeHint')}
            </span>
          </div>

          {/* Receipt URL / Slip */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-700">
              {t('orderDetail.returnCard.receiptUrlLabel')}
            </label>
            <input
              type="url"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder={t('orderDetail.returnCard.receiptUrlPlaceholder')}
              className="w-full px-3 py-2 border border-brand-border rounded-xs text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#2B1810] hover:bg-[#3D2317] text-white rounded-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
            >
              <CheckCircle2 size={14} />
              <span>
                {isSubmitting
                  ? t('orders.refund.processing')
                  : t('orderDetail.returnCard.submitShipmentBtn')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
