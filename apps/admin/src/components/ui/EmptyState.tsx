import * as React from 'react';
import { PackageOpen, type LucideIcon } from 'lucide-react';
import { cn } from 'cn';

export interface EmptyStateActionConfig {
  label: string;
  onClick?: () => void;
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode | EmptyStateActionConfig;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  subtitle,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'p-12 sm:p-16 text-center bg-white border border-[#EAE3D9] rounded-xs shadow-2xs flex flex-col items-center justify-center',
        className,
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-gray-400 mb-3 shadow-2xs">
        <Icon size={24} className="stroke-[1.5]" />
      </div>
      <p className="text-sm font-bold text-[#2B1810]">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1 max-w-sm">{subtitle}</p>}
      {action && (
        <div className="mt-4">
          {React.isValidElement(action) ? (
            action
          ) : typeof action === 'object' && action !== null && 'label' in action ? (
            <button
              type="button"
              onClick={(action as EmptyStateActionConfig).onClick}
              className="px-4 py-2 bg-[#2B1810] hover:bg-[#3D2318] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              {(action as EmptyStateActionConfig).label}
            </button>
          ) : (
            (action as React.ReactNode)
          )}
        </div>
      )}
    </div>
  );
}
