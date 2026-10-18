import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminPageHeader, type AdminBreadcrumbItem } from './AdminPageHeader';
import { AdminFooter } from './AdminFooter';
export { NidaLogo } from '../common/NidaLogo';
export type { AdminBreadcrumbItem } from './AdminPageHeader';

export interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  breadcrumbs?: AdminBreadcrumbItem[];
  hidePageHeader?: boolean;
}

export function AdminLayout({
  children,
  title,
  subtitle,
  actionButton,
  breadcrumbs,
  hidePageHeader = false,
}: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-brown flex">
      {/* Sidebar (Desktop Fixed & Mobile Slide-over) */}
      <AdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Stage (Offset by sidebar width on desktop) */}
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <AdminHeader
          title={title}
          onOpenMobile={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Title & Breadcrumb Header */}
        {!hidePageHeader && (title || actionButton || breadcrumbs) && (
          <AdminPageHeader
            title={title || ''}
            subtitle={subtitle}
            actionButton={actionButton}
            breadcrumbs={breadcrumbs}
          />
        )}

        {/* Page Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          {children}
        </main>

        {/* Admin Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}
