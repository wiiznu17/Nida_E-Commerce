'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from 'cn';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
}

export interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  actionIcon?: LucideIcon;
  variant?: 'dashed' | 'card' | 'clean';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  actionLabel,
  onAction,
  actionHref,
  actionIcon: ActionIcon,
  variant = 'dashed',
  className,
}: EmptyStateProps) {
  const variantStyles = {
    dashed: 'border border-dashed border-gray-300 bg-gray-50/50 p-12 sm:p-16',
    card: 'border border-brand-border bg-white shadow-xs p-10 sm:p-14',
    clean: 'p-8 sm:p-12',
  };

  const resolvedAction: EmptyStateAction | undefined = action ?? (
    actionLabel
      ? {
          label: actionLabel,
          onClick: onAction,
          href: actionHref,
          icon: ActionIcon,
        }
      : undefined
  );

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const Component = Icon as LucideIcon;
    return (
      <div className="w-14 h-14 rounded-full bg-brand-warm-cream border border-brand-border flex items-center justify-center text-brand-brown mb-4 shadow-2xs">
        <Component size={24} strokeWidth={1.5} />
      </div>
    );
  };

  const renderAction = (act: EmptyStateAction, isSecondary = false) => {
    const IconComp = act.icon;
    const buttonClasses = isSecondary
      ? 'border border-brand-brown text-brand-brown hover:bg-brand-warm-cream px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 cursor-pointer rounded-xs'
      : 'bg-brand-brown hover:bg-brand-amber text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-2 rounded-xs shadow-xs cursor-pointer';

    if (act.href) {
      return (
        <Link href={act.href} className={buttonClasses}>
          {IconComp && <IconComp size={14} />}
          <span>{act.label}</span>
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={act.onClick}
        className={buttonClasses}
      >
        {IconComp && <IconComp size={13} />}
        <span>{act.label}</span>
      </button>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center font-sans',
        variantStyles[variant],
        className,
      )}
    >
      {renderIcon()}
      <h3 className="text-base sm:text-lg font-black text-brand-brown uppercase tracking-tight mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed font-normal">
          {description}
        </p>
      )}
      {(resolvedAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {resolvedAction && renderAction(resolvedAction, false)}
          {secondaryAction && renderAction(secondaryAction, true)}
        </div>
      )}
    </div>
  );
}
