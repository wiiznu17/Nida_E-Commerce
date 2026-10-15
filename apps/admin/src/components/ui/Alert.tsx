import * as React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { cn } from 'cn';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  message?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  showIcon?: boolean;
}

const variantStyles: Record<
  AlertVariant,
  {
    container: string;
    iconClass: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  success: {
    container: 'bg-emerald-50/80 border-emerald-300 text-emerald-900',
    iconClass: 'text-emerald-600',
    icon: CheckCircle2,
  },
  error: {
    container: 'bg-rose-50/80 border-rose-300 text-rose-900',
    iconClass: 'text-rose-600',
    icon: AlertCircle,
  },
  warning: {
    container: 'bg-amber-50/80 border-amber-300 text-amber-900',
    iconClass: 'text-amber-600',
    icon: AlertTriangle,
  },
  info: {
    container: 'bg-sky-50/80 border-sky-300 text-sky-900',
    iconClass: 'text-sky-600',
    icon: Info,
  },
};

export function Alert({
  variant = 'success',
  message,
  children,
  onClose,
  showIcon = true,
  className,
  ...props
}: AlertProps) {
  const current = variantStyles[variant];
  const IconComponent = current.icon;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center justify-between border px-4 py-3 text-xs font-bold rounded-xs shadow-2xs transition-all animate-in fade-in-0 duration-200',
        current.container,
        className,
      )}
      {...props}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        {showIcon && (
          <IconComponent
            size={16}
            className={cn('shrink-0', current.iconClass)}
          />
        )}
        <div className="truncate">{message ?? children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-3 shrink-0 p-0.5 rounded-xs text-current/60 hover:text-current transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
