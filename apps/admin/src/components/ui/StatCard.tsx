import React, { type ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  valueClassName?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  footer,
  valueClassName = 'text-brand-brown',
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-brand-border rounded-xs p-4.5 shadow-2xs transition-colors ${
        onClick ? 'cursor-pointer hover:border-brand-brown/40' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="tracking-wider text-[10px] font-black uppercase text-stone-400 truncate">
          {title}
        </span>
        {icon && (
          <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div
        className={`text-2xl font-mono font-bold tracking-tight truncate ${valueClassName}`}
      >
        {value}
      </div>

      {subtitle && (
        <div className="mt-1 text-[11px] text-stone-400 truncate">
          {subtitle}
        </div>
      )}

      {footer && <div className="mt-2 text-xs text-stone-500">{footer}</div>}
    </div>
  );
};
