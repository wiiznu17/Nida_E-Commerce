import type { Product } from '../../../data/products';
import type { SkuVariant } from '../../../data/adminData';
import type { MarketingTagOption, CategoryOption, SubCategoryOption } from '@repo/types';

export interface ProductFormProps {
  initialData?: Partial<Product>;
  initialSkus?: SkuVariant[];
  onSubmit: (data: Omit<Product, 'id'>, skus?: SkuVariant[]) => void;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

export interface FormTopBarProps {
  isTh?: boolean;
  isFormDirty?: boolean;
  isSubmitting: boolean;
  publishStatus: 'published' | 'draft';
  isEdit: boolean;
  onScrollTo: (sectionId: string) => void;
}

export interface FormBasicInfoSectionProps {
  isTh?: boolean;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  descLangTab: 'en' | 'th';
  onNameChange: (val: string) => void;
  onNameThChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onDescriptionThChange: (val: string) => void;
  onDescLangTabChange: (tab: 'en' | 'th') => void;
}

export interface FormStatusOverviewCardProps {
  isTh?: boolean;
  publishStatus: 'published' | 'draft';
  totalStockCount: number;
  numericPrice: number;
  numericOriginal?: number;
  discountPercent?: number | null;
  onPublishStatusChange: (status: 'published' | 'draft') => void;
  onShowPreview: () => void;
}

export interface FormMediaSectionProps {
  isTh?: boolean;
  isEdit?: boolean;
  initialColors?: string[];
  image: string;
  secondaryImage: string;
  selectedColors: string[];
  customColor: string;
  colorImages: Record<string, string>;
  onImageChange: (url: string) => void;
  onSecondaryImageChange: (url: string) => void;
  onCustomColorChange: (val: string) => void;
  onAddCustomColor: () => void;
  onRemoveColor: (hex: string) => void;
  onToggleColor: (hex: string) => void;
  onColorImageChange: (hex: string, url: string) => void;
  onUseMasterImageForColor: (hex: string) => void;
}

export interface FormPricingSectionProps {
  isTh?: boolean;
  price: number | string;
  originalPrice: number | string;
  discountPercent: number | null;
  onPriceChange: (val: string) => void;
  onOriginalPriceChange: (val: string) => void;
}

export interface FormMaterialsCareSectionProps {
  isTh?: boolean;
  materialsCare: string;
  materialsCareTh: string;
  onMaterialsCareChange: (val: string) => void;
  onMaterialsCareThChange: (val: string) => void;
}

export interface FormTaxonomySectionProps {
  isTh?: boolean;
  department: string;
  category: string;
  subCategoryKey: string;
  subCategory: string;
  subCategoryTh: string;
  availableCategories: CategoryOption[];
  availableSubCategories: SubCategoryOption[];
  onDepartmentChange: (dept: string) => void;
  onCategoryChange: (cat: string) => void;
  onSubCategoryChange: (key: string) => void;
}

export interface FormMarketingTagSectionProps {
  isTh?: boolean;
  tag: string;
  activeMarketingTag?: MarketingTagOption;
  onSelectTag: (tagOption?: MarketingTagOption) => void;
}

export interface FormVariantsSectionProps {
  isTh?: boolean;
  isEdit: boolean;
  initialSizes?: string[];
  productName: string;
  variantMode: 'matrix' | 'single';
  activeSizes: string[];
  customSizeInput: string;
  skuList: SkuVariant[];
  totalStockCount: number;
  totalStockValue: number;
  singleSkuCode: string;
  singleLowStock: number | string;
  initialSingleStock: number;
  onVariantModeChange: (mode: 'matrix' | 'single') => void;
  onApplySizePreset: (presetKey: 'apparel' | 'shoes' | 'onesize') => void;
  onRemoveSize: (size: string) => void;
  onCustomSizeInputChange: (val: string) => void;
  onAddCustomSize: () => void;
  onRegenerateMatrix: () => void;
  onUpdateSkuRow: (index: number, field: keyof SkuVariant, value: any) => void;
  onSingleSkuCodeChange: (val: string) => void;
  onSingleLowStockChange: (val: string | number) => void;
}
