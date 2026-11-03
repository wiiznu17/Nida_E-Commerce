import React from 'react';
import type { OrderTaxInvoiceProps } from './printTypes';
import { NIDA_SENDER_INFO } from './printConstants';

export const OrderTaxInvoice: React.FC<OrderTaxInvoiceProps> = ({ order }) => {
  const taxInvoice = order.taxInvoice;
  const isCompany = taxInvoice?.payerType === 'COMPANY';

  const buyerName =
    taxInvoice?.name ||
    order.shippingAddress?.recipientName ||
    'Valued Customer';
  const buyerTaxId = taxInvoice?.taxId || '-';
  const buyerAddress =
    taxInvoice?.address ||
    [
      order.shippingAddress?.addressLine1,
      order.shippingAddress?.addressLine2,
      order.shippingAddress?.subdistrict,
      order.shippingAddress?.district,
      order.shippingAddress?.province,
      order.shippingAddress?.postalCode,
    ]
      .filter(Boolean)
      .join(' ') ||
    '-';

  const branchText = isCompany
    ? taxInvoice?.branchType === 'BRANCH'
      ? `สาขาที่ ${taxInvoice.branchCode || '-'}`
      : 'สำนักงานใหญ่ (00000)'
    : null;

  const totalAmount = Number(order.totalAmount ?? 0);
  const subtotal = Number(order.subtotal ?? 0);
  const discount = Number(order.discountTotal ?? 0);
  const shippingFee = Number(order.shippingFee ?? 0);

  const preVatAmount =
    taxInvoice?.preVatAmount !== undefined
      ? Number(taxInvoice.preVatAmount)
      : Math.round((totalAmount / 1.07) * 100) / 100;

  const vatAmount =
    taxInvoice?.vatAmount !== undefined
      ? Number(taxInvoice.vatAmount)
      : Math.round((totalAmount - preVatAmount) * 100) / 100;

  const invoiceNumber = taxInvoice?.invoiceNumber || `INV-PENDING`;
  const issuedDate = taxInvoice?.issuedAt
    ? new Date(taxInvoice.issuedAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(order.placedAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div className="w-full max-w-[210mm] bg-white text-black p-8 font-sans mx-auto text-xs border border-gray-200 shadow-xs print:border-none print:shadow-none print:p-6 print:m-0 print:w-full print:max-w-none print:break-after-page">
      {/* Header & Seller Info */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-black">
        <div className="max-w-[60%]">
          <h1 className="font-serif font-black tracking-widest text-2xl uppercase">
            {NIDA_SENDER_INFO.brandName}
          </h1>
          <p className="text-[10px] tracking-wider uppercase font-semibold text-black/70 mt-0.5">
            Haute Couture & Modern Apparel
          </p>
          <div className="text-[11px] text-black/80 mt-2 leading-relaxed">
            <span className="font-bold">
              บริษัท นิ ดา แบรนด์ จำกัด (NIDA BRAND CO., LTD.)
            </span>
            <br />
            {NIDA_SENDER_INFO.addressLine1}, แขวงคลองตัน เขตคลองเตย
            กรุงเทพมหานคร {NIDA_SENDER_INFO.postalCode}
            <br />
            <span className="font-semibold">
              เลขประจำตัวผู้เสียภาษีอากร (Tax ID):
            </span>{' '}
            <span className="font-mono font-bold">0105566088888</span>{' '}
            (สำนักงานใหญ่)
            <br />
            โทร: {NIDA_SENDER_INFO.phone} | อีเมล: {NIDA_SENDER_INFO.email}
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="inline-block bg-black text-white px-3 py-1 font-black text-xs uppercase tracking-widest mb-1 text-center">
            ใบกำกับภาษี / ใบเสร็จรับเงิน
            <div className="text-[9px] font-normal tracking-wider opacity-90">
              TAX INVOICE / RECEIPT (ต้นฉบับ / ORIGINAL)
            </div>
          </div>
          <div className="font-mono text-xs font-black text-black mt-2">
            เลขที่ / No.:{' '}
            <span className="text-sm font-bold">{invoiceNumber}</span>
          </div>
          <div className="text-[11px] text-black/80 mt-1">
            วันที่ / Date: <span className="font-medium">{issuedDate}</span>
          </div>
          <div className="text-[11px] text-black/60 font-mono mt-0.5">
            อ้างอิงออเดอร์: #{order.orderNumber}
          </div>
        </div>
      </div>

      {/* Buyer Information Section */}
      <div className="my-5 p-4 border border-black/20 bg-[#FAF7F2] text-xs">
        <div className="font-black text-[10px] uppercase tracking-wider text-black/60 mb-2">
          ข้อมูลลูกค้า / CUSTOMER DETAILS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex gap-2">
              <span className="font-semibold text-black/70 w-24 shrink-0">
                ชื่อผู้ซื้อ / Name:
              </span>
              <span className="font-bold text-black">{buyerName}</span>
            </div>
            <div className="flex gap-2 mt-1">
              <span className="font-semibold text-black/70 w-24 shrink-0">
                เลขผู้เสียภาษี:
              </span>
              <span className="font-mono font-bold text-black">
                {buyerTaxId}
              </span>
            </div>
            {branchText && (
              <div className="flex gap-2 mt-1">
                <span className="font-semibold text-black/70 w-24 shrink-0">
                  สาขา / Branch:
                </span>
                <span className="font-medium text-black">{branchText}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex gap-2">
              <span className="font-semibold text-black/70 w-24 shrink-0">
                ที่อยู่ / Address:
              </span>
              <span className="text-black/90 leading-relaxed">
                {buyerAddress}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="mt-4 border border-black">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-black text-white font-black text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-12 text-center">ลำดับ</th>
              <th className="py-2.5 px-3">รายการสินค้า / Description</th>
              <th className="py-2.5 px-3 w-28 text-center">รหัสสินค้า (SKU)</th>
              <th className="py-2.5 px-3 w-16 text-center">จำนวน</th>
              <th className="py-2.5 px-3 w-24 text-right">ราคาต่อหน่วย</th>
              <th className="py-2.5 px-3 w-24 text-right">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {order.items.map((item, idx) => {
              const itemPrice = Number(item.unitPrice ?? 0);
              const qty = Number(item.quantity ?? 1);
              const itemTotal = Number(item.subtotal ?? itemPrice * qty);
              const sku =
                item.skuCodeSnapshot || item.skuCode || item.id.slice(0, 8);

              return (
                <tr key={item.id || idx} className="hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 text-center font-mono text-black/60">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-medium">
                    <div>{item.productName}</div>
                    <div className="text-[10px] text-black/60">
                      {item.variantInfo}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-[11px] text-black/70">
                    {sku}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">{qty}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    ฿
                    {itemPrice.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">
                    ฿
                    {itemTotal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Summary & VAT Breakdown */}
      <div className="grid grid-cols-2 gap-6 mt-4">
        {/* Remarks & Legal Notes */}
        <div className="p-3 border border-black/15 bg-gray-50 text-[10px] text-black/70 flex flex-col justify-between">
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1 text-black">
              หมายเหตุ / Remarks:
            </span>
            <p className="leading-relaxed">
              1. สินค้ารวมภาษีมูลค่าเพิ่ม 7% ตามประมวลรัษฎากรแห่งประเทศไทย
              <br />
              2.
              เอกสารนี้ถือเป็นใบเสร็จรับเงินเมื่อได้รับการชำระเงินเรียบร้อยแล้ว
              <br />
              3. กรณีมีข้อสงสัยหรือต้องการสอบถาม กรุณาติดต่อ ฝ่ายบริการลูกค้า
              NIDA
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-black/10 flex justify-between font-mono text-[10px] text-black/50">
            <span>ISSUED AUTOMATICALLY BY NIDA SYSTEM</span>
            <span>PAGE 1 OF 1</span>
          </div>
        </div>

        {/* Calculation Box */}
        <div className="border border-black p-3 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-black/70">
            <span>รวมมูลค่าสินค้า (Subtotal):</span>
            <span>
              ฿{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>ส่วนลด (Discount):</span>
              <span>
                -฿
                {discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {shippingFee > 0 ? (
            <div className="flex justify-between text-black/70">
              <span>ค่าจัดส่ง (Shipping Fee):</span>
              <span>
                ฿
                {shippingFee.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          ) : (
            <div className="flex justify-between text-black/70">
              <span>ค่าจัดส่ง (Shipping Fee):</span>
              <span className="text-emerald-700 font-semibold">ฟรี (Free)</span>
            </div>
          )}

          <div className="pt-2 border-t border-black/20 flex justify-between text-black/80 font-bold">
            <span>มูลค่าก่อนภาษีมูลค่าเพิ่ม (Pre-VAT Base):</span>
            <span>
              ฿
              {preVatAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between text-black/80 font-bold">
            <span>ภาษีมูลค่าเพิ่ม 7% (VAT Amount):</span>
            <span>
              ฿{vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-2 border-t-2 border-black flex justify-between text-sm font-black text-black">
            <span className="uppercase">จำนวนเงินรวมทั้งสิ้น (Total Net):</span>
            <span className="text-base text-black font-serif">
              ฿
              {totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-10 mt-10 pt-4 text-center text-xs">
        <div>
          <div className="border-b border-black/40 h-10 w-48 mx-auto" />
          <p className="mt-2 text-[11px] font-semibold text-black/80">
            ผู้รับสินค้า / บริการ (Received by)
          </p>
          <p className="text-[10px] text-black/50">
            วันที่: _____/_____/__________
          </p>
        </div>

        <div>
          <div className="border-b border-black/40 h-10 w-48 mx-auto" />
          <p className="mt-2 text-[11px] font-semibold text-black/80">
            ผู้มีอำนาจลงนาม (Authorized Signature)
          </p>
          <p className="text-[10px] text-black/50">
            ในนาม บริษัท นิ ดา แบรนด์ จำกัด
          </p>
        </div>
      </div>
    </div>
  );
};
