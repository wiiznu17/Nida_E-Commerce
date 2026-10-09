import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Tag,
  ExternalLink,
  X,
  ShieldCheck,
} from 'lucide-react';
import { NidaLogo } from '../common/NidaLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useAdmin } from '../../context/AdminContext';

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const { ordersList, inventoryList } = useAdmin();

  // Live badge calculations
  const pendingOrdersCount = ordersList.filter(
    (o) => o.status === 'PROCESSING' || o.status === 'PAID',
  ).length;
  const lowStockCount = inventoryList.filter(
    (i) => i.availableStock <= i.lowStockThreshold,
  ).length;

  const navigationSections = [
    {
      group: t('nav.overview'),
      items: [
        {
          id: 'dashboard',
          path: '/admin',
          altPath: '/',
          label: t('nav.dashboard'),
          icon: LayoutDashboard,
          badge: null,
          badgeColor: undefined,
        },
      ],
    },
    {
      group: t('nav.catalogStock'),
      items: [
        {
          id: 'products',
          path: '/admin/products',
          altPath: '/products',
          label: t('nav.products'),
          icon: ShoppingBag,
          badge: null,
          badgeColor: undefined,
        },
        {
          id: 'inventory',
          path: '/admin/inventory',
          altPath: '/inventory',
          label: t('nav.inventory'),
          icon: Boxes,
          badge: lowStockCount > 0 ? lowStockCount : null,
          badgeColor: 'bg-amber-500 text-[#1E110A] font-black',
        },
      ],
    },
    {
      group: t('nav.salesOrders'),
      items: [
        {
          id: 'orders',
          path: '/admin/orders',
          altPath: '/orders',
          label: t('nav.orders'),
          icon: Package,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
          badgeColor: 'bg-red-500 text-white font-bold',
        },
        {
          id: 'promotions',
          path: '/admin/promotions',
          altPath: '/promotions',
          label: t('nav.promotions'),
          icon: Tag,
          badge: null,
          badgeColor: undefined,
        },
      ],
    },
  ];

  const renderContent = () => (
    <div className="flex flex-col h-full bg-[#1E110A] text-white border-r border-[#2B1810] shadow-xl">
      {/* Sidebar Header / Brand */}
      <div className="p-4 border-b border-white/10 flex flex-col items-center justify-center relative">
        <Link to="/admin" className="flex flex-col items-center" onClick={onClose}>
          <NidaLogo size="sm" dark />
        </Link>
        <div className="mt-2 flex items-center space-x-1 bg-[#F59E0B]/15 border border-[#F59E0B]/30 px-2 py-0.5 rounded-full">
          <ShieldCheck size={10} className="text-[#F59E0B]" />
          <span className="text-[9px] font-black tracking-widest text-[#F59E0B] uppercase">
            {t('nav.backOffice')}
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {navigationSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-0.5">
            <div className="px-2.5 mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
              {sec.group}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  location.pathname === item.altPath ||
                  (item.id === 'dashboard' &&
                    (location.pathname === '/' || location.pathname === '/admin'));

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={onClose}
                    className={`group relative flex items-center justify-between px-2.5 py-1.5 text-xs font-bold tracking-wide rounded-md transition-all ${
                      isActive
                        ? 'bg-[#F59E0B] text-[#1E110A] shadow-xs font-black'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        size={15}
                        className={`transition-transform group-hover:scale-105 ${
                          isActive ? 'text-[#1E110A]' : 'text-white/60 group-hover:text-[#F59E0B]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                          item.badgeColor || 'bg-red-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer / Quick Actions & User Profile */}
      <div className="p-3 border-t border-white/10 space-y-2 bg-[#170D08]">
        {/* View Storefront Link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all group"
        >
          <div className="flex items-center space-x-2">
            <ExternalLink
              size={13}
              className="text-[#F59E0B] group-hover:translate-x-0.5 transition-transform"
            />
            <span className="text-[11px]">{t('nav.viewStore')}</span>
          </div>
          <span className="text-[9px] text-white/40">:3000</span>
        </a>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-[#1E110A] flex items-center justify-center font-black text-[11px] shadow-xs">
                W
              </div>
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-[#170D08]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white leading-tight">Wissanu</div>
              <div className="text-[9px] text-white/50 leading-tight">Super Admin</div>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-white/10 p-0.5 rounded-xs border border-white/20">
            <button
              type="button"
              onClick={() => setLanguage('th')}
              className={`px-1.5 py-0.5 text-[9px] font-black rounded-xs transition-colors cursor-pointer ${
                language === 'th' ? 'bg-[#F59E0B] text-[#1E110A]' : 'text-white/70 hover:text-white'
              }`}
            >
              TH
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 text-[9px] font-black rounded-xs transition-colors cursor-pointer ${
                language === 'en' ? 'bg-[#F59E0B] text-[#1E110A]' : 'text-white/70 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-60 fixed inset-y-0 left-0 z-40">
        {renderContent()}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            <div className="absolute top-3 right-3 z-50">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                aria-label="Close Sidebar"
              >
                <X size={20} />
              </button>
            </div>
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
