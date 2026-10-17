'use client';

import React, { useState } from 'react';
import { X, CreditCard, QrCode, Loader2, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PaymentMethod } from '@repo/types';

interface ChangePaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMethod: PaymentMethod;
  orderNumber: string;
  totalAmount: number;
  onConfirmChange: (newMethod: PaymentMethod) => Promise<void>;
  isUpdating: boolean;
  error?: string | null;
}

export function ChangePaymentMethodModal({
  isOpen,
  onClose,
  currentMethod,
  orderNumber,
  totalAmount,
  onConfirmChange,
  isUpdating,
  error,
}: ChangePaymentMethodModalProps) {
  const { language } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(currentMethod);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === currentMethod) {
      onClose();
      return;
    }
    await onConfirmChange(selectedMethod);
  };

  const methods = [
    {
      id: PaymentMethod.CREDIT_CARD,
      title: language === 'th' ? 'บัตรเครดิต / เดบิต' : 'Credit / Debit Card',
      desc:
        language === 'th'
          ? 'Visa, Mastercard, JCB (ระบบ Omise Vault เข้ารหัส 256-bit)'
          : 'Visa, Mastercard, JCB (256-bit Omise Vault encryption)',
      icon: CreditCard,
    },
    {
      id: PaymentMethod.PROMPTPAY,
      title: 'PromptPay QR Code',
      desc:
        language === 'th'
          ? 'สแกนจ่ายผ่าน Mobile Banking ได้ทุกธนาคารในไทย'
          : 'Scan and pay via any Thai Mobile Banking app',
      icon: QrCode,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-brand-border shadow-2xl rounded-xs overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50/70">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
              {language === 'th' ? 'เปลี่ยนช่องทางการชำระเงิน' : 'Change Payment Method'}
            </h3>
            <p className="text-[11px] text-stone-500 font-mono mt-0.5">
              #{orderNumber} • ฿{Number(totalAmount).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            disabled={isUpdating}
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-stone-600">
            {language === 'th'
              ? 'เลือกช่องทางการชำระเงินใหม่ที่คุณต้องการใช้สำหรับคำสั่งซื้อนี้:'
              : 'Select your preferred payment method for this order:'}
          </p>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            {methods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              const isCurrent = currentMethod === method.id;

              return (
                <div
                  key={method.id}
                  onClick={() => !isUpdating && setSelectedMethod(method.id)}
                  className={`p-4 border transition-all cursor-pointer flex items-start space-x-3.5 relative ${
                    isSelected
                      ? 'border-brand-brown bg-brand-warm-cream/30 shadow-xs'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-brand-brown bg-brand-brown text-white'
                        : 'border-stone-300 bg-stone-100 text-stone-600'
                    }`}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-stone-900">
                        {method.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-2xs">
                          {language === 'th' ? 'ช่องทางปัจจุบัน' : 'Current'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                      {method.desc}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-brand-brown text-white flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              disabled={isUpdating}
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              {language === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isUpdating || selectedMethod === currentMethod}
              className="px-5 py-2.5 bg-brand-brown hover:bg-brand-dark-brown disabled:bg-stone-300 text-white text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-2 cursor-pointer shadow-xs disabled:cursor-not-allowed"
            >
              {isUpdating && <Loader2 size={14} className="animate-spin" />}
              <span>
                {language === 'th' ? 'ยืนยันการเปลี่ยน' : 'Confirm Change'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
