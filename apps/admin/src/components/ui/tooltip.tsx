import * as React from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { Info } from 'lucide-react';
import { cn } from 'cn';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;
export const TooltipPositioner = TooltipPrimitive.Positioner;

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Popup> {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(({ className, children, side = 'top', sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
      <TooltipPrimitive.Popup
        ref={ref}
        className={cn(
          'z-50 max-w-xs rounded-xs border border-stone-800 bg-stone-900 px-3 py-2 text-stone-100 shadow-xl transition-opacity',
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Popup>
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';

export interface InfoTooltipProps {
  title?: string;
  description: string;
  formula?: string;
  children?: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconClassName?: string;
  delay?: number;
  closeDelay?: number;
}

export function InfoTooltip({
  title,
  description,
  formula,
  children,
  side = 'top',
  className = '',
  iconClassName = '',
  delay = 100,
  closeDelay = 0,
}: InfoTooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger
        type="button"
        delay={delay}
        closeDelay={closeDelay}
        className={cn(
          'inline-flex items-center text-stone-400 hover:text-stone-200 transition-colors focus:outline-none cursor-help',
          className,
        )}
      >
        {children ?? <Info size={12} className={iconClassName} />}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={6}>
          <TooltipPrimitive.Popup className="z-50 max-w-xs rounded-xs border border-stone-800 bg-stone-900 px-3 py-2 text-stone-100 shadow-xl text-left pointer-events-none">
            {title && (
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-200/90 mb-1">
                {title}
              </div>
            )}
            <div className="text-[11px] text-stone-300 leading-relaxed font-sans">
              {description}
            </div>
            {formula && (
              <div className="mt-1.5 pt-1.5 border-t border-stone-800 text-[10px] font-mono text-amber-300 bg-stone-950/60 px-1.5 py-0.5 rounded-xs">
                <span className="text-stone-400 font-sans mr-1">คำนวณ:</span>
                {formula}
              </div>
            )}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
