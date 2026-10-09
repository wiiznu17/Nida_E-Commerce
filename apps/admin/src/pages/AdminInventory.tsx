import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Boxes, Search, AlertTriangle, Plus, Minus, History, CheckCircle2, X, ChevronDown } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import type { InventoryItem } from '../data/adminData';

export default function AdminInventory() {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const { inventoryList, movementsList, adjustStock } = useAdmin();

  const [activeTab, setActiveTab] = useState<'levels' | 'history'>('levels');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Adjust stock modal state
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('นำเข้าล็อตใหม่จากโรงงานตัดเย็บ (Restocked)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    adjustStock(adjustTarget.sku, adjustQuantity, adjustReason, 'วิศณุ (Wissanu)');
    showToast(
      language === 'th'
        ? `ปรับสต็อก SKU: ${adjustTarget.sku} จำนวน ${adjustQuantity > 0 ? '+' : ''}${adjustQuantity} ชิ้น เรียบร้อยแล้ว`
        : `Stock for ${adjustTarget.sku} adjusted by ${adjustQuantity > 0 ? '+' : ''}${adjustQuantity}`,
    );
    setAdjustTarget(null);
    setAdjustQuantity(10);
  };

  // Filtered Inventory
  const filteredInventory = inventoryList.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (stockFilter === 'low') {
      return matchesSearch && item.availableStock > 0 && item.availableStock <= item.lowStockThreshold;
    }
    if (stockFilter === 'out') {
      return matchesSearch && item.availableStock === 0;
    }
    return matchesSearch;
  });

  const lowStockCount = inventoryList.filter(
    (i) => i.availableStock > 0 && i.availableStock <= i.lowStockThreshold,
  ).length;
  const outOfStockCount = inventoryList.filter((i) => i.availableStock === 0).length;

  return (
    <AdminLayout
      title={language === 'th' ? 'การจัดการสต็อกและความเคลื่อนไหว' : 'Inventory & Stock Control'}
      subtitle={
        language === 'th'
          ? 'ควบคุมระดับสินค้าคงคลังราย SKU และตรวจสอบประวัติการปรับสต็อก (Stock Movement Ledger)'
          : 'SKU-level stock management and real-time audit ledger'
      }
    >
      <div className="space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 text-xs font-bold flex items-center rounded-xs animate-in fade-in">
            <CheckCircle2 size={16} className="mr-2 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top View Selector: Levels vs Audit History */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('levels')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 ${
                activeTab === 'levels'
                  ? 'bg-[#2B1810] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Boxes size={14} />
              <span>{language === 'th' ? 'ระดับสต็อกสินค้าคงคลัง' : 'Current Stock Levels'}</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 ${
                activeTab === 'history'
                  ? 'bg-[#2B1810] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <History size={14} />
              <span>{language === 'th' ? 'ประวัติการเคลื่อนไหวสต็อก (Audit Log)' : 'Stock Movement Ledger'}</span>
            </button>
          </div>

          {/* Low Stock Quick Status Pills */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xs font-bold flex items-center">
              <AlertTriangle size={12} className="mr-1 text-amber-600" />
              {lowStockCount} {language === 'th' ? 'รายการใกล้หมด' : 'Low Stock'}
            </span>
            {outOfStockCount > 0 && (
              <span className="bg-red-100 text-red-900 px-2.5 py-1 rounded-xs font-bold">
                {outOfStockCount} {language === 'th' ? 'สินค้าหมด' : 'Out of Stock'}
              </span>
            )}
          </div>
        </div>

        {activeTab === 'levels' ? (
          <>
            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#EAE3D9] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                    stockFilter === 'all' ? 'bg-[#2B1810] text-white' : 'bg-[#FAF7F2] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language === 'th' ? 'ทั้งหมด (All SKUs)' : 'All SKUs'}
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                    stockFilter === 'low' ? 'bg-[#2B1810] text-white' : 'bg-[#FAF7F2] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language === 'th' ? 'สต็อกใกล้หมด (Low Stock)' : 'Low Stock Only'}
                </button>
                <button
                  onClick={() => setStockFilter('out')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                    stockFilter === 'out' ? 'bg-[#2B1810] text-white' : 'bg-[#FAF7F2] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language === 'th' ? 'สินค้าหมด (Out of Stock)' : 'Out of Stock'}
                </button>
              </div>

              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'th' ? 'ค้นหาชื่อสินค้า, SKU...' : 'Search product title, SKU...'}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#2B1810]"
                />
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white border border-[#EAE3D9] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#FAF7F2] text-gray-600 font-bold uppercase tracking-wider">
                      <th className="p-4">{language === 'th' ? 'รูป / SKU' : 'SKU Code'}</th>
                      <th className="p-4">{language === 'th' ? 'ชื่อสินค้า' : 'Product Name'}</th>
                      <th className="p-4">{language === 'th' ? 'ขนาด & สี' : 'Variant (Size/Color)'}</th>
                      <th className="p-4">{language === 'th' ? 'คงเหลือพร้อมขาย' : 'Available Stock'}</th>
                      <th className="p-4">{language === 'th' ? 'จองไว้ (Reserved)' : 'Reserved'}</th>
                      <th className="p-4">{language === 'th' ? 'เกณฑ์แจ้งเตือน' : 'Min Alert'}</th>
                      <th className="p-4 text-right">{language === 'th' ? 'ปรับสต็อก' : 'Adjust'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {filteredInventory.map((item) => {
                      const isLowStock = item.availableStock <= item.lowStockThreshold && item.availableStock > 0;
                      const isOutOfStock = item.availableStock === 0;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.image}
                                alt=""
                                className="w-10 h-12 object-cover border border-gray-200 flex-shrink-0"
                              />
                              <div>
                                <span className="font-mono font-bold text-[#2B1810] block">{item.sku}</span>
                                <span className="text-[10px] text-gray-400 uppercase">{item.department}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-bold text-[#2B1810]">{item.productName}</td>

                          <td className="p-4">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block"
                                style={{ backgroundColor: item.colorHex }}
                              />
                              <span className="font-bold text-gray-800">{item.size}</span>
                              <span className="text-gray-500 text-[11px]">({item.colorName})</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`font-mono text-base font-black ${
                                  isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'
                                }`}
                              >
                                {item.availableStock}
                              </span>
                              {isLowStock && (
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                                  {language === 'th' ? 'ใกล้หมด' : 'Low'}
                                </span>
                              )}
                              {isOutOfStock && (
                                <span className="bg-red-100 text-red-900 text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                                  {language === 'th' ? 'หมด' : 'Out'}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4 font-mono text-gray-500">
                            {item.reservedStock} {language === 'th' ? 'ชิ้น' : 'pcs'}
                          </td>

                          <td className="p-4 font-mono text-gray-400">≤ {item.lowStockThreshold}</td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setAdjustTarget(item);
                                setAdjustQuantity(10);
                              }}
                              className="bg-[#2B1810] hover:bg-[#D97706] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xs transition-colors inline-flex items-center space-x-1"
                            >
                              <span>{language === 'th' ? 'ปรับสต็อก' : 'Adjust'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Stock Movement Ledger Table */
          <div className="bg-white border border-[#EAE3D9] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF7F2] border-b border-gray-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {language === 'th'
                  ? 'สมุดบันทึกประวัติการเปลี่ยนแปลงสต็อก (Stock Movement Audit Ledger)'
                  : 'Immutable Stock Movement Audit Trail'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'th'
                  ? 'เก็บบันทึกประวัติการนำเข้า ตัดสต็อก และเหตุผลการปรับปรุงเพื่อความโปร่งใส'
                  : 'Historical records of all restocks, orders deductions, and QC write-offs'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase tracking-wider">
                    <th className="p-4">{language === 'th' ? 'วันเวลา' : 'Timestamp'}</th>
                    <th className="p-4">{language === 'th' ? 'SKU / สินค้า' : 'SKU & Product'}</th>
                    <th className="p-4">{language === 'th' ? 'ประเภท' : 'Movement Type'}</th>
                    <th className="p-4">{language === 'th' ? 'จำนวนที่เปลี่ยน' : 'Change Qty'}</th>
                    <th className="p-4">{language === 'th' ? 'คงเหลือหลังปรับ' : 'Balance After'}</th>
                    <th className="p-4">{language === 'th' ? 'เหตุผล / หมายเหตุ' : 'Reason / Reference'}</th>
                    <th className="p-4">{language === 'th' ? 'ผู้ดำเนินการ' : 'Operator'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {movementsList.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-mono text-gray-500">{m.timestamp}</td>
                      <td className="p-4">
                        <div className="font-mono font-bold text-[#2B1810]">{m.sku}</div>
                        <div className="text-[11px] text-gray-500">{m.productName}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-xs ${
                            m.changeType === 'RESTOCK'
                              ? 'bg-emerald-100 text-emerald-900'
                              : m.changeType === 'DAMAGE'
                                ? 'bg-red-100 text-red-900'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {m.changeType}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-sm">
                        <span className={m.quantityChange >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                          {m.quantityChange >= 0 ? `+${m.quantityChange}` : m.quantityChange}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#2B1810]">{m.balanceAfter}</td>
                      <td className="p-4 text-gray-700">{m.reason}</td>
                      <td className="p-4 font-semibold text-[#2B1810]">{m.adminName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1810]/50 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE3D9] max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-black uppercase text-[#2B1810]">
                  {language === 'th' ? 'ปรับปรุงจำนวนสต็อกสินค้า' : 'Adjust Inventory Stock'}
                </h3>
                <p className="text-xs text-gray-500 font-mono">{adjustTarget.sku}</p>
              </div>
              <button onClick={() => setAdjustTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-3 border border-[#EAE3D9] mb-4 text-xs">
              <div className="font-bold text-[#2B1810]">{adjustTarget.productName}</div>
              <div className="text-gray-500 mt-0.5">
                ขนาด {adjustTarget.size} • สี {adjustTarget.colorName} • สต็อกปัจจุบัน:{' '}
                <strong className="text-[#2B1810]">{adjustTarget.availableStock} ชิ้น</strong>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  จำนวนที่ต้องการปรับ (+ หรือ -)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setAdjustQuantity((prev) => prev - 5)}
                    className="p-2 border border-gray-300 hover:bg-gray-100 text-[#2B1810]"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    required
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                    className="flex-1 text-center font-mono font-black text-base border border-gray-300 py-1.5 focus:outline-none focus:border-[#2B1810]"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustQuantity((prev) => prev + 5)}
                    className="p-2 border border-gray-300 hover:bg-gray-100 text-[#2B1810]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 block mt-1">
                  สต็อกใหม่หลังปรับ: <strong>{Math.max(0, adjustTarget.availableStock + adjustQuantity)} ชิ้น</strong>
                </span>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  เหตุผลในการปรับปรุง (Reason / PO Reference) *
                </label>
                <div className="relative mb-2">
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full appearance-none border border-gray-300 pl-3 pr-9 py-2 bg-white focus:outline-none focus:border-[#2B1810] cursor-pointer"
                  >
                    <option value="นำเข้าล็อตใหม่จากโรงงานตัดเย็บ (Restocked)">
                      นำเข้าล็อตใหม่จากโรงงานตัดเย็บ (Restocked)
                    </option>
                    <option value="ตรวจนับสต็อกประจำสัปดาห์ (Cycle Count Reconciliation)">
                      ตรวจนับสต็อกประจำสัปดาห์ (Cycle Count)
                    </option>
                    <option value="เบิกสินค้าโชว์หน้าร้าน / สื่อโปรโมท (Showroom Sample)">
                      เบิกสินค้าโชว์หน้าร้าน (Showroom Sample)
                    </option>
                    <option value="สินค้าชำรุดตัดจำหน่ายออกจากคลัง (Damaged Write-off)">
                      สินค้าชำรุดตัดจำหน่าย (Damaged Write-off)
                    </option>
                    <option value="ลูกค้านำมาเปลี่ยน/คืนสภาพสมบูรณ์ (Returned & Restocked)">
                      รับคืนสินค้าสภาพสมบูรณ์ (Customer Return)
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                    <ChevronDown size={14} />
                  </div>
                </div>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="หรือพิมพ์เหตุผลเพิ่มเติม..."
                  className="w-full border border-gray-300 px-3 py-1.5 focus:outline-none focus:border-[#2B1810]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="px-4 py-2 border border-gray-300 font-bold text-gray-600 hover:bg-gray-100"
                >
                  {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2B1810] hover:bg-[#D97706] text-white font-bold uppercase tracking-wider shadow-xs"
                >
                  {language === 'th' ? 'บันทึกการปรับสต็อก' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
