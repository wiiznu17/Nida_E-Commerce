import * as React from 'react';
import { cn } from 'cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-8.5 w-full rounded-xs border border-brand-border bg-white px-3 py-2 text-xs text-brand-brown shadow-2xs outline-none transition-all placeholder:text-gray-400',
          'hover:border-brand-brown/40 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown/20',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-16 w-full rounded-xs border border-brand-border bg-white px-3 py-2 text-xs text-brand-brown shadow-2xs outline-none transition-all placeholder:text-gray-400',
          'hover:border-brand-brown/40 focus:border-brand-brown focus:ring-1 focus:ring-brand-brown/20',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
