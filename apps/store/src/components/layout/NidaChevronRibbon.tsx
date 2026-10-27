import React from 'react';

export interface NidaChevronRibbonProps {
  className?: string;
  variant?: 'brand' | 'icon' | 'dark';
  hasShadow?: boolean;
}

export function NidaChevronRibbon({
  className = 'w-16 h-auto',
  variant = 'brand',
  hasShadow = true,
}: NidaChevronRibbonProps) {
  const isDark = variant === 'dark';
  const peak1Color =
    variant === 'icon' || variant === 'dark' ? '#E6C687' : '#2B1810';
  const peak2Color = '#FFFFFF';
  const peak2Stroke = isDark ? '#FFFFFF' : '#D0C7BE';
  const peak3Color = '#EB9617';

  const shadowClass = hasShadow
    ? 'drop-shadow-[0_1.5px_2px_rgba(43,24,16,0.08)]'
    : '';

  return (
    <svg
      viewBox="6 78 244 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 overflow-visible ${shadowClass} ${className}`}
      aria-hidden="true"
    >
      {/* Peak 1: Left (Brand Brown / Champagne Gold) */}
      <path
        d="M 12 128 L 50.67 84 L 89.33 128 L 89.33 172 L 50.67 128 L 12 172 Z"
        fill={peak1Color}
        stroke={variant === 'icon' ? '#D0C7BE' : undefined}
        strokeWidth={variant === 'icon' ? '1.5' : undefined}
      />
      {/* Peak 2: Center (Crisp White with subtle contrast border) */}
      <path
        d="M 89.33 128 L 128 84 L 166.67 128 L 166.67 172 L 128 128 L 89.33 172 Z"
        fill={peak2Color}
        stroke={peak2Stroke}
        strokeWidth="1.5"
      />
      {/* Peak 3: Right (Amber Yellow) */}
      <path
        d="M 166.67 128 L 205.33 84 L 244 128 L 244 172 L 205.33 128 L 166.67 172 Z"
        fill={peak3Color}
      />
    </svg>
  );
}
