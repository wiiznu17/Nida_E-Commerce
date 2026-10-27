'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { NidaChevronRibbon } from './NidaChevronRibbon';

export interface StandaloneHeaderProps {
  orderNumber?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function StandaloneHeader({
  orderNumber,
  backHref,
  backLabel,
  className = '',
}: StandaloneHeaderProps) {
  return (
    <header
      className={`flex items-center justify-between pt-1 pb-2 mb-6 border-b border-stone-200 w-full ${className}`}
    >
      <div className="w-1/3 flex justify-start">
        {backHref && backLabel ? (
          <Link
            href={backHref}
            className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-brand-brown transition-colors"
          >
            <ChevronLeft size={16} />
            <span>{backLabel}</span>
          </Link>
        ) : null}
      </div>

      <div className="w-1/3 flex justify-center">
        <Link href="/" className="flex flex-col items-center group py-0.5">
          <span className="font-sans font-black tracking-[0.25em] text-brand-brown uppercase text-xl group-hover:text-brand-amber transition-colors">
            NIDA
          </span>
          <NidaChevronRibbon className="w-14 sm:w-16 h-auto mt-0.5" />
        </Link>
      </div>

      <div className="w-1/3 flex justify-end">
        {orderNumber ? (
          <span className="font-mono text-xs font-bold text-stone-500">
            #{orderNumber}
          </span>
        ) : null}
      </div>
    </header>
  );
}
