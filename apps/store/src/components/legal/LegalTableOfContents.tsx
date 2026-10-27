'use client';

import React from 'react';
import { ArrowUpRight, HelpCircle, Mail, Phone, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface TocItem {
  id: string;
  num: string;
  title: string;
}

export interface LegalTableOfContentsProps {
  items: TocItem[];
}

export function LegalTableOfContents({ items }: LegalTableOfContentsProps) {
  const { t } = useLanguage();

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="space-y-6">
      {/* Table of Contents Box */}
      <div className="bg-white border border-brand-border p-6 shadow-xs sticky top-28">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
            {t('terms.tocTitle')}
          </span>
          <span className="text-[10px] font-mono text-stone-400">
            {items.length} SECTIONS
          </span>
        </div>

        <nav className="mt-4 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScrollTo(item.id)}
              className="w-full text-left p-3 rounded-none border border-transparent hover:border-brand-border hover:bg-brand-warm-cream/50 transition-all duration-200 group flex items-start justify-between cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <span className="text-[11px] font-mono font-bold text-stone-400 group-hover:text-brand-brown">
                  {item.num}
                </span>
                <span className="text-xs font-bold text-stone-700 group-hover:text-brand-dark-brown leading-snug line-clamp-2">
                  {item.title}
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-brand-brown shrink-0 mt-0.5 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          ))}
        </nav>

        {/* Client Support Assistance Card */}
        <div className="mt-8 pt-6 border-t border-brand-border/60">
          <div className="flex items-center space-x-2 mb-2">
            <HelpCircle className="w-4 h-4 text-brand-brown" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              {t('terms.contact.title')}
            </h4>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed mb-4">
            {t('terms.contact.description')}
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center space-x-2.5 text-stone-600">
              <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="font-medium truncate">support@nida-apparel.com</span>
            </div>
            <div className="flex items-center space-x-2.5 text-stone-600">
              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="font-medium">+66 (0) 2 123 4567</span>
            </div>
            <div className="flex items-center space-x-2.5 text-stone-500 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{t('terms.contact.hoursValue')}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
