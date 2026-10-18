import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Package,
  Boxes,
  Tag,
  Sliders,
  Users,
  ExternalLink,
  X,
  ShieldCheck,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { NidaLogo } from '../common/NidaLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { STOREFRONT_URL } from '../../config';
import { SignOutConfirmModal } from '../common/SignOutConfirmModal';
import { AdminPermission } from '@repo/types';

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { admin, hasPermission } = useAuth();
  const location = useLocation();

  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const rawSections = [
    {
      group: t('nav.overview'),
      items: [
        {
          id: 'dashboard',
          path: '/admin',
          altPath: '/',
          label: t('nav.dashboard'),
          icon: LayoutDashboard,
          permission: undefined,
        },
      ],
    },
    {
      group: t('nav.catalogInventory'),
      items: [
        {
          id: 'products',
          path: '/admin/products',
          altPath: '/products',
          label: t('nav.products'),
          icon: ShoppingBag,
          permission: AdminPermission.CATALOG_READ,
        },
        {
          id: 'categories',
          path: '/admin/categories',
          altPath: '/categories',
          label: t('nav.categories'),
          icon: FolderTree,
          permission: AdminPermission.CATALOG_READ,
        },
        {
          id: 'inventory',
          path: '/admin/inventory',
          altPath: '/inventory',
          label: t('nav.inventory'),
          icon: Boxes,
          permission: AdminPermission.INVENTORY_READ,
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
          permission: AdminPermission.ORDERS_READ,
        },
        {
          id: 'promotions',
          path: '/admin/promotions',
          altPath: '/promotions',
          label: t('nav.promotions'),
          icon: Tag,
          permission: AdminPermission.COUPONS_READ,
        },
        {
          id: 'content',
          path: '/admin/content',
          altPath: '/content',
          label: t('nav.contentBanners'),
          icon: Sliders,
          permission: AdminPermission.COUPONS_READ,
        },
      ],
    },
    {
      group: t('nav.systemManagement'),
      items: [
        {
          id: 'users',
          path: '/admin/users',
          altPath: '/users',
          label: t('nav.staffManagement'),
          icon: Users,
          permission: AdminPermission.ADMIN_USERS_MANAGE,
        },
        {
          id: 'auditLogs',
          path: '/admin/audit-logs',
          altPath: '/audit-logs',
          label: t('nav.auditLogs'),
          icon: ShieldAlert,
          permission: AdminPermission.AUDIT_LOGS_READ,
        },
      ],
    },
  ];

  const navigationSections = rawSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.permission ? hasPermission(item.permission) : true,
      ),
    }))
    .filter((section) => section.items.length > 0);

  const initial = admin?.fullName
    ? admin.fullName.charAt(0).toUpperCase()
    : 'A';

  const renderContent = () => (
    <div className="flex flex-col h-full bg-brand-dark-brown text-white border-r border-brand-brown shadow-xl">
      {/* Sidebar Header / Brand */}
      <div className="p-4 border-b border-white/10 flex flex-col items-center justify-center relative">
        <Link
          to="/admin"
          className="flex flex-col items-center"
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              onClose();
            }
          }}
        >
          <NidaLogo size="sm" dark />
        </Link>
        <div className="mt-2 flex items-center space-x-1 bg-brand-yellow/15 border border-brand-yellow/30 px-2 py-0.5 rounded-full">
          <ShieldCheck size={10} className="text-brand-yellow" />
          <span className="text-[9px] font-black tracking-widest text-brand-yellow uppercase">
            {t('nav.backOffice')}
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {navigationSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-0.5">
            <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/40">
              {sec.group}
            </div>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin' || location.pathname === '/'
                  : location.pathname === item.path ||
                    (item.altPath && location.pathname === item.altPath) ||
                    location.pathname.startsWith(item.path + '/');

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors duration-150 group ${
                    isActive
                      ? 'bg-brand-yellow text-brand-dark-brown shadow-xs'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      size={16}
                      className={`transition-colors ${
                        isActive
                          ? 'text-brand-dark-brown'
                          : 'text-white/50 group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Storefront + Admin Profile */}
      <div className="p-3 border-t border-white/10 space-y-2.5 bg-black/15">
        {/* Quick Link to Storefront */}
        <a
          href={STOREFRONT_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs transition-colors border border-white/5"
        >
          <div className="flex items-center space-x-2">
            <ExternalLink size={13} className="text-brand-yellow" />
            <span className="font-bold text-[11px]">
              {t('common.viewStorefront')}
            </span>
          </div>
          <span className="text-[9px] text-white/40 font-mono">
            {(() => {
              try {
                return new URL(STOREFRONT_URL).port || '5173';
              } catch {
                return '5173';
              }
            })()}
          </span>
        </a>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2 truncate">
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-full bg-brand-yellow text-brand-dark-brown flex items-center justify-center font-black text-[11px] shadow-xs">
                {initial}
              </div>
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-brand-dark-brown" />
            </div>
            <div className="truncate">
              <div className="text-[11px] font-bold text-white leading-tight truncate">
                {admin?.fullName ?? 'Admin'}
              </div>
              <div className="text-[9px] text-white/50 leading-tight truncate">
                {admin?.role?.roleName ?? 'Staff'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => setIsSignOutOpen(true)}
              title={t('auth.sign_out_button')}
              className="p-1 rounded-md text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-xs border border-white/20">
              <button
                type="button"
                onClick={() => setLanguage('th')}
                className={`px-1.5 py-0.5 text-[9px] font-black rounded-xs transition-colors cursor-pointer ${
                  language === 'th'
                    ? 'bg-brand-yellow text-brand-dark-brown'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 text-[9px] font-black rounded-xs transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-brand-yellow text-brand-dark-brown'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
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

      <SignOutConfirmModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
      />
    </>
  );
}
