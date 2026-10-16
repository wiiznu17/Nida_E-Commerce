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

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div>
      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full mb-4">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <span className="text-[11px] font-bold uppercase tracking-wider">
          {t('orderSuccess.orderPendingStatus')}
        </span>
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tight text-brand-brown mb-1.5">
        {t('orderSuccess.awaitingPromptPay')}
      </h1>
      <p className="text-xs text-gray-600 leading-relaxed mb-6 font-medium">
        {t('orderSuccess.promptPayDesc')}
      </p>

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
          {order?.totalAmount ? (
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
          <p className="font-mono text-xl font-black text-brand-brown tracking-tight">
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
            {language === 'th'
              ? `กรุณาชำระเงินภายใน ${formattedCountdown} นาที`
              : `Please pay within ${formattedCountdown} mins`}
          </span>
        </div>
      </div>

      {/* Listening to Webhook Banner */}
      <div className="mb-6 p-3 bg-brand-warm-cream border border-brand-border flex items-center justify-center space-x-2 text-xs text-gray-700">
        <Loader2 size={14} className="animate-spin text-brand-amber shrink-0" />
        <span className="text-[11px] font-medium">
          {t('orderSuccess.listeningWebhook')}
        </span>
      </div>

      {/* Test Sandbox Simulate Payment Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onSimulatePayment}
          disabled={isSimulating}
          className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-400 text-white py-3 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-2xs flex items-center justify-center space-x-2 cursor-pointer"
        >
          {isSimulating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>{t('orderSuccess.simulating')}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>{t('orderSuccess.simulatePayment')}</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-gray-500 mt-1.5">
          {language === 'th'
            ? '* ปุ่มจำลองสำหรับทดสอบระบบในขั้นตอนพัฒนา โดยจะปรับสถานะเป็น PAID และตัดยอดทันที'
            : '* Sandbox test button to immediately trigger PAID state and verify real-time polling'}
        </p>
      </div>
    </div>
  );
}
