import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import {
  ProductListFilters,
  ProductListPagination,
  ProductListTable,
  DEFAULT_FILTERS,
  type ProductFilterState,
} from '../components/product';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import type { Product } from '../data/products';

export default function AdminProducts() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const { productsList, deleteProduct, inventoryList, toggleProductStatus } = useAdmin();

  // Committed filter state (only updated when user clicks Search or Reset)
  const [activeFilters, setActiveFilters] = useState<ProductFilterState>(DEFAULT_FILTERS);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Status & Feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen for toast from navigation redirect (create/edit)
  useEffect(() => {
    const navState = location.state as { toast?: string } | null;
    if (navState?.toast) {
      showToast(navState.toast);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDelete = (id: string, name: string) => {
    const confirmText =
      language === 'th'
        ? t('productList.confirmDelete').replace('{name}', name)
        : t('productList.confirmDelete').replace('{name}', name);

    if (window.confirm(confirmText)) {
      deleteProduct(id);
      showToast(t('productList.deleteSuccess'));
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.isActive === false ? true : false;
    setTogglingId(product.id);
    try {
      await toggleProductStatus(product.id, nextStatus);
      const statusLabel = nextStatus
        ? t('productList.published')
        : t('productList.draft');
      showToast(
        t('productList.statusToggleSuccess').replace('{status}', statusLabel),
      );
    } catch {
      showToast(t('productList.statusToggleError'));
    } finally {
      setTogglingId(null);
    }
  };

  // Available categories derived dynamically from products
  const availableCategories = useMemo(() => {
    const map = new Map<string, string>();
    productsList.forEach((p) => {
      const slug = p.category;
      const label = p.subCategory || p.category;
      if (slug && !map.has(slug)) {
        map.set(slug, label);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [productsList]);

  // Handle Search button / filter apply
  const handleApplyFilters = (newFilters: ProductFilterState) => {
    setActiveFilters(newFilters);
    setCurrentPage(1); // Always reset to page 1 on new query
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    const term = activeFilters.search.trim().toLowerCase();

    return productsList
      .filter((p) => {
        // Status filter
        if (activeFilters.status === 'published' && p.isActive === false) {
          return false;
        }
        if (activeFilters.status === 'draft' && p.isActive !== false) {
          return false;
        }

        // Department filter
        if (
          activeFilters.department !== 'all' &&
          p.department?.toLowerCase() !== activeFilters.department.toLowerCase()
        ) {
          return false;
        }

        // Category filter
        if (
          activeFilters.category !== 'all' &&
          p.category.toLowerCase() !== activeFilters.category.toLowerCase()
        ) {
          return false;
        }

        // Search text filter
        if (term) {
          const matchName = p.name.toLowerCase().includes(term);
          const matchNameTh = p.nameTh ? p.nameTh.toLowerCase().includes(term) : false;
          const matchCategory = p.category.toLowerCase().includes(term);
          const matchSubCategory = p.subCategory ? p.subCategory.toLowerCase().includes(term) : false;
          const matchSlug = p.slug ? p.slug.toLowerCase().includes(term) : false;

          if (!matchName && !matchNameTh && !matchCategory && !matchSubCategory && !matchSlug) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (activeFilters.sortBy === 'price_asc') {
          return a.price - b.price;
        }
        if (activeFilters.sortBy === 'price_desc') {
          return b.price - a.price;
        }
        if (activeFilters.sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        // Default: newest / preserve default list order
        return 0;
      });
  }, [productsList, activeFilters]);

  // Counts for status pills
  const totalPublished = useMemo(
    () => productsList.filter((p) => p.isActive !== false).length,
    [productsList],
  );
  const totalDrafts = useMemo(
    () => productsList.filter((p) => p.isActive === false).length,
    [productsList],
  );

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safeCurrentPage, pageSize]);

  return (
    <AdminLayout
      title={t('productList.title')}
      subtitle={`${t('productList.subtitle')} (${language === 'th' ? `แสดง ${filteredProducts.length} จาก ${productsList.length} รายการ` : `${filteredProducts.length} of ${productsList.length} products displayed`})`}
      actionButton={
        <Link
          to="/admin/products/new"
          className="bg-[#2B1810] hover:bg-[#3D2318] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 rounded-xs shadow-2xs"
        >
          <Plus size={15} />
          <span>{t('productList.addProduct')}</span>
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 text-xs font-bold flex items-center rounded-xs shadow-2xs animate-in fade-in">
            <Check size={16} className="mr-2 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filters and Search Bar with Search Button */}
        <ProductListFilters
          activeFilters={activeFilters}
          onApplyFilters={handleApplyFilters}
          totalCount={productsList.length}
          publishedCount={totalPublished}
          draftCount={totalDrafts}
          availableCategories={availableCategories}
        />

        {/* Products Table with Pagination */}
        <div className="space-y-0">
          <ProductListTable
            products={paginatedProducts}
            inventoryList={inventoryList}
            togglingId={togglingId}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />

          <ProductListPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(page) => setCurrentPage(page)}
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
