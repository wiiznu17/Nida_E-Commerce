import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Boxes, Plus, Minus, History, X, Search, RotateCcw, Filter } from 'lucide-react';
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
import { inventoryRequester } from '../api/requester/inventoryRequester';
import { PermissionGate } from '../components/common';
import { AdminPermission, type ApiInventoryItem } from '@repo/types';

export default function AdminInventory() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();

  const [inventoryList, setInventoryList] = useState<ApiInventoryItem[]>([]);

  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'sku_asc' | 'stock_asc' | 'stock_desc'>('sku_asc');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [appliedSearch, setAppliedSearch] = useState(searchParams.get('search') || '');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Adjust stock modal state
  const [adjustTarget, setAdjustTarget] = useState<ApiInventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('นำเข้าล็อตใหม่จากโรงงานตัดเย็บ (Restocked)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadInventory = async () => {
    try {
      const apiItems = await inventoryRequester.getInventory();
      setInventoryList(apiItems ?? []);
    } catch (err: unknown) {
      console.warn('Backend inventory unavailable:', err);
      setInventoryList([]);
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
        sku: adjustTarget.sku,
        quantity: adjustQuantity,
        reasonNote: adjustReason,
      });
      await loadInventory();
      showToast(
        language === 'th'
          ? `ปรับสต็อก SKU: ${adjustTarget.sku} จำนวน ${adjustQuantity > 0 ? '+' : ''}${adjustQuantity} ชิ้น เรียบร้อยแล้ว`
          : `Stock for ${adjustTarget.sku} adjusted by ${adjustQuantity > 0 ? '+' : ''}${adjustQuantity}`,
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to adjust stock';
      showToast(errMsg);
    } finally {
      setAdjustTarget(null);
      setAdjustQuantity(10);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setDepartmentFilter('all');
    setSortBy('sku_asc');
    setStockFilter('all');
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: 'all' | 'low' | 'out') => {
    setStockFilter(filter);
    setCurrentPage(1);
  };

  // Filtered and Sorted Inventory
  const filteredInventory = inventoryList
    .filter((item) => {
      const query = appliedSearch.toLowerCase();
      const matchesSearch = !query || item.sku.toLowerCase().includes(query);

      const matchesDept =
        departmentFilter === 'all' ||
        item.department.toLowerCase() === departmentFilter.toLowerCase();

      if (!matchesSearch || !matchesDept) return false;

      if (stockFilter === 'low') {
        return item.quantityAvailable > 0 && item.quantityAvailable <= item.lowStockThreshold;
      }
      if (stockFilter === 'out') {
        return item.quantityAvailable === 0;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'stock_asc') return a.quantityAvailable - b.quantityAvailable;
      if (sortBy === 'stock_desc') return b.quantityAvailable - a.quantityAvailable;
      return a.sku.localeCompare(b.sku);
    });

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / pageSize));
  const paginatedInventory = filteredInventory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const lowStockCount = inventoryList.filter(
    (i) => i.quantityAvailable > 0 && i.quantityAvailable <= i.lowStockThreshold,
  ).length;
  const outOfStockCount = inventoryList.filter((i) => i.quantityAvailable === 0).length;

  return (
    <AdminLayout
      title={t('inventory.title') || 'การจัดการสต็อกและความเคลื่อนไหว'}
      subtitle={`${t('inventory.subtitle') || 'ควบคุมระดับสินค้าคงคลังราย SKU และตรวจสอบประวัติการปรับสต็อก'} (${
        language === 'th'
          ? `แสดง ${filteredInventory.length} จาก ${inventoryList.length} รายการ`
          : `${filteredInventory.length} of ${inventoryList.length} items displayed`
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

        {/* Top View Selector: Levels vs Audit History */}
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
          <div className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 bg-brand-brown text-white shadow-xs cursor-default">
            <Boxes size={14} />
            <span>{t('inventory.levelsTab') || 'ระดับสต็อกสินค้าคงคลัง'}</span>
          </div>
          <Link
            to="/admin/inventory/audit"
            className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 cursor-pointer"
          >
            <History size={14} />
            <span>{t('inventory.historyTab') || 'ประวัติการเคลื่อนไหวสต็อก (Audit Log)'}</span>
          </Link>
        </div>

        {/* Filter and Search Bar (Styled like ProductListFilters) */}
            <div className="bg-white border border-brand-border p-4 space-y-3.5 shadow-2xs rounded-xs">
              {/* Top Row: Stock Status Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-cream">
                <div className="flex items-center space-x-1.5 p-1 bg-brand-cream border border-brand-border rounded-xs w-full sm:w-auto overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => handleFilterChange('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                      stockFilter === 'all'
                        ? 'bg-white text-brand-brown shadow-2xs font-black'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('inventory.filterAll') || 'ทั้งหมด'} ({inventoryList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFilterChange('low')}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                      stockFilter === 'low'
                        ? 'bg-amber-600 text-white shadow-2xs font-black'
                        : 'text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${stockFilter === 'low' ? 'bg-white' : 'bg-amber-500'}`}
                    />
                    <span>
                      {t('inventory.filterLow') || 'สต็อกใกล้หมด'} ({lowStockCount})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFilterChange('out')}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                      stockFilter === 'out'
                        ? 'bg-red-600 text-white shadow-2xs font-black'
                        : 'text-red-800 hover:bg-red-50'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${stockFilter === 'out' ? 'bg-white' : 'bg-red-500'}`}
                    />
                    <span>
                      {t('inventory.filterOut') || 'สินค้าหมด'} ({outOfStockCount})
                    </span>
                  </button>
                </div>

                {/* Active Filter Hint */}
                <div className="hidden lg:flex items-center text-[11px] text-gray-500 space-x-1">
                  <Filter size={12} className="text-brand-amber" />
                  <span>
                    {language === 'th'
                      ? `แสดง ${filteredInventory.length} จากทั้งหมด ${inventoryList.length} รายการ`
                      : `Showing ${filteredInventory.length} of ${inventoryList.length} items`}
                  </span>
                </div>
              </div>

              {/* Main Filter & Search Form */}
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
                  {/* Search Input for SKU (6 cols on lg) */}
                  <div className="sm:col-span-2 lg:col-span-6">
                    <SearchInput
                      value={searchInput}
                      onChange={setSearchInput}
                      onClear={handleResetSearch}
                      placeholder={t('inventory.searchPlaceholder') || 'ค้นหารหัส SKU...'}
                    />
                  </div>

                  {/* Department Select (2 cols on lg) */}
                  <div className="lg:col-span-2">
                    <DropdownSelect
                      value={departmentFilter}
                      onChange={(val) => {
                        setDepartmentFilter(val);
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: 'all', label: language === 'th' ? 'ทุกแผนก (All)' : 'All Depts' },
                        { value: 'women', label: language === 'th' ? 'ผู้หญิง (Women)' : 'Women' },
                        { value: 'men', label: language === 'th' ? 'ผู้ชาย (Men)' : 'Men' },
                        { value: 'kids', label: language === 'th' ? 'เด็ก (Kids)' : 'Kids' },
                        { value: 'bags', label: language === 'th' ? 'กระเป๋า (Bags)' : 'Bags' },
                        { value: 'shoes', label: language === 'th' ? 'รองเท้า (Shoes)' : 'Shoes' },
                        { value: 'home', label: language === 'th' ? 'ของแต่งบ้าน (Home)' : 'Home' },
                      ]}
                    />
                  </div>

                  {/* Sort By Select (2 cols on lg) */}
                  <div className="lg:col-span-2">
                    <DropdownSelect
                      value={sortBy}
                      onChange={(val) => {
                        setSortBy(val as 'sku_asc' | 'stock_asc' | 'stock_desc');
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: 'sku_asc', label: language === 'th' ? 'รหัส SKU (A-Z)' : 'SKU (A-Z)' },
                        { value: 'stock_asc', label: language === 'th' ? 'สต็อกน้อยสุดก่อน' : 'Lowest Stock' },
                        { value: 'stock_desc', label: language === 'th' ? 'สต็อกมากสุดก่อน' : 'Highest Stock' },
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
                      <span>{t('inventory.searchBtn') || 'ค้นหา'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 bg-brand-cream hover:bg-brand-border border border-brand-border rounded-xs transition-colors cursor-pointer"
                      title={t('inventory.resetBtn') || 'ล้างตัวกรอง'}
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Inventory Table Container */}
            <div className="space-y-0">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14 text-center">{language === 'th' ? 'รูป' : 'Image'}</TableHead>
                      <TableHead className="w-48">{t('inventory.table.sku') || 'รหัส SKU'}</TableHead>
                      <TableHead className="min-w-[180px]">{t('inventory.table.product') || 'ชื่อสินค้า'}</TableHead>
                      <TableHead className="w-36 text-center">{t('inventory.table.variant') || 'ขนาด & สี'}</TableHead>
                      <TableHead className="w-36 text-center">{t('inventory.table.available') || 'คงเหลือพร้อมขาย'}</TableHead>
                      <TableHead className="w-28 text-center">{t('inventory.table.reserved') || 'จองไว้ (Reserved)'}</TableHead>
                      <TableHead className="w-28 text-center">{t('inventory.table.threshold') || 'เกณฑ์แจ้งเตือน'}</TableHead>
                      <TableHead className="w-28 text-right">{t('inventory.table.adjust') || 'ปรับสต็อก'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="p-8">
                          <EmptyState
                            icon={Boxes}
                            title={t('inventory.emptyLevelsTitle') || 'ไม่พบรายการสต็อกสินค้า'}
                            subtitle={t('inventory.emptyLevelsSubtitle') || 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองระดับสต็อก'}
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedInventory.map((item) => {
                        const isLowStock = item.quantityAvailable <= item.lowStockThreshold && item.quantityAvailable > 0;
                        const isOutOfStock = item.quantityAvailable === 0;

                        return (
                          <TableRow key={item.id} className="group">
                            {/* Image */}
                            <TableCell className="text-center">
                              <div className="w-11 h-14 bg-gray-100 border border-brand-border rounded-xs overflow-hidden mx-auto flex-shrink-0">
                                <img
                                  src={item.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200'}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>

                            {/* SKU & Dept */}
                            <TableCell>
                              <div className="font-mono font-bold text-brand-brown">{item.sku}</div>
                              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{item.department}</div>
                            </TableCell>

                            {/* Product Name */}
                            <TableCell className="font-bold text-brand-brown">
                              {item.productName}
                            </TableCell>

                            {/* Variant */}
                            <TableCell className="text-center">
                              <div className="inline-flex items-center space-x-1.5">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block flex-shrink-0"
                                  style={{ backgroundColor: item.colorHex }}
                                  title={item.colorName}
                                />
                                <span className="font-bold text-gray-800">{item.size}</span>
                                <span className="text-gray-500 text-[11px]">({item.colorName})</span>
                              </div>
                            </TableCell>

                            {/* Stock */}
                            <TableCell className="text-center">
                              <div className="inline-flex items-center space-x-2">
                                <span
                                  className={`font-mono text-base font-black ${
                                    isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'
                                  }`}
                                >
                                  {item.quantityAvailable}
                                </span>
                                {isLowStock && (
                                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                                    {language === 'th' ? 'ใกล้หมด' : 'Low'}
                                  </span>
                                )}
                                {isOutOfStock && (
                                  <span className="bg-red-100 text-red-900 text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                                    {language === 'th' ? 'หมด' : 'Out'}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Reserved */}
                            <TableCell className="text-center font-mono text-gray-500">
                              {item.quantityReserved} {language === 'th' ? 'ชิ้น' : 'pcs'}
                            </TableCell>

                            {/* Threshold */}
                            <TableCell className="text-center font-mono text-gray-400">
                              ≤ {item.lowStockThreshold}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                              <PermissionGate
                                permission={AdminPermission.INVENTORY_ADJUST}
                                fallback={
                                  <span className="text-[10px] text-gray-400 font-mono italic">
                                    {t('common.readOnly') || 'Read-Only'}
                                  </span>
                                }
                              >
                                <button
                                  onClick={() => {
                                    setAdjustTarget(item);
                                    setAdjustQuantity(10);
                                  }}
                                  className="bg-brand-brown hover:bg-brand-dark-brown text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xs transition-colors inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                                >
                                  <span>{t('inventory.adjustBtn') || 'ปรับสต็อก'}</span>
                                </button>
                              </PermissionGate>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredInventory.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </div>
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
                <strong className="text-brand-brown">{adjustTarget.quantityAvailable} ชิ้น</strong>
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
                  สต็อกใหม่หลังปรับ: <strong>{Math.max(0, adjustTarget.quantityAvailable + adjustQuantity)} ชิ้น</strong>
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
