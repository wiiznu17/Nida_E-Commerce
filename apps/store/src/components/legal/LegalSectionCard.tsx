'use client';

import React from 'react';

export interface LegalItem {
  subNum: string;
  subtitle: string;
  content: string;
}

export interface LegalSectionCardProps {
  id: string;
  num: string;
  title: string;
  summary: string;
  items: LegalItem[];
}

export function LegalSectionCard({
  id,
  num,
  title,
  summary,
  items,
}: LegalSectionCardProps) {
  return (
    <article
      id={id}
      className="scroll-mt-28 bg-white border border-brand-border p-6 sm:p-8 lg:p-10 shadow-xs transition-shadow duration-300 hover:shadow-sm"
    >
      {/* Header */}
      <div className="border-b border-brand-border/60 pb-6 mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase bg-brand-dark-brown text-white">
            SECTION {num}
          </span>
          <span className="h-px flex-1 bg-brand-border/50" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-brand-dark-brown">
          {title}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-stone-500 leading-relaxed font-normal">
          {summary}
        </p>
      </div>

      {/* Itemized clauses */}
      <div className="space-y-6 sm:space-y-8">
        {items.map((item) => (
          <div key={item.subNum} className="group">
            <div className="flex items-baseline space-x-2.5 mb-2">
              <span className="text-[11px] font-mono font-bold text-stone-400 group-hover:text-brand-brown transition-colors">
                {item.subNum}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-stone-800 tracking-tight">
                {item.subtitle}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-5 border-l border-brand-border/80 font-normal">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
