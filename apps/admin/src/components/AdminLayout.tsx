import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminPageHeader } from './AdminPageHeader';
import { AdminFooter } from './AdminFooter';
export { NidaLogo } from './NidaLogo';

export interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export function AdminLayout({ children, title, subtitle, actionButton }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#2B1810] flex">
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
        {(title || actionButton) && (
          <AdminPageHeader
            title={title || ''}
            subtitle={subtitle}
            actionButton={actionButton}
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
