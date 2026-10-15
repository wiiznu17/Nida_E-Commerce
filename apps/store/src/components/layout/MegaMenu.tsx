import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { MegaMenuDepartment } from './types';

interface MegaMenuProps {
  departmentKey: string;
  departmentData: MegaMenuDepartment;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  shopThisEditLabel: string;
}

export function MegaMenu({
  departmentData,
  onMouseEnter,
  onMouseLeave,
  shopThisEditLabel,
}: MegaMenuProps) {
  return (
    <div
      className="absolute top-full left-0 w-full bg-white border-b-2 border-[#2B1810] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
        <div className="grid grid-cols-12 gap-8">
          {/* Category Links Columns */}
          <div className="col-span-8 grid grid-cols-3 gap-8">
            {departmentData.categories.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-xs font-black tracking-[0.2em] text-[#2B1810] uppercase pb-2 border-b border-[#EAE3D9]">
                  {group.title}
                </h4>
                <ul className="space-y-2.5">
                  {group.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        className="text-xs font-medium text-gray-700 hover:text-[#D97706] transition-colors block py-0.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Campaign Promotional Highlight Tile */}
          <div className="col-span-4 border-l border-[#EAE3D9] pl-8">
            <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-4 group cursor-pointer hover:border-[#2B1810] transition-all">
              <div className="relative aspect-[16/10] overflow-hidden mb-4 bg-gray-200">
                <img
                  src={departmentData.promo.image}
                  alt={departmentData.promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-3 left-3 bg-[#2B1810] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                  {departmentData.promo.tag}
                </span>
              </div>
              <h5 className="font-bold text-sm text-[#2B1810] mb-1">
                {departmentData.promo.title}
              </h5>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {departmentData.promo.subtitle}
              </p>
              <Link
                href={departmentData.promo.link}
                className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#2B1810] group-hover:text-[#D97706] transition-colors"
              >
                {shopThisEditLabel}{' '}
                <ArrowRight
                  size={12}
                  className="ml-1.5 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
