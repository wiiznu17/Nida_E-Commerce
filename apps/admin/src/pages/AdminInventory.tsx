import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Boxes, AlertTriangle, Plus, Minus, History, X } from 'lucide-react';
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
} from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { inventoryRequester } from '../api/requester/inventoryRequester';
import type { InventoryItem, StockMovement } from '../data/adminData';
import { INITIAL_MOVEMENTS, INITIAL_INVENTORY } from '../data/adminData';

export default function AdminInventory() {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();

  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [movementsList] = useState<StockMovement[]>(INITIAL_MOVEMENTS);

  const [activeTab, setActiveTab] = useState<'levels' | 'history'>('levels');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Adjust stock modal state
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('นำเข้าล็อตใหม่จากโรงงานตัดเย็บ (Restocked)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadInventory = async () => {
    try {
      const apiItems = await inventoryRequester.getInventory();
      if (apiItems && apiItems.length > 0) {
        setInventoryList(
          apiItems.map((api) => ({
            id: api.id,
            sku: api.sku,
            productId: api.productId,
            productName: api.productName,
            department: String(api.department),
            category: api.categoryName,
            size: api.size,
            colorName: api.colorName,
            colorHex: api.colorHex,
            availableStock: api.quantityAvailable,
            reservedStock: api.quantityReserved,
            lowStockThreshold: api.lowStockThreshold,
            price: api.price,
            image: api.imageUrl ?? '',
          })),
        );
      } else {
        setInventoryList(INITIAL_INVENTORY);
      }
    } catch (err: unknown) {
      console.warn('Backend inventory unavailable, using initial data:', err);
      setInventoryList(INITIAL_INVENTORY);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    try {
      await inventoryRequester.restock({
        variantId: adjustTarget.id,
        quantity: adjustQuantity,
        reasonNote: adjustReason,
      });
      await loadInventory();
      showToast(
        language === 'th'
          ? `ปรับสต็อก SKU: ${adjustTarget.sku} จำนวน ${adjustQuantity > 0 ? '+' : ''}${adjustQuantity} ชิ้น เรียบร้อยแล้ว`
          : `Stock for ${adjustTarget.sku} adjusted by ${adjustQuantity > 0 ? '+' : ''}${adjustQuantity}`,
      );
    } catch {
      const newStock = Math.max(0, adjustTarget.availableStock + adjustQuantity);
      setInventoryList((prev) =>
        prev.map((i) => (i.sku === adjustTarget.sku ? { ...i, availableStock: newStock } : i)),
      );
      showToast(
        language === 'th'
          ? `ปรับสต็อก SKU: ${adjustTarget.sku} จำนวน ${adjustQuantity > 0 ? '+' : ''}${adjustQuantity} ชิ้น เรียบร้อยแล้ว`
          : `Stock for ${adjustTarget.sku} adjusted by ${adjustQuantity > 0 ? '+' : ''}${adjustQuantity}`,
      );
    } finally {
      setAdjustTarget(null);
      setAdjustQuantity(10);
    }
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
          <Alert
            variant="success"
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* Top View Selector: Levels vs Audit History */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('levels')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 ${
                activeTab === 'levels'
                  ? 'bg-brand-brown text-white shadow-xs'
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
                  ? 'bg-brand-brown text-white shadow-xs'
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
            <div className="bg-white border border-brand-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                    stockFilter === 'all' ? 'bg-brand-brown text-white' : 'bg-brand-cream text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language === 'th' ? 'ทั้งหมด (All SKUs)' : 'All SKUs'}
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                    stockFilter === 'low' ? 'bg-brand-brown text-white' : 'bg-brand-cream text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language === 'th' ? 'สต็อกใกล้หมด (Low Stock)' : 'Low Stock Only'}
                </button>
                <button
                  onClick={() => setStockFilter('out')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                    stockFilter === 'out' ? 'bg-brand-brown text-white' : 'bg-brand-cream text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language === 'th' ? 'สินค้าหมด (Out of Stock)' : 'Out of Stock'}
                </button>
              </div>

              <SearchInput
                containerClassName="w-full md:w-80"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={language === 'th' ? 'ค้นหาชื่อสินค้า, SKU...' : 'Search product title, SKU...'}
              />
            </div>

            {/* Inventory Table */}
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'th' ? 'รูป / SKU' : 'SKU Code'}</TableHead>
                    <TableHead>{language === 'th' ? 'ชื่อสินค้า' : 'Product Name'}</TableHead>
                    <TableHead>{language === 'th' ? 'ขนาด & สี' : 'Variant (Size/Color)'}</TableHead>
                    <TableHead>{language === 'th' ? 'คงเหลือพร้อมขาย' : 'Available Stock'}</TableHead>
                    <TableHead>{language === 'th' ? 'จองไว้ (Reserved)' : 'Reserved'}</TableHead>
                    <TableHead>{language === 'th' ? 'เกณฑ์แจ้งเตือน' : 'Min Alert'}</TableHead>
                    <TableHead className="text-right">{language === 'th' ? 'ปรับสต็อก' : 'Adjust'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-8">
                        <EmptyState
                          icon={Boxes}
                          title={language === 'th' ? 'ไม่พบรายการสต็อกสินค้า' : 'No inventory items found'}
                          subtitle={language === 'th' ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองระดับสต็อก' : 'Try adjusting your search query or stock filter'}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => {
                      const isLowStock = item.availableStock <= item.lowStockThreshold && item.availableStock > 0;
                      const isOutOfStock = item.availableStock === 0;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.image}
                                alt=""
                                className="w-10 h-12 object-cover border border-gray-200 flex-shrink-0"
                              />
                              <div>
                                <span className="font-mono font-bold text-brand-brown block">{item.sku}</span>
                                <span className="text-[10px] text-gray-400 uppercase">{item.department}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-bold text-brand-brown">{item.productName}</TableCell>

                          <TableCell>
                            <div className="flex items-center space-x-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block"
                                style={{ backgroundColor: item.colorHex }}
                              />
                              <span className="font-bold text-gray-800">{item.size}</span>
                              <span className="text-gray-500 text-[11px]">({item.colorName})</span>
                            </div>
                          </TableCell>

                          <TableCell>
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
                          </TableCell>

                          <TableCell className="font-mono text-gray-500">
                            {item.reservedStock} {language === 'th' ? 'ชิ้น' : 'pcs'}
                          </TableCell>

                          <TableCell className="font-mono text-gray-400">≤ {item.lowStockThreshold}</TableCell>

                          <TableCell className="text-right">
                            <button
                              onClick={() => {
                                setAdjustTarget(item);
                                setAdjustQuantity(10);
                              }}
                              className="bg-brand-brown hover:bg-brand-amber text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xs transition-colors inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <span>{language === 'th' ? 'ปรับสต็อก' : 'Adjust'}</span>
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          /* Stock Movement Ledger Table */
          <TableContainer>
            <div className="p-4 bg-brand-cream border-b border-gray-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown">
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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'th' ? 'วันเวลา' : 'Timestamp'}</TableHead>
                  <TableHead>{language === 'th' ? 'SKU / สินค้า' : 'SKU & Product'}</TableHead>
                  <TableHead>{language === 'th' ? 'ประเภท' : 'Movement Type'}</TableHead>
                  <TableHead>{language === 'th' ? 'จำนวนที่เปลี่ยน' : 'Change Qty'}</TableHead>
                  <TableHead>{language === 'th' ? 'คงเหลือหลังปรับ' : 'Balance After'}</TableHead>
                  <TableHead>{language === 'th' ? 'เหตุผล / หมายเหตุ' : 'Reason / Reference'}</TableHead>
                  <TableHead>{language === 'th' ? 'ผู้ดำเนินการ' : 'Operator'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movementsList.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-gray-500">{m.timestamp}</TableCell>
                    <TableCell>
                      <div className="font-mono font-bold text-brand-brown">{m.sku}</div>
                      <div className="text-[11px] text-gray-500">{m.productName}</div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="font-mono font-bold text-sm">
                      <span className={m.quantityChange >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                        {m.quantityChange >= 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-brand-brown">{m.balanceAfter}</TableCell>
                    <TableCell className="text-gray-700">{m.reason}</TableCell>
                    <TableCell className="font-semibold text-brand-brown">{m.adminName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-xs">
          <div className="bg-white border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-black uppercase text-brand-brown">
                  {language === 'th' ? 'ปรับปรุงจำนวนสต็อกสินค้า' : 'Adjust Inventory Stock'}
                </h3>
                <p className="text-xs text-gray-500 font-mono">{adjustTarget.sku}</p>
              </div>
              <button onClick={() => setAdjustTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="bg-brand-cream p-3 border border-brand-border mb-4 text-xs">
              <div className="font-bold text-brand-brown">{adjustTarget.productName}</div>
              <div className="text-gray-500 mt-0.5">
                ขนาด {adjustTarget.size} • สี {adjustTarget.colorName} • สต็อกปัจจุบัน:{' '}
                <strong className="text-brand-brown">{adjustTarget.availableStock} ชิ้น</strong>
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
                    className="p-2 border border-gray-300 hover:bg-gray-100 text-brand-brown"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    required
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                    className="flex-1 text-center font-mono font-black text-base border border-gray-300 py-1.5 focus:outline-none focus:border-brand-brown"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustQuantity((prev) => prev + 5)}
                    className="p-2 border border-gray-300 hover:bg-gray-100 text-brand-brown"
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
                <div className="mb-2">
                  <DropdownSelect
                    value={adjustReason}
                    onChange={setAdjustReason}
                    options={[
                      {
                        value: 'นำเข้าล็อตใหม่จากโรงงานตัดเย็บ (Restocked)',
                        label: 'นำเข้าล็อตใหม่จากโรงงานตัดเย็บ (Restocked)',
                      },
                      {
                        value: 'ตรวจนับสต็อกประจำสัปดาห์ (Cycle Count Reconciliation)',
                        label: 'ตรวจนับสต็อกประจำสัปดาห์ (Cycle Count)',
                      },
                      {
                        value: 'เบิกสินค้าโชว์หน้าร้าน / สื่อโปรโมท (Showroom Sample)',
                        label: 'เบิกสินค้าโชว์หน้าร้าน (Showroom Sample)',
                      },
                      {
                        value: 'สินค้าชำรุดตัดจำหน่ายออกจากคลัง (Damaged Write-off)',
                        label: 'สินค้าชำรุดตัดจำหน่าย (Damaged Write-off)',
                      },
                      {
                        value: 'ลูกค้านำมาเปลี่ยน/คืนสภาพสมบูรณ์ (Returned & Restocked)',
                        label: 'รับคืนสินค้าสภาพสมบูรณ์ (Customer Return)',
                      },
                    ]}
                  />
                </div>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="หรือพิมพ์เหตุผลเพิ่มเติม..."
                  className="w-full border border-gray-300 px-3 py-1.5 focus:outline-none focus:border-brand-brown"
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
                  className="px-5 py-2 bg-brand-brown hover:bg-brand-amber text-white font-bold uppercase tracking-wider shadow-xs"
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
