import { useState } from 'react';
import { Menu, ChevronRight, ExternalLink, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { STOREFRONT_URL } from '../../config';
import { SignOutConfirmModal } from '../common/SignOutConfirmModal';

export interface AdminHeaderProps {
  title?: string;
  onOpenMobile: () => void;
}

export function AdminHeader({ title, onOpenMobile }: AdminHeaderProps) {
  const { t } = useLanguage();
  const { admin } = useAuth();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const initial = admin?.fullName
    ? admin.fullName.charAt(0).toUpperCase()
    : 'A';

  return (
    <>
      <header className="sticky top-0 z-30 h-13 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onOpenMobile}
            className="lg:hidden p-2 text-brand-brown hover:bg-gray-100 rounded-md cursor-pointer"
            aria-label="Open Sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-gray-500">Admin</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="font-bold text-brand-brown">{title ?? 'Dashboard'}</span>
          </div>
        </div>

        {/* Right: Quick Links / Storefront Gateway & Admin Profile */}
        <div className="flex items-center space-x-3">
          <a
            href={STOREFRONT_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-brand-brown bg-brand-cream hover:bg-brand-border border border-brand-border transition-colors"
            title="Open Public Storefront in new tab"
          >
            <span>{t('common.viewStorefront')}</span>
            <ExternalLink size={13} className="text-brand-amber" />
          </a>

          {/* Current Admin User Pill & Sign Out */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-brand-brown text-brand-yellow font-bold text-xs flex items-center justify-center">
                {initial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-brand-brown leading-none">
                  {admin?.fullName ?? 'Admin'}
                </p>
                <p className="text-[10px] text-gray-500 leading-tight">
                  {admin?.role?.roleName ?? 'Staff'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSignOutOpen(true)}
              title={t('auth.sign_out_button')}
              className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <SignOutConfirmModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
      />
    </>
  );
}
