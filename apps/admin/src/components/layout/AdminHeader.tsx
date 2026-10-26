import { useState } from 'react';
import { Menu, ChevronRight, ExternalLink, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { STOREFRONT_URL } from '../../config';
import { SignOutConfirmModal } from '../common/SignOutConfirmModal';

export interface AdminHeaderProps {
  title?: string;
  onToggleSidebar: () => void;
}

export function AdminHeader({ title, onToggleSidebar }: AdminHeaderProps) {
  const { t } = useLanguage();
  const { admin } = useAuth();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const initial = admin?.fullName
    ? admin.fullName.charAt(0).toUpperCase()
    : 'A';

  return (
    <>
      <header className="sticky top-0 z-30 h-13 bg-white/95 backdrop-blur-md border-b border-brand-border px-3 sm:px-6 flex items-center justify-between shadow-xs w-full min-w-0">
        {/* Left: Sidebar Toggle & Breadcrumbs */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 text-brand-brown hover:bg-stone-100 rounded-md transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Sidebar"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs truncate">
            <span className="hidden sm:inline font-bold text-gray-500">Admin</span>
            <ChevronRight size={14} className="hidden sm:inline text-gray-400 shrink-0" />
            <span className="font-bold text-brand-brown truncate">
              {title ?? 'Dashboard'}
            </span>
          </div>
        </div>

        {/* Right: Quick Links / Storefront Gateway & Admin Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <a
            href={STOREFRONT_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold text-brand-brown bg-brand-cream hover:bg-brand-border border border-brand-border transition-colors shrink-0"
            title="Open Public Storefront in new tab"
          >
            <span className="hidden md:inline">{t('common.viewStorefront')}</span>
            <span className="md:hidden text-[10px] font-bold">Store</span>
            <ExternalLink size={12} className="text-brand-amber shrink-0" />
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
