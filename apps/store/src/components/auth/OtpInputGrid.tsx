import React from 'react';

interface OtpInputGridProps {
  otp: string[];
  isLoading: boolean;
  inputRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  onChange: (val: string, index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

export function OtpInputGrid({
  otp,
  isLoading,
  inputRefs,
  onChange,
  onKeyDown,
  onPaste,
}: OtpInputGridProps) {
  return (
    <div className="flex justify-between gap-2 max-w-xs mx-auto">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className="w-11 h-14 border-2 border-gray-300 text-center text-xl font-bold font-mono bg-white text-brand-brown focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-colors disabled:bg-gray-100"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={isLoading}
          onChange={(e) => onChange(e.target.value, index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          required
        />
      ))}
    </div>
  );
}
