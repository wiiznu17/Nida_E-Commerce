'use client';

import React from 'react';
import { cn } from 'cn';
import { OrderStatus } from '@repo/types';

export type StatusType = OrderStatus | 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'info';

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  pulseDot?: boolean;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  size = 'sm',
  pulseDot = false,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const normalized = String(status).toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case 'PAID':
      case 'DELIVERED':
      case 'SUCCESS':
      case 'ACTIVE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          defaultLabel: 'Delivered',
        };
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
          defaultLabel: 'Shipped',
        };
      case 'PROCESSING':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          defaultLabel: 'Processing',
        };
      case 'PENDING':
      case 'PENDING_PAYMENT':
      case 'WARNING':
        return {
          bg: 'bg-stone-50 text-stone-700 border-stone-200',
          dot: 'bg-stone-400',
          defaultLabel: 'Pending',
        };
      case 'CANCELLED':
      case 'REFUNDED':
      case 'ERROR':
      case 'INACTIVE':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          defaultLabel: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          dot: 'bg-gray-400',
          defaultLabel: normalized,
        };
    }
  };

  const config = getStatusConfig();
  const textLabel = label ?? config.defaultLabel;

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-xs border select-none',
        config.bg,
        sizeStyles[size],
        className,
      )}
    >
      {showDot && (
        pulseDot ? (
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                config.dot,
              )}
            />
            <span
              className={cn(
                'relative inline-flex rounded-full h-1.5 w-1.5',
                config.dot,
              )}
            />
          </span>
        ) : (
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
        )
      )}
      <span>{textLabel}</span>
    </span>
  );
}
