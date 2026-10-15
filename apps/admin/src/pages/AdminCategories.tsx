import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import {
  AdminPermission,
  PRODUCT_DEPARTMENTS,
  type ApiCategory,
} from '@repo/types';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@repo/validators';
import { AdminLayout } from '../components/layout';
import { PermissionGate } from '../components/common';
import { Button, Alert } from '../components/ui';
import {
  CategoryModal,
  CategoryStatsCards,
  CategoryFilterBar,
  CategoryTable,
  CategoryDeleteDialog,
  type CategoryStats,
} from '../components/category';
import { productRequester } from '../api/requester/productRequester';
import { useLanguage } from '../context/LanguageContext';

export default function AdminCategories() {
  const { t, isTh } = useLanguage();

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Expandable tree state: set of expanded main category IDs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(
    null,
  );
  const [modalParentId, setModalParentId] = useState<string | undefined>(
    undefined,
  );

  // Delete confirmation dialog state
  const [deletingCategory, setDeletingCategory] = useState<ApiCategory | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Status toggling state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productRequester.getCategories(
        selectedDept !== 'all' ? selectedDept : undefined,
        true,
      );
      setCategories(data);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : t('category.saveError');
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDept, t]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Derived parent categories
  const parentCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  // Sub-categories map: parentId -> ApiCategory[]
  const subCategoryMap = useMemo(() => {
    const map = new Map<string, ApiCategory[]>();
    for (const c of categories) {
      if (c.parentId) {
        const list = map.get(c.parentId) || [];
        list.push(c);
        map.set(c.parentId, list);
      }
    }
    for (const [key, list] of map.entries()) {
      list.sort(
        (a, b) =>
          (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
          a.name.localeCompare(b.name),
      );
      map.set(key, list);
    }
    return map;
  }, [categories]);

  // Toggle single main category expand / collapse
  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand / Collapse all
  const areAllExpanded = useMemo(() => {
    if (parentCategories.length === 0) return false;
    return parentCategories.every((p) => expandedIds.has(p.id));
  }, [parentCategories, expandedIds]);

  const handleToggleExpandAll = () => {
    if (areAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(parentCategories.map((p) => p.id)));
    }
  };

  // Auto-expand parents when searching
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    const matchedParentIds = new Set<string>();

    for (const cat of categories) {
      const match =
        cat.name.toLowerCase().includes(q) ||
        (cat.nameTh && cat.nameTh.toLowerCase().includes(q)) ||
        cat.slug.toLowerCase().includes(q);

      if (match) {
        if (cat.parentId) {
          matchedParentIds.add(cat.parentId);
        } else {
          matchedParentIds.add(cat.id);
        }
      }
    }

    setExpandedIds((prev) => {
      const merged = new Set(prev);
      for (const id of matchedParentIds) {
        merged.add(id);
      }
      return merged;
    });
  }, [searchQuery, categories]);

  // Filtered Main Categories
  const filteredMainCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return parentCategories
      .filter((mainCat) => {
        if (
          selectedDept !== 'all' &&
          mainCat.department?.toUpperCase() !== selectedDept.toUpperCase()
        ) {
          return false;
        }

        if (q) {
          const matchMain =
            mainCat.name.toLowerCase().includes(q) ||
            (mainCat.nameTh && mainCat.nameTh.toLowerCase().includes(q)) ||
            mainCat.slug.toLowerCase().includes(q);

          if (matchMain) return true;

          const subs = subCategoryMap.get(mainCat.id) || [];
          return subs.some(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              (s.nameTh && s.nameTh.toLowerCase().includes(q)) ||
              s.slug.toLowerCase().includes(q),
          );
        }

        return true;
      })
      .sort(
        (a, b) =>
          (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
          a.name.localeCompare(b.name),
      );
  }, [parentCategories, selectedDept, searchQuery, subCategoryMap]);

  // Stats computation
  const stats: CategoryStats = useMemo(() => {
    const total = categories.length;
    const main = categories.filter((c) => !c.parentId).length;
    const sub = categories.filter((c) => !!c.parentId).length;
    const active = categories.filter((c) => c.isActive !== false).length;
    return { total, main, sub, active };
  }, [categories]);

  // Modal Submit (Create / Edit)
  const handleModalSubmit = async (data: CreateCategoryInput) => {
    try {
      if (editingCategory) {
        const updatePayload: UpdateCategoryInput = { ...data };
        await productRequester.updateCategory(
          editingCategory.id,
          updatePayload,
        );
      } else {
        await productRequester.createCategory(data);
      }
      showToast(t('category.saveSuccess'), 'success');
      setIsModalOpen(false);
      setEditingCategory(null);
      setModalParentId(undefined);
      await loadCategories();
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : t('category.saveError');
      showToast(errMsg, 'error');
      throw err;
    }
  };

  // Delete Category
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await productRequester.deleteCategory(deletingCategory.id);
      showToast(t('category.deleteSuccess'), 'success');
      setDeletingCategory(null);
      await loadCategories();
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : t('category.deleteError');
      showToast(errMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Deactivate Category from Delete Modal
  const handleDeactivateCategory = async (cat: ApiCategory) => {
    setIsDeactivating(true);
    try {
      await productRequester.updateCategory(cat.id, { isActive: false });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: false } : c)),
      );
      showToast(t('category.deactivateSuccess'), 'success');
      setDeletingCategory(null);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : t('category.saveError');
      showToast(errMsg, 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Toggle Category Status (Active / Inactive)
  const handleToggleStatus = async (cat: ApiCategory) => {
    setTogglingId(cat.id);
    const nextStatus = cat.isActive === false ? true : false;
    try {
      await productRequester.updateCategory(cat.id, { isActive: nextStatus });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextStatus } : c)),
      );
      showToast(t('category.saveSuccess'), 'success');
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : t('category.saveError');
      showToast(errMsg, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const departments = useMemo(
    () => [
      { id: 'all', label: t('category.allDepts') },
      ...PRODUCT_DEPARTMENTS.map((dept) => ({
        id: dept.id,
        label: isTh ? dept.labelTh : dept.labelEn,
      })),
    ],
    [isTh, t],
  );

  return (
    <AdminLayout
      title={t('category.title')}
      subtitle={t('category.subtitle')}
      actionButton={
        <PermissionGate permission={AdminPermission.CATALOG_WRITE}>
          <Button
            onClick={() => {
              setEditingCategory(null);
              setModalParentId(undefined);
              setIsModalOpen(true);
            }}
            className="bg-brand-brown hover:bg-brand-dark-brown text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 rounded-xs shadow-2xs"
          >
            <Plus size={15} />
            <span>{t('category.addBtn')}</span>
          </Button>
        </PermissionGate>
      }
    >
      <div className="space-y-6">
        {toastMessage && (
          <Alert
            variant={toastMessage.type}
            message={toastMessage.text}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* 1. Metric Cards */}
        <CategoryStatsCards stats={stats} />

        {/* 2. Controls & Filter Bar */}
        <CategoryFilterBar
          departments={departments}
          selectedDept={selectedDept}
          onSelectDept={setSelectedDept}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          hasCategories={parentCategories.length > 0}
          areAllExpanded={areAllExpanded}
          onToggleExpandAll={handleToggleExpandAll}
        />

        {/* 3. Expandable Accordion Tree Table */}
        <CategoryTable
          isLoading={isLoading}
          mainCategories={filteredMainCategories}
          subCategoryMap={subCategoryMap}
          expandedIds={expandedIds}
          onToggleExpand={handleToggleExpand}
          togglingId={togglingId}
          onToggleStatus={handleToggleStatus}
          onAddSub={(mainCat) => {
            setEditingCategory(null);
            setModalParentId(mainCat.id);
            setIsModalOpen(true);
          }}
          onEdit={(cat) => {
            setEditingCategory(cat);
            setModalParentId(undefined);
            setIsModalOpen(true);
          }}
          onDelete={(cat) => setDeletingCategory(cat)}
          searchQuery={searchQuery}
        />
      </div>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
            setModalParentId(undefined);
          }}
          onSubmit={handleModalSubmit}
          initialData={editingCategory}
          parentCategories={parentCategories}
          defaultParentId={modalParentId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <CategoryDeleteDialog
        category={deletingCategory}
        isOpen={!!deletingCategory}
        isDeleting={isDeleting}
        isDeactivating={isDeactivating}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        onDeactivate={handleDeactivateCategory}
      />
    </AdminLayout>
  );
}
