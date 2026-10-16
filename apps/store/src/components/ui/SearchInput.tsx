'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from 'cn';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = 'Search...',
  size = 'md',
  disabled = false,
  className,
  inputClassName,
  autoFocus = false,
}: SearchInputProps) {
  const sizeStyles = {
    sm: 'h-8 text-xs pl-8 pr-7',
    md: 'h-9 sm:h-10 text-xs pl-9 pr-8',
    lg: 'h-11 text-sm pl-10 pr-9',
  };

  const iconSizes = {
    sm: 13,
    md: 14,
    lg: 16,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === 'Escape' && onClear) {
      e.preventDefault();
      onClear();
    }
  };

  return (
    <div className={cn('relative flex items-center font-sans', className)}>
      <Search
        size={iconSizes[size]}
        className="absolute left-3 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'w-full bg-white border border-gray-200 rounded-xs placeholder-gray-400 text-brand-brown outline-none transition-colors font-medium',
          'focus:border-brand-brown focus:bg-white',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeStyles[size],
          inputClassName,
        )}
      />
      {value.length > 0 && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 p-0.5 text-gray-400 hover:text-brand-brown rounded-xs transition-colors cursor-pointer"
          title="Clear search"
          aria-label="Clear search"
        >
          <X size={iconSizes[size]} />
        </button>
      )}
    </div>
  );
}
