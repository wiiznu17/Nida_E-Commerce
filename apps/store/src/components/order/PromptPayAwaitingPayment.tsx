import React from 'react';
import Image from 'next/image';
import { Loader2, QrCode, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiOrder } from '@repo/types';

interface PromptPayAwaitingPaymentProps {
  order: ApiOrder | null;
  displayOrderNumber: string;
  countdown: number;
  isSimulating: boolean;
  onSimulatePayment: () => void;
}

export function PromptPayAwaitingPayment({
  order,
  displayOrderNumber,
  countdown,
  isSimulating,
  onSimulatePayment,
}: PromptPayAwaitingPaymentProps) {
  const { language, t } = useLanguage();

  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);
  const seconds = countdown % 60;
  const formattedCountdown =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div>
      {/* QR Code Card */}
      <div className="border border-brand-border bg-brand-warm-cream/40 p-6 mb-6 text-center">
        {/* Thai QR Header Banner */}
        <div className="bg-[#113566] text-white py-2 px-4 rounded-t-xs mb-4 inline-block shadow-2xs">
          <span className="text-[11px] font-black uppercase tracking-widest">
            Thai QR Payment • PromptPay
          </span>
        </div>

        {/* Generated QR Code */}
        <div className="w-56 h-56 mx-auto bg-white p-3 border border-gray-300 shadow-2xs mb-3 flex items-center justify-center relative">
          {order?.payment?.qrDownloadUri ? (
            <Image
              src={order.payment.qrDownloadUri}
              alt="PromptPay QR Code"
              width={200}
              height={200}
              unoptimized
              className="w-full h-full object-contain"
            />
          ) : order?.totalAmount ? (
            <Image
              src={`https://promptpay.io/0105567891234/${Number(order.totalAmount).toFixed(2)}.png`}
              alt="PromptPay QR Code"
              width={200}
              height={200}
              unoptimized
              className="w-full h-full object-contain"
            />
          ) : (
            <QrCode size={160} className="text-brand-brown" />
          )}
        </div>

        {/* QR Meta Details */}
        <div className="space-y-1 text-xs">
          <p className="font-mono text-2xl font-black text-brand-brown tracking-tight">
            ฿{Number(order?.totalAmount ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] font-bold text-gray-700">
            {t('orderSuccess.accountName')}
          </p>
          <p className="text-[10px] text-gray-500 font-mono">
            {t('orderSuccess.promptPayId')} • Ref: #{displayOrderNumber}
          </p>
        </div>

        {/* Countdown Badge */}
        <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-center space-x-2 text-xs text-amber-900 font-bold">
          <Clock size={14} className="text-amber-700" />
          <span>
            {countdown > 0
              ? language === 'th'
                ? `กรุณาชำระเงินภายใน ${formattedCountdown}`
                : `Please pay within ${formattedCountdown}`
              : language === 'th'
                ? 'QR Code หมดอายุแล้ว กรุณากดเปลี่ยนช่องทางหรือรีเฟรช'
                : 'QR Code expired. Please refresh or change payment method.'}
          </span>
        </div>
      </div>

      {/* Discrete Dev / Sandbox Badge Tool */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={onSimulatePayment}
          disabled={isSimulating}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono tracking-wider text-gray-500 hover:text-brand-brown hover:border-brand-brown/40 border border-dashed border-gray-300 rounded-xs bg-brand-warm-cream/30 hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
          title="Developer Test Sandbox"
        >
          {isSimulating ? (
            <Loader2 size={11} className="animate-spin text-brand-brown" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          )}
          <span className="font-bold text-gray-600 uppercase">DEV:</span>
          <span>
            {isSimulating ? t('orderSuccess.simulating') : t('orderSuccess.simulatePayment')}
          </span>
        </button>
      </div>
    </div>
  );
}
