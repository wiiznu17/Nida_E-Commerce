import { Menu, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface AdminHeaderProps {
  title?: string;
  onOpenMobile: () => void;
}

export function AdminHeader({ title, onOpenMobile }: AdminHeaderProps) {
  const { language } = useLanguage();

  return (
    <header className="sticky top-0 z-30 h-13 bg-white/95 backdrop-blur-md border-b border-[#EAE3D9] px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-[#2B1810] hover:bg-gray-100 rounded-md"
          aria-label="Open Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400 font-bold uppercase tracking-wider hidden sm:inline">
            {language === 'th' ? 'ระบบจัดการหลังบ้าน' : 'Nida Console'}
          </span>
          {title && (
            <>
              <ChevronRight size={12} className="text-gray-400 hidden sm:inline" />
              <span className="font-bold text-[#2B1810]">{title}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Status & Quick Action */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Quick Link to Storefront */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-xs font-bold text-[#2B1810] hover:text-[#D97706] bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#EAE3D9] px-3 py-1.5 rounded-md transition-colors"
        >
          <ExternalLink size={13} className="text-[#D97706]" />
          <span className="hidden sm:inline">
            {language === 'th' ? 'หน้าร้าน' : 'Store'}
          </span>
        </a>
      </div>
    </header>
  );
}
