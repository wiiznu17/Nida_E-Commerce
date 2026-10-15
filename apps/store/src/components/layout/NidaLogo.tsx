import React from 'react';

export function NidaLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize =
    size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl';

  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="flex items-center space-x-2">
        <span
          className={`font-sans font-black tracking-[0.25em] text-[#2B1810] uppercase ${textSize}`}
        >
          NIDA
        </span>
      </div>
      {/* Signature Ribbon / Flag emblem in Brown, White, Yellow */}
      <div className="flex w-14 h-1.5 mt-0.5 rounded-xs overflow-hidden shadow-xs">
        <div className="w-1/3 bg-[#2B1810]"></div>
        <div className="w-1/3 bg-white border-y border-[#EAE3D9]"></div>
        <div className="w-1/3 bg-[#F59E0B]"></div>
      </div>
    </div>
  );
}
