'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { CatalogMobileDrawerProps } from './catalogTypes';

export function CatalogMobileDrawer({
  isOpen,
  onClose,
  totalCount,
  children,
}: CatalogMobileDrawerProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-black tracking-wider uppercase text-brand-brown">
              {t('search.filter')}
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              ({totalCount})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-brand-brown rounded-xs cursor-pointer"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-brand-border bg-brand-warm-cream">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-brand-brown text-white text-xs font-black uppercase tracking-widest hover:bg-brand-amber transition-colors rounded-xs cursor-pointer"
          >
            {t('search.viewResults')} ({totalCount})
          </button>
        </div>
      </div>
    </div>
  );
}
