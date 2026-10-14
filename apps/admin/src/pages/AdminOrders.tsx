import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, ExternalLink, Eye, X, MapPin, CreditCard, Send, Search, RotateCcw } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import {
  DropdownSelect,
  Alert,
  SearchInput,
  EmptyState,
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { orderRequester } from '../api/requester/orderRequester';
import { STOREFRONT_URL } from '../config';
import type { AdminOrder } from '../data/adminData';
import { INITIAL_ORDERS } from '../data/adminData';
import { PermissionGate } from '../components/common';
import { AdminPermission, type ApiOrder, type OrderStatus } from '@repo/types';

export function mapApiOrderToAdminOrder(api: ApiOrder): AdminOrder {
  return {
    id: api.id,
    orderNumber: api.orderNumber,
    customerName: api.shippingAddress?.recipientName || 'Valued Customer',
    customerEmail: 'customer@nida.com',
    customerPhone: api.shippingAddress?.phone || '-',
    shippingAddress: api.shippingAddress?.addressLine1 || '-',
    city: api.shippingAddress?.province || '-',
    postalCode: api.shippingAddress?.postalCode || '-',
    items: (api.items ?? []).map((i) => ({
      productId: i.id,
      productName: i.productName,
      size: i.variantInfo,
      color: 'Standard',
      quantity: i.quantity,
      price: i.unitPrice,
      image: i.imageUrl ?? '',
    })),
    totalAmount: api.totalAmount,
    paymentMethod: api.payment?.paymentMethod ?? 'CREDIT_CARD',
    status: api.status as AdminOrder['status'],
    courierName: api.shipments?.[0]?.courierName,
    trackingNumber: api.shipments?.[0]?.trackingNumber,
    createdAt: api.placedAt,
  };
}

export default function AdminOrders() {
  const { t, language } = useLanguage();
  const [ordersList, setOrdersList] = useState<AdminOrder[]>([]);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc'>('newest');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & interaction states
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [orderToFulfill, setOrderToFulfill] = useState<AdminOrder | null>(null);
  const [courier, setCourier] = useState('Kerry Express TH');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const apiOrders = await orderRequester.getOrders();
      if (apiOrders && apiOrders.length > 0) {
        setOrdersList(apiOrders.map(mapApiOrderToAdminOrder));
      } else {
        setOrdersList(INITIAL_ORDERS);
      }
    } catch (err: unknown) {
      console.warn('Backend orders unavailable, using seed orders:', err);
      setOrdersList(INITIAL_ORDERS);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setStatusFilter('ALL');
    setPaymentFilter('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleOpenFulfill = (order: AdminOrder) => {
    setOrderToFulfill(order);
    setTrackingNumber(order.trackingNumber || `KER-${Math.floor(100000000 + Math.random() * 900000000)}TH`);
    setIsFulfillModalOpen(true);
  };

  const handleFulfillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToFulfill) return;

    try {
      await orderRequester.fulfill(orderToFulfill.orderNumber, {
        courierName: courier,
        trackingNumber,
      });
      await loadOrders();
    } catch {
      setOrdersList((prev) =>
        prev.map((o) =>
          o.id === orderToFulfill.id
            ? { ...o, status: 'SHIPPED', courierName: courier, trackingNumber }
            : o,
        ),
      );
    }

    setIsFulfillModalOpen(false);
    showToast(
      language === 'th'
        ? `อัปเดตคำสั่งซื้อ #${orderToFulfill.orderNumber} เป็น 'จัดส่งแล้ว' พร้อมเลขพัสดุ ${trackingNumber}`
        : `Order #${orderToFulfill.orderNumber} fulfilled with tracking ${trackingNumber}`,
    );
  };

  const handleQuickStatusChange = async (orderId: string, newStatus: AdminOrder['status']) => {
    try {
      await orderRequester.updateStatus(orderId, newStatus as OrderStatus);
      await loadOrders();
    } catch {
      setOrdersList((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    }
    showToast(
      language === 'th'
        ? `เปลี่ยนสถานะคำสั่งซื้อเป็น ${newStatus} เรียบร้อยแล้ว`
        : `Order status updated to ${newStatus}`,
    );
  };

  // Status counts for top tabs
  const allCount = ordersList.length;
  const paidCount = ordersList.filter((o) => o.status === 'PAID').length;
  const processingCount = ordersList.filter((o) => o.status === 'PROCESSING').length;
  const shippedCount = ordersList.filter((o) => o.status === 'SHIPPED').length;
  const deliveredCount = ordersList.filter((o) => o.status === 'DELIVERED').length;
  const cancelledCount = ordersList.filter((o) => o.status === 'CANCELLED').length;

  // Filtered & Sorted Orders
  const filteredOrders = ordersList
    .filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

      const query = appliedSearch.toLowerCase();
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.customerPhone.toLowerCase().includes(query) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(query));

      const matchesPayment =
        paymentFilter === 'ALL' ||
        (paymentFilter === 'CREDIT_CARD' && order.paymentMethod.toLowerCase().includes('credit')) ||
        (paymentFilter === 'PROMPTPAY' && order.paymentMethod.toLowerCase().includes('promptpay')) ||
        (paymentFilter === 'BANK_TRANSFER' && order.paymentMethod.toLowerCase().includes('bank'));

      return matchesStatus && matchesSearch && matchesPayment;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
      if (sortBy === 'amount_asc') return a.totalAmount - b.totalAmount;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadgeStyle = (status: AdminOrder['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-900 border-blue-300';
      case 'PROCESSING':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'PAID':
        return 'bg-purple-50 text-purple-900 border-purple-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout
      title={t('orders.title')}
      subtitle={`${t('orders.subtitle')} (${
        language === 'th'
          ? `แสดง ${filteredOrders.length} จาก ${ordersList.length} รายการ`
          : `${filteredOrders.length} of ${ordersList.length} orders displayed`
      })`}
    >
      <div className="space-y-4">
        {/* Toast */}
        {toastMessage && (
          <Alert
            variant="success"
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* Filter and Search Bar (Styled like ProductListFilters & AdminInventory) */}
        <div className="bg-white border border-brand-border p-4 space-y-3.5 shadow-2xs rounded-xs">
          {/* Top Row: Order Status Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-cream">
            <div className="flex items-center space-x-1.5 p-1 bg-brand-cream border border-brand-border rounded-xs w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => handleStatusFilterChange('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-brand-brown shadow-2xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('orders.filterAll')} ({allCount})
              </button>

              <button
                type="button"
                onClick={() => handleStatusFilterChange('PAID')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'PAID'
                    ? 'bg-purple-700 text-white shadow-2xs font-black'
                    : 'text-purple-900 hover:bg-purple-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'PAID' ? 'bg-white' : 'bg-purple-500'}`}
                />
                <span>
                  {t('orders.filterPaid')} ({paidCount})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusFilterChange('PROCESSING')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'PROCESSING'
                    ? 'bg-amber-600 text-white shadow-2xs font-black'
                    : 'text-amber-900 hover:bg-amber-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'PROCESSING' ? 'bg-white' : 'bg-amber-500'}`}
                />
                <span>
                  {t('orders.filterProcessing')} ({processingCount})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusFilterChange('SHIPPED')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'SHIPPED'
                    ? 'bg-blue-600 text-white shadow-2xs font-black'
                    : 'text-blue-900 hover:bg-blue-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'SHIPPED' ? 'bg-white' : 'bg-blue-500'}`}
                />
                <span>
                  {t('orders.filterShipped')} ({shippedCount})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusFilterChange('DELIVERED')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'DELIVERED'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'DELIVERED' ? 'bg-white' : 'bg-emerald-500'}`}
                />
                <span>
                  {t('orders.filterDelivered')} ({deliveredCount})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusFilterChange('CANCELLED')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'CANCELLED'
                    ? 'bg-gray-700 text-white shadow-2xs font-black'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'CANCELLED' ? 'bg-white' : 'bg-gray-500'}`}
                />
                <span>
                  {t('orders.filterCancelled')} ({cancelledCount})
                </span>
              </button>
            </div>

            <div className="text-[11px] font-bold text-gray-500">
              {language === 'th'
                ? `แสดง ${filteredOrders.length} จากทั้งหมด ${ordersList.length} ออเดอร์`
                : `Showing ${filteredOrders.length} of ${ordersList.length} orders`}
            </div>
          </div>

          {/* Main Filter Row: Search & Dropdowns */}
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* Search Input (4 cols on lg) */}
              <div className="lg:col-span-4">
                <SearchInput
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder={t('orders.searchPlaceholder')}
                />
              </div>

              {/* Payment Method Filter Dropdown (3 cols on lg) */}
              <div className="lg:col-span-3">
                <DropdownSelect
                  value={paymentFilter}
                  onChange={(val) => {
                    setPaymentFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: t('orders.allPaymentMethods') },
                    { value: 'CREDIT_CARD', label: 'Credit Card' },
                    { value: 'PROMPTPAY', label: 'PromptPay QR' },
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                  ]}
                />
              </div>

              {/* Sort By Dropdown (3 cols on lg) */}
              <div className="lg:col-span-3">
                <DropdownSelect
                  value={sortBy}
                  onChange={(val) => {
                    setSortBy(val as 'newest' | 'oldest' | 'amount_desc' | 'amount_asc');
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'newest', label: t('orders.sortNewest') },
                    { value: 'oldest', label: t('orders.sortOldest') },
                    { value: 'amount_desc', label: t('orders.sortAmountDesc') },
                    { value: 'amount_asc', label: t('orders.sortAmountAsc') },
                  ]}
                />
              </div>

              {/* Action Buttons: Search & Reset (2 cols on lg) */}
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

        {/* Orders Table Container */}
        <div className="space-y-0">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">{t('orders.table.orderNumber')}</TableHead>
                  <TableHead className="w-56">{t('orders.table.customer')}</TableHead>
                  <TableHead className="min-w-[200px]">{t('orders.table.items')}</TableHead>
                  <TableHead className="w-32 text-right">{t('orders.table.total')}</TableHead>
                  <TableHead className="w-36 text-center">{t('orders.table.status')}</TableHead>
                  <TableHead className="w-48">{t('orders.table.courier')}</TableHead>
                  <TableHead className="w-32 text-right whitespace-nowrap">{t('orders.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-8">
                      <EmptyState
                        icon={Package}
                        title={t('orders.emptyTitle')}
                        subtitle={t('orders.emptySubtitle')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      {/* Order # & Date */}
                      <TableCell>
                        <Link
                          to={`/admin/orders/${order.orderNumber}`}
                          className="font-mono font-black text-brand-brown text-sm hover:underline hover:text-brand-dark-brown"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="text-[11px] text-gray-400 font-normal mt-0.5">{order.createdAt}</div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <div className="font-bold text-brand-brown">{order.customerName}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[200px]">{order.customerEmail}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{order.customerPhone}</div>
                      </TableCell>

                      {/* Purchased Items */}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {order.items[0]?.image && (
                            <img
                              src={order.items[0].image}
                              alt=""
                              className="w-8 h-10 object-cover border border-gray-200 flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-gray-800 line-clamp-1">{order.items[0]?.productName}</div>
                            <div className="text-[10px] text-gray-500">
                              {language === 'th' ? 'ไซส์' : 'Size'} {order.items[0]?.size} • {order.items[0]?.quantity}{' '}
                              {t('orders.detail.pieces')}
                              {order.items.length > 1 &&
                                ` ${t('orders.detail.plusMore').replace('{count}', String(order.items.length - 1))}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Amount & Payment Method */}
                      <TableCell className="text-right">
                        <div className="font-mono font-black text-brand-brown text-sm">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{order.paymentMethod}</div>
                      </TableCell>

                      {/* Status Selector */}
                      <TableCell>
                        <DropdownSelect
                          value={order.status}
                          onChange={(val) => handleQuickStatusChange(order.id, val as AdminOrder['status'])}
                          options={[
                            { value: 'PAID', label: 'PAID' },
                            { value: 'PROCESSING', label: 'PROCESSING' },
                            { value: 'SHIPPED', label: 'SHIPPED' },
                            { value: 'DELIVERED', label: 'DELIVERED' },
                            { value: 'CANCELLED', label: 'CANCELLED' },
                          ]}
                          className={`text-[11px] font-black uppercase h-7.5 px-2.5 py-1 ${getStatusBadgeStyle(
                            order.status,
                          )}`}
                        />
                      </TableCell>

                      {/* Courier & Tracking */}
                      <TableCell>
                        {order.trackingNumber ? (
                          <div>
                            <div className="font-mono font-bold text-brand-brown text-[11px] flex items-center">
                              <Truck size={12} className="mr-1 text-brand-amber flex-shrink-0" />
                              <span className="truncate">{order.trackingNumber}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                              {order.courierName || 'Kerry Express'}
                            </div>
                          </div>
                        ) : (
                          <PermissionGate
                            permission={AdminPermission.ORDERS_FULFILL}
                            fallback={
                              <span className="text-[10px] text-gray-400 font-mono italic">
                                {t('orders.status.unfulfilled') || 'Pending'}
                              </span>
                            }
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenFulfill(order)}
                              className="bg-brand-brown hover:bg-brand-dark-brown text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-xs transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {t('orders.fulfill.addTracking')}
                            </button>
                          </PermissionGate>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Link
                          to={`/admin/orders/${order.orderNumber}`}
                          className="inline-flex items-center space-x-1 p-1.5 text-brand-brown hover:text-brand-amber hover:bg-gray-100 rounded-xs cursor-pointer transition-colors whitespace-nowrap"
                          title={t('orders.detail.viewInvoice')}
                        >
                          <Eye size={15} />
                          <span className="font-bold text-[11px] whitespace-nowrap">{t('orders.detail.viewDetails')}</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredOrders.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Fulfill / Add Tracking Modal */}
      {isFulfillModalOpen && orderToFulfill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-xs">
          <div className="bg-white border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-black uppercase text-brand-brown">
                  {t('orders.fulfill.modalTitle')}
                </h3>
                <p className="text-xs text-gray-500">
                  {t('orders.fulfill.orderPrefix')}
                  {orderToFulfill.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFulfillModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFulfillSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  {t('orders.fulfill.courierPartner')}
                </label>
                <DropdownSelect
                  value={courier}
                  onChange={setCourier}
                  options={[
                    { value: 'Kerry Express TH', label: 'Kerry Express TH' },
                    { value: 'Flash Express', label: 'Flash Express' },
                    { value: 'Thailand Post EMS', label: 'Thailand Post EMS' },
                    { value: 'DHL Express International', label: 'DHL Express International' },
                  ]}
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  {t('orders.fulfill.trackingNumber')}
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 font-mono font-bold text-sm focus:outline-none focus:border-brand-brown"
                />
              </div>

              <p className="text-[11px] text-gray-500">
                {t('orders.fulfill.dispatchNote')}
              </p>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFulfillModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  {t('orders.fulfill.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-brown hover:bg-brand-dark-brown text-white font-bold uppercase tracking-wider shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send size={14} />
                  <span>{t('orders.fulfill.confirm')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-xs">
          <div className="bg-white border border-brand-border max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex justify-between items-start pb-4 mb-6 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-amber block">
                  {t('orders.detail.modalTitle')}
                </span>
                <h3 className="text-xl font-black uppercase text-brand-brown mt-0.5">
                  {t('orders.detail.orderPrefix')}
                  {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-400">
                  {t('orders.detail.orderedAt')} {selectedOrder.createdAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Address & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-brand-cream p-4 border border-brand-border text-xs">
              <div>
                <div className="font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center">
                  <MapPin size={12} className="mr-1 text-brand-amber" />
                  {t('orders.detail.shippingAddress')}
                </div>
                <p className="font-bold text-brand-brown text-sm">{selectedOrder.customerName}</p>
                <p className="text-gray-600 mt-0.5">{selectedOrder.shippingAddress}</p>
                <p className="text-gray-600">
                  {selectedOrder.city} {selectedOrder.postalCode}
                </p>
                <p className="text-gray-500 mt-1">
                  {t('orders.detail.phone')} {selectedOrder.customerPhone}
                </p>
              </div>
              <div>
                <div className="font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center">
                  <CreditCard size={12} className="mr-1 text-brand-amber" />
                  {t('orders.detail.paymentShipping')}
                </div>
                <p className="text-gray-700">
                  {t('orders.detail.paymentMethod')}{' '}
                  <strong className="text-brand-brown">{selectedOrder.paymentMethod}</strong>
                </p>
                <p className="text-gray-700 mt-1">
                  {t('orders.detail.status')}{' '}
                  <strong className="text-brand-amber">{selectedOrder.status}</strong>
                </p>
                {selectedOrder.trackingNumber && (
                  <p className="text-gray-700 mt-1">
                    {t('orders.detail.tracking')}{' '}
                    <span className="font-mono font-bold text-brand-brown">{selectedOrder.trackingNumber}</span>{' '}
                    ({selectedOrder.courierName})
                  </p>
                )}
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-200">
                {t('orders.detail.itemsPurchased')} ({selectedOrder.items.length}{' '}
                {language === 'th' ? 'รายการ' : 'items'})
              </h4>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 text-xs">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-12 h-14 object-cover border border-gray-200"
                    />
                    <div>
                      <div className="font-bold text-brand-brown text-sm">{item.productName}</div>
                      <div className="text-gray-500">
                        {t('orders.detail.size')} {item.size} • {t('orders.detail.color')} {item.color} •{' '}
                        {t('orders.detail.quantity')} {item.quantity} {t('orders.detail.pieces')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-brand-brown text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-[11px]">
                      ${item.price.toFixed(2)} {t('orders.detail.perUnit')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-brand-cream border border-brand-border mb-6">
              <span className="font-bold uppercase tracking-wider text-gray-700 text-xs">
                {t('orders.detail.grandTotal')}
              </span>
              <span className="font-black font-mono text-xl text-brand-brown">
                ${selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              <a
                href={`${STOREFRONT_URL}/track-order/${selectedOrder.orderNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-brand-amber hover:underline flex items-center"
              >
                <span>{t('orders.detail.liveTracking')}</span>
                <ExternalLink size={14} className="ml-1" />
              </a>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="bg-brand-brown text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-brand-dark-brown transition-colors cursor-pointer"
              >
                {t('orders.detail.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
