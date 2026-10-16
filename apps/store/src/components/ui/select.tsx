'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from 'cn';

export interface DropdownOption<T extends string = string> {
  id: T;
  label: string;
}

export interface DropdownSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly DropdownOption<T>[] | DropdownOption<T>[];
  prefixLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  variant?: 'outline' | 'ghost' | 'pill';
  className?: string;
  menuClassName?: string;
}

export function DropdownSelect<T extends string = string>({
  value,
  onChange,
  options,
  prefixLabel,
  placeholder,
  disabled = false,
  size = 'md',
  variant = 'outline',
  className,
  menuClassName,
}: DropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayLabel = selectedOption?.label ?? placeholder ?? value;

  const sizeStyles = {
    sm: 'text-[11px] h-7 px-2.5 py-1',
    md: 'text-xs h-9 px-3 py-1.5',
  };

  const variantStyles = {
    outline:
      'border border-brand-border bg-white text-brand-brown hover:bg-brand-warm-cream focus:border-brand-brown shadow-2xs',
    ghost:
      'border-transparent bg-transparent text-brand-brown hover:text-brand-amber',
    pill: 'border border-gray-200 bg-white text-brand-brown rounded-full hover:border-brand-brown',
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'inline-flex items-center justify-between gap-1.5 font-bold tracking-wider uppercase rounded-xs transition-colors cursor-pointer select-none outline-none',
          sizeStyles[size],
          variantStyles[variant],
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1 truncate">
          {prefixLabel && (
            <span className="text-gray-400 font-medium normal-case">
              {prefixLabel}:
            </span>
          )}
          <span className="truncate">{displayLabel}</span>
        </span>
        <ChevronDown
          size={13}
          className={cn(
            'shrink-0 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180 text-brand-brown',
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute right-0 mt-1 min-w-[12rem] bg-white border border-brand-border shadow-xl rounded-xs py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150',
            menuClassName,
          )}
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer select-none',
                  isSelected
                    ? 'font-black text-brand-brown bg-brand-warm-cream'
                    : 'font-medium text-gray-700 hover:bg-brand-warm-cream hover:text-brand-brown',
                )}
              >
                <span className="truncate mr-2">{option.label}</span>
                {isSelected && (
                  <Check size={13} className="shrink-0 text-brand-brown" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
