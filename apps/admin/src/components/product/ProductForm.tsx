import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  PRODUCT_DEPARTMENTS,
  PRODUCT_CATEGORIES,
  PRODUCT_SUB_CATEGORIES,
  findMarketingTagByLabel,
  type MarketingTagOption,
  getSubCategoriesFor,
  findSubCategoryByLabel,
  findSubCategoryByKey,
  type ProductCategory,
} from '@repo/types';
import { useLanguage } from '../../context/LanguageContext';
import type { SkuVariant } from '../../data/adminData';
import { ProductPreviewModal } from './ProductPreviewModal';
import { PublishConfirmModal } from './PublishConfirmModal';
import { UnsavedChangesModal } from '../common';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import {
  FormTopBar,
  FormBasicInfoSection,
  FormStatusOverviewCard,
  FormMediaSection,
  FormPricingSection,
  FormMaterialsCareSection,
  FormTaxonomySection,
  FormMarketingTagSection,
  FormVariantsSection,
  SIZE_PRESETS,
  getDepartmentCode,
  getColorName,
  buildSkuMatrix,
  type ProductFormProps,
} from './form';

export type { ProductFormProps };

export function ProductForm({
  initialData,
  initialSkus,
  onSubmit,
  isEdit = false,
  isSubmitting = false,
}: ProductFormProps) {
  const { t, isTh } = useLanguage();

  // Active language tab for text inputs (EN / TH)
  const [descLangTab, setDescLangTab] = useState<'en' | 'th'>('en');

  // Basic Information
  const [name, setName] = useState(initialData?.name || '');
  const [nameTh, setNameTh] = useState(initialData?.nameTh || '');
  const [price, setPrice] = useState<number | string>(initialData?.price ?? '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(
    initialData?.originalPrice ?? '',
  );
  const [department, setDepartment] = useState(initialData?.department || 'women');
  const [category, setCategory] = useState(initialData?.category || 'apparel');

  // Taxonomy Enum Matching
  const initialSubCatMatch =
    (initialData?.subCategory && findSubCategoryByLabel(initialData.subCategory)) ||
    (initialData?.subCategoryTh && findSubCategoryByLabel(initialData.subCategoryTh)) ||
    getSubCategoriesFor(initialData?.category || 'apparel', initialData?.department || 'women')[0] ||
    PRODUCT_SUB_CATEGORIES[0];

  const [subCategoryKey, setSubCategoryKey] = useState<string>(
    initialSubCatMatch?.key || 'SWEATERS_AND_KNITS',
  );
  const [subCategory, setSubCategory] = useState<string>(
    initialSubCatMatch?.labelEn || initialData?.subCategory || 'Sweaters & Knits',
  );
  const [subCategoryTh, setSubCategoryTh] = useState<string>(
    initialSubCatMatch?.labelTh || initialData?.subCategoryTh || 'สเวตเตอร์และเสื้อไหมพรม',
  );

  // Marketing Tag Enum Matching
  const initialTagMatch = initialData?.tag
    ? findMarketingTagByLabel(initialData.tag)
    : initialData?.tagTh
      ? findMarketingTagByLabel(initialData.tagTh)
      : undefined;

  const [tag, setTag] = useState(initialTagMatch?.labelEn || initialData?.tag || '');
  const [tagTh, setTagTh] = useState(initialTagMatch?.labelTh || initialData?.tagTh || '');

  const [description, setDescription] = useState(initialData?.description || '');
  const [descriptionTh, setDescriptionTh] = useState(initialData?.descriptionTh || '');

  const [materialsCare, setMaterialsCare] = useState(initialData?.materialsCare || '');
  const [materialsCareTh, setMaterialsCareTh] = useState(initialData?.materialsCareTh || '');

  // Master Images
  const [image, setImage] = useState(initialData?.image || '');
  const [secondaryImage, setSecondaryImage] = useState(initialData?.secondaryImage || '');

  // Color Swatches & Color-Specific Images
  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialData?.colors && initialData.colors.length > 0 ? initialData.colors : [],
  );
  const [customColor, setCustomColor] = useState('#D4C3B3');
  const [colorImages, setColorImages] = useState<Record<string, string>>(
    initialData?.colorImages || {},
  );

  // SKU Management State
  const hasMultipleInitialSkus = initialSkus && initialSkus.length > 1;
  const isInitialSingle =
    initialSkus &&
    initialSkus.length === 1 &&
    (initialSkus[0].size === 'ONE SIZE' || initialSkus[0].size === 'Standard');

  const [variantMode, setVariantMode] = useState<'matrix' | 'single'>(
    hasMultipleInitialSkus ? 'matrix' : isInitialSingle ? 'single' : 'matrix',
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'published' | 'draft'>(() => {
    if (initialData?.isActive === false) return 'draft';
    return 'published';
  });
  const [showPublishModal, setShowPublishModal] = useState(false);

  const initialSizes =
    initialSkus && initialSkus.length > 0
      ? Array.from(new Set(initialSkus.map((s) => s.size)))
      : [];

  // Keep immutable references to original colors and sizes for edit mode protection
  const initialColorsRef = useRef<string[]>(
    initialData?.colors && initialData.colors.length > 0 ? [...initialData.colors] : [],
  );
  const initialSizesRef = useRef<string[]>(
    initialSkus && initialSkus.length > 0
      ? Array.from(new Set(initialSkus.map((s) => s.size)))
      : [],
  );

  const [activeSizes, setActiveSizes] = useState<string[]>(initialSizes);
  const [customSizeInput, setCustomSizeInput] = useState('');

  const [skuList, setSkuList] = useState<SkuVariant[]>(() => {
    if (initialSkus && initialSkus.length > 0) {
      return initialSkus;
    }
    if (initialData?.colors && initialData.colors.length > 0 && initialSizes.length > 0) {
      return buildSkuMatrix(
        initialData.colors,
        initialSizes,
        [],
        initialData?.department || 'women',
      );
    }
    return [];
  });

  const [singleSkuCode, setSingleSkuCode] = useState(
    initialSkus?.[0]?.sku || '',
  );
  const [singleLowStock, setSingleLowStock] = useState<number | string>(
    initialSkus?.[0]?.lowStockThreshold ?? 5,
  );

  const [error, setError] = useState<string | null>(null);

  // Track initial snapshot for precise dirty detection
  const initialSnapshotRef = useRef<string>('');
  const [isManuallyDirty, setIsManuallyDirty] = useState(false);

  useEffect(() => {
    initialSnapshotRef.current = JSON.stringify({
      name: initialData?.name || '',
      nameTh: initialData?.nameTh || '',
      price: initialData?.price || '',
      originalPrice: initialData?.originalPrice || '',
      department: initialData?.department || 'women',
      category: initialData?.category || 'apparel',
      subCategory: initialData?.subCategory || '',
      tag: initialData?.tag || '',
      description: initialData?.description || '',
      descriptionTh: initialData?.descriptionTh || '',
      materialsCare: initialData?.materialsCare || '',
      materialsCareTh: initialData?.materialsCareTh || '',
      image: initialData?.image || '',
      secondaryImage: initialData?.secondaryImage || '',
      colors: initialData?.colors || [],
      colorImages: initialData?.colorImages || {},
      skus: initialSkus || [],
      publishStatus: initialData?.isActive === false ? 'draft' : 'published',
    });
  }, [initialData, initialSkus]);

  const currentSnapshot = JSON.stringify({
    name,
    nameTh,
    price,
    originalPrice,
    department,
    category,
    subCategory,
    tag,
    description,
    descriptionTh,
    materialsCare,
    materialsCareTh,
    image,
    secondaryImage,
    colors: selectedColors,
    colorImages,
    skus: skuList,
    publishStatus,
  });

  const isFormDirty =
    isManuallyDirty ||
    (Boolean(initialSnapshotRef.current) && currentSnapshot !== initialSnapshotRef.current);

  const { isBlocked, proceed, reset } = useUnsavedChanges({
    isDirty: isFormDirty,
    isSubmitting,
  });

  // Calculations
  const numericPrice = Number(price) || 0;
  const numericOriginal = Number(originalPrice) || 0;
  const discountPercent =
    numericOriginal > numericPrice && numericPrice > 0
      ? Math.round(((numericOriginal - numericPrice) / numericOriginal) * 100)
      : null;

  // Sync color changes with SKU matrix
  const handleColorsUpdated = (newColors: string[]) => {
    setSelectedColors(newColors);
    if (variantMode === 'matrix') {
      const updatedMatrix = buildSkuMatrix(newColors, activeSizes, skuList, department);
      setSkuList(updatedMatrix);
    }
  };

  const toggleColor = (hex: string) => {
    let next: string[];
    if (selectedColors.includes(hex)) {
      // Cannot unselect original color in edit mode
      if (isEdit && initialColorsRef.current.some((c) => c.toLowerCase() === hex.toLowerCase())) {
        return;
      }
      next = selectedColors.filter((c) => c.toLowerCase() !== hex.toLowerCase());
    } else {
      next = [...selectedColors, hex];
    }
    handleColorsUpdated(next);
  };

  const addCustomColor = () => {
    if (customColor && !selectedColors.some((c) => c.toLowerCase() === customColor.toLowerCase())) {
      const next = [...selectedColors, customColor];
      handleColorsUpdated(next);
    }
  };

  const removeColor = (hexToRemove: string) => {
    // Cannot delete original color in edit mode
    if (isEdit && initialColorsRef.current.some((c) => c.toLowerCase() === hexToRemove.toLowerCase())) {
      return;
    }
    const next = selectedColors.filter((c) => c.toLowerCase() !== hexToRemove.toLowerCase());
    const updatedImages = { ...colorImages };
    delete updatedImages[hexToRemove];
    setColorImages(updatedImages);
    handleColorsUpdated(next);
  };

  const handleUseMasterImageForColor = (hex: string) => {
    if (image) {
      setColorImages((prev) => ({ ...prev, [hex]: image }));
      setIsManuallyDirty(true);
    }
  };

  const handleColorImageChange = (hex: string, url: string) => {
    setColorImages((prev) => ({ ...prev, [hex]: url }));
    setIsManuallyDirty(true);
  };

  const activeMarketingTag = findMarketingTagByLabel(tag);

  const handleSelectMarketingTag = (tagOption?: MarketingTagOption) => {
    if (!tagOption) {
      setTag('');
      setTagTh('');
      return;
    }
    setTag(tagOption.labelEn);
    setTagTh(tagOption.labelTh);
  };

  const applySizePreset = (presetKey: keyof typeof SIZE_PRESETS) => {
    const preset = SIZE_PRESETS[presetKey];
    // In edit mode, preserve original initial sizes
    const nextSizes = isEdit
      ? Array.from(new Set([...initialSizesRef.current, ...preset.sizes]))
      : preset.sizes;
    setActiveSizes(nextSizes);
    const updated = buildSkuMatrix(selectedColors, nextSizes, skuList, department);
    setSkuList(updated);
  };

  // Computed Taxonomy Options & Cascades
  const currentDeptConfig = PRODUCT_DEPARTMENTS.find((d) => d.id === department);
  const availableCategories = PRODUCT_CATEGORIES.filter((cat) =>
    currentDeptConfig ? currentDeptConfig.allowedCategories.includes(cat.id) : true,
  );
  const availableSubCategories = getSubCategoriesFor(category, department);

  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    if (variantMode === 'matrix') {
      setSkuList(buildSkuMatrix(selectedColors, activeSizes, skuList, newDept));
    }
    const deptConfig = PRODUCT_DEPARTMENTS.find((d) => d.id === newDept);
    let nextCategory = category;
    if (deptConfig && !deptConfig.allowedCategories.includes(category as ProductCategory)) {
      nextCategory = deptConfig.allowedCategories[0];
      setCategory(nextCategory);
    }
    const validSubs = getSubCategoriesFor(nextCategory, newDept);
    if (validSubs.length > 0) {
      const stillValid = validSubs.find((s) => s.key === subCategoryKey);
      if (stillValid) {
        setSubCategory(stillValid.labelEn);
        setSubCategoryTh(stillValid.labelTh);
      } else {
        setSubCategoryKey(validSubs[0].key);
        setSubCategory(validSubs[0].labelEn);
        setSubCategoryTh(validSubs[0].labelTh);
      }
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (newCat === 'shoes' && activeSizes.includes('S')) {
      applySizePreset('shoes');
    } else if (
      (newCat === 'bags' || newCat === 'home' || newCat === 'accessories') &&
      (activeSizes.includes('S') || activeSizes.includes('US 8'))
    ) {
      applySizePreset('onesize');
    }
    const validSubs = getSubCategoriesFor(newCat, department);
    if (validSubs.length > 0) {
      const stillValid = validSubs.find((s) => s.key === subCategoryKey);
      if (stillValid) {
        setSubCategory(stillValid.labelEn);
        setSubCategoryTh(stillValid.labelTh);
      } else {
        setSubCategoryKey(validSubs[0].key);
        setSubCategory(validSubs[0].labelEn);
        setSubCategoryTh(validSubs[0].labelTh);
      }
    }
  };

  const handleSubCategoryChange = (newKey: string) => {
    const match = findSubCategoryByKey(newKey);
    if (match) {
      setSubCategoryKey(match.key);
      setSubCategory(match.labelEn);
      setSubCategoryTh(match.labelTh);
    }
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed || activeSizes.includes(trimmed)) return;
    const nextSizes = [...activeSizes, trimmed];
    setActiveSizes(nextSizes);
    setCustomSizeInput('');
    const updated = buildSkuMatrix(selectedColors, nextSizes, skuList, department);
    setSkuList(updated);
  };

  const removeSize = (sizeToRemove: string) => {
    // Cannot delete original size in edit mode
    if (isEdit && initialSizesRef.current.includes(sizeToRemove)) {
      return;
    }
    const nextSizes = activeSizes.filter((s) => s !== sizeToRemove);
    setActiveSizes(nextSizes);
    const updated = skuList.filter((sku) => sku.size !== sizeToRemove);
    setSkuList(updated);
  };

  const regenerateMatrix = () => {
    const updated = buildSkuMatrix(selectedColors, activeSizes, skuList, department);
    setSkuList(updated);
  };

  const updateSkuRow = (index: number, field: keyof SkuVariant, value: any) => {
    const updated = [...skuList];
    updated[index] = { ...updated[index], [field]: value };
    setSkuList(updated);
  };

  const totalStockCount =
    variantMode === 'matrix'
      ? skuList.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)
      : Math.max(0, Number(initialSkus?.[0]?.stock) || 0);

  const totalStockValue =
    variantMode === 'matrix'
      ? skuList.reduce(
          (sum, s) =>
            sum +
            (Number(s.stock) || 0) * (numericPrice + (Number(s.priceAdjustment) || 0)),
          0,
        )
      : (Number(initialSkus?.[0]?.stock) || 0) * numericPrice;

  // Scroll to section helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!name.trim()) {
      setError(t('product.validationNameEn'));
      scrollTo('sec-basic');
      return false;
    }

    if (!numericPrice || numericPrice <= 0) {
      setError(t('product.validationPrice'));
      scrollTo('sec-pricing');
      return false;
    }

    if (!image.trim()) {
      setError(t('product.validationImage'));
      scrollTo('sec-media');
      return false;
    }

    if (variantMode === 'matrix' && skuList.length === 0) {
      setError(t('product.validationSkus'));
      scrollTo('sec-inventory');
      return false;
    }

    return true;
  };

  const executeSubmit = (finalActive: boolean) => {
    let finalSkus: SkuVariant[] = [];
    if (variantMode === 'matrix') {
      finalSkus = skuList.map((s) => ({
        ...s,
        sku: s.sku.trim().toUpperCase(),
        stock: Math.max(0, Number(s.stock) || 0),
        lowStockThreshold: Math.max(1, Number(s.lowStockThreshold) || 5),
        priceAdjustment: Number(s.priceAdjustment) || 0,
      }));
    } else {
      const code =
        singleSkuCode.trim().toUpperCase() ||
        `NIDA-${getDepartmentCode(department)}-STD-${Date.now().toString().slice(-4)}`;
      finalSkus = [
        {
          sku: code,
          size: 'ONE SIZE',
          colorName: selectedColors[0] ? getColorName(selectedColors[0]) : 'Standard',
          colorHex: selectedColors[0] || '#2B1810',
          stock: Math.max(0, Number(initialSkus?.[0]?.stock) || 0),
          lowStockThreshold: Math.max(1, Number(singleLowStock) || 5),
          priceAdjustment: 0,
        },
      ];
    }

    setIsManuallyDirty(false);
    initialSnapshotRef.current = currentSnapshot;

    onSubmit(
      {
        name: name.trim(),
        nameTh: nameTh.trim() || undefined,
        price: numericPrice,
        originalPrice: numericOriginal > 0 ? numericOriginal : undefined,
        image: image.trim(),
        secondaryImage: secondaryImage.trim() || undefined,
        category,
        department,
        subCategory: subCategory.trim() || undefined,
        subCategoryTh: subCategoryTh.trim() || undefined,
        tag: tag.trim() || undefined,
        tagTh: tagTh.trim() || undefined,
        description: description.trim() || undefined,
        descriptionTh: descriptionTh.trim() || undefined,
        materialsCare: materialsCare.trim() || undefined,
        materialsCareTh: materialsCareTh.trim() || undefined,
        colors: selectedColors,
        colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined,
        rating: initialData?.rating ?? 5.0,
        reviewsCount: initialData?.reviewsCount ?? 0,
        isActive: finalActive,
      },
      finalSkus,
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (publishStatus === 'published') {
      setShowPublishModal(true);
    } else {
      executeSubmit(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Ergonomic Top Navigation Bar */}
      <FormTopBar
        isTh={isTh}
        isFormDirty={isFormDirty}
        isSubmitting={isSubmitting}
        publishStatus={publishStatus}
        isEdit={isEdit}
        onScrollTo={scrollTo}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 text-xs font-bold rounded-md flex items-center space-x-2 animate-in fade-in">
          <AlertCircle size={15} className="text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Top Section: Basic Info (8 Cols) + Action Hub (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Core Product Info */}
        <div className="lg:col-span-8">
          <FormBasicInfoSection
            isTh={isTh}
            name={name}
            nameTh={nameTh}
            description={description}
            descriptionTh={descriptionTh}
            descLangTab={descLangTab}
            onNameChange={(val) => setName(val)}
            onNameThChange={(val) => setNameTh(val)}
            onDescriptionChange={(val) => setDescription(val)}
            onDescriptionThChange={(val) => setDescriptionTh(val)}
            onDescLangTabChange={(tab) => setDescLangTab(tab)}
          />
        </div>

        {/* Right Column: Status & Publishing Action Hub */}
        <div className="lg:col-span-4">
          <FormStatusOverviewCard
            isTh={isTh}
            publishStatus={publishStatus}
            totalStockCount={totalStockCount}
            numericPrice={numericPrice}
            numericOriginal={numericOriginal}
            discountPercent={discountPercent}
            onPublishStatusChange={(status) => setPublishStatus(status)}
            onShowPreview={() => setShowPreviewModal(true)}
          />
        </div>
      </div>

      {/* 2. Full-Width Section: Media & Color Showcase */}
      <FormMediaSection
        isTh={isTh}
        isEdit={isEdit}
        initialColors={initialColorsRef.current}
        image={image}
        secondaryImage={secondaryImage}
        selectedColors={selectedColors}
        customColor={customColor}
        colorImages={colorImages}
        onImageChange={(url) => {
          setImage(url);
          setIsManuallyDirty(true);
        }}
        onSecondaryImageChange={(url) => {
          setSecondaryImage(url);
          setIsManuallyDirty(true);
        }}
        onCustomColorChange={(val) => setCustomColor(val)}
        onAddCustomColor={addCustomColor}
        onRemoveColor={removeColor}
        onToggleColor={toggleColor}
        onColorImageChange={handleColorImageChange}
        onUseMasterImageForColor={handleUseMasterImageForColor}
      />

      {/* 3. Mid Section: Pricing & Materials (7 Cols) + Taxonomy & Marketing Tags (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Pricing & Materials */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          <FormPricingSection
            isTh={isTh}
            price={price}
            originalPrice={originalPrice}
            discountPercent={discountPercent}
            onPriceChange={(val) => setPrice(val)}
            onOriginalPriceChange={(val) => setOriginalPrice(val)}
          />

          <FormMaterialsCareSection
            isTh={isTh}
            materialsCare={materialsCare}
            materialsCareTh={materialsCareTh}
            onMaterialsCareChange={(val) => setMaterialsCare(val)}
            onMaterialsCareThChange={(val) => setMaterialsCareTh(val)}
          />
        </div>

        {/* Right Column (5 Cols): Taxonomy & Marketing Tags */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <FormTaxonomySection
            isTh={isTh}
            department={department}
            category={category}
            subCategoryKey={subCategoryKey}
            subCategory={subCategory}
            subCategoryTh={subCategoryTh}
            availableCategories={availableCategories}
            availableSubCategories={availableSubCategories}
            onDepartmentChange={handleDepartmentChange}
            onCategoryChange={handleCategoryChange}
            onSubCategoryChange={handleSubCategoryChange}
          />

          <FormMarketingTagSection
            isTh={isTh}
            tag={tag}
            activeMarketingTag={activeMarketingTag}
            onSelectTag={handleSelectMarketingTag}
          />
        </div>
      </div>

      {/* 4. Full-Width Section: SKU & Inventory Matrix */}
      <FormVariantsSection
        isTh={isTh}
        isEdit={isEdit}
        initialSizes={initialSizesRef.current}
        productName={name || initialData?.name || ''}
        variantMode={variantMode}
        activeSizes={activeSizes}
        customSizeInput={customSizeInput}
        skuList={skuList}
        totalStockCount={totalStockCount}
        totalStockValue={totalStockValue}
        singleSkuCode={singleSkuCode}
        singleLowStock={singleLowStock}
        initialSingleStock={initialSkus?.[0]?.stock ?? 0}
        onVariantModeChange={(mode) => setVariantMode(mode)}
        onApplySizePreset={applySizePreset}
        onRemoveSize={removeSize}
        onCustomSizeInputChange={(val) => setCustomSizeInput(val)}
        onAddCustomSize={addCustomSize}
        onRegenerateMatrix={regenerateMatrix}
        onUpdateSkuRow={updateSkuRow}
        onSingleSkuCodeChange={(val) => setSingleSkuCode(val)}
        onSingleLowStockChange={(val) => setSingleLowStock(val)}
      />

      {/* Reusable Storefront Live Preview Modal */}
      <ProductPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        product={{
          name,
          nameTh,
          price: numericPrice,
          originalPrice: numericOriginal > 0 ? numericOriginal : undefined,
          image,
          department,
          category,
          subCategory,
          subCategoryTh,
          tag,
          tagTh,
          isPreorder: tag === 'PRE-ORDER',
          colors: selectedColors,
          sizes: activeSizes,
          description,
          descriptionTh,
          materialsCare,
          materialsCareTh,
          totalStock: totalStockCount,
          getColorName,
        }}
      />

      {/* Publish Confirmation Warning Dialog */}
      <PublishConfirmModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={() => {
          setShowPublishModal(false);
          executeSubmit(true);
        }}
        onSaveAsDraft={() => {
          setShowPublishModal(false);
          setPublishStatus('draft');
          executeSubmit(false);
        }}
        isSubmitting={isSubmitting}
        productData={{
          name,
          nameTh,
          price: numericPrice,
          image,
          department,
          category,
          skuCount: variantMode === 'matrix' ? skuList.length : 1,
          totalStock: totalStockCount,
          isEdit,
        }}
      />

      {/* Unsaved Changes Confirmation Dialog */}
      <UnsavedChangesModal
        isOpen={isBlocked}
        onStay={reset}
        onDiscard={proceed}
      />
    </form>
  );
}
