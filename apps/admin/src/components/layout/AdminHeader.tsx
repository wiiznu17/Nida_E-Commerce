import { Menu, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { STOREFRONT_URL } from '../../config';

export interface AdminHeaderProps {
  title?: string;
  onOpenMobile: () => void;
}

export function AdminHeader({ title, onOpenMobile }: AdminHeaderProps) {
  const { t } = useLanguage();

  return (
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

      {/* Right: Quick Links / Storefront Gateway */}
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

        {/* Current Admin User Pill */}
        <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-gray-200">
          <div className="w-7 h-7 rounded-full bg-brand-brown text-brand-yellow font-bold text-xs flex items-center justify-center">
            W
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-brand-brown leading-none">Wissanu</p>
            <p className="text-[10px] text-gray-500 leading-tight">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
