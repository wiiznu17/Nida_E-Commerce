'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CreditCardFormProps {
  cardName: string;
  setCardName: (val: string) => void;
  cardNumber: string;
  onCardNumberChange: (val: string) => void;
  cardExpiry: string;
  onExpiryChange: (val: string) => void;
  cardCvc: string;
  setCardCvc: (val: string) => void;
}

export function CreditCardForm({
  cardName,
  setCardName,
  cardNumber,
  onCardNumberChange,
  cardExpiry,
  onExpiryChange,
  cardCvc,
  setCardCvc,
}: CreditCardFormProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 text-xs font-sans">
      <div>
        <label className="block text-stone-700 font-bold uppercase tracking-wider text-[10px] mb-1">
          {t('orderDetail.payModal.cardholderLabel')}
        </label>
        <input
          type="text"
          required
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder={t('orderDetail.payModal.cardholderPlaceholder')}
          className="w-full px-3 py-2 border border-brand-border rounded-xs uppercase tracking-wider"
        />
      </div>

      <div>
        <label className="block text-stone-700 font-bold uppercase tracking-wider text-[10px] mb-1">
          {t('orderDetail.payModal.cardNumberLabel')}
        </label>
        <input
          type="text"
          required
          value={cardNumber}
          onChange={(e) => onCardNumberChange(e.target.value)}
          placeholder="4242 •••• •••• 4242"
          className="w-full px-3 py-2 border border-brand-border rounded-xs font-mono font-bold tracking-wider"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-stone-700 font-bold uppercase tracking-wider text-[10px] mb-1">
            {t('orderDetail.payModal.cardExpiryLabel')}
          </label>
          <input
            type="text"
            required
            value={cardExpiry}
            onChange={(e) => onExpiryChange(e.target.value)}
            placeholder="MM/YY"
            className="w-full px-3 py-2 border border-brand-border rounded-xs font-mono font-bold text-center"
          />
        </div>

        <div>
          <label className="block text-stone-700 font-bold uppercase tracking-wider text-[10px] mb-1">
            {t('orderDetail.payModal.cardCvcLabel')}
          </label>
          <input
            type="password"
            maxLength={4}
            required
            value={cardCvc}
            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
            placeholder="•••"
            className="w-full px-3 py-2 border border-brand-border rounded-xs font-mono font-bold text-center"
          />
        </div>
      </div>

      <div className="flex items-center space-x-1.5 text-[11px] text-stone-500 pt-1">
        <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span>{t('orderDetail.payModal.secureNotice')}</span>
      </div>
    </div>
  );
}
