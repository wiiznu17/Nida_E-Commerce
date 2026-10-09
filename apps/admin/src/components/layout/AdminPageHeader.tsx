import React from 'react';

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export function AdminPageHeader({ title, subtitle, actionButton }: AdminPageHeaderProps) {
  return (
    <div className="bg-white border-b border-[#EAE3D9] py-3.5 sm:py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2B1810] uppercase tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>}
        </div>

        {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
      </div>
    </div>
  );
}
