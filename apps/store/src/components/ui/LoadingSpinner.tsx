'use client';

import React from 'react';
import { cn } from 'cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'brand' | 'white' | 'amber';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'brand',
  text,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-10 h-10 border-2',
    xl: 'w-14 h-14 border-[3px]',
  };

  const variantStyles = {
    brand: 'border-brand-brown border-t-transparent',
    white: 'border-white border-t-transparent',
    amber: 'border-brand-amber border-t-transparent',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center font-sans', className)}>
      <div
        className={cn(
          'rounded-full animate-spin shrink-0',
          sizeStyles[size],
          variantStyles[variant],
        )}
      />
      {text && (
        <p className="mt-3 text-xs uppercase font-bold tracking-widest text-gray-500">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
