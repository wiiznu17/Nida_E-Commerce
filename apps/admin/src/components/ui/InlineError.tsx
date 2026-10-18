import { AlertCircle } from 'lucide-react';

export interface InlineErrorProps {
  message?: string | null;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  if (!message) return null;

  return (
    <div
      className={`flex items-center space-x-1.5 text-[11px] text-rose-600 font-semibold mt-1.5 transition-all ${className}`}
    >
      <AlertCircle size={13} className="shrink-0 stroke-[2.2]" />
      <span>{message}</span>
    </div>
  );
}
