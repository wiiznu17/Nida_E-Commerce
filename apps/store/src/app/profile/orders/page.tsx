'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import {
  OrdersMetricsOverview,
  OrdersFilterToolbar,
  OrdersListItem,
  OrdersPagination,
  useCustomerOrders,
} from '@/components/profile/orders';

export default function ProfileOrdersPage() {
  const { t } = useLanguage();
  const {
    user,
    isLoading,
    allOrdersCount,
    metrics,
    statusCounts,
    statusFilter,
    handleStatusFilterChange,
    searchQuery,
    handleSearchChange,
    sortBy,
    setSortBy,
    pageSize,
    handlePageSizeChange,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    paginatedOrders,
    handleResetFilters,
  } = useCustomerOrders();

  if (!user && isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center text-xs font-black uppercase tracking-wider text-gray-500 hover:text-brand-brown transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          <span>{t('orderHistory.backToProfile')}</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-6 sm:mb-8 pb-4 border-b border-gray-200">
        <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-1">
          NIDA CUSTOMER PORTAL
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-brown uppercase tracking-tight">
          {t('orderHistory.title')}
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-xl">
          {t('orderHistory.subtitle')}
        </p>
      </div>

      {/* Metrics Stat Cards (Desktop Grid & Mobile Scroll) */}
      {allOrdersCount > 0 && <OrdersMetricsOverview metrics={metrics} />}

      {/* Filter and Search Bar */}
      {allOrdersCount > 0 && (
        <OrdersFilterToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          statusCounts={statusCounts}
          sortBy={sortBy}
          onSortChange={setSortBy}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Orders List / Loading / Empty States */}
      {isLoading ? (
        <div className="space-y-4 py-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 p-6 bg-white animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded-xs w-48 mb-4" />
              <div className="h-16 bg-gray-100 rounded-xs w-full" />
            </div>
          ))}
        </div>
      ) : allOrdersCount === 0 ? (
        <EmptyState
          variant="dashed"
          icon={Package}
          title={t('trackOrder.emptyOrders')}
          description={t('trackOrder.emptyOrdersDesc')}
          action={{
            label: t('trackOrder.browseCatalog'),
            href: '/collections',
          }}
          className="p-12 sm:p-16"
        />
      ) : paginatedOrders.length === 0 ? (
        <EmptyState
          variant="dashed"
          icon={RotateCcw}
          title={t('orderHistory.noFilterResults')}
          description={t('orderHistory.noFilterResultsDesc')}
          action={{
            label: t('orderHistory.clearFilters'),
            onClick: handleResetFilters,
          }}
          className="p-10 sm:p-12"
        />
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => (
            <OrdersListItem key={order.id} order={order} />
          ))}

          {/* Pagination Controls */}
          <OrdersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
