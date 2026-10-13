import { useState, useEffect } from 'react';
import { Search, RotateCcw, X, Filter } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { DEFAULT_FILTERS, type ProductFilterState } from './productListTypes';

interface ProductListFiltersProps {
  activeFilters: ProductFilterState;
  onApplyFilters: (filters: ProductFilterState) => void;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  availableCategories: { id: string; label: string }[];
}

export function ProductListFilters({
  activeFilters,
  onApplyFilters,
  totalCount,
  publishedCount,
  draftCount,
  availableCategories,
}: ProductListFiltersProps) {
  const { t, language } = useLanguage();
  const [staging, setStaging] = useState<ProductFilterState>(activeFilters);

  // Sync staging if activeFilters changed externally
  useEffect(() => {
    setStaging(activeFilters);
  }, [activeFilters]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onApplyFilters(staging);
  };

  const handleReset = () => {
    setStaging(DEFAULT_FILTERS);
    onApplyFilters(DEFAULT_FILTERS);
  };

  const handleStatusChange = (status: ProductFilterState['status']) => {
    const updated = { ...staging, status };
    setStaging(updated);
    onApplyFilters(updated);
  };

  const departments = [
    { id: 'all', label: t('productList.allDepts') },
    { id: 'women', label: language === 'th' ? 'ผู้หญิง (Women)' : 'Women' },
    { id: 'men', label: language === 'th' ? 'ผู้ชาย (Men)' : 'Men' },
    { id: 'kids', label: language === 'th' ? 'เด็ก (Kids)' : 'Kids' },
    { id: 'bags', label: language === 'th' ? 'กระเป๋า (Bags)' : 'Bags' },
    { id: 'shoes', label: language === 'th' ? 'รองเท้า (Shoes)' : 'Shoes' },
    { id: 'home', label: language === 'th' ? 'ของแต่งบ้าน (Home)' : 'Home' },
  ];

  const sortOptions = [
    { id: 'newest', label: t('productList.sortNewest') },
    { id: 'price_asc', label: t('productList.sortPriceAsc') },
    { id: 'price_desc', label: t('productList.sortPriceDesc') },
    { id: 'name_asc', label: t('productList.sortNameAsc') },
  ];

  return (
    <div className="bg-white border border-[#EAE3D9] p-4 space-y-3.5 shadow-2xs rounded-xs">
      {/* Top Row: Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FAF7F2]">
        <div className="flex items-center space-x-1.5 p-1 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xs w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => handleStatusChange('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all ${
              staging.status === 'all'
                ? 'bg-white text-[#2B1810] shadow-2xs font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('productList.all')} ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('published')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all ${
              staging.status === 'published'
                ? 'bg-emerald-600 text-white shadow-2xs font-black'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${staging.status === 'published' ? 'bg-white' : 'bg-emerald-500'}`}
            />
            <span>
              {t('productList.published')} ({publishedCount})
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('draft')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all ${
              staging.status === 'draft'
                ? 'bg-amber-600 text-white shadow-2xs font-black'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${staging.status === 'draft' ? 'bg-white' : 'bg-amber-500'}`}
            />
            <span>
              {t('productList.draft')} ({draftCount})
            </span>
          </button>
        </div>

        {/* Active Filter Hint */}
        <div className="hidden lg:flex items-center text-[11px] text-gray-400 space-x-1">
          <Filter size={12} />
          <span>{language === 'th' ? 'เลือกตัวกรองแล้วกดปุ่ม "ค้นหา" เพื่อโหลดข้อมูล' : 'Configure filters and click "Search" to query'}</span>
        </div>
      </div>

      {/* Main Filter & Search Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
          {/* Search Input (5 cols on lg) */}
          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={staging.search}
              onChange={(e) => setStaging({ ...staging, search: e.target.value })}
              placeholder={t('productList.searchPlaceholder')}
              className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] rounded-xs bg-white text-gray-900 transition-colors"
            />
            {staging.search && (
              <button
                type="button"
                onClick={() => setStaging({ ...staging, search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                title="Clear input"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Department Select (2 cols on lg) */}
          <div className="lg:col-span-2">
            <select
              value={staging.department}
              onChange={(e) => setStaging({ ...staging, department: e.target.value })}
              className="w-full px-2.5 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#2B1810] rounded-xs bg-white text-gray-800"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select (2 cols on lg) */}
          <div className="lg:col-span-2">
            <select
              value={staging.category}
              onChange={(e) => setStaging({ ...staging, category: e.target.value })}
              className="w-full px-2.5 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#2B1810] rounded-xs bg-white text-gray-800"
            >
              <option value="all">{t('productList.allCategories')}</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Select (2 cols on lg) */}
          <div className="lg:col-span-2">
            <select
              value={staging.sortBy}
              onChange={(e) =>
                setStaging({ ...staging, sortBy: e.target.value as ProductFilterState['sortBy'] })
              }
              className="w-full px-2.5 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#2B1810] rounded-xs bg-white text-gray-800"
            >
              {sortOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons: Search & Reset (2 cols on lg) */}
          <div className="flex items-center space-x-1.5 sm:col-span-2 lg:col-span-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-[#2B1810] hover:bg-[#3D2318] text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Search size={13} />
              <span>{t('productList.searchBtn')}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 bg-[#FAF7F2] hover:bg-[#EAE3D9] border border-[#EAE3D9] rounded-xs transition-colors cursor-pointer"
              title={t('productList.resetBtn')}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
