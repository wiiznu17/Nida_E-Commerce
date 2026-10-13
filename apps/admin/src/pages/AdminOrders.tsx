import { useState, useEffect } from 'react';
import { Package, Truck, ExternalLink, Eye, X, MapPin, CreditCard, Send } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { DropdownSelect, Alert, SearchInput, EmptyState } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { orderRequester } from '../api/requester/orderRequester';
import { STOREFRONT_URL } from '../config';
import type { AdminOrder } from '../data/adminData';
import { INITIAL_ORDERS } from '../data/adminData';
import type { ApiOrder, OrderStatus } from '@repo/types';

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
  const { language } = useLanguage();
  const [ordersList, setOrdersList] = useState<AdminOrder[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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
    setTimeout(() => setToastMessage(null), 3000);
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
    showToast(language === 'th' ? `เปลี่ยนสถานะออเดอร์เป็น ${newStatus} สำเร็จ` : `Status updated to ${newStatus}`);
  };

  // Filter orders
  const filteredOrders = ordersList.filter((order) => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusTabs = [
    { id: 'ALL', label: language === 'th' ? 'ทั้งหมด (All)' : 'All' },
    { id: 'PROCESSING', label: language === 'th' ? 'รอจัดเตรียม' : 'Processing' },
    { id: 'PAID', label: language === 'th' ? 'ชำระแล้ว' : 'Paid' },
    { id: 'SHIPPED', label: language === 'th' ? 'จัดส่งแล้ว' : 'Shipped' },
    { id: 'DELIVERED', label: language === 'th' ? 'สำเร็จ' : 'Delivered' },
  ];

  return (
    <AdminLayout
      title={language === 'th' ? 'คำสั่งซื้อและการจัดส่งพัสดุ' : 'Orders & Shipping Management'}
      subtitle={
        language === 'th'
          ? 'ตรวจสอบคำสั่งซื้อ บันทึกหมายเลขพัสดุ และอัปเดตสถานะการส่งมอบ'
          : 'Inspect incoming orders, assign carrier tracking codes, and manage fulfillment'
      }
    >
      <div className="space-y-6">
        {/* Toast */}
        {toastMessage && (
          <Alert
            variant="success"
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* Filters & Search */}
        <div className="bg-white border border-[#EAE3D9] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <SearchInput
            containerClassName="w-full md:w-80"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={
              language === 'th' ? 'ค้นหาเลขออเดอร์, ชื่อลูกค้า, อีเมล...' : 'Search order #, customer, email...'
            }
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-[#EAE3D9] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#FAF7F2] text-gray-600 font-bold uppercase tracking-wider">
                  <th className="p-4">{language === 'th' ? 'เลขออเดอร์ / วันเวลา' : 'Order # & Date'}</th>
                  <th className="p-4">{language === 'th' ? 'ข้อมูลลูกค้า' : 'Customer'}</th>
                  <th className="p-4">{language === 'th' ? 'รายการสินค้า' : 'Purchased Items'}</th>
                  <th className="p-4">{language === 'th' ? 'ยอดเงิน' : 'Total'}</th>
                  <th className="p-4">{language === 'th' ? 'สถานะคำสั่งซื้อ' : 'Fulfillment Status'}</th>
                  <th className="p-4">{language === 'th' ? 'ขนส่ง / หมายเลขพัสดุ' : 'Courier / Tracking'}</th>
                  <th className="p-4 text-right">{language === 'th' ? 'การจัดการ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Order # */}
                    <td className="p-4">
                      <div className="font-mono font-black text-[#2B1810] text-sm">{order.orderNumber}</div>
                      <div className="text-[11px] text-gray-400 font-normal mt-0.5">{order.createdAt}</div>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="font-bold text-[#2B1810]">{order.customerName}</div>
                      <div className="text-[11px] text-gray-500">{order.customerEmail}</div>
                      <div className="text-[11px] text-gray-400">{order.customerPhone}</div>
                    </td>

                    {/* Items */}
                    <td className="p-4">
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
                            ไซส์ {order.items[0]?.size} • {order.items[0]?.quantity} ชิ้น
                            {order.items.length > 1 && ` (+อีก ${order.items.length - 1} ชิ้น)`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <div className="font-mono font-black text-[#2B1810] text-sm">${order.totalAmount.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{order.paymentMethod}</div>
                    </td>

                    {/* Status with quick selector */}
                    <td className="p-4">
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
                        className={`text-[11px] font-black uppercase h-7.5 px-2.5 py-1 ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : order.status === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : order.status === 'PROCESSING'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-purple-50 text-purple-900 border-purple-300'
                        }`}
                      />
                    </td>

                    {/* Courier & Tracking */}
                    <td className="p-4">
                      {order.trackingNumber ? (
                        <div>
                          <div className="font-mono font-bold text-[#2B1810] text-[11px] flex items-center">
                            <Truck size={12} className="mr-1 text-[#D97706]" />
                            {order.trackingNumber}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{order.courierName || 'Kerry Express'}</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenFulfill(order)}
                          className="bg-[#2B1810] hover:bg-[#D97706] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-xs transition-colors"
                        >
                          {language === 'th' ? '+ ใส่เลขพัสดุ' : '+ Add Tracking'}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-[#2B1810] hover:text-[#D97706] hover:bg-gray-100 rounded-xs flex items-center space-x-1"
                          title={language === 'th' ? 'ดูใบสั่งซื้อฉบับเต็ม' : 'View full invoice'}
                        >
                          <Eye size={16} />
                          <span className="font-bold text-[11px]">{language === 'th' ? 'รายละเอียด' : 'Details'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-8">
              <EmptyState
                icon={Package}
                title={language === 'th' ? 'ไม่พบคำสั่งซื้อตามตัวกรองนี้' : 'No orders found matching criteria'}
                subtitle={language === 'th' ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองสถานะ' : 'Try adjusting your search query or status filter'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Fulfill / Add Tracking Modal */}
      {isFulfillModalOpen && orderToFulfill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1810]/50 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE3D9] max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-black uppercase text-[#2B1810]">
                  {language === 'th' ? 'บันทึกการจัดส่งพัสดุ' : 'Fulfill & Dispatch Order'}
                </h3>
                <p className="text-xs text-gray-500">ออเดอร์ #{orderToFulfill.orderNumber}</p>
              </div>
              <button onClick={() => setIsFulfillModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFulfillSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  บริษัทขนส่ง (Courier Partner)
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
                  หมายเลขพัสดุ (Tracking Number) *
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 font-mono font-bold text-sm focus:outline-none focus:border-[#2B1810]"
                />
              </div>

              <p className="text-[11px] text-gray-500">
                {language === 'th'
                  ? 'เมื่อกดยืนยัน ระบบจะปรับสถานะออเดอร์เป็น SHIPPED และลูกค้าสามารถติดตามสถานะสดได้ทันที'
                  : 'Customer tracking page will immediately update to SHIPPED milestone upon saving.'}
              </p>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFulfillModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 font-bold text-gray-600 hover:bg-gray-100"
                >
                  {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2B1810] hover:bg-[#D97706] text-white font-bold uppercase tracking-wider shadow-xs flex items-center space-x-1.5"
                >
                  <Send size={14} />
                  <span>{language === 'th' ? 'ยืนยันการจัดส่ง' : 'Confirm Dispatch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1810]/50 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE3D9] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex justify-between items-start pb-4 mb-6 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D97706] block">
                  ใบสั่งซื้อคำสั่งซื้อ (Order Details)
                </span>
                <h3 className="text-xl font-black uppercase text-[#2B1810] mt-0.5">
                  ออเดอร์ #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-400">สั่งซื้อเมื่อ: {selectedOrder.createdAt}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={22} />
              </button>
            </div>

            {/* Address & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-[#FAF7F2] p-4 border border-[#EAE3D9] text-xs">
              <div>
                <div className="font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center">
                  <MapPin size={12} className="mr-1 text-[#D97706]" />
                  ที่อยู่จัดส่งสินค้า
                </div>
                <p className="font-bold text-[#2B1810] text-sm">{selectedOrder.customerName}</p>
                <p className="text-gray-600 mt-0.5">{selectedOrder.shippingAddress}</p>
                <p className="text-gray-600">
                  {selectedOrder.city} {selectedOrder.postalCode}
                </p>
                <p className="text-gray-500 mt-1">โทร: {selectedOrder.customerPhone}</p>
              </div>
              <div>
                <div className="font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center">
                  <CreditCard size={12} className="mr-1 text-[#D97706]" />
                  การชำระเงิน & ขนส่ง
                </div>
                <p className="text-gray-700">
                  วิธีชำระ: <strong className="text-[#2B1810]">{selectedOrder.paymentMethod}</strong>
                </p>
                <p className="text-gray-700 mt-1">
                  สถานะ: <strong className="text-[#D97706]">{selectedOrder.status}</strong>
                </p>
                {selectedOrder.trackingNumber && (
                  <p className="text-gray-700 mt-1">
                    เลขพัสดุ: <span className="font-mono font-bold text-[#2B1810]">{selectedOrder.trackingNumber}</span>{' '}
                    ({selectedOrder.courierName})
                  </p>
                )}
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-200">
                รายการสินค้าที่สั่งซื้อ ({selectedOrder.items.length} รายการ)
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
                      <div className="font-bold text-[#2B1810] text-sm">{item.productName}</div>
                      <div className="text-gray-500">
                        ขนาด: {item.size} • สี: {item.color} • จำนวน: {item.quantity} ชิ้น
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-[#2B1810] text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-[11px]">${item.price.toFixed(2)} / ชิ้น</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-[#FAF7F2] border border-[#EAE3D9] mb-6">
              <span className="font-bold uppercase tracking-wider text-gray-700 text-xs">
                ยอดรวมทั้งสิ้น (Grand Total)
              </span>
              <span className="font-black font-mono text-xl text-[#2B1810]">
                ${selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              <a
                href={`${STOREFRONT_URL}/track-order/${selectedOrder.orderNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#D97706] hover:underline flex items-center"
              >
                <span>เปิดดูหน้า Live Tracking ของลูกค้า</span>
                <ExternalLink size={14} className="ml-1" />
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-[#2B1810] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#D97706] transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
