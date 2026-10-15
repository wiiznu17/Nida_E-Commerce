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
                ? 'text-brand-amber hover:text-amber-700 border-transparent hover:border-brand-amber'
                : activeMegaMenu === dept.id
                  ? 'text-brand-brown border-brand-brown'
                  : 'text-brand-brown hover:text-brand-amber border-transparent'
            }`}
          >
            {dept.label}
            {dept.isSale && (
              <span className="ml-1.5 bg-brand-yellow text-brand-brown text-[9px] px-1.5 py-0.2 font-black rounded-xs">
                50% OFF
              </span>
            )}
          </Link>
        </div>
      ))}
    </nav>
  );
}
