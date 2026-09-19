import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Boxes,
  Tag,
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { ordersList, inventoryList, updateOrderStatus } = useAdmin();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  // Metrics calculations
  const totalRevenue = ordersList.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const pendingOrders = ordersList.filter((o) => o.status === 'PROCESSING' || o.status === 'PAID');
  const lowStockItems = inventoryList.filter((i) => i.availableStock <= i.lowStockThreshold);

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
            {language === 'th' ? 'จัดส่งสำเร็จ' : 'Delivered'}
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="bg-blue-100 text-blue-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
            {language === 'th' ? 'กำลังจัดส่ง' : 'Shipped'}
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
            {language === 'th' ? 'กำลังจัดเตรียม' : 'Processing'}
          </span>
        );
      case 'PAID':
        return (
          <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
            {language === 'th' ? 'ชำระแล้ว' : 'Paid'}
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title={language === 'th' ? 'แดชบอร์ดภาพรวมร้านค้า' : 'Store Overview Dashboard'}
      subtitle={
        language === 'th'
          ? 'สรุปภาพรวมรายได้ คำสั่งซื้อ และสถานะสต็อกสินค้าแบบเรียลไทม์'
          : 'Real-time performance metrics, orders fulfillment, and inventory health'
      }
      actionButton={
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/products"
            className="bg-[#2B1810] hover:bg-[#D97706] text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>{language === 'th' ? 'เพิ่มสินค้าใหม่' : 'Add Product'}</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Timeframe Filter Bar */}
        <div className="flex items-center justify-between bg-white border border-[#EAE3D9] p-3 px-4 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {language === 'th' ? 'ช่วงเวลาที่แสดงข้อมูล:' : 'Timeframe:'}
          </span>
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xs">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors ${
                timeframe === 'today' ? 'bg-[#2B1810] text-white' : 'text-gray-600 hover:text-[#2B1810]'
              }`}
            >
              {language === 'th' ? 'วันนี้ (Today)' : 'Today'}
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors ${
                timeframe === 'week' ? 'bg-[#2B1810] text-white' : 'text-gray-600 hover:text-[#2B1810]'
              }`}
            >
              {language === 'th' ? '7 วันล่าสุด' : 'Past 7 Days'}
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors ${
                timeframe === 'month' ? 'bg-[#2B1810] text-white' : 'text-gray-600 hover:text-[#2B1810]'
              }`}
            >
              {language === 'th' ? 'เดือนนี้ (Month)' : 'This Month'}
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="bg-white border border-[#EAE3D9] p-6 relative overflow-hidden shadow-xs hover:border-[#2B1810] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                {language === 'th' ? 'ยอดขายรวม' : 'Total Revenue'}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#D97706] flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2B1810] tracking-tight">
              $
              {(totalRevenue + 12840).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-600 mt-2">
              <TrendingUp size={14} className="mr-1" />
              <span>+18.4% {language === 'th' ? 'จากเดือนก่อน' : 'vs last month'}</span>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white border border-[#EAE3D9] p-6 relative overflow-hidden shadow-xs hover:border-[#2B1810] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                {language === 'th' ? 'คำสั่งซื้อทั้งหมด' : 'Total Orders'}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#2B1810] flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2B1810] tracking-tight">
              {ordersList.length + 124} {language === 'th' ? 'ออเดอร์' : 'orders'}
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-600 mt-2">
              <ArrowUpRight size={14} className="mr-1" />
              <span>+12 {language === 'th' ? 'ออเดอร์ใหม่สัปดาห์นี้' : 'new this week'}</span>
            </div>
          </div>

          {/* Pending Fulfillment */}
          <div className="bg-white border border-[#EAE3D9] p-6 relative overflow-hidden shadow-xs hover:border-[#2B1810] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                {language === 'th' ? 'ออเดอร์รอจัดส่ง' : 'Pending Shipping'}
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-[#D97706] flex items-center justify-center">
                <Package size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#D97706] tracking-tight">
              {pendingOrders.length} {language === 'th' ? 'รายการ' : 'pending'}
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-[#2B1810] mt-2 underline"
            >
              <span>{language === 'th' ? 'คลิกเพื่อจัดการพัสดุ' : 'Fulfill orders now'}</span>
              <ArrowUpRight size={12} className="ml-0.5" />
            </Link>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white border border-[#EAE3D9] p-6 relative overflow-hidden shadow-xs hover:border-[#2B1810] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                {language === 'th' ? 'สินค้าสต็อกเหลือน้อย' : 'Low Stock SKUs'}
              </span>
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight">
              {lowStockItems.length} {language === 'th' ? 'รายการ' : 'SKUs'}
            </div>
            <Link
              to="/admin/inventory"
              className="inline-flex items-center text-xs font-bold text-red-600 hover:underline mt-2"
            >
              <span>{language === 'th' ? 'ดูและเติมสต็อก' : 'Review & Restock'}</span>
              <ArrowUpRight size={12} className="ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Low Stock Urgent Warning Banner (if any) */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  {language === 'th' ? 'แจ้งเตือนสินค้าใกล้หมด (Low Stock Alert)' : 'Inventory Threshold Warning'}
                </h4>
                <p className="text-xs text-amber-800">
                  {language === 'th'
                    ? `มีสินค้า ${lowStockItems.length} รายการ ที่สต็อกคงเหลือต่ำกว่าเกณฑ์ความปลอดภัย (เช่น ${lowStockItems[0]?.productName})`
                    : `${lowStockItems.length} items have fallen below safe thresholds (e.g. ${lowStockItems[0]?.productName})`}
                </p>
              </div>
            </div>
            <Link
              to="/admin/inventory"
              className="bg-[#2B1810] hover:bg-[#D97706] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs whitespace-nowrap"
            >
              {language === 'th' ? 'จัดการสต็อกทันที' : 'Adjust Stock'}
            </Link>
          </div>
        )}

        {/* Sales by Department & Quick Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Department Breakdown */}
          <div className="lg:col-span-2 bg-white border border-[#EAE3D9] p-6">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#2B1810]">
                  {language === 'th' ? 'สัดส่วนยอดขายตามหมวดหมู่' : 'Sales by Department'}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'th'
                    ? 'เปรียบเทียบส่วนแบ่งยอดขายจากทุกกลุ่มสินค้า'
                    : 'Department distribution and product revenue'}
                </p>
              </div>
              <span className="text-xs font-bold text-[#D97706]">2026 Season</span>
            </div>

            <div className="space-y-4">
              {[
                {
                  dept: language === 'th' ? 'เสื้อผ้าสตรี (Women)' : 'Women Collection',
                  pct: 44,
                  color: 'bg-[#2B1810]',
                  amount: '$62,854',
                },
                {
                  dept: language === 'th' ? 'เสื้อผ้าบุรุษ (Men)' : 'Men Collection',
                  pct: 28,
                  color: 'bg-[#D97706]',
                  amount: '$39,998',
                },
                {
                  dept: language === 'th' ? 'กระเป๋าและเครื่องหนัง (Bags)' : 'Bags & Leather',
                  pct: 16,
                  color: 'bg-[#B45309]',
                  amount: '$22,856',
                },
                {
                  dept: language === 'th' ? 'รองเท้า (Shoes)' : 'Footwear',
                  pct: 8,
                  color: 'bg-amber-400',
                  amount: '$11,428',
                },
                {
                  dept: language === 'th' ? 'ของแต่งบ้าน (Home & Living)' : 'Home & Living',
                  pct: 4,
                  color: 'bg-gray-400',
                  amount: '$5,714',
                },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>{item.dept}</span>
                    <span className="font-mono text-[#2B1810]">
                      {item.amount} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Admin Actions & Shortcuts */}
          <div className="bg-white border border-[#EAE3D9] p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#2B1810] mb-4 pb-2 border-b border-gray-100">
                {language === 'th' ? 'ทางลัดการจัดการ' : 'Quick Actions'}
              </h3>
              <div className="space-y-3">
                <Link
                  to="/admin/products"
                  className="w-full p-3 bg-[#FAF7F2] hover:bg-white border border-[#EAE3D9] hover:border-[#2B1810] text-left text-xs font-bold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <ShoppingBag size={16} className="text-[#D97706]" />
                    <span>{language === 'th' ? 'เพิ่ม / แก้ไขสินค้า' : 'Manage Products'}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#2B1810]" />
                </Link>

                <Link
                  to="/admin/orders"
                  className="w-full p-3 bg-[#FAF7F2] hover:bg-white border border-[#EAE3D9] hover:border-[#2B1810] text-left text-xs font-bold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Package size={16} className="text-[#D97706]" />
                    <span>{language === 'th' ? 'อัปเดตสถานะจัดส่ง' : 'Fulfill & Ship Orders'}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#2B1810]" />
                </Link>

                <Link
                  to="/admin/inventory"
                  className="w-full p-3 bg-[#FAF7F2] hover:bg-white border border-[#EAE3D9] hover:border-[#2B1810] text-left text-xs font-bold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Boxes size={16} className="text-[#D97706]" />
                    <span>{language === 'th' ? 'ตรวจนับ & ปรับสต็อก' : 'Adjust Inventory Stock'}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#2B1810]" />
                </Link>

                <Link
                  to="/admin/promotions"
                  className="w-full p-3 bg-[#FAF7F2] hover:bg-white border border-[#EAE3D9] hover:border-[#2B1810] text-left text-xs font-bold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Tag size={16} className="text-[#D97706]" />
                    <span>{language === 'th' ? 'สร้างโค้ดส่วนลดใหม่' : 'Create Promo Code'}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#2B1810]" />
                </Link>
              </div>
            </div>

            {/* Support/Info Note */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500">
              <p>
                {language === 'th'
                  ? 'ระบบบันทึก Audit Logs ทุกการกระทำอัตโนมัติตามมาตรฐานความปลอดภัยระดับสูง'
                  : 'All modifications are logged to audit trails with operator credentials.'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white border border-[#EAE3D9] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-[#2B1810]">
                {language === 'th' ? 'คำสั่งซื้อล่าสุด (Recent Orders)' : 'Recent Customer Orders'}
              </h3>
              <p className="text-xs text-gray-500">
                {language === 'th'
                  ? 'อัปเดตและติดตามพัสดุได้โดยตรงจากตารางนี้'
                  : 'Quick overview of incoming orders and instant shipping updates'}
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold uppercase tracking-wider text-[#D97706] hover:underline flex items-center"
            >
              <span>{language === 'th' ? 'ดูคำสั่งซื้อทั้งหมด' : 'View All Orders'}</span>
              <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#FAF7F2] text-gray-600 font-bold uppercase tracking-wider">
                  <th className="p-3">{language === 'th' ? 'เลขออเดอร์' : 'Order #'}</th>
                  <th className="p-3">{language === 'th' ? 'ลูกค้า' : 'Customer'}</th>
                  <th className="p-3">{language === 'th' ? 'สินค้า' : 'Items'}</th>
                  <th className="p-3">{language === 'th' ? 'ยอดรวม' : 'Total'}</th>
                  <th className="p-3">{language === 'th' ? 'สถานะ' : 'Status'}</th>
                  <th className="p-3 text-right">{language === 'th' ? 'การจัดการ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {ordersList.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#2B1810]">
                      {order.orderNumber}
                      <span className="block text-[10px] font-sans text-gray-400 font-normal mt-0.5">
                        {order.createdAt}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#2B1810]">{order.customerName}</div>
                      <div className="text-[11px] text-gray-500">{order.customerEmail}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-800">
                        {order.items[0]?.productName}
                        {order.items.length > 1 && ` (+อีก ${order.items.length - 1} รายการ)`}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#2B1810]">${order.totalAmount.toFixed(2)}</td>
                    <td className="p-3">{renderStatusBadge(order.status)}</td>
                    <td className="p-3 text-right">
                      {order.status === 'PROCESSING' || order.status === 'PAID' ? (
                        <button
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              'SHIPPED',
                              'Kerry Express TH',
                              `KER-${Math.floor(100000000 + Math.random() * 900000000)}TH`,
                            )
                          }
                          className="bg-[#2B1810] hover:bg-[#D97706] text-white text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xs transition-colors"
                        >
                          {language === 'th' ? 'กดจัดส่งทันที' : 'Ship Now'}
                        </button>
                      ) : (
                        <Link to="/admin/orders" className="text-[#D97706] hover:underline text-xs font-bold">
                          {language === 'th' ? 'ดูรายละเอียด' : 'View Details'}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
