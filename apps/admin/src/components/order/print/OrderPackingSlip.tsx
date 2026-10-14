import React from 'react';
import type { OrderPackingSlipProps } from './printTypes';
import { NIDA_SENDER_INFO, PACKING_POLICY_NOTES } from './printConstants';
import { OrderBarcode } from './OrderBarcode';

export const OrderPackingSlip: React.FC<OrderPackingSlipProps> = ({ order }) => {
  const courier = order.shipments?.[0]?.courierName || 'Kerry Express';

  const subtotal = (order.items ?? []).reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 1),
    0,
  );

  return (
    <div className="w-full max-w-[210mm] bg-white text-black p-8 font-sans mx-auto text-xs border border-gray-200 shadow-xs print:border-none print:shadow-none print:p-6 print:m-0 print:w-full print:max-w-none print:break-after-page">
      {/* Header */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-black">
        <div>
          <h1 className="font-serif font-black tracking-widest text-2xl uppercase">
            {NIDA_SENDER_INFO.brandName}
          </h1>
          <p className="text-[10px] tracking-wider uppercase font-semibold text-black/70 mt-0.5">
            Haute Couture & Modern Apparel
          </p>
          <div className="text-[10px] text-black/70 mt-2 leading-relaxed">
            {NIDA_SENDER_INFO.companyName}<br />
            {NIDA_SENDER_INFO.addressLine1}, {NIDA_SENDER_INFO.province} {NIDA_SENDER_INFO.postalCode}<br />
            Tel: {NIDA_SENDER_INFO.phone} | Email: {NIDA_SENDER_INFO.email}
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="inline-block bg-black text-white px-3 py-1 font-black text-xs uppercase tracking-widest mb-2">
            PACKING SLIP / ใบจัดส่งสินค้า
          </div>
          <div className="font-mono text-sm font-black text-black">
            #{order.orderNumber}
          </div>
          <div className="text-[11px] text-black/70 font-mono mt-1">
            Date: {new Date(order.placedAt).toLocaleDateString('th-TH')}
          </div>
          <div className="mt-2">
            <OrderBarcode value={order.orderNumber} height={36} showText={false} />
          </div>
        </div>
      </div>

      {/* Recipient & Shipping Info */}
      <div className="grid grid-cols-2 gap-6 py-6 border-b border-black/20 text-xs">
        <div>
          <h3 className="font-black text-[10px] uppercase tracking-wider text-black/60 mb-1.5">
            DELIVER TO / ข้อมูลผู้รับพัสดุ
          </h3>
          <p className="font-bold text-sm text-black">{order.shippingAddress?.recipientName || 'Valued Customer'}</p>
          <p className="text-black/80 mt-1 leading-relaxed">
            {order.shippingAddress?.addressLine1 || '-'}<br />
            {order.shippingAddress?.province || '-'} {order.shippingAddress?.postalCode || '-'}
          </p>
          <p className="font-mono text-xs text-black/80 mt-1.5">
            Phone: {order.shippingAddress?.phone || '-'}
          </p>
        </div>

        <div className="bg-[#FAF7F2] p-4 border border-[#EAE3D9] flex flex-col justify-between">
          <div>
            <h3 className="font-black text-[10px] uppercase tracking-wider text-black/60 mb-2">
              DISPATCH DETAILS / รายละเอียดการจัดส่ง
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-black/60">Courier / ผู้ให้บริการ:</span>
                <span className="font-bold">{courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Tracking No. / เลขพัสดุ:</span>
                <span className="font-mono font-bold">{order.shipments?.[0]?.trackingNumber || 'Pending Dispatch'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Payment Method / การชำระ:</span>
                <span className="font-semibold uppercase">{order.payment?.paymentMethod || 'CREDIT_CARD'}</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#EAE3D9] flex justify-between items-center text-[11px]">
            <span className="font-black uppercase tracking-wider text-black/60">Status:</span>
            <span className="font-black text-black bg-white px-2 py-0.5 border border-black/20">
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="py-6">
        <h3 className="font-black text-[10px] uppercase tracking-wider text-black/60 mb-3">
          ORDER ITEMS / รายการสินค้าในบรรจุภัณฑ์
        </h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-wider">
              <th className="py-2 w-12 text-center">#</th>
              <th className="py-2">ITEM DESCRIPTION / รายละเอียดสินค้า</th>
              <th className="py-2 text-center w-36">VARIANT / ตัวเลือก</th>
              <th className="py-2 text-center w-16">QTY / จำนวน</th>
              <th className="py-2 text-right w-28">PRICE / ราคา</th>
              <th className="py-2 text-right w-28">AMOUNT / รวม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 text-xs">
            {(order.items ?? []).map((item, index) => {
              const itemTotal = (item.unitPrice ?? 0) * (item.quantity ?? 1);
              return (
                <tr key={index}>
                  <td className="py-3 text-center font-mono text-black/50">
                    {index + 1}
                  </td>
                  <td className="py-3 pr-2">
                    <div className="font-bold text-black">{item.productName}</div>
                    <div className="text-[10px] font-mono text-black/50">
                      SKU: {item.id.slice(0, 8).toUpperCase()}
                    </div>
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-black/80">
                    {item.variantInfo || 'Standard'}
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-sm">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right font-mono">
                    ${(item.unitPrice ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono font-bold">
                    ${itemTotal.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-end pt-2 pb-6 border-t-2 border-black">
        <div className="w-64 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-black/60">Subtotal / ยอดรวมสินค้า:</span>
            <span className="font-mono font-semibold">฿{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/60">Shipping / ค่าจัดส่ง:</span>
            <span className="font-mono text-emerald-700 font-semibold">
              {order.totalAmount > subtotal ? `฿${(order.totalAmount - subtotal).toLocaleString()}` : 'FREE'}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-black/20 text-sm font-black">
            <span>Total Paid / ยอดชำระสุทธิ:</span>
            <span className="font-mono">฿{(order.totalAmount ?? subtotal).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes & Policy */}
      <div className="p-4 bg-[#FAF7F2] border border-[#EAE3D9] text-[10px] text-black/70 leading-relaxed mt-4">
        <div className="font-black uppercase tracking-wider text-black mb-1">
          NIDA RETURN & EXCHANGE POLICY / นโยบายการเปลี่ยนสินค้า
        </div>
        <p className="mb-1">{PACKING_POLICY_NOTES.th}</p>
        <p className="italic">{PACKING_POLICY_NOTES.en}</p>
      </div>

      <div className="mt-8 text-center text-[10px] text-black/40 uppercase tracking-widest font-black">
        Thank you for choosing NIDA. Crafted with timeless sophistication.
      </div>
    </div>
  );
};
