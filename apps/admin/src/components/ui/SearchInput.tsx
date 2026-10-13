import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from 'cn';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search...',
      className,
      containerClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const handleClear = () => {
      onChange('');
      if (onClear) onClear();
    };

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none"
        />
        <input
          ref={ref}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-8.5 pl-9 pr-8 text-xs bg-white text-[#2B1810] placeholder:text-gray-400',
            'border border-[#EAE3D9] rounded-xs shadow-2xs outline-none transition-all',
            'hover:border-[#2B1810]/40 focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810]/20',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50',
            className,
          )}
          {...props}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 rounded-xs transition-colors cursor-pointer"
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
