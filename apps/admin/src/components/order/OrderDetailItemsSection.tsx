import { Package } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { ApiOrderItem } from '@repo/types';

export interface OrderDetailItemsSectionProps {
  items: ApiOrderItem[];
  totalAmount: number;
}

export function OrderDetailItemsSection({
  items = [],
  totalAmount,
}: OrderDetailItemsSectionProps) {
  const { t } = useLanguage();

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 1), 0);

  return (
    <div
      id="sec-items"
      className="bg-white border border-brand-border rounded-md shadow-2xs overflow-hidden flex flex-col justify-between h-full"
    >
      <div>
        {/* Header */}
        <div className="p-4 bg-brand-cream border-b border-brand-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown">
              {t('orders.detail.itemsTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t('orders.detail.itemsSubtitle').replace('{count}', String(items.length))}
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-gray-500">
            {items.reduce((acc, i) => acc + (i.quantity ?? 1), 0)} {t('orders.detail.pieces')}
          </span>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] font-black uppercase tracking-wider text-gray-500">
                <th className="py-2.5 px-4 w-16 text-center">{t('orders.detail.tableImage')}</th>
                <th className="py-2.5 px-4 min-w-[180px]">{t('orders.detail.tableProductVariant')}</th>
                <th className="py-2.5 px-4 w-28 text-right">{t('orders.detail.tableUnitPrice')}</th>
                <th className="py-2.5 px-4 w-20 text-center">{t('orders.detail.tableQuantity')}</th>
                <th className="py-2.5 px-4 w-28 text-right">{t('orders.detail.tableLineTotal')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-brand-cream/30 transition-colors">
                  {/* Image */}
                  <td className="py-3 px-4 text-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-14 object-cover border border-gray-200 rounded-2xs inline-block"
                      />
                    ) : (
                      <div className="w-12 h-14 bg-gray-100 border border-gray-200 rounded-2xs flex items-center justify-center text-gray-400 inline-flex">
                        <Package size={16} />
                      </div>
                    )}
                  </td>

                  {/* Title & Variant */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-brand-brown text-sm line-clamp-1">
                      {item.productName}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold bg-brand-cream border border-brand-border text-brand-brown">
                        {item.variantInfo || 'Standard'}
                      </span>
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-700">
                    ${(item.unitPrice ?? 0).toFixed(2)}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-brand-brown">
                    x{item.quantity}
                  </td>

                  {/* Line Total */}
                  <td className="py-3 px-4 text-right font-mono font-black text-brand-brown text-sm">
                    ${((item.unitPrice ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Breakdown Card */}
      <div className="border-t border-brand-border bg-brand-cream/40 p-4">
        <div className="max-w-xs ml-auto space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-gray-600">
            <span>{t('orders.detail.subtotal')}</span>
            <span className="font-mono font-bold text-gray-800">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-gray-600">
            <span>{t('orders.detail.shippingFee')}</span>
            <span className="text-emerald-700 font-bold">{t('orders.detail.freeShipping')}</span>
          </div>

          <div className="pt-2 border-t border-brand-border flex justify-between items-baseline">
            <span className="font-black uppercase tracking-wider text-brand-brown text-xs">
              {t('orders.detail.grandTotal')}
            </span>
            <span className="font-mono font-black text-xl text-brand-brown">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
