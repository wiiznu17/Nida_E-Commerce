import { Menu, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface AdminHeaderProps {
  title?: string;
  onOpenMobile: () => void;
}

export function AdminHeader({ title, onOpenMobile }: AdminHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 h-13 bg-white/95 backdrop-blur-md border-b border-[#EAE3D9] px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-[#2B1810] hover:bg-gray-100 rounded-md cursor-pointer"
          aria-label="Open Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-gray-500">Admin</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-bold text-[#2B1810]">{title || 'Dashboard'}</span>
        </div>
      </div>

      {/* Right: Quick Links / Storefront Gateway */}
      <div className="flex items-center space-x-3">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#2B1810] bg-[#FAF7F2] hover:bg-[#EAE3D9] border border-[#EAE3D9] transition-colors"
          title="Open Public Storefront in new tab"
        >
          <span>{t('common.viewStorefront')}</span>
          <ExternalLink size={13} className="text-[#D97706]" />
        </a>

        {/* Current Admin User Pill */}
        <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-gray-200">
          <div className="w-7 h-7 rounded-full bg-[#2B1810] text-[#F59E0B] font-bold text-xs flex items-center justify-center">
            W
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#2B1810] leading-none">Wissanu</p>
            <p className="text-[10px] text-gray-500 leading-tight">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
