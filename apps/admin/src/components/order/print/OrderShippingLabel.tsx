import React from 'react';
import type { OrderShippingLabelProps } from './printTypes';
import { NIDA_SENDER_INFO } from './printConstants';
import { OrderBarcode } from './OrderBarcode';
import { useLanguage } from '../../../context/LanguageContext';

export const OrderShippingLabel: React.FC<OrderShippingLabelProps> = ({ order }) => {
  const { t } = useLanguage();
  const trackingCode = order.trackingNumber || `NIDA-${order.orderNumber}`;
  const courier = order.courierName || 'Kerry Express';

  const totalQuantity = (order.items ?? []).reduce(
    (sum, item) => sum + (item.quantity ?? 1),
    0,
  );

  return (
    <div className="w-[100mm] min-h-[150mm] max-w-[100mm] bg-white text-black p-3.5 border-2 border-black font-sans mx-auto text-xs leading-tight print:border-black print:p-2 print:m-0 print:w-full print:max-w-none print:break-after-page">
      {/* Header: Carrier & Brand */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-black">
        <div className="flex flex-col">
          <span className="font-serif font-black tracking-widest text-lg uppercase leading-none">
            {NIDA_SENDER_INFO.brandName}
          </span>
          <span className="text-[9px] tracking-wider uppercase font-semibold text-black/70">
            Luxury Apparel Express
          </span>
        </div>
        <div className="text-right">
          <span className="inline-block border-2 border-black px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-black text-white">
            {courier}
          </span>
        </div>
      </div>

      {/* Primary Barcode & Tracking */}
      <div className="py-2.5 border-b-2 border-black text-center">
        <OrderBarcode value={trackingCode} height={46} showText={false} />
        <div className="mt-1 font-mono font-black text-base tracking-widest uppercase">
          {trackingCode}
        </div>
      </div>

      {/* Recipient Section (Large & Prominent) */}
      <div className="py-2.5 border-b-2 border-black">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-1.5 py-0.5">
            TO / ผู้รับ
          </span>
          <span className="text-xs font-mono font-black">{order.customerPhone}</span>
        </div>
        <div className="text-sm font-bold text-black mb-1">
          {order.customerName}
        </div>
        <div className="text-xs text-black leading-snug">
          {order.shippingAddress}
        </div>
        <div className="flex items-end justify-between mt-2 pt-1">
          <div className="text-xs font-semibold">
            {order.city}
          </div>
          <div className="border-2 border-black px-2 py-0.5 font-mono text-lg font-black tracking-wider">
            {order.postalCode}
          </div>
        </div>
      </div>

      {/* Sender Section */}
      <div className="py-2 border-b border-black text-[10px] leading-tight">
        <div className="font-black uppercase tracking-wider mb-0.5">
          FROM / ผู้ส่ง: {NIDA_SENDER_INFO.companyName}
        </div>
        <div className="text-black/80">
          {NIDA_SENDER_INFO.warehouseName}, {NIDA_SENDER_INFO.addressLine1}, {NIDA_SENDER_INFO.district}, {NIDA_SENDER_INFO.province} {NIDA_SENDER_INFO.postalCode} | โทร. {NIDA_SENDER_INFO.phone}
        </div>
      </div>

      {/* Order Meta & Inspection Summary */}
      <div className="pt-2">
        <div className="flex items-center justify-between font-mono text-[10px] font-bold pb-1.5 border-b border-dashed border-black/50">
          <span>ORDER: #{order.orderNumber}</span>
          <span>ITEMS: {totalQuantity} PCS</span>
        </div>

        {/* Itemized Mini Manifest */}
        <div className="mt-1.5 space-y-1">
          {(order.items ?? []).slice(0, 4).map((item, index) => (
            <div key={index} className="flex justify-between text-[10px] font-mono">
              <span className="truncate max-w-[200px]">
                • {item.productName} ({item.size})
              </span>
              <span className="font-bold shrink-0">x{item.quantity}</span>
            </div>
          ))}
          {(order.items ?? []).length > 4 && (
            <div className="text-[9px] italic text-black/70">
              {t('orders.print.moreItems').replace(
                '{count}',
                String((order.items ?? []).length - 4),
              )}
            </div>
          )}
        </div>
      </div>

      {/* Signature & Date Footer */}
      <div className="mt-3 pt-2 border-t border-black flex justify-between text-[9px] text-black/80 font-mono">
        <span>DATE: {new Date(order.createdAt).toLocaleDateString('th-TH')}</span>
        <span>SIGNATURE: ____________________</span>
      </div>
    </div>
  );
};
