import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../components/layout';
import { Pagination } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { orderRequester } from '../api/requester/orderRequester';
import {
  ReturnTable,
  ReturnFilterCard,
  OrderReturnInspectModal,
  ReturnReviewModal,
  type ReturnFilterTab,
  type ReturnInspectModalData,
} from '../components/order';
import type {
  ApiReturnRequestWithOrder,
  AdminReturnStatusCounts,
} from '@repo/types';

export default function AdminReturns() {
  const { t, isTh } = useLanguage();
  const toast = useToast();
  const [items, setItems] = useState<ApiReturnRequestWithOrder[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<AdminReturnStatusCounts>({
    all: 0,
    requested: 0,
    approved: 0,
    shipped: 0,
    completed: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Review & Inspect Modals
  const [reviewModalRequest, setReviewModalRequest] =
    useState<ApiReturnRequestWithOrder | null>(null);
  const [inspectModal, setInspectModal] =
    useState<ReturnInspectModalData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // URL-driven search & filter params
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') ?? '';
  const statusFilter = (searchParams.get('status') as ReturnFilterTab) ?? 'ALL';
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

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await orderRequester.getReturnRequests({
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
      console.warn('Backend returns unavailable:', err);
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

  const handleStatusFilterChange = (status: ReturnFilterTab) => {
    const next = new URLSearchParams(searchParams);
    if (status === 'ALL') next.delete('status');
    else next.set('status', status);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
  };

  const handleOpenInspect = (req: ApiReturnRequestWithOrder) => {
    const itemsTotal = req.items.reduce(
      (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
      0,
    );
    const shippingFee = req.returnShippingFee ?? 0;
    const defaultRefund = itemsTotal + shippingFee;
    const max = req.order?.totalAmount
      ? req.order.totalAmount + shippingFee
      : defaultRefund;

    setInspectModal({
      id: req.id,
      requestNumber: req.requestNumber,
      carrier: req.returnCarrier,
      trackingNumber: req.returnTrackingNumber,
      shippingFee: req.returnShippingFee,
      receiptUrl: req.returnShippingReceiptUrl,
      maxAmount: max,
      amount: defaultRefund.toString(),
      adminNote: '',
      restock: true,
    });
  };

  const handleConfirmInspect = async () => {
    if (!inspectModal) return;
    setIsProcessing(true);
    try {
      const parsedAmount = parseFloat(inspectModal.amount);
      const res = await orderRequester.reviewReturnRequest(inspectModal.id, {
        action: 'COMPLETE',
        refundAmount: isNaN(parsedAmount) ? undefined : parsedAmount,
        adminNote: inspectModal.adminNote.trim() || undefined,
        restockInventory: inspectModal.restock,
      });
      toast.success(res.message);
      setInspectModal(null);
      await loadRequests();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : isTh
            ? 'เกิดข้อผิดพลาดในการตรวจรับและคืนเงิน'
            : 'Failed to complete return and refund',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout
      title={t('returnsPage.title')}
      subtitle={t('returnsPage.subtitle')}
      breadcrumbs={[
        { label: t('nav.salesOrders') },
        { label: t('returnsPage.title') },
      ]}
    >
      <div className="space-y-6">
        <ReturnFilterCard
          statusFilter={statusFilter}
          statusCounts={statusCounts}
          totalItems={totalItems}
          itemsCount={items.length}
          searchInput={searchInput}
          sortByInput={sortByInput}
          onStatusChange={handleStatusFilterChange}
          onSearchInputChange={setSearchInput}
          onSortByChange={setSortByInput}
          onSubmit={handleSearchSubmit}
          onReset={handleResetSearch}
        />

        <ReturnTable
          items={items}
          isLoading={isLoading}
          onReview={(req) => setReviewModalRequest(req)}
          onInspect={(req) => handleOpenInspect(req)}
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

      <ReturnReviewModal
        isOpen={Boolean(reviewModalRequest)}
        request={reviewModalRequest}
        onClose={() => setReviewModalRequest(null)}
        onSuccess={() => {
          setReviewModalRequest(null);
          loadRequests();
        }}
      />

      <OrderReturnInspectModal
        modalData={inspectModal}
        isProcessing={isProcessing}
        onClose={() => setInspectModal(null)}
        onChange={setInspectModal}
        onConfirm={handleConfirmInspect}
      />
    </AdminLayout>
  );
}
