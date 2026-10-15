import {
  CheckCircle2,
  List,
  Plus,
  ExternalLink,
  X,
  Package,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { ApiProductDetail, ProductSkuVariant } from '@repo/types';

export interface ProductCreateSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ApiProductDetail | null;
  skus?: ProductSkuVariant[];
  onViewList: () => void;
  onCreateAnother: () => void;
  onViewStore?: () => void;
}

export function ProductCreateSuccessModal({
  isOpen,
  onClose,
  product,
  skus,
  onViewList,
  onCreateAnother,
  onViewStore,
}: ProductCreateSuccessModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !product) return null;

  const skuCount = skus?.length || 1;
  const isPublished = product.isActive !== false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-brown/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-border overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Emerald Header Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-600" />

        <div className="p-6">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-black text-brand-brown tracking-tight">
                  {t('product.createSuccessTitle')}
                </h3>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                  {t('product.createSuccessDesc')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Product Snapshot Card */}
          <div className="mt-5 bg-brand-cream border border-brand-border rounded-lg p-4">
            <div className="flex items-center space-x-4">
              {product.images?.[0]?.imageUrl ? (
                <img
                  src={product.images[0].imageUrl}
                  alt={product.name}
                  className="w-16 h-20 object-cover rounded-md border border-brand-border bg-white shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-16 h-20 rounded-md border border-brand-border bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                  <Package size={20} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-white border border-brand-border px-2 py-0.5 rounded-sm">
                    {String(product.department || 'CATALOG').toUpperCase()}
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-sm border bg-white border-stone-200 text-stone-600">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    />
                    <span>
                      {isPublished
                        ? t('productList.published')
                        : t('productList.draft')}
                    </span>
                  </span>
                </div>

                <h4 className="mt-1.5 text-sm font-bold text-brand-brown truncate">
                  {product.name}
                </h4>
                {product.nameTh && (
                  <p className="text-xs text-stone-500 truncate font-light">
                    {product.nameTh}
                  </p>
                )}

                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-sm font-black text-brand-brown">
                    ${Number(product.basePrice).toLocaleString()}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.basePrice && (
                      <span className="text-xs text-stone-400 line-through">
                        ${Number(product.originalPrice).toLocaleString()}
                      </span>
                    )}
                  <span className="text-[11px] text-stone-500 font-medium ml-auto">
                    {skuCount} {skuCount === 1 ? 'SKU' : 'SKUs'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={onViewList}
              className="w-full sm:flex-1 py-2.5 px-4 bg-brand-brown hover:bg-brand-dark-brown text-white rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
            >
              <List size={15} />
              <span>{t('product.viewProductList')}</span>
            </button>

            <button
              type="button"
              onClick={onCreateAnother}
              className="w-full sm:w-auto py-2.5 px-4 bg-white border border-brand-border hover:bg-stone-50 text-brand-brown rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus size={15} />
              <span>{t('product.createAnother')}</span>
            </button>

            {onViewStore && (
              <button
                type="button"
                onClick={onViewStore}
                className="w-full sm:w-auto py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                title={t('product.viewStorefront')}
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">
                  {t('product.viewStorefront')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
