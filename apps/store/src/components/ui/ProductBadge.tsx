import React from 'react';
import { findMarketingTagByLabel } from '@repo/types';

export interface ProductBadgeProps {
  tag?: string | null;
  tagTh?: string | null;
  language?: 'th' | 'en';
  className?: string;
}

export function ProductBadge({
  tag,
  tagTh,
  language = 'en',
  className = '',
}: ProductBadgeProps) {
  if (!tag && !tagTh) return null;

  const rawTag = tag ?? tagTh ?? '';
  const preset = findMarketingTagByLabel(rawTag);

  if (preset) {
    const label = language === 'th' ? preset.labelTh : preset.labelEn;
    return (
      <span
        style={{
          backgroundColor: preset.badgeBg,
          color: preset.badgeText,
          borderColor: preset.badgeBorder,
        }}
        className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 border shadow-2xs rounded-xs select-none ${className}`}
      >
        {label}
      </span>
    );
  }

  // Graceful luxury fallback for custom tags
  const customLabel = language === 'th' ? (tagTh ?? rawTag) : (tag ?? rawTag);
  return (
    <span
      className={`inline-flex items-center bg-brand-brown text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 shadow-2xs rounded-xs select-none ${className}`}
    >
      {customLabel}
    </span>
  );
}
