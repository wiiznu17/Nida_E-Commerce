'use client';

import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { cn } from 'cn';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  const variantConfig = {
    error: {
      container: 'bg-red-50/80 border-red-200 text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600',
    },
    success: {
      container: 'bg-emerald-50/80 border-emerald-200 text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    warning: {
      container: 'bg-amber-50/80 border-amber-200 text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    info: {
      container: 'bg-brand-warm-cream border-brand-border text-brand-brown',
      icon: Info,
      iconColor: 'text-brand-amber',
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        'p-3.5 sm:p-4 border rounded-xs text-xs font-sans flex items-start gap-3 shadow-2xs relative',
        config.container,
        className,
      )}
    >
      <IconComponent
        size={16}
        className={cn('shrink-0 mt-0.5', config.iconColor)}
      />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-bold text-xs uppercase tracking-wider mb-0.5">
            {title}
          </h4>
        )}
        <div className="leading-relaxed font-medium">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-0.5 text-gray-400 hover:text-brand-brown rounded-xs transition-colors cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
