'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from 'cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: 'light' | 'dark';
  separator?: 'slash' | 'chevron';
  className?: string;
}

export function Breadcrumb({
  items,
  variant = 'light',
  separator = 'slash',
  className,
}: BreadcrumbProps) {
  const isDark = variant === 'dark';

  const separatorElement =
    separator === 'chevron' ? (
      <ChevronRight
        size={12}
        className={cn('shrink-0', isDark ? 'text-gray-400' : 'text-gray-300')}
      />
    ) : (
      <span
        className={cn(
          'select-none',
          isDark ? 'text-gray-400' : 'text-gray-300',
        )}
      >
        /
      </span>
    );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center space-x-2 text-[11px] font-black uppercase tracking-[0.2em] font-sans',
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.href) {
          return (
            <span
              key={index}
              className={cn(
                'truncate max-w-xs',
                isDark
                  ? 'text-brand-yellow font-black'
                  : 'text-brand-brown font-black',
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.label}
            </span>
          );
        }

        return (
          <React.Fragment key={index}>
            <Link
              href={item.href}
              className={cn(
                'transition-colors',
                isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-500 hover:text-brand-brown',
              )}
            >
              {item.label}
            </Link>
            {separatorElement}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
