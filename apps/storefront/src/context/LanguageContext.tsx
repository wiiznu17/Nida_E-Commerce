'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'th' | 'en';

type Translations = Record<string, { th: string; en: string }>;

export const translations: Translations = {
  // Navigation & General
  'nav.women': { th: 'ผู้หญิง', en: 'WOMEN' },
  'nav.men': { th: 'ผู้ชาย', en: 'MEN' },
  'nav.kids': { th: 'เด็ก', en: 'KIDS' },
  'nav.bags': { th: 'กระเป๋าและเครื่องหนัง', en: 'BAGS & ACCESSORIES' },
  'nav.shoes': { th: 'รองเท้า', en: 'SHOES' },
  'nav.home': { th: 'ของแต่งบ้านและไลฟ์สไตล์', en: 'HOME & LIFESTYLE' },
  'nav.sale': { th: 'ลดราคาพิเศษ', en: 'SALE' },
  'nav.about': { th: 'เกี่ยวกับแบรนด์ Nida', en: 'About Nida' },
  'nav.search': { th: 'ค้นหาสินค้า', en: 'SEARCH' },
  'nav.account': { th: 'บัญชีของฉัน', en: 'My Account' },
  'nav.login': { th: 'เข้าสู่ระบบ / สมัครสมาชิก', en: 'Sign In / Join' },
  'nav.admin': { th: 'ระบบจัดการหลังบ้าน (Admin)', en: 'Admin Portal' },
  'nav.store': { th: 'หน้าร้านออนไลน์', en: 'Online Store' },

  // Top Promo Bar
  'promo.bar': {
    th: 'FALL SALE: ลดสูงสุด 50% + ลดเพิ่ม 20% ด้วยโค้ด: NIDA20 | จัดส่งฟรีเมื่อช้อปครบ $100',
    en: 'FALL SALE: UP TO 50% OFF + EXTRA 20% OFF WITH CODE: NIDA20 | FREE SHIPPING OVER $100',
  },
  'promo.limited': { th: 'โปรโมชันจำกัดเวลา', en: 'LIMITED TIME' },

  // Common Actions
  'btn.addToBag': { th: 'เพิ่มลงในถุงช้อปปิ้ง', en: 'ADD TO BAG' },
  'btn.checkout': { th: 'ดำเนินการสั่งซื้อ', en: 'CHECKOUT' },
  'btn.continueShopping': { th: 'เลือกซื้อสินค้าต่อ', en: 'CONTINUE SHOPPING' },
  'btn.save': { th: 'บันทึกข้อมูล', en: 'SAVE CHANGES' },
  'btn.cancel': { th: 'ยกเลิก', en: 'CANCEL' },
  'btn.delete': { th: 'ลบ', en: 'DELETE' },
  'btn.edit': { th: 'แก้ไข', en: 'EDIT' },
  'btn.filter': { th: 'กรองข้อมูล', en: 'FILTER' },
  'btn.viewDetails': { th: 'ดูรายละเอียด', en: 'VIEW DETAILS' },

  // Admin Navigation
  'admin.title': { th: 'ระบบจัดการหลังบ้าน NIDA', en: 'NIDA BACK-OFFICE' },
  'admin.dashboard': { th: 'แดชบอร์ดภาพรวม', en: 'Dashboard' },
  'admin.products': { th: 'จัดการสินค้า', en: 'Products' },
  'admin.orders': { th: 'คำสั่งซื้อและการจัดส่ง', en: 'Orders & Shipping' },
  'admin.inventory': { th: 'สต็อกและการเคลื่อนไหว', en: 'Inventory & Stock' },
  'admin.promotions': { th: 'โค้ดส่วนลด & แคมเปญ', en: 'Coupons & Promos' },
  'admin.logout': { th: 'ออกจากระบบแอดมิน', en: 'Exit Admin' },

  // Admin Dashboard Stats
  'admin.revenueToday': { th: 'ยอดขายวันนี้', en: "Today's Revenue" },
  'admin.revenueMonth': { th: 'ยอดขายเดือนนี้', en: 'Monthly Revenue' },
  'admin.ordersPending': { th: 'ออเดอร์รอจัดส่ง', en: 'Pending Fulfillment' },
  'admin.lowStockAlerts': { th: 'สินค้าสต็อกใกล้หมด', en: 'Low Stock Alerts' },
  'admin.recentOrders': { th: 'คำสั่งซื้อล่าสุด', en: 'Recent Orders' },
  'admin.topProducts': { th: 'สินค้ายอดนิยม', en: 'Top Selling Products' },
  'admin.quickActions': { th: 'เมนูลัด', en: 'Quick Actions' },

  // Statuses
  'status.pending': { th: 'รอดำเนินการ', en: 'Pending' },
  'status.paid': { th: 'ชำระเงินแล้ว', en: 'Paid' },
  'status.processing': { th: 'กำลังจัดเตรียม', en: 'Processing' },
  'status.shipped': { th: 'จัดส่งแล้ว', en: 'Shipped' },
  'status.delivered': { th: 'จัดส่งสำเร็จ', en: 'Delivered' },
  'status.cancelled': { th: 'ยกเลิก', en: 'Cancelled' },
  'status.active': { th: 'เปิดใช้งาน', en: 'Active' },
  'status.inactive': { th: 'ปิดใช้งาน', en: 'Inactive' },
  'status.inStock': { th: 'มีสินค้า', en: 'In Stock' },
  'status.lowStock': { th: 'สต็อกเหลือน้อย', en: 'Low Stock' },
  'status.outOfStock': { th: 'สินค้าหมด', en: 'Out of Stock' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('th');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nida_lang');
      if (saved === 'th' || saved === 'en') {
        setLanguageState(saved);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('nida_lang', lang);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'th' ? 'en' : 'th';
    setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = translations[key];
    if (entry) {
      return entry[language] || entry.en;
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
