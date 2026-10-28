import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { STOREFRONT_URL } from '../../config';

export interface AdminBreadcrumbItem {
  label: string;
  path?: string;
}

export interface AdminHeaderProps {
  title?: string;
  breadcrumbs?: AdminBreadcrumbItem[];
  actionButton?: React.ReactNode;
  onToggleSidebar: () => void;
}

export function AdminHeader({
  title,
  breadcrumbs,
  actionButton,
  onToggleSidebar,
}: AdminHeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 min-h-13 bg-white/95 backdrop-blur-md border-b border-brand-border px-3 sm:px-6 py-2 sm:py-0 flex items-center justify-between shadow-xs w-full min-w-0">
      {/* Left: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 pr-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 text-brand-brown hover:bg-stone-100 rounded-md transition-colors cursor-pointer shrink-0"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-1.5 sm:space-x-2 text-xs truncate"
        >
          <Link
            to="/admin"
            className="hidden sm:inline font-bold text-gray-500 hover:text-brand-brown transition-colors shrink-0"
          >
            Admin
          </Link>
          <ChevronRight
            size={14}
            className="hidden sm:inline text-gray-400 shrink-0"
          />

          {breadcrumbs && breadcrumbs.length > 0 ? (
            breadcrumbs.map((bc, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight
                      size={12}
                      className="text-gray-400 shrink-0"
                    />
                  )}
                  {bc.path && !isLast ? (
                    <Link
                      to={bc.path}
                      className="text-gray-500 hover:text-brand-brown font-bold transition-colors truncate max-w-[120px] sm:max-w-none"
                    >
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="font-bold text-brand-brown truncate max-w-[160px] sm:max-w-none">
                      {bc.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <span className="font-bold text-brand-brown truncate max-w-[180px] sm:max-w-none">
              {title ?? 'Dashboard'}
            </span>
          )}
        </nav>
      </div>

      {/* Right: Action Button, Language Switcher & Storefront Gateway */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {actionButton && (
          <div className="flex items-center shrink-0">
            {actionButton}
          </div>
        )}
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
