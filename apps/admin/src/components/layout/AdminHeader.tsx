import { Menu, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { STOREFRONT_URL } from '../../config';

export interface AdminHeaderProps {
  title?: string;
  onToggleSidebar: () => void;
}

export function AdminHeader({ title, onToggleSidebar }: AdminHeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
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

      {/* Right: Language Switcher & Storefront Gateway */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Language Switcher */}
        <div className="flex items-center bg-brand-cream/80 p-0.5 rounded-full border border-brand-border shrink-0">
          <button
            type="button"
            onClick={() => setLanguage('th')}
            className={`px-2.5 py-1 text-[11px] rounded-full transition-all cursor-pointer ${
              language === 'th'
                ? 'bg-brand-dark-brown text-white shadow-xs font-black'
                : 'text-stone-500 hover:text-brand-brown font-bold'
            }`}
          >
            TH
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-[11px] rounded-full transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-brand-dark-brown text-white shadow-xs font-black'
                : 'text-stone-500 hover:text-brand-brown font-bold'
            }`}
          >
            EN
          </button>
        </div>

        {/* View Storefront */}
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
      </div>
    </header>
  );
}
