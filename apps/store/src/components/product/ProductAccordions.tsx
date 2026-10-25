import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ProductAccordionKey } from './productTypes';

interface ProductAccordionsProps {
  description?: string;
  materialsText?: string;
  openAccordions: ProductAccordionKey[];
  onToggleAccordion: (key: ProductAccordionKey) => void;
}

export function ProductAccordions({
  description,
  materialsText,
  openAccordions,
  onToggleAccordion,
}: ProductAccordionsProps) {
  const { language, t } = useLanguage();
  const isTh = language === 'th';

  const isDetailsOpen = openAccordions.includes('details');
  const isMaterialsOpen = openAccordions.includes('materials');
  const isDeliveryOpen = openAccordions.includes('delivery');

  return (
    <div className="border-t border-gray-200 pt-2">
      {/* Accordion 1: Description */}
      <div className="border-b border-gray-200">
        <button
          type="button"
          onClick={() => onToggleAccordion('details')}
          className="w-full py-4 flex justify-between items-center text-xs font-black uppercase tracking-wider text-brand-brown cursor-pointer"
        >
          <span>{t('product.details')}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isDetailsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isDetailsOpen && (
          <div className="pb-4 text-xs text-gray-600 leading-relaxed space-y-2">
            <p>{description}</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                {isTh
                  ? 'ป้ายริบบิ้นแถบสามสีเอกลักษณ์ Nida ชายเสื้อ'
                  : 'Signature Nida tri-color flag tab on hem'}
              </li>
              <li>
                {isTh
                  ? 'โครงเสื้อทรงคลาสสิก สวมใส่สบาย คล่องตัว'
                  : 'Regular classic fit with relaxed shoulders'}
              </li>
              <li>
                {isTh
                  ? 'เดินด้ายประณีตทุกจุด พร้อมอะไหล่สั่งทำพิเศษ'
                  : 'Reinforced stitching and custom engraved accents'}
              </li>
              <li>
                {isTh
                  ? 'คัดสรรเส้นใยธรรมชาติด้วยมาตรฐานความยั่งยืน'
                  : 'Ethically sourced natural fibres'}
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Accordion 2: Materials */}
      <div className="border-b border-gray-200">
        <button
          type="button"
          onClick={() => onToggleAccordion('materials')}
          className="w-full py-4 flex justify-between items-center text-xs font-black uppercase tracking-wider text-brand-brown cursor-pointer"
        >
          <span>{t('product.materials')}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isMaterialsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isMaterialsOpen && (
          <div className="pb-4 text-xs text-gray-600 leading-relaxed">
            {materialsText}
          </div>
        )}
      </div>

      {/* Accordion 3: Delivery */}
      <div className="border-b border-gray-200">
        <button
          type="button"
          onClick={() => onToggleAccordion('delivery')}
          className="w-full py-4 flex justify-between items-center text-xs font-black uppercase tracking-wider text-brand-brown cursor-pointer"
        >
          <span>{t('product.deliveryReturns')}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isDeliveryOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isDeliveryOpen && (
          <div className="pb-4 text-xs text-gray-600 leading-relaxed space-y-1">
            <p>
              {isTh
                ? '• จัดส่งภายใน 1-3 วันทำการสำหรับกรุงเทพฯ และ 2-4 วันสำหรับต่างจังหวัด'
                : '• Standard delivery in 2-4 business days.'}
            </p>
            <p>
              {isTh
                ? '• สามารถเปลี่ยนหรือคืนสินค้าได้ภายใน 30 วันนับจากวันที่ได้รับสินค้า โดยสินค้าต้องอยู่ในสภาพสมบูรณ์พร้อมป้ายราคา'
                : '• 30-day exchange and return policy provided items are unworn and tags intact.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
