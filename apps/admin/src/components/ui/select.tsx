import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from 'cn';

function Select({
  value,
  onValueChange,
  defaultValue,
  children,
  disabled,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(val) => {
        if (typeof val === 'string' && onValueChange) {
          onValueChange(val);
        }
      }}
      defaultValue={defaultValue}
      disabled={disabled}
    >
      {children}
    </SelectPrimitive.Root>
  );
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'group/select-trigger flex h-8.5 w-full items-center justify-between gap-2 rounded-xs border border-[#EAE3D9] bg-white px-3 py-2 text-xs text-[#2B1810] shadow-2xs outline-none transition-colors select-none',
      'hover:border-[#2B1810]/40 focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810]/20',
      'disabled:cursor-not-allowed disabled:opacity-50 data-[popup-open]:border-[#2B1810]',
      className,
    )}
    {...props}
  >
    <span className="truncate flex-1 text-left">{children}</span>
    <SelectPrimitive.Icon className="shrink-0 text-gray-400 group-hover/select-trigger:text-[#2B1810] transition-transform duration-200 group-data-[popup-open]/select-trigger:rotate-180">
      <ChevronDown size={14} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = SelectPrimitive.Value;

function SelectContent({
  className,
  children,
  sideOffset = 4,
}: {
  className?: string;
  children: React.ReactNode;
  sideOffset?: number;
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={sideOffset} className="z-50 min-w-[var(--anchor-width)]">
        <SelectPrimitive.Popup
          className={cn(
            'max-h-64 overflow-y-auto rounded-xs border border-[#EAE3D9] bg-white p-1 text-xs text-[#2B1810] shadow-lg outline-none',
            'animate-in fade-in-0 zoom-in-95',
            className,
          )}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full items-center justify-between rounded-xs px-2.5 py-1.5 text-xs text-gray-700 outline-none select-none cursor-pointer transition-colors',
      'data-[highlighted]:bg-[#FAF7F2] data-[highlighted]:text-[#2B1810]',
      'data-[selected]:font-bold data-[selected]:text-[#2B1810] data-[selected]:bg-[#FAF7F2]/60',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="truncate">{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="shrink-0 pl-2 text-[#2B1810]">
      <Check size={13} />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

export interface DropdownSelectOption {
  value: string;
  label: string;
}

export interface DropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
}: DropdownSelectProps) {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <span className="truncate">{selectedOption?.label ?? placeholder ?? value}</span>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
