import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { DropdownSelect, SearchInput, Pagination } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { orderRequester } from '../api/requester/orderRequester';
import {
  CancellationTable,
  CancellationReviewModal,
} from '../components/order';
import type {
  ApiOrderCancellationWithOrder,
  AdminCancellationStatusCounts,
} from '@repo/types';

export default function AdminCancellations() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<ApiOrderCancellationWithOrder[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] =
    useState<AdminCancellationStatusCounts>({
      all: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    });
  const [isLoading, setIsLoading] = useState(false);

  // URL-driven search & filter params
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') ?? '';
  const statusFilter =
    (searchParams.get('status') as
      'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') ?? 'ALL';
  const urlSortBy =
    (searchParams.get('sortBy') as 'newest' | 'oldest') ?? 'newest';
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10) || 1;
  const pageSize = 10;

  // Local draft form inputs (only applied on clicking Search)
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [sortByInput, setSortByInput] = useState(urlSortBy);

  useEffect(() => {
    setSearchInput(urlSearch);
    setSortByInput(urlSortBy);
  }, [urlSearch, urlSortBy]);

  // Review Modal
  const [selectedRequest, setSelectedRequest] =
    useState<ApiOrderCancellationWithOrder | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await orderRequester.getCancellationRequests({
        search: urlSearch || undefined,
        status: statusFilter,
        sortBy: urlSortBy,
        page: currentPage,
        pageSize,
      });
      setItems(res.items ?? []);
      setTotalItems(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
      if (res.statusCounts) {
        setStatusCounts(res.statusCounts);
      }
    } catch (err: unknown) {
      console.warn('Backend cancellations unavailable:', err);
      setItems([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [urlSearch, statusFilter, urlSortBy, currentPage, pageSize]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const next = new URLSearchParams();
    if (searchInput.trim()) next.set('search', searchInput.trim());
    if (statusFilter && statusFilter !== 'ALL')
      next.set('status', statusFilter);
    if (sortByInput && sortByInput !== 'newest')
      next.set('sortBy', sortByInput);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSortByInput('newest');
    setSearchParams(new URLSearchParams());
  };

  const handleStatusFilterChange = (status: string) => {
    const next = new URLSearchParams(searchParams);
    if (status === 'ALL') {
      next.delete('status');
    } else {
      next.set('status', status);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
  };

  return (
    <AdminLayout
      title={t('cancellationsPage.title')}
      subtitle={t('cancellationsPage.subtitle')}
    >
      <div className="space-y-6">
        {/* Filter Card */}
        <div className="bg-white border border-brand-border p-5 rounded-xs space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => handleStatusFilterChange('ALL')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#2B1810] text-white shadow-2xs font-black'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>
                  {t('cancellationsPage.filterAll')} ({statusCounts.all})
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('PENDING')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-2xs font-black'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'PENDING' ? 'bg-white' : 'bg-amber-500'}`}
                />
                <span>
                  {t('cancellationsPage.filterPending')} ({statusCounts.pending}
                  )
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('APPROVED')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'APPROVED'
                    ? 'bg-emerald-700 text-white shadow-2xs font-black'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'APPROVED' ? 'bg-white' : 'bg-emerald-500'}`}
                />
                <span>
                  {t('cancellationsPage.filterApproved')} (
                  {statusCounts.approved})
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('REJECTED')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'REJECTED'
                    ? 'bg-stone-700 text-white shadow-2xs font-black'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'REJECTED' ? 'bg-white' : 'bg-stone-400'}`}
                />
                <span>
                  {t('cancellationsPage.filterRejected')} (
                  {statusCounts.rejected})
                </span>
              </button>
            </div>
            <div className="text-[11px] font-bold text-gray-500">
              {language === 'th'
                ? `แสดง ${items.length} จากทั้งหมด ${totalItems} คำขอ`
                : `Showing ${items.length} of ${totalItems} requests`}
            </div>
          </div>

          {/* Search Row */}
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-7">
                <SearchInput
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder={t('cancellationsPage.searchPlaceholder')}
                />
              </div>
              <div className="lg:col-span-3">
                <DropdownSelect
                  value={sortByInput}
                  onChange={(val) => setSortByInput(val as 'newest' | 'oldest')}
                  options={[
                    { value: 'newest', label: t('orders.sortNewest') },
                    { value: 'oldest', label: t('orders.sortOldest') },
                  ]}
                />
              </div>
              <div className="flex items-center space-x-1.5 sm:col-span-2 lg:col-span-2">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-brand-brown hover:bg-brand-dark-brown text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <Search size={13} />
                  <span>{t('orders.searchBtn')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 bg-brand-cream hover:bg-brand-border border border-brand-border rounded-xs transition-colors cursor-pointer"
                  title={t('orders.resetBtn')}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Table */}
        <CancellationTable
          items={items}
          isLoading={isLoading}
          onReview={(req) => setSelectedRequest(req)}
        />

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <CancellationReviewModal
        isOpen={Boolean(selectedRequest)}
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onSuccess={() => loadRequests()}
      />
    </AdminLayout>
  );
}
