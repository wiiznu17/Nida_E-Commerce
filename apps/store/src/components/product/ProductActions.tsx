import React from 'react';
import {
  ShoppingBag,
  Check,
  Heart,
  Truck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ProductActionsProps {
  isAdded: boolean;
  isWish: boolean;
  hasSelectedSize?: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}

export function ProductActions({
  isAdded,
  isWish,
  hasSelectedSize = true,
  onAddToCart,
  onToggleWishlist,
}: ProductActionsProps) {
  const { language, t } = useLanguage();
  const isTh = language === 'th';

  return (
    <div className="space-y-6 pt-2">
      {/* CTA Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={!hasSelectedSize || isAdded}
          className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-black transition-all flex justify-center items-center space-x-2 shadow-md ${
            isAdded
              ? 'bg-emerald-600 text-white cursor-default'
              : !hasSelectedSize
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300 shadow-none'
                : 'bg-brand-brown hover:bg-brand-amber text-white hover:shadow-lg cursor-pointer'
          }`}
        >
          {isAdded ? (
            <>
              <Check size={18} /> <span>{t('product.added')}</span>
            </>
          ) : !hasSelectedSize ? (
            <span>{isTh ? 'กรุณาเลือกขนาดไซส์' : 'SELECT A SIZE'}</span>
          ) : (
            <>
              <ShoppingBag size={18} /> <span>{t('product.addToBag')}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleWishlist}
          className="w-full py-3 text-xs uppercase tracking-widest font-black border border-gray-300 text-brand-brown hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <Heart
            size={16}
            className={isWish ? 'fill-brand-amber text-brand-amber' : ''}
          />
          <span>
            {isWish
              ? isTh
                ? 'บันทึกในรายการที่ถูกใจแล้ว'
                : 'SAVED TO WISHLIST'
              : isTh
                ? 'เพิ่มลงรายการที่ถูกใจ'
                : 'ADD TO WISHLIST'}
          </span>
        </button>
      </div>

      {/* Delivery & Guarantees */}
      <div className="border-t border-gray-200 pt-6 space-y-3 text-xs text-gray-600">
        <div className="flex items-center space-x-3">
          <Truck size={18} className="text-brand-amber shrink-0" />
          <span>
            <strong>
              {isTh ? 'จัดส่งมาตรฐานฟรี' : 'Free standard shipping'}
            </strong>{' '}
            {isTh
              ? 'เมื่อสั่งซื้อครบ ฿1,500 ขึ้นไป พัสดุถึงภายใน 2-4 วันทำการ'
              : 'on orders over ฿1,500. Arrives in 2-4 business days.'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <RefreshCw size={18} className="text-brand-amber shrink-0" />
          <span>
            <strong>
              {isTh
                ? 'เปลี่ยนและคืนสินค้าได้ใน 30 วัน'
                : 'Free 30-day returns & exchanges'}
            </strong>{' '}
            {isTh ? 'สะดวกสบายทั้งหน้าร้านและทางพัสดุ' : 'in-store or by mail.'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <ShieldCheck size={18} className="text-brand-amber shrink-0" />
          <span>
            <strong>
              {isTh
                ? 'การันตีคุณภาพของแท้ 100%'
                : '100% Guaranteed Authentic Nida Craft'}
            </strong>{' '}
            {isTh
              ? 'ตัดเย็บประณีตด้วยเส้นใยธรรมชาติอย่างยั่งยืน'
              : 'with sustainable materials.'}
          </span>
        </div>
      </div>
    </div>
  );
}
