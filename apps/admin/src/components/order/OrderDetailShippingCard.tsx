import { useState } from 'react';
import { Truck, Copy, Check, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface OrderDetailShippingCardProps {
  courierName?: string;
  trackingNumber?: string;
  status: string;
  createdAt: string;
  onOpenFulfill: () => void;
}

export function OrderDetailShippingCard({
  courierName,
  trackingNumber,
  status,
  createdAt,
  onOpenFulfill,
}: OrderDetailShippingCardProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="sec-shipping"
      className="bg-white border border-brand-border rounded-md shadow-2xs overflow-hidden flex flex-col justify-between h-full"
    >
      <div>
        {/* Header */}
        <div className="p-4 bg-brand-cream border-b border-brand-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown">
              {t('orders.detail.shippingTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {language === 'th'
                ? 'ข้อมูลผู้ให้บริการจัดส่งและเลขติดตามสถานะพัสดุ'
                : 'Carrier details and parcel tracking code'}
            </p>
          </div>
          <Truck size={16} className="text-brand-amber" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {trackingNumber ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-brand-cream/60 border border-brand-border rounded-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                    {t('orders.fulfill.trackingNumber')}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-brand-brown hover:text-brand-dark-brown cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700">{language === 'th' ? 'คัดลอกแล้ว' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>{language === 'th' ? 'คัดลอก' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono font-black text-base text-brand-brown">
                  {trackingNumber}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {courierName || 'Kerry Express TH'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    {language === 'th' ? 'สถานะจัดส่ง' : 'Fulfillment Status'}
                  </span>
                  <span className="font-black text-brand-brown mt-0.5 block">
                    {status === 'SHIPPED' || status === 'DELIVERED'
                      ? language === 'th' ? 'ส่งมอบให้ขนส่งแล้ว' : 'Dispatched'
                      : language === 'th' ? 'รอการส่งมอบ' : 'Pending'}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    {language === 'th' ? 'วันที่เริ่มจัดส่ง' : 'Dispatch Date'}
                  </span>
                  <span className="font-mono font-bold text-gray-700 mt-0.5 block truncate">
                    {createdAt}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xs space-y-2">
              <Truck size={24} className="mx-auto text-gray-400" />
              <div className="font-bold text-gray-700">
                {language === 'th' ? 'ยังไม่ได้ระบุหมายเลขพัสดุ' : 'No tracking code assigned yet'}
              </div>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                {language === 'th'
                  ? 'เมื่อเตรียมพัสดุเสร็จสิ้น ให้บันทึกเลขพัสดุเพื่อให้ลูกค้าสามารถติดตามพัสดุได้'
                  : 'Assign carrier tracking number when the order is ready for dispatch.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-brand-cream bg-gray-50/50 flex justify-end">
        <button
          type="button"
          onClick={onOpenFulfill}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-brown hover:bg-brand-dark-brown text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer"
        >
          <Send size={13} />
          <span>
            {trackingNumber
              ? language === 'th' ? 'แก้ไขข้อมูลพัสดุ' : 'Update Shipping Code'
              : t('orders.fulfill.addTracking')}
          </span>
        </button>
      </div>
    </div>
  );
}
