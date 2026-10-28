import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader, type AdminBreadcrumbItem } from './AdminHeader';
import { AdminFooter } from './AdminFooter';
import { TooltipProvider } from '../ui';
export { NidaLogo } from '../common/NidaLogo';
export type { AdminBreadcrumbItem } from './AdminHeader';

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
  subtitle: _subtitle,
  actionButton,
  breadcrumbs,
  hidePageHeader: _hidePageHeader = false,
}: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(
    () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('nida_admin_sidebar_open');
        return saved !== null ? saved === 'true' : true;
      }
      return true;
    },
  );

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsDesktopSidebarOpen((prev) => {
        const next = !prev;
        if (typeof window !== 'undefined') {
          localStorage.setItem('nida_admin_sidebar_open', String(next));
        }
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-brown flex w-full overflow-x-hidden">
      {/* Sidebar (Desktop Fixed/Collapsible & Mobile Slide-over) */}
      <AdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isDesktopOpen={isDesktopSidebarOpen}
      />

      {/* Main Content Stage (Offset by sidebar width on desktop if open) */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out ${
          isDesktopSidebarOpen ? 'lg:pl-60' : 'lg:pl-0'
        }`}
      >
        {/* Top Navbar */}
        <AdminHeader
          title={title}
          breadcrumbs={breadcrumbs}
          actionButton={actionButton}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Page Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 min-w-0">
          <TooltipProvider delay={100} timeout={300} closeDelay={0}>
            {children}
          </TooltipProvider>
        </main>

        {/* Admin Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}
