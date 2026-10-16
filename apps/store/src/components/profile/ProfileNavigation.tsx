import React from 'react';
import { User as UserIcon, Package, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ProfileTab } from './profileTypes';

interface ProfileNavigationProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function ProfileNavigation({
  activeTab,
  onTabChange,
}: ProfileNavigationProps) {
  const { language, t } = useLanguage();

  return (
    <div className="col-span-1 md:col-span-3 space-y-2">
      <button
        type="button"
        onClick={() => onTabChange('profile')}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors text-left cursor-pointer ${
          activeTab === 'profile'
            ? 'bg-brand-brown text-white shadow-xs'
            : 'bg-white hover:bg-gray-100 text-brand-brown border border-gray-200'
        }`}
      >
        <UserIcon size={16} />
        <span>{t('auth.tabProfile')}</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('orders')}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors text-left cursor-pointer ${
          activeTab === 'orders'
            ? 'bg-brand-brown text-white shadow-xs'
            : 'bg-white hover:bg-gray-100 text-brand-brown border border-gray-200'
        }`}
      >
        <Package size={16} />
        <span>{t('auth.tabOrders')}</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('addresses')}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors text-left cursor-pointer ${
          activeTab === 'addresses'
            ? 'bg-brand-brown text-white shadow-xs'
            : 'bg-white hover:bg-gray-100 text-brand-brown border border-gray-200'
        }`}
      >
        <MapPin size={16} />
        <span>{t('auth.tabAddresses')}</span>
      </button>

      {/* VIP Perks Card */}
      <div className="p-4 bg-brand-warm-cream border border-brand-border mt-6">
        <div className="flex items-center space-x-2 text-brand-amber mb-2">
          <Sparkles size={16} />
          <span className="text-xs font-black uppercase tracking-wider">
            {language === 'th' ? 'สิทธิประโยชน์สมาชิก' : 'Member Perks'}
          </span>
        </div>
        <ul className="text-[11px] text-gray-600 space-y-1.5 font-medium">
          <li className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-brown shrink-0" />
            <span>
              {language === 'th'
                ? 'จัดส่งฟรีทุกออเดอร์ทั่วไทย'
                : 'Free shipping on all orders'}
            </span>
          </li>
          <li className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-brown shrink-0" />
            <span>
              {language === 'th'
                ? 'ส่วนลดพิเศษโค้ดโปรโมชั่น'
                : 'Exclusive promotional discounts'}
            </span>
          </li>
          <li className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-brown shrink-0" />
            <span>
              {language === 'th'
                ? 'สิทธิ์จองคอลเลกชันใหม่ก่อนใคร'
                : 'Early private drop access'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
