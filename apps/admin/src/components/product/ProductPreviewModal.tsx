import { useEffect } from 'react';
import { X, ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface ProductPreviewData {
  name: string;
  nameTh?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  secondaryImage?: string;
  department?: string;
  category?: string;
  subCategory?: string;
  subCategoryTh?: string;
  tag?: string;
  tagTh?: string;
  isPreorder?: boolean;
  colors?: string[];
  sizes?: string[];
  description?: string;
  descriptionTh?: string;
  materialsCare?: string;
  materialsCareTh?: string;
  totalStock?: number;
  getColorName?: (hex: string) => string;
}

export interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductPreviewData;
}

export function ProductPreviewModal({
  isOpen,
  onClose,
  product,
}: ProductPreviewModalProps) {
  const { t, isTh } = useLanguage();

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const {
    name = '',
    nameTh = '',
    price = 0,
    originalPrice,
    image = '',
    department = 'women',
    category = 'apparel',
    subCategory = '',
    tag = '',
    tagTh = '',
    isPreorder = false,
    colors = [],
    sizes = [],
    description = '',
    descriptionTh = '',
    materialsCare = '',
    materialsCareTh = '',
    totalStock = 0,
    getColorName,
  } = product;

  const numericPrice = Number(price) || 0;
  const numericOriginal = originalPrice ? Number(originalPrice) : 0;
  const hasDiscount = numericOriginal > numericPrice && numericPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((numericOriginal - numericPrice) / numericOriginal) * 100)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-[#EAE3D9] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-[#FAF7F2]">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            {t('preview.title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: 2-Column Responsive Layout */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          {/* Left Column: Product Card (Catalog / Collections View) */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
              {t('preview.catalogCard')}
            </span>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-[#FAF7F2] p-3 shadow-xs">
              <div className="aspect-[3/4] bg-white rounded-md overflow-hidden relative border border-gray-200 flex items-center justify-center group">
                {image ? (
                  <img
                    src={image}
                    alt={name || 'Preview'}
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800';
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={28} className="mx-auto text-gray-300 mb-1" />
                    <span className="text-gray-400 text-xs block">
                      {t('preview.noImage')}
                    </span>
                  </div>
                )}

                {tag && (
                  <div className="absolute top-2.5 left-2.5 bg-[#2B1810] text-[#F59E0B] text-[9px] font-black uppercase px-2.5 py-0.5 tracking-wider rounded-xs shadow-md">
                    {isTh && tagTh ? tagTh : tag}
                  </div>
                )}

                {hasDiscount && discountPercent !== null && (
                  <div className="absolute top-2.5 right-2.5 bg-emerald-700 text-white text-[8px] font-black uppercase px-2 py-0.5 tracking-wider rounded-xs shadow-xs">
                    {t('product.saveDiscount')} {discountPercent}%
                  </div>
                )}

                {isPreorder && (
                  <div className="absolute bottom-2.5 left-2.5 bg-amber-500 text-white text-[8px] font-black uppercase px-2 py-0.5 tracking-wider rounded-xs shadow-xs">
                    {t('preview.preOrderBadge')}
                  </div>
                )}
              </div>

              <div className="pt-3">
                <span className="text-[10px] font-mono uppercase text-gray-500 block">
                  {department} • {subCategory || category}
                </span>
                <h4 className="text-sm font-bold text-[#2B1810] truncate mt-0.5">
                  {name || t('preview.defaultTitle')}
                </h4>
                {nameTh && (
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {nameTh}
                  </p>
                )}

                {hasDiscount ? (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-sm font-black text-emerald-700 font-mono">
                        ${numericPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 line-through font-mono">
                        ${numericOriginal.toFixed(2)}
                      </span>
                      {discountPercent !== null && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-xs">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 text-[9px] text-gray-500">
                      <span className="text-emerald-700 font-bold">{t('product.discountPrice')}</span>
                      <span>•</span>
                      <span>{t('product.fullPrice')}: <span className="line-through">${numericOriginal.toFixed(2)}</span></span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline space-x-2 mt-1.5">
                    <span className="text-sm font-black text-[#2B1810] font-mono">
                      ${numericPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {colors.length > 0 && (
                  <div className="flex items-center space-x-1.5 mt-2.5 pt-2 border-t border-gray-200">
                    {colors.map((c) => (
                      <span
                        key={c}
                        className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs"
                        style={{ backgroundColor: c }}
                        title={getColorName ? getColorName(c) : c}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: PDP Quick Info Snapshot */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
              {t('preview.detailsSnapshot')}
            </span>
            <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3 text-xs shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#D97706] tracking-wider">
                  NIDA HERITAGE
                </span>
                <h4 className="text-base font-black text-[#2B1810] leading-tight mt-0.5">
                  {name || t('preview.defaultTitle')}
                </h4>
                {nameTh && (
                  <p className="text-xs text-gray-500 mt-0.5">{nameTh}</p>
                )}
              </div>

              {hasDiscount ? (
                <div className="pb-2.5 border-b border-gray-100 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 block">
                        {t('product.discountPrice')}
                      </span>
                      <span className="text-xl font-black text-emerald-700 font-mono">
                        ${numericPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">
                        {t('product.fullPrice')}
                      </span>
                      <span className="text-sm text-gray-400 line-through font-mono font-bold">
                        ${numericOriginal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {discountPercent !== null && (
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-dashed border-gray-200">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-xs">
                        {t('product.saveDiscount')} {discountPercent}%
                      </span>
                      <span className="text-emerald-700 font-bold">
                        {t('product.youSave')} ${(numericOriginal - numericPrice).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pb-2 border-b border-gray-100">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block">
                    {t('product.price')}
                  </span>
                  <span className="text-lg font-black text-[#2B1810] font-mono">
                    ${numericPrice.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Size Matrix preview */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  {t('preview.availableSizes')}
                </label>
                <div className="flex flex-wrap gap-1">
                  {sizes.length > 0 ? (
                    sizes.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-sm border border-gray-200 text-[10px] font-bold text-gray-700 bg-gray-50"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">
                      {t('preview.noSizesSpecified')}
                    </span>
                  )}
                </div>
              </div>

              {/* Description preview */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-0.5">
                  {t('preview.description')}
                </label>
                <p className="text-[11px] text-gray-600 line-clamp-3 leading-relaxed">
                  {(isTh ? descriptionTh || description : description || descriptionTh) ||
                    t('preview.noDescription')}
                </p>
              </div>

              {/* Materials & Care snippet */}
              {(materialsCare || materialsCareTh) && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="text-[10px] font-bold text-gray-500 block">
                    {t('preview.materialsCare')}
                  </label>
                  <p className="text-[11px] text-gray-600 italic">
                    {isTh ? materialsCareTh || materialsCare : materialsCare || materialsCareTh}
                  </p>
                </div>
              )}

              {/* Stock count badge */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100">
                <span>{t('preview.initialStock')}</span>
                <span className="font-bold text-[#D97706]">
                  {totalStock} {t('common.units')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors shadow-2xs cursor-pointer"
          >
            {t('preview.closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
