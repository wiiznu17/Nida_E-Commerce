import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { ApiErrorModal } from '../components/ui';
import { useToast } from '../context/ToastContext';
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
import { PermissionGate } from '../components/common';
import {
  AdminPermission,
  type ApiProduct,
  type ApiInventoryItem,
} from '@repo/types';
import { inventoryRequester } from '../api/requester/inventoryRequester';
import type { QueryProductsInput } from '@repo/validators';

export default function AdminProducts() {
  const { t, language, isTh } = useLanguage();
  const location = useLocation();

  const [activeFilters, setActiveFilters] =
    useState<ProductFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [apiError, setApiError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [inventoryList, setInventoryList] = useState<ApiInventoryItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<{
    total: number;
    published: number;
    draft: number;
  }>({
    total: 0,
    published: 0,
    draft: 0,
  });

  const toast = useToast();

  const fetchStatusCounts = useCallback(() => {
    productRequester
      .getStatusCounts()
      .then(setStatusCounts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStatusCounts();
    inventoryRequester
      .getInventory()
      .then(setInventoryList)
      .catch(() => {});
  }, [fetchStatusCounts]);

  const queryParams = useMemo((): QueryProductsInput => {
    return {
      page: currentPage,
      limit: pageSize,
      search:
        activeFilters.search.trim().length > 0
          ? activeFilters.search.trim()
          : undefined,
      category:
        activeFilters.category !== 'all' ? activeFilters.category : undefined,
      department:
        activeFilters.department !== 'all'
          ? activeFilters.department.toUpperCase()
          : undefined,
      status: activeFilters.status,
      sortBy:
        activeFilters.sortBy === 'price_asc'
          ? ('price_asc' as const)
          : activeFilters.sortBy === 'price_desc'
            ? ('price_desc' as const)
            : ('newest' as const),
    };
  }, [currentPage, pageSize, activeFilters]);

  const { products, total, totalPages, isLoading, refetch } =
    useProducts(queryParams);

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

  useEffect(() => {
    const navState = location.state as { toast?: string } | null;
    if (navState?.toast) {
      toast.success(navState.toast);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  const handleDelete = async (id: string, name: string) => {
    const confirmText = t('productList.confirmDelete').replace('{name}', name);

    if (window.confirm(confirmText)) {
      try {
        await productRequester.delete(id);
        toast.success(t('productList.deleteSuccess'));
        refetch();
        fetchStatusCounts();
      } catch (err: unknown) {
        setApiError(
          err instanceof Error ? err.message : t('productList.deleteError'),
        );
      }
    }
  };

  const handleToggleStatus = async (product: ApiProduct) => {
    const nextStatus = product.isActive === false ? true : false;
    setTogglingId(product.id);
    try {
      await productRequester.toggleStatus(product.id, nextStatus);
      const statusLabel = nextStatus
        ? t('productList.published')
        : t('productList.draft');
      toast.success(
        t('productList.statusToggleSuccess').replace('{status}', statusLabel),
      );
      refetch();
      fetchStatusCounts();
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : t('productList.statusToggleError'),
      );
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
        <PermissionGate permission={AdminPermission.CATALOG_WRITE}>
          <Link
            to="/admin/products/new"
            className="bg-brand-brown hover:bg-brand-dark-brown text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 rounded-xs shadow-2xs"
          >
            <Plus size={15} />
            <span>{t('productList.addProduct')}</span>
          </Link>
        </PermissionGate>
      }
    >
      <div className="space-y-4">
        <ProductListFilters
          activeFilters={activeFilters}
          onApplyFilters={handleApplyFilters}
          totalCount={statusCounts.total}
          publishedCount={statusCounts.published}
          draftCount={statusCounts.draft}
          availableCategories={availableCategories}
        />

        <div className="space-y-0">
          <ProductListTable
            products={products}
            inventoryList={inventoryList}
            togglingId={togglingId}
            isLoading={isLoading}
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

      <ApiErrorModal
        isOpen={Boolean(apiError)}
        onClose={() => setApiError(null)}
        errorMessage={apiError}
      />
    </AdminLayout>
  );
}
