'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LegalSectionCard } from './LegalSectionCard';
import { LegalTableOfContents } from './LegalTableOfContents';
import th from '@/locales/th.json';
import en from '@/locales/en.json';

export function TermsContentView() {
  const { language, t } = useLanguage();
  const termsData = language === 'th' ? th.terms : en.terms;

  const sections = [
    {
      id: termsData.sections.use.id,
      num: termsData.sections.use.num,
      title: termsData.sections.use.title,
      summary: termsData.sections.use.summary,
      items: termsData.sections.use.items,
    },
    {
      id: termsData.sections.orders.id,
      num: termsData.sections.orders.num,
      title: termsData.sections.orders.title,
      summary: termsData.sections.orders.summary,
      items: termsData.sections.orders.items,
    },
    {
      id: termsData.sections.liability.id,
      num: termsData.sections.liability.num,
      title: termsData.sections.liability.title,
      summary: termsData.sections.liability.summary,
      items: termsData.sections.liability.items,
    },
  ];

  const tocItems = sections.map((sec) => ({
    id: sec.id,
    num: sec.num,
    title: sec.title,
  }));

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen font-sans pb-24">
      {/* Hero Header */}
      <header className="relative bg-white border-b border-brand-border py-12 sm:py-16">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-5xl">
            {/* Editorial Label */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.25em] bg-stone-100 text-stone-700 border border-stone-200">
                {termsData.badge}
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {termsData.lastUpdated}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-brand-dark-brown leading-tight">
              {termsData.title}
            </h1>

            <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed max-w-4xl font-normal">
              {termsData.subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content 2-Column Grid */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
          {/* Sticky Sidebar Nav (Desktop: 3 cols) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <LegalTableOfContents items={tocItems} />
          </div>

          {/* Legal Clauses List (Desktop: 9 cols) */}
          <div className="lg:col-span-9 order-1 lg:order-2 space-y-8 sm:space-y-10">
            {sections.map((section) => (
              <LegalSectionCard
                key={section.id}
                id={section.id}
                num={section.num}
                title={section.title}
                summary={section.summary}
                items={section.items}
              />
            ))}

            {/* Bottom Compliance Guarantee Note */}
            <div className="bg-white/60 border border-brand-border p-6 text-stone-500 text-xs leading-relaxed flex items-start space-x-4">
              <ShieldCheck className="w-5 h-5 text-brand-brown shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-700 uppercase tracking-wider text-[11px] mb-1">
                  {language === 'th' ? 'การคุ้มครองตามมาตรฐานสากล' : 'Verified Standard Compliance'}
                </p>
                <p>
                  {language === 'th'
                    ? 'NIDA ยึดมั่นในการดำเนินธุรกิจอย่างโปร่งใส ถูกต้องตามกฎหมายคุ้มครองผู้บริโภคและกฎหมายธุรกรรมอิเล็กทรอนิกส์ของประเทศไทย'
                    : 'NIDA operates under full transparency and compliance with consumer protection and electronic transaction laws of Thailand.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
