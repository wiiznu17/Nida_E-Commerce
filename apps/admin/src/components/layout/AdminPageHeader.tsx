import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface AdminBreadcrumbItem {
  label: string;
  path?: string;
}

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  breadcrumbs?: AdminBreadcrumbItem[];
}

export function AdminPageHeader({
  title,
  subtitle,
  actionButton,
  breadcrumbs,
}: AdminPageHeaderProps) {
  return (
    <div className="bg-white border-b border-brand-border py-3.5 sm:py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-stone-500 mb-1.5">
              {breadcrumbs.map((bc, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <ChevronRight size={11} className="text-stone-400 shrink-0" />
                    )}
                    {bc.path && !isLast ? (
                      <Link
                        to={bc.path}
                        className="hover:text-brand-brown font-semibold transition-colors hover:underline"
                      >
                        {bc.label}
                      </Link>
                    ) : (
                      <span className={isLast ? 'text-brand-brown font-black' : 'font-medium'}>
                        {bc.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          <h1 className="text-xl sm:text-2xl font-black text-brand-brown uppercase tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
      </div>
    </div>
  );
}
