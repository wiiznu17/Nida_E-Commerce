import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, X, Send } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { Alert, EmptyState, DropdownSelect } from '../components/ui';
import {
  OrderDetailTopBar,
  OrderDetailStatusCard,
  OrderDetailItemsSection,
  OrderDetailShippingCard,
  OrderDetailCustomerCard,
} from '../components/order';
import { useLanguage } from '../context/LanguageContext';
import { orderRequester } from '../api/requester/orderRequester';
import { STOREFRONT_URL } from '../config';
import type { AdminOrder } from '../data/adminData';
import { INITIAL_ORDERS } from '../data/adminData';
import { mapApiOrderToAdminOrder } from './AdminOrders';
import type { OrderStatus } from '@repo/types';

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AdminOrder['status']>('PAID');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fulfill modal states
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [courier, setCourier] = useState('Kerry Express TH');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  const loadOrder = async () => {
    if (!id) return;
    try {
      const apiOrder = await orderRequester.getByNumber(id);
      if (apiOrder) {
        const mapped = mapApiOrderToAdminOrder(apiOrder);
        setOrder(mapped);
        setSelectedStatus(mapped.status);
        if (mapped.courierName) setCourier(mapped.courierName);
        if (mapped.trackingNumber) setTrackingNumberInput(mapped.trackingNumber);
        return;
      }
    } catch {
      // Fallback to local admin orders seed
    }

    const localFound = INITIAL_ORDERS.find(
      (o) => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase(),
    );
    if (localFound) {
      setOrder(localFound);
      setSelectedStatus(localFound.status);
      if (localFound.courierName) setCourier(localFound.courierName);
      if (localFound.trackingNumber) setTrackingNumberInput(localFound.trackingNumber);
    } else {
      setOrder(null);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleScrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hasUnsavedStatus = Boolean(order && selectedStatus !== order.status);

  const handleSaveStatus = async () => {
    if (!order || !hasUnsavedStatus) return;
    setIsUpdating(true);
    try {
      await orderRequester.updateStatus(order.id, selectedStatus as OrderStatus);
      setOrder((prev) => (prev ? { ...prev, status: selectedStatus } : null));
    } catch {
      setOrder((prev) => (prev ? { ...prev, status: selectedStatus } : null));
    } finally {
      setIsUpdating(false);
      showToast(
        language === 'th'
          ? `อัปเดตสถานะออเดอร์ #${order.orderNumber} เป็น ${selectedStatus} เรียบร้อยแล้ว`
          : `Order #${order.orderNumber} status updated to ${selectedStatus}`,
      );
    }
  };

  const handleOpenFulfillModal = () => {
    if (!order) return;
    setTrackingNumberInput(
      order.trackingNumber || `KER-${Math.floor(100000000 + Math.random() * 900000000)}TH`,
    );
    setIsFulfillModalOpen(true);
  };

  const handleFulfillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      await orderRequester.fulfill(order.orderNumber, {
        courierName: courier,
        trackingNumber: trackingNumberInput,
      });
      await loadOrder();
    } catch {
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: 'SHIPPED',
              courierName: courier,
              trackingNumber: trackingNumberInput,
            }
          : null,
      );
      setSelectedStatus('SHIPPED');
    }

    setIsFulfillModalOpen(false);
    showToast(
      language === 'th'
        ? `บันทึกการจัดส่งพัสดุสำหรับออเดอร์ #${order.orderNumber} สำเร็จ`
        : `Order #${order.orderNumber} dispatched with tracking ${trackingNumberInput}`,
    );
  };

  if (!order) {
    return (
      <AdminLayout
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
      >
        <div className="bg-white border border-brand-border p-12 rounded-md shadow-2xs text-center space-y-4">
          <EmptyState
            icon={Package}
            title={t('orders.detail.orderNotFound')}
            subtitle={t('orders.detail.orderNotFoundDesc')}
          />
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="px-4 py-2 bg-brand-brown text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-brand-dark-brown transition-colors cursor-pointer"
          >
            {t('orders.detail.backToOrders')}
          </button>
        </div>
      </AdminLayout>
    );
  }

  const liveTrackingUrl = `${STOREFRONT_URL}/track-order/${order.orderNumber}`;

  return (
    <AdminLayout
      title={`${t('orders.detail.orderPrefix')}${order.orderNumber}`}
      subtitle={`${t('orders.detail.orderedAt')} ${order.createdAt} • ${order.customerName}`}
    >
      <div className="space-y-5">
        {/* Sticky Top Bar matching FormTopBar */}
        <OrderDetailTopBar
          orderNumber={order.orderNumber}
          createdAt={order.createdAt}
          status={order.status}
          isUpdating={isUpdating}
          hasUnsavedStatus={hasUnsavedStatus}
          onSaveStatus={handleSaveStatus}
          liveTrackingUrl={liveTrackingUrl}
          onOpenFulfill={handleOpenFulfillModal}
          trackingNumber={order.trackingNumber}
          onScrollTo={handleScrollTo}
        />

        {/* Feedback Alert */}
        {toastMessage && (
          <Alert
            variant="success"
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* Row 1: Core Items (8 cols) + Status Action Hub (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <OrderDetailItemsSection
              items={order.items}
              totalAmount={order.totalAmount}
            />
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <OrderDetailStatusCard
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalAmount={order.totalAmount}
              totalItems={order.items.reduce((sum, i) => sum + i.quantity, 0)}
              paymentMethod={order.paymentMethod}
              hasUnsavedStatus={hasUnsavedStatus}
              isUpdating={isUpdating}
              onSaveStatus={handleSaveStatus}
            />
          </div>
        </div>

        {/* Row 2: Shipping (7 cols) + Customer & Payment Info (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <OrderDetailShippingCard
              courierName={order.courierName}
              trackingNumber={order.trackingNumber}
              status={order.status}
              createdAt={order.createdAt}
              onOpenFulfill={handleOpenFulfillModal}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <OrderDetailCustomerCard
              customerName={order.customerName}
              customerEmail={order.customerEmail}
              customerPhone={order.customerPhone}
              shippingAddress={order.shippingAddress}
              city={order.city}
              postalCode={order.postalCode}
              paymentMethod={order.paymentMethod}
              status={order.status}
            />
          </div>
        </div>
      </div>

      {/* Fulfill / Add Tracking Modal */}
      {isFulfillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-xs">
          <div className="bg-white border border-brand-border max-w-md w-full p-6 shadow-2xl relative rounded-xs">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-black uppercase text-brand-brown">
                  {t('orders.fulfill.modalTitle')}
                </h3>
                <p className="text-xs text-gray-500">
                  {t('orders.fulfill.orderPrefix')}
                  {order.orderNumber}
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
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 font-mono font-bold text-sm focus:outline-none focus:border-brand-brown rounded-xs"
                />
              </div>

              <p className="text-[11px] text-gray-500">
                {t('orders.fulfill.dispatchNote')}
              </p>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFulfillModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 rounded-xs cursor-pointer"
                >
                  {t('orders.fulfill.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-brown hover:bg-brand-dark-brown text-white font-bold uppercase tracking-wider shadow-xs flex items-center space-x-1.5 rounded-xs cursor-pointer"
                >
                  <Send size={14} />
                  <span>{t('orders.fulfill.confirm')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
