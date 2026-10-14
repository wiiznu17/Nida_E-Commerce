import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { Alert, EmptyState } from '../components/ui';
import {
  OrderDetailTopBar,
  OrderDetailStatusCard,
  OrderDetailItemsSection,
  OrderDetailShippingCard,
  OrderDetailCustomerCard,
  OrderPrintModal,
  OrderFulfillModal,
} from '../components/order';
import { useLanguage } from '../context/LanguageContext';
import { orderRequester, mapApiOrderToAdminOrder } from '../api/requester/orderRequester';
import { formatOrderDateTime } from '../utils';
import { STOREFRONT_URL } from '../config';
import type { AdminOrder } from '../data/adminData';
import { INITIAL_ORDERS } from '../data/adminData';
import type { OrderStatus } from '@repo/types';
import { validateOrderStatusTransition } from '@repo/validators';

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AdminOrder['status']>('PAID');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fulfill modal state
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    try {
      const apiOrder = await orderRequester.getByNumber(id);
      if (apiOrder) {
        const mapped = mapApiOrderToAdminOrder(apiOrder);
        setOrder(mapped);
        setSelectedStatus(mapped.status);
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

    const hasTracking = Boolean(order.trackingNumber?.trim());
    const validation = validateOrderStatusTransition(
      order.status as OrderStatus,
      selectedStatus as OrderStatus,
      hasTracking,
    );

    if (!validation.isValid) {
      if (selectedStatus === 'SHIPPED' && order.status === 'PROCESSING' && !hasTracking) {
        showToast(
          language === 'th'
            ? 'กรุณาระบุเลขพัสดุ (Tracking Number) เพื่อจัดส่งสินค้า'
            : 'Please specify carrier tracking number to dispatch this order',
        );
        setIsFulfillModalOpen(true);
        return;
      }

      showToast(
        language === 'th'
          ? (validation.errorTh ?? validation.error ?? 'ไม่สามารถเปลี่ยนสถานะได้')
          : (validation.error ?? 'Invalid status transition'),
      );
      setSelectedStatus(order.status);
      return;
    }

    setIsUpdating(true);
    try {
      await orderRequester.updateStatus(order.id, selectedStatus as OrderStatus);
      await loadOrder();
      showToast(
        language === 'th'
          ? `อัปเดตสถานะออเดอร์ #${order.orderNumber} เป็น ${selectedStatus} เรียบร้อยแล้ว`
          : `Order #${order.orderNumber} status updated to ${selectedStatus}`,
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenFulfillModal = () => {
    setIsFulfillModalOpen(true);
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
      subtitle={`${t('orders.detail.orderedAt')} ${formatOrderDateTime(order.createdAt, language)} • ${order.customerName}`}
    >
      <div className="space-y-5">
        {/* Sticky Top Bar matching FormTopBar */}
        <OrderDetailTopBar
          orderNumber={order.orderNumber}
          createdAt={formatOrderDateTime(order.createdAt, language)}
          status={order.status}
          isUpdating={isUpdating}
          hasUnsavedStatus={hasUnsavedStatus}
          onSaveStatus={handleSaveStatus}
          liveTrackingUrl={liveTrackingUrl}
          onOpenFulfill={handleOpenFulfillModal}
          onOpenPrint={() => setIsPrintModalOpen(true)}
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
              currentStatus={order.status}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              hasTracking={Boolean(order.trackingNumber)}
              totalAmount={order.totalAmount}
              totalItems={order.items.reduce((sum, i) => sum + i.quantity, 0)}
              paymentMethod={order.paymentMethod}
              hasUnsavedStatus={hasUnsavedStatus}
              isUpdating={isUpdating}
              onSaveStatus={handleSaveStatus}
              onOpenFulfill={handleOpenFulfillModal}
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
              createdAt={formatOrderDateTime(order.createdAt, language)}
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
      {order && (
        <OrderFulfillModal
          isOpen={isFulfillModalOpen}
          onClose={() => setIsFulfillModalOpen(false)}
          orderNumber={order.orderNumber}
          initialCourier={order.courierName}
          initialTrackingNumber={order.trackingNumber}
          onSuccess={(courierName, trackingNumber) => {
            setOrder((prev) =>
              prev ? { ...prev, status: 'SHIPPED', courierName, trackingNumber } : null,
            );
            setSelectedStatus('SHIPPED');
            showToast(
              language === 'th'
                ? `บันทึกการจัดส่งพัสดุสำหรับออเดอร์ #${order.orderNumber} สำเร็จ`
                : `Order #${order.orderNumber} dispatched with tracking ${trackingNumber}`,
            );
            loadOrder();
          }}
        />
      )}

      <OrderPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        orders={order ? [order] : []}
      />
    </AdminLayout>
  );
}
