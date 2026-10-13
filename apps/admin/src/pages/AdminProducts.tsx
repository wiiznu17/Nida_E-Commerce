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
import { productRequester } from '../api/requester/productRequester';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../data/products';
import type { QueryProductsInput } from '@repo/validators';

export default function AdminProducts() {
  const { t, language, isTh } = useLanguage();
  const location = useLocation();

  const [activeFilters, setActiveFilters] = useState<ProductFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: string; label: string }>>([]);

  const queryParams = useMemo((): QueryProductsInput => {
    return {
      page: currentPage,
      limit: pageSize,
      search: activeFilters.search.trim().length > 0 ? activeFilters.search.trim() : undefined,
      category: activeFilters.category !== 'all' ? activeFilters.category : undefined,
      department: activeFilters.department !== 'all' ? activeFilters.department.toUpperCase() : undefined,
      status: activeFilters.status !== 'all' ? (activeFilters.status as 'published' | 'draft') : undefined,
      sortBy:
        activeFilters.sortBy === 'price_asc'
          ? ('price_asc' as const)
          : activeFilters.sortBy === 'price_desc'
            ? ('price_desc' as const)
            : ('newest' as const),
    };
  }, [currentPage, pageSize, activeFilters]);

  const { products, total, totalPages, refetch } = useProducts(queryParams);

  useEffect(() => {
    productRequester
      .getCategories()
      .then((cats) => {
        setAvailableCategories(
          cats.map((c) => ({
            id: c.slug,
            label: isTh && c.nameTh ? c.nameTh : c.name,
          })),
        );
      })
      .catch(() => {
        // Categories list optional fallback
      });
  }, [isTh]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const navState = location.state as { toast?: string } | null;
    if (navState?.toast) {
      showToast(navState.toast);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDelete = async (id: string, name: string) => {
    const confirmText = t('productList.confirmDelete').replace('{name}', name);

    if (window.confirm(confirmText)) {
      try {
        await productRequester.delete(id);
        showToast(t('productList.deleteSuccess'));
        refetch();
      } catch {
        showToast(t('productList.deleteError'));
      }
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.isActive === false ? true : false;
    setTogglingId(product.id);
    try {
      await productRequester.toggleStatus(product.id, nextStatus);
      const statusLabel = nextStatus
        ? t('productList.published')
        : t('productList.draft');
      showToast(
        t('productList.statusToggleSuccess').replace('{status}', statusLabel),
      );
      refetch();
    } catch {
      showToast(t('productList.statusToggleError'));
    } finally {
      setTogglingId(null);
    }
  };

  const handleApplyFilters = (newFilters: ProductFilterState) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <AdminLayout
      title={t('productList.title')}
      subtitle={`${t('productList.subtitle')} (${
        language === 'th'
          ? `แสดง ${products.length} จาก ${total} รายการ`
          : `${products.length} of ${total} products displayed`
      })`}
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
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 text-xs font-bold flex items-center rounded-xs shadow-2xs animate-in fade-in">
            <Check size={16} className="mr-2 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <ProductListFilters
          activeFilters={activeFilters}
          onApplyFilters={handleApplyFilters}
          totalCount={total}
          publishedCount={total}
          draftCount={0}
          availableCategories={availableCategories}
        />

        <div className="space-y-0">
          <ProductListTable
            products={products}
            inventoryList={[]}
            togglingId={togglingId}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />

          <ProductListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
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
