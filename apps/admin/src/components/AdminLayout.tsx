import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Tag,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';

export function NidaLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl';
  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="flex items-center space-x-2">
        <span className={`font-sans font-black tracking-[0.25em] text-[#2B1810] uppercase ${textSize}`}>NIDA</span>
      </div>
      {/* Signature Ribbon / Flag emblem in Brown, White, Yellow */}
      <div className="flex w-14 h-1.5 mt-0.5 rounded-xs overflow-hidden shadow-xs">
        <div className="w-1/3 bg-[#2B1810]"></div>
        <div className="w-1/3 bg-white border-y border-[#EAE3D9]"></div>
        <div className="w-1/3 bg-[#F59E0B]"></div>
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export function AdminLayout({ children, title, subtitle, actionButton }: AdminLayoutProps) {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { ordersList, inventoryList } = useAdmin();

  // Calculate live badge alerts
  const pendingOrdersCount = ordersList.filter((o) => o.status === 'PROCESSING' || o.status === 'PAID').length;
  const lowStockCount = inventoryList.filter((i) => i.availableStock <= i.lowStockThreshold).length;

  const navItems = [
    {
      id: 'dashboard',
      path: '/admin',
      altPath: '/',
      label: language === 'th' ? 'แดชบอร์ดภาพรวม' : 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: 'products',
      path: '/admin/products',
      altPath: '/products',
      label: language === 'th' ? 'จัดการสินค้า' : 'Products',
      icon: ShoppingBag,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: 'orders',
      path: '/admin/orders',
      altPath: '/orders',
      label: language === 'th' ? 'คำสั่งซื้อ & จัดส่ง' : 'Orders & Shipping',
      icon: Package,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: undefined,
    },
    {
      id: 'inventory',
      path: '/admin/inventory',
      altPath: '/inventory',
      label: language === 'th' ? 'สต็อก & ความเคลื่อนไหว' : 'Inventory & Stock',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'promotions',
      path: '/admin/promotions',
      altPath: '/promotions',
      label: language === 'th' ? 'โค้ดโปรโมชัน & คูปอง' : 'Coupons & Promos',
      icon: Tag,
      badge: null,
      badgeColor: undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#2B1810] flex flex-col">
      {/* Top Admin Status Bar */}
      <div className="bg-[#2B1810] text-white text-[11px] py-2 px-4 sm:px-8 border-b border-[#1E110A]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="bg-[#F59E0B] text-[#2B1810] font-black text-[10px] px-2 py-0.5 uppercase tracking-wider rounded-xs flex items-center">
              <ShieldCheck size={12} className="mr-1" />
              ADMIN BACK-OFFICE
            </span>
            <span className="text-white/70 hidden sm:inline text-xs">
              {language === 'th' ? 'ระบบจัดการคลังและคำสั่งซื้อแบรนด์ Nida' : 'Nida Master Management Console'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-white/10 p-0.5 rounded-xs border border-white/20">
              <button
                type="button"
                onClick={() => setLanguage('th')}
                className={`px-2 py-0.5 text-[10px] font-black rounded-xs transition-colors ${
                  language === 'th' ? 'bg-[#F59E0B] text-[#2B1810]' : 'text-white/80 hover:text-white'
                }`}
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[10px] font-black rounded-xs transition-colors ${
                  language === 'en' ? 'bg-[#F59E0B] text-[#2B1810]' : 'text-white/80 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Back to Client Store Link (Port 3000) */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F59E0B] hover:text-white transition-colors text-xs font-bold flex items-center space-x-1"
            >
              <span>{language === 'th' ? 'ดูหน้าร้านออนไลน์' : 'View Store'}</span>
              <ExternalLink size={12} />
            </a>

            <div className="h-3 w-px bg-white/20 hidden sm:block" />

            {/* Admin Avatar & Role */}
            <div className="hidden sm:flex items-center space-x-2 text-xs">
              <div className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#2B1810] flex items-center justify-center font-black text-[10px]">
                W
              </div>
              <span className="font-semibold text-white/90">Wissanu (Super Admin)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Header */}
      <header className="bg-white border-b border-[#EAE3D9] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-[#2B1810] hover:bg-gray-100 rounded-xs"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link to="/admin" className="flex items-center space-x-3">
                <NidaLogo size="sm" />
                <div className="hidden md:block pl-3 border-l border-gray-300">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#D97706] block">
                    ADMINISTRATION
                  </span>
                  <span className="text-xs font-bold text-gray-500">Control Center</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 h-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  location.pathname === item.altPath ||
                  (item.id === 'dashboard' && (location.pathname === '/' || location.pathname === '/admin'));

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`relative px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center space-x-2 transition-all ${
                      isActive ? 'bg-[#2B1810] text-white shadow-xs' : 'text-[#2B1810] hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {item.badge !== null && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1.5 ${
                          item.badgeColor || 'bg-red-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Action */}
            <div className="flex items-center space-x-3">
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-[#2B1810] border border-gray-300 px-3 py-2 bg-white transition-colors"
              >
                <LogOut size={14} className="mr-1.5" />
                <span>{language === 'th' ? 'กลับสู่หน้าร้าน' : 'Customer View'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname === item.altPath ||
                (item.id === 'dashboard' && (location.pathname === '/' || location.pathname === '/admin'));

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider rounded-xs ${
                    isActive ? 'bg-[#2B1810] text-white' : 'text-[#2B1810] hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-gray-200">
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 p-3 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                <LogOut size={16} />
                <span>{language === 'th' ? 'กลับสู่หน้าร้านลูกค้า' : 'Back to Store'}</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Page Title & Breadcrumb Header */}
      {(title || actionButton) && (
        <div className="bg-white border-b border-[#EAE3D9] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                <span>{language === 'th' ? 'ระบบหลังบ้าน' : 'Admin'}</span>
                <ChevronRight size={12} />
                <span className="text-[#D97706]">{title}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2B1810] uppercase tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-gray-500 font-medium mt-1">{subtitle}</p>}
            </div>

            {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-[#EAE3D9] py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#2B1810]">NIDA ADMIN PORTAL</span>
            <span>•</span>
            <span>Ver 2.4.0 (Live Preview)</span>
          </div>
          <p>© 2026 Nida Brands. All Administrative Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
