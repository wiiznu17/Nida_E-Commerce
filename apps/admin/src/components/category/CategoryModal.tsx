import { useState, useEffect } from 'react';
import { X, FolderTree, Loader2 } from 'lucide-react';
import { Department, type ApiCategory } from '@repo/types';
import type { CreateCategoryInput } from '@repo/validators';
import { useLanguage } from '../../context/LanguageContext';
import { Button, DropdownSelect, InlineError, ApiErrorModal } from '../ui';

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
  initialData?: ApiCategory | null;
  parentCategories: ApiCategory[];
  defaultParentId?: string;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentCategories,
  defaultParentId,
}: CategoryModalProps) {
  const { t, isTh } = useLanguage();

  const [name, setName] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [slug, setSlug] = useState('');
  const [department, setDepartment] = useState<Department>(Department.WOMEN);
  const [parentId, setParentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [descriptionTh, setDescriptionTh] = useState('');
  const [bannerTag, setBannerTag] = useState('');
  const [bannerTagTh, setBannerTagTh] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setNameTh(initialData.nameTh ?? '');
      setSlug(initialData.slug ?? '');
      setDepartment(initialData.department ?? Department.WOMEN);
      setParentId(initialData.parentId ?? '');
      setDescription(initialData.description ?? '');
      setDescriptionTh(initialData.descriptionTh ?? '');
      setBannerTag(initialData.bannerTag ?? '');
      setBannerTagTh(initialData.bannerTagTh ?? '');
      setDisplayOrder(initialData.displayOrder ?? 0);
      setIsActive(
        initialData.isActive !== undefined ? initialData.isActive : true,
      );
    } else {
      setName('');
      setNameTh('');
      setSlug('');
      const matchedParent = defaultParentId
        ? parentCategories.find((p) => p.id === defaultParentId)
        : null;
      setDepartment(matchedParent?.department ?? Department.WOMEN);
      setParentId(defaultParentId ?? '');
      setDescription('');
      setDescriptionTh('');
      setBannerTag('');
      setBannerTagTh('');
      setDisplayOrder(0);
      setIsActive(true);
    }
    setFieldErrors({});
    setApiError(null);
  }, [initialData, isOpen, defaultParentId, parentCategories]);

  if (!isOpen) return null;

  const isEdit = Boolean(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { name?: string } = {};
    if (!name.trim()) {
      errs.name = isTh
        ? 'กรุณากรอกชื่อหมวดหมู่ภาษาอังกฤษ'
        : 'Category name (English) is required';
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    try {
      setIsSubmitting(true);
      setApiError(null);

      const payload: CreateCategoryInput = {
        name: name.trim(),
        nameTh: nameTh.trim() || undefined,
        slug: slug.trim() || undefined,
        department,
        parentId: parentId ? parentId : undefined,
        description: description.trim() || undefined,
        descriptionTh: descriptionTh.trim() || undefined,
        bannerTag: bannerTag.trim() || undefined,
        bannerTagTh: bannerTagTh.trim() || undefined,
        displayOrder,
        isActive,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('category.saveError');
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = [
    { value: Department.WOMEN, label: isTh ? 'เสื้อผ้าสตรี (WOMEN)' : 'WOMEN' },
    { value: Department.MEN, label: isTh ? 'เสื้อผ้าบุรุษ (MEN)' : 'MEN' },
    { value: Department.KIDS, label: isTh ? 'เด็ก (KIDS)' : 'KIDS' },
    { value: Department.BAGS, label: isTh ? 'กระเป๋า (BAGS)' : 'BAGS' },
    { value: Department.SHOES, label: isTh ? 'รองเท้า (SHOES)' : 'SHOES' },
    { value: Department.HOME, label: isTh ? 'ของแต่งบ้าน (HOME)' : 'HOME' },
  ];

  // Candidates for parent category: top-level categories in the same department (excluding itself)
  const eligibleParents = parentCategories.filter(
    (c) =>
      c.id !== initialData?.id && !c.parentId && c.department === department,
  );

  const parentOptions = [
    { value: '', label: t('category.modal.parentCategoryNone') },
    ...eligibleParents.map((c) => ({
      value: c.id,
      label: isTh && c.nameTh ? `${c.nameTh} (${c.name})` : c.name,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-brand-border w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-brand-cream border-b border-brand-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-yellow/20 border border-brand-yellow/40 flex items-center justify-center text-brand-dark-brown shadow-2xs">
              <FolderTree size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
                {isEdit
                  ? t('category.modal.editTitle')
                  : t('category.modal.createTitle')}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {isEdit ? initialData?.name : t('category.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
          {/* Department & Parent Category (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.department')} *
              </label>
              <DropdownSelect
                value={department}
                onChange={(val) => setDepartment(val as Department)}
                options={departmentOptions}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.parentCategory')}
              </label>
              <DropdownSelect
                value={parentId}
                onChange={setParentId}
                options={parentOptions}
              />
            </div>
          </div>

          {/* Name EN & Name TH (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.nameEn')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev: { name?: string }) => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder={t('category.modal.nameEnPlaceholder')}
                className={`w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown ${
                  fieldErrors.name ? 'border-red-500' : 'border-brand-border'
                }`}
              />
              <InlineError message={fieldErrors.name} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.nameTh')}
              </label>
              <input
                type="text"
                value={nameTh}
                onChange={(e) => setNameTh(e.target.value)}
                placeholder={t('category.modal.nameThPlaceholder')}
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
              />
            </div>
          </div>

          {/* Slug & Display Order (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.slug')}
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t('category.modal.slugPlaceholder')}
                className="w-full px-3 py-2 text-xs font-mono border border-brand-border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.displayOrder')}
              </label>
              <input
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
              />
            </div>
          </div>

          {/* Banner Tag EN & TH (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.bannerTagEn')}
              </label>
              <input
                type="text"
                value={bannerTag}
                onChange={(e) => setBannerTag(e.target.value)}
                placeholder="e.g. NEW ARRIVAL, EXCLUSIVE"
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.bannerTagTh')}
              </label>
              <input
                type="text"
                value={bannerTagTh}
                onChange={(e) => setBannerTagTh(e.target.value)}
                placeholder="เช่น สินค้ามาใหม่, ลดราคาพิเศษ"
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
              />
            </div>
          </div>

          {/* Description (EN & TH) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.descriptionEn')}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {t('category.modal.descriptionTh')}
              </label>
              <textarea
                rows={2}
                value={descriptionTh}
                onChange={(e) => setDescriptionTh(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown resize-none"
              />
            </div>
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-brand-cream/50 border border-brand-border rounded-lg">
            <div>
              <span className="text-xs font-bold text-brand-brown block">
                {t('category.modal.isActive')}
              </span>
              <span className="text-[10px] text-gray-500">
                {isActive
                  ? t('category.statusActive')
                  : t('category.statusInactive')}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('category.modal.cancel')}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="bg-brand-dark-brown hover:bg-brand-brown text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  <span>{t('category.modal.saving')}</span>
                </span>
              ) : (
                t('category.modal.save')
              )}
            </Button>
          </div>
        </form>
      </div>

      <ApiErrorModal
        isOpen={Boolean(apiError)}
        onClose={() => setApiError(null)}
        errorMessage={apiError}
      />
    </div>
  );
}
