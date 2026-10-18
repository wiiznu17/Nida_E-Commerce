import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, History, Search, RotateCcw, Filter } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import {
  DropdownSelect,
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
import type { ApiStockMovement, StockMovementType } from '@repo/types';

export default function AdminInventoryAudit() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();

  const [movementsList, setMovementsList] = useState<ApiStockMovement[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | StockMovementType>(
    'all',
  );
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'qty_desc' | 'qty_asc'
  >('newest');
  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') ?? '',
  );
  const [appliedSearch, setAppliedSearch] = useState(
    searchParams.get('search') ?? '',
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadMovements = async () => {
    try {
      const data = await inventoryRequester.getMovements();
      if (Array.isArray(data)) {
        setMovementsList(data);
      } else {
        setMovementsList([]);
      }
    } catch (err: unknown) {
      console.warn('Backend movements unavailable:', err);
      setMovementsList([]);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setTypeFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (type: 'all' | StockMovementType) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  // Counts for tabs
  const restockCount = movementsList.filter(
    (m) => m.changeType === 'RESTOCK',
  ).length;
  const orderDeductCount = movementsList.filter(
    (m) => m.changeType === 'ORDER_DEDUCT',
  ).length;
  const damageCount = movementsList.filter(
    (m) => m.changeType === 'DAMAGE',
  ).length;
  const adjustmentCount = movementsList.filter(
    (m) => m.changeType === 'MANUAL_ADJUSTMENT',
  ).length;

  // Filtered and Sorted Movements
  const filteredMovements = movementsList
    .filter((m) => {
      const query = appliedSearch.toLowerCase();
      const matchesSearch =
        !query ||
        m.sku.toLowerCase().includes(query) ||
        m.productName.toLowerCase().includes(query) ||
        (m.reason ?? '').toLowerCase().includes(query) ||
        (m.adminName ?? '').toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (typeFilter !== 'all' && m.changeType !== typeFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'oldest') return a.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'qty_desc') return b.quantityChange - a.quantityChange;
      if (sortBy === 'qty_asc') return a.quantityChange - b.quantityChange;
      return 0;
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMovements.length / pageSize),
  );
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const getChangeTypeBadge = (changeType: StockMovementType) => {
    switch (changeType) {
      case 'RESTOCK':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            {language === 'th' ? 'นำเข้าสต็อก' : 'Restock'}
          </span>
        );
      case 'ORDER_DEDUCT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
            {language === 'th' ? 'ตัดจำหน่ายออเดอร์' : 'Order Deduct'}
          </span>
        );
      case 'DAMAGE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-800 border border-red-200">
            {language === 'th' ? 'ชำรุด / QC' : 'Damage / QC'}
          </span>
        );
      case 'MANUAL_ADJUSTMENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            {language === 'th' ? 'ปรับยอดตรวจนับ' : 'Adjustment'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-700 border border-gray-200">
            {changeType}
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title={
        t('inventoryAudit.title') ||
        'ประวัติการเคลื่อนไหวสต็อก (Stock Movement Audit Ledger)'
      }
      subtitle={`${
        t('inventoryAudit.subtitle') ||
        'ตรวจสอบบันทึกประวัติการนำเข้า ตัดจำหน่าย และการปรับปรุงสต็อกสินค้าคงคลัง'
      } (${
        language === 'th'
          ? `แสดง ${filteredMovements.length} จาก ${movementsList.length} รายการ`
          : `${filteredMovements.length} of ${movementsList.length} records displayed`
      })`}
      breadcrumbs={[
        { label: t('nav.inventory'), path: '/admin/inventory' },
        { label: t('inventory.historyTab') },
      ]}
      actionButton={
        <Link
          to="/admin/inventory"
          className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-brand-brown text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-1.5 shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>{t('common.back')}</span>
        </Link>
      }
    >
      <div className="space-y-4">

        {/* Filter and Search Bar (Styled like ProductListFilters) */}
        <div className="bg-white border border-brand-border p-4 space-y-3.5 shadow-2xs rounded-xs">
          {/* Top Row: Movement Type Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-cream">
            <div className="flex items-center space-x-1.5 p-1 bg-brand-cream border border-brand-border rounded-xs w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => handleTypeFilterChange('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-white text-brand-brown shadow-2xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('inventoryAudit.filterAll') || 'ทั้งหมด'} (
                {movementsList.length})
              </button>

              <button
                type="button"
                onClick={() => handleTypeFilterChange('RESTOCK')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  typeFilter === 'RESTOCK'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${typeFilter === 'RESTOCK' ? 'bg-white' : 'bg-emerald-500'}`}
                />
                <span>
                  {t('inventoryAudit.filterRestock') || 'นำเข้าสต็อก'} (
                  {restockCount})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeFilterChange('ORDER_DEDUCT')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  typeFilter === 'ORDER_DEDUCT'
                    ? 'bg-blue-600 text-white shadow-2xs font-black'
                    : 'text-blue-800 hover:bg-blue-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${typeFilter === 'ORDER_DEDUCT' ? 'bg-white' : 'bg-blue-500'}`}
                />
                <span>
                  {t('inventoryAudit.filterOrderDeduct') || 'ตัดสต็อกออเดอร์'} (
                  {orderDeductCount})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeFilterChange('DAMAGE')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  typeFilter === 'DAMAGE'
                    ? 'bg-red-600 text-white shadow-2xs font-black'
                    : 'text-red-800 hover:bg-red-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${typeFilter === 'DAMAGE' ? 'bg-white' : 'bg-red-500'}`}
                />
                <span>
                  {t('inventoryAudit.filterDamage') || 'ชำรุด / QC'} (
                  {damageCount})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeFilterChange('MANUAL_ADJUSTMENT')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  typeFilter === 'MANUAL_ADJUSTMENT'
                    ? 'bg-amber-600 text-white shadow-2xs font-black'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${typeFilter === 'MANUAL_ADJUSTMENT' ? 'bg-white' : 'bg-amber-500'}`}
                />
                <span>
                  {t('inventoryAudit.filterAdjustment') || 'ปรับยอดตรวจนับ'} (
                  {adjustmentCount})
                </span>
              </button>
            </div>

            {/* Active Filter Hint */}
            <div className="hidden lg:flex items-center text-[11px] text-gray-500 space-x-1">
              <Filter size={12} className="text-brand-amber" />
              <span>
                {language === 'th'
                  ? `แสดง ${filteredMovements.length} จากทั้งหมด ${movementsList.length} รายการ`
                  : `Showing ${filteredMovements.length} of ${movementsList.length} records`}
              </span>
            </div>
          </div>

          {/* Main Filter & Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
              {/* Search Input (SKU, Title, Reason) */}
              <div className="sm:col-span-2 lg:col-span-6">
                <SearchInput
                  value={searchInput}
                  onChange={setSearchInput}
                  onClear={handleResetSearch}
                  placeholder={
                    t('inventoryAudit.searchPlaceholder') ||
                    'ค้นหารหัส SKU, ชื่อสินค้า, หมายเหตุ...'
                  }
                />
              </div>

              {/* Change Type Dropdown */}
              <div className="lg:col-span-2">
                <DropdownSelect
                  value={typeFilter}
                  onChange={(val) => {
                    setTypeFilter(
                      val as
                        | 'all'
                        | 'RESTOCK'
                        | 'ORDER_DEDUCT'
                        | 'DAMAGE'
                        | 'MANUAL_ADJUSTMENT',
                    );
                    setCurrentPage(1);
                  }}
                  options={[
                    {
                      value: 'all',
                      label:
                        t('inventoryAudit.allTypes') ||
                        'ทุกประเภทการเปลี่ยนแปลง',
                    },
                    {
                      value: 'RESTOCK',
                      label: language === 'th' ? 'นำเข้า (RESTOCK)' : 'Restock',
                    },
                    {
                      value: 'ORDER_DEDUCT',
                      label:
                        language === 'th' ? 'ตัดสต็อก (ORDER)' : 'Order Deduct',
                    },
                    {
                      value: 'DAMAGE',
                      label:
                        language === 'th' ? 'ชำรุด (DAMAGE)' : 'Damage / QC',
                    },
                    {
                      value: 'MANUAL_ADJUSTMENT',
                      label:
                        language === 'th' ? 'ปรับยอด (ADJUST)' : 'Adjustment',
                    },
                  ]}
                />
              </div>

              {/* Sort By Dropdown */}
              <div className="lg:col-span-2">
                <DropdownSelect
                  value={sortBy}
                  onChange={(val) => {
                    setSortBy(
                      val as 'newest' | 'oldest' | 'qty_desc' | 'qty_asc',
                    );
                    setCurrentPage(1);
                  }}
                  options={[
                    {
                      value: 'newest',
                      label: t('inventoryAudit.sortNewest') || 'เวลาล่าสุดก่อน',
                    },
                    {
                      value: 'oldest',
                      label:
                        t('inventoryAudit.sortOldest') || 'เวลาเก่าสุดก่อน',
                    },
                    {
                      value: 'qty_desc',
                      label:
                        t('inventoryAudit.sortQtyDesc') || 'จำนวนบวกมากสุด (+)',
                    },
                    {
                      value: 'qty_asc',
                      label:
                        t('inventoryAudit.sortQtyAsc') || 'จำนวนลดลงมากสุด (-)',
                    },
                  ]}
                />
              </div>

              {/* Action Buttons: Search & Reset */}
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

        {/* Audit Log Table Container */}
        <div className="space-y-0">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36 font-mono text-xs">
                    {t('inventory.table.timestamp') || 'วันเวลา'}
                  </TableHead>
                  <TableHead className="w-48">
                    {t('inventory.table.sku') || 'รหัส SKU'}
                  </TableHead>
                  <TableHead className="min-w-[180px]">
                    {t('inventory.table.product') || 'ชื่อสินค้า'}
                  </TableHead>
                  <TableHead className="w-36 text-center">
                    {t('inventory.table.changeType') || 'ประเภท'}
                  </TableHead>
                  <TableHead className="w-28 text-center">
                    {t('inventory.table.changeQty') || 'จำนวนที่เปลี่ยน'}
                  </TableHead>
                  <TableHead className="w-32 text-center">
                    {t('inventory.table.balanceAfter') || 'คงเหลือหลังปรับ'}
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    {t('inventory.table.reason') || 'เหตุผล / หมายเหตุ'}
                  </TableHead>
                  <TableHead className="w-36 text-right">
                    {t('inventory.table.operator') || 'ผู้ดำเนินการ'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-8">
                      <EmptyState
                        icon={History}
                        title={
                          t('inventoryAudit.emptyTitle') ||
                          'ไม่พบประวัติความเคลื่อนไหวสต็อก'
                        }
                        subtitle={
                          t('inventoryAudit.emptySubtitle') ||
                          'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองประเภทการเปลี่ยนแปลง'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMovements.map((m) => (
                    <TableRow key={m.id} className="group">
                      {/* Timestamp */}
                      <TableCell className="font-mono text-gray-500 text-xs whitespace-nowrap">
                        {m.createdAt
                          ? m.createdAt.replace('T', ' ').slice(0, 16)
                          : '-'}
                      </TableCell>

                      {/* SKU */}
                      <TableCell className="font-mono font-bold text-brand-brown whitespace-nowrap">
                        {m.sku}
                      </TableCell>

                      {/* Product Name */}
                      <TableCell className="font-bold text-brand-brown">
                        {m.productName}
                      </TableCell>

                      {/* Change Type */}
                      <TableCell className="text-center whitespace-nowrap">
                        {getChangeTypeBadge(m.changeType)}
                      </TableCell>

                      {/* Quantity Change */}
                      <TableCell className="font-mono font-bold text-sm text-center whitespace-nowrap">
                        <span
                          className={
                            m.quantityChange >= 0
                              ? 'text-emerald-700'
                              : 'text-red-600'
                          }
                        >
                          {m.quantityChange >= 0
                            ? `+${m.quantityChange}`
                            : m.quantityChange}
                        </span>
                      </TableCell>

                      {/* Balance After */}
                      <TableCell className="font-mono font-bold text-brand-brown text-center whitespace-nowrap">
                        {m.balanceAfter}{' '}
                        <span className="text-[11px] font-normal text-gray-500">
                          {language === 'th' ? 'ชิ้น' : 'pcs'}
                        </span>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="text-gray-700 text-xs leading-relaxed">
                        {m.reason || '-'}
                      </TableCell>

                      {/* Operator */}
                      <TableCell className="text-right text-xs font-semibold text-brand-brown whitespace-nowrap">
                        {m.adminName || 'System / Admin'}
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
            totalItems={filteredMovements.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
