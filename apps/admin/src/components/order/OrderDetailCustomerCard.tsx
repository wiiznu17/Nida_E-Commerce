import { MapPin, CreditCard, Mail, Phone, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { ApiOrderAddress, ApiPaymentSummary, OrderStatus } from '@repo/types';

export interface OrderDetailCustomerCardProps {
  shippingAddress?: ApiOrderAddress;
  payment?: ApiPaymentSummary;
  status: OrderStatus;
  customerEmail?: string;
}

export function OrderDetailCustomerCard({
  shippingAddress,
  payment,
  status,
  customerEmail = 'customer@nida.com',
}: OrderDetailCustomerCardProps) {
  const { t } = useLanguage();
  const recipientName = shippingAddress?.recipientName ?? 'Valued Customer';
  const phone = shippingAddress?.phone ?? '-';
  const addressLine1 = shippingAddress?.addressLine1 ?? '-';
  const province = shippingAddress?.province ?? '-';
  const postalCode = shippingAddress?.postalCode ?? '-';
  const paymentMethod = payment?.paymentMethod ?? 'CREDIT_CARD';

  return (
    <div
      id="sec-customer"
      className="bg-white border border-brand-border rounded-md shadow-2xs overflow-hidden flex flex-col justify-between h-full"
    >
      <div>
        {/* Header */}
        <div className="p-4 bg-brand-cream border-b border-brand-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown">
              {t('orders.detail.customerTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t('orders.detail.customerSubtitle')}
            </p>
          </div>
          <User size={16} className="text-brand-amber" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Customer & Contact */}
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xs space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-brand-brown text-white flex items-center justify-center font-black text-xs">
                {recipientName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-brand-brown text-sm">{recipientName}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {t('orders.detail.recipient')}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/80 space-y-1.5 text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail size={13} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{customerEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={13} className="text-gray-400 flex-shrink-0" />
                <span className="font-mono">{phone}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xs space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center mb-1.5">
              <MapPin size={12} className="mr-1 text-brand-amber" />
              <span>{t('orders.detail.deliveryAddress')}</span>
            </div>
            <p className="font-bold text-brand-brown">{addressLine1}</p>
            <p className="text-gray-600">
              {province} {postalCode}
            </p>
          </div>

          {/* Payment Info */}
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xs space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center mb-1.5">
              <CreditCard size={12} className="mr-1 text-brand-amber" />
              <span>{t('orders.detail.paymentInfo')}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">{t('orders.detail.paymentMethod')}</span>
              <strong className="text-brand-brown">{paymentMethod}</strong>
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-gray-600">{t('orders.detail.transactionStatus')}</span>
              <span
                className={`font-black text-[10px] uppercase px-1.5 py-0.5 rounded-2xs ${
                  status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {status === 'CANCELLED'
                  ? t('orders.detail.paymentCancelled')
                  : t('orders.detail.paymentCaptured')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
