'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
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
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
        <div className="border border-dashed border-gray-300 p-12 sm:p-16 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3 shadow-2xs">
            <Package size={26} />
          </div>
          <h3 className="text-base font-bold text-brand-brown uppercase tracking-wide mb-1">
            {t('trackOrder.emptyOrders')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mb-6">
            {t('trackOrder.emptyOrdersDesc')}
          </p>
          <Link
            href="/collections"
            className="bg-brand-brown hover:bg-brand-amber text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center"
          >
            <span>{t('trackOrder.browseCatalog')}</span>
          </Link>
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="border border-dashed border-gray-300 p-10 sm:p-12 text-center bg-gray-50/50">
          <h3 className="text-sm font-bold text-brand-brown uppercase tracking-wide mb-1">
            {t('orderHistory.noFilterResults')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            {t('orderHistory.noFilterResultsDesc')}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="border border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white px-5 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <RotateCcw size={13} />
            <span>{t('orderHistory.clearFilters')}</span>
          </button>
        </div>
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
