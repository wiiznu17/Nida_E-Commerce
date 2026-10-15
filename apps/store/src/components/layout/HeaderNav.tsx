import React from 'react';
import Link from 'next/link';
import type { NavDepartment } from './types';

interface HeaderNavProps {
  departments: NavDepartment[];
  activeMegaMenu: string | null;
  onMouseEnter: (deptId: string) => void;
  onMouseLeave: () => void;
}

export function HeaderNav({
  departments,
  activeMegaMenu,
  onMouseEnter,
  onMouseLeave,
}: HeaderNavProps) {
  return (
    <nav className="hidden lg:flex items-center space-x-5 xl:space-x-8 h-full">
      {departments.map((dept) => (
        <div
          key={dept.id}
          className="h-full flex items-center relative flex-shrink-0"
          onMouseEnter={() => onMouseEnter(dept.id)}
          onMouseLeave={onMouseLeave}
        >
          <Link
            href={dept.path}
            className={`text-xs font-bold tracking-[0.12em] py-7 transition-colors flex items-center whitespace-nowrap border-b-2 ${
              dept.isSale
                ? 'text-[#D97706] hover:text-[#B45309] border-transparent hover:border-[#D97706]'
                : activeMegaMenu === dept.id
                  ? 'text-[#2B1810] border-[#2B1810]'
                  : 'text-[#2B1810] hover:text-[#D97706] border-transparent'
            }`}
          >
            {dept.label}
            {dept.isSale && (
              <span className="ml-1.5 bg-[#F59E0B] text-[#2B1810] text-[9px] px-1.5 py-0.2 font-black rounded-xs">
                50% OFF
              </span>
            )}
          </Link>
        </div>
      ))}
    </nav>
  );
}
