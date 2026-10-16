'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from 'cn';

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-brand-brown',
  bgColor = 'bg-white',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'border border-gray-200 p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-brand-brown/40 shadow-2xs font-sans',
        bgColor,
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 truncate mr-2">
          {label}
        </span>
        <Icon size={16} className={cn('shrink-0', iconColor)} />
      </div>
      <div className="text-xl sm:text-2xl font-black text-brand-brown tracking-tight truncate">
        {value}
      </div>
    </div>
  );
}
