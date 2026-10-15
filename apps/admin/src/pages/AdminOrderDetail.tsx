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
import { orderRequester } from '../api/requester/orderRequester';
import { formatOrderDateTime } from '../utils';
import { STOREFRONT_URL } from '../config';
import type { ApiOrder, OrderStatus } from '@repo/types';
import { validateOrderStatusTransition } from '@repo/validators';

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isTh, language } = useLanguage();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PAID');
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
        setOrder(apiOrder);
        setSelectedStatus(apiOrder.status);
        return;
      }
    } catch (err: unknown) {
      console.warn('Failed to load order from API:', err);
    }
    setOrder(null);
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

  const primaryShipment = order?.shipments?.[0];
  const trackingNumber = primaryShipment?.trackingNumber;
  const courierName = primaryShipment?.courierName;
  const hasTracking = Boolean(trackingNumber?.trim());

  const hasUnsavedStatus = Boolean(order && selectedStatus !== order.status);

  const handleSaveStatus = async () => {
    if (!order || !hasUnsavedStatus) return;

    const validation = validateOrderStatusTransition(
      order.status,
      selectedStatus,
      hasTracking,
    );

    if (!validation.isValid) {
      if (
        selectedStatus === 'SHIPPED' &&
        order.status === 'PROCESSING' &&
        !hasTracking
      ) {
        showToast(t('orders.detail.specifyTrackingRequired'));
        setIsFulfillModalOpen(true);
        return;
      }

      showToast(
        isTh
          ? (validation.errorTh ??
              validation.error ??
              t('orders.detail.statusTransitionFailed'))
          : (validation.error ?? t('orders.detail.statusTransitionFailed')),
      );
      setSelectedStatus(order.status);
      return;
    }

    setIsUpdating(true);
    try {
      await orderRequester.updateStatus(order.id, selectedStatus);
      await loadOrder();
      showToast(
        t('orders.detail.statusUpdatedToast')
          .replace('{orderNumber}', order.orderNumber)
          .replace('{status}', selectedStatus),
      );
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update order status',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenFulfillModal = () => {
    setIsFulfillModalOpen(true);
  };

  if (!order) {
    return (
      <AdminLayout title={t('orders.title')} subtitle={t('orders.subtitle')}>
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
      subtitle={`${t('orders.detail.orderedAt')} ${formatOrderDateTime(order.placedAt, language)} • ${order.shippingAddress?.recipientName ?? 'Valued Customer'}`}
    >
      <div className="space-y-5">
        {/* Sticky Top Bar matching FormTopBar */}
        <OrderDetailTopBar
          orderNumber={order.orderNumber}
          placedAt={formatOrderDateTime(order.placedAt, language)}
          status={order.status}
          isUpdating={isUpdating}
          hasUnsavedStatus={hasUnsavedStatus}
          onSaveStatus={handleSaveStatus}
          liveTrackingUrl={liveTrackingUrl}
          onOpenFulfill={handleOpenFulfillModal}
          onOpenPrint={() => setIsPrintModalOpen(true)}
          trackingNumber={trackingNumber}
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
              hasTracking={hasTracking}
              totalAmount={order.totalAmount}
              totalItems={order.items.reduce((sum, i) => sum + i.quantity, 0)}
              paymentMethod={order.payment?.paymentMethod ?? 'CREDIT_CARD'}
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
              courierName={courierName}
              trackingNumber={trackingNumber}
              status={order.status}
              placedAt={formatOrderDateTime(order.placedAt, language)}
              onOpenFulfill={handleOpenFulfillModal}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <OrderDetailCustomerCard
              shippingAddress={order.shippingAddress}
              payment={order.payment}
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
          initialCourier={courierName}
          initialTrackingNumber={trackingNumber}
          onSuccess={(newCourier, newTracking) => {
            setOrder((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'SHIPPED',
                    shipments: [
                      {
                        id: prev.shipments?.[0]?.id ?? `ship-${Date.now()}`,
                        courierName: newCourier,
                        trackingNumber: newTracking,
                        status: 'IN_TRANSIT',
                        shippedAt: new Date().toISOString(),
                        timeline: prev.shipments?.[0]?.timeline ?? [],
                      },
                    ],
                  }
                : null,
            );
            setSelectedStatus('SHIPPED');
            showToast(
              t('orders.detail.dispatchSuccessToast')
                .replace('{orderNumber}', order.orderNumber)
                .replace('{tracking}', newTracking),
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
