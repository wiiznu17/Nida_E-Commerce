import { Link } from 'react-router-dom';
import {
  Boxes,
  ExternalLink,
  Plus,
  RefreshCw,
  Lock,
  Barcode,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { FormVariantsSectionProps } from './formTypes';

export function FormVariantsSection({
  isTh,
  isEdit,
  initialSizes,
  productName,
  variantMode,
  activeSizes,
  customSizeInput,
  skuList,
  totalStockCount,
  totalStockValue,
  singleSkuCode,
  singleLowStock,
  initialSingleStock,
  onVariantModeChange,
  onApplySizePreset,
  onRemoveSize,
  onCustomSizeInputChange,
  onAddCustomSize,
  onRegenerateMatrix,
  onUpdateSkuRow,
  onSingleSkuCodeChange,
  onSingleLowStockChange,
}: FormVariantsSectionProps) {
  const { t } = useLanguage();

  return (
    <div
      id="sec-inventory"
      className="w-full bg-white border border-[#EAE3D9] p-4 sm:p-6 rounded-md shadow-2xs space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Boxes size={16} className="text-[#D97706]" />
          <h2 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            {t('product.variantsSkus')}
          </h2>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-[#FAF7F2] p-0.5 border border-[#EAE3D9] rounded-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onVariantModeChange('matrix')}
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm transition-all cursor-pointer ${
              variantMode === 'matrix'
                ? 'bg-[#2B1810] text-[#F59E0B] shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('product.matrixMode')}
          </button>
          <button
            type="button"
            onClick={() => onVariantModeChange('single')}
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm transition-all cursor-pointer ${
              variantMode === 'single'
                ? 'bg-[#2B1810] text-[#F59E0B] shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('product.singleMode')}
          </button>
        </div>
      </div>

      {/* Decoupled Inventory Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-amber-50/70 border border-amber-200 rounded-md text-amber-900 text-xs">
        <div className="flex items-start space-x-2.5">
          <Boxes size={16} className="text-[#D97706] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[11px] text-[#2B1810]">
              {t('product.decoupledStockTitle')}
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              {t('product.decoupledStockDesc')}
            </p>
          </div>
        </div>
        {isEdit && (
          <Link
            to={`/admin/inventory?search=${encodeURIComponent(productName)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#2B1810] bg-white border border-amber-300 px-2.5 py-1 rounded-xs hover:bg-amber-100/60 shadow-2xs shrink-0 self-start sm:self-auto"
          >
            <span>{t('product.manageInInventory')}</span>
            <ExternalLink size={12} />
          </Link>
        )}
      </div>

      {variantMode === 'matrix' ? (
        <div className="space-y-4">
          {/* Size Presets and Active Sizes */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-3 rounded-md space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2B1810]">
                {t('product.activeSizes')}
              </span>

              {/* Presets Quick Buttons */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[9px] text-gray-500 font-bold mr-1">
                  {t('product.presets')}
                </span>
                <button
                  type="button"
                  onClick={() => onApplySizePreset('apparel')}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
                >
                  XS-XL
                </button>
                <button
                  type="button"
                  onClick={() => onApplySizePreset('shoes')}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
                >
                  Shoes
                </button>
                <button
                  type="button"
                  onClick={() => onApplySizePreset('onesize')}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
                >
                  One Size
                </button>
              </div>
            </div>

            {/* Active Sizes Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {activeSizes.length === 0 ? (
                <span className="text-[10px] text-gray-400 italic">
                  {t('product.noSizesSelected')}
                </span>
              ) : (
                activeSizes.map((size) => {
                  const isLocked = Boolean(isEdit && initialSizes?.includes(size));
                  return (
                    <span
                      key={size}
                      className="inline-flex items-center space-x-1 bg-white border border-[#2B1810] text-[#2B1810] text-[10px] font-black px-2 py-0.5 rounded-xs shadow-2xs"
                    >
                      <span>{size}</span>
                      {isLocked ? (
                        <span
                          title={t('product.originalLockedSize')}
                          className="text-gray-400 ml-0.5"
                        >
                          <Lock size={9} />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRemoveSize(size)}
                          className="text-gray-400 hover:text-red-600 ml-1 text-xs leading-none cursor-pointer"
                          title={isTh ? 'ลบไซส์นี้' : 'Remove size'}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  );
                })
              )}

              {/* Add Custom Size Inline */}
              <div className="inline-flex items-center space-x-1 ml-1">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => onCustomSizeInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddCustomSize();
                    }
                  }}
                  placeholder={t('product.addCustomSizePlaceholder')}
                  className="w-28 text-[10px] px-2 py-0.5 border border-gray-300 rounded-xs bg-white uppercase font-mono outline-hidden"
                />
                <button
                  type="button"
                  onClick={onAddCustomSize}
                  className="text-[10px] font-bold px-2 py-0.5 bg-[#2B1810] text-[#F59E0B] rounded-xs hover:bg-[#3D2317] cursor-pointer"
                >
                  <Plus size={11} className="inline mr-0.5" />
                  {t('product.addSize')}
                </button>
              </div>
            </div>
          </div>

          {/* Overview Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  {t('product.skuCount')}
                </span>
                <span className="font-black text-[#2B1810] text-sm">
                  {skuList.length} {t('common.variants')}
                </span>
              </div>
              <div className="border-l border-gray-300 pl-4">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  {t('product.totalStockReadOnly')}
                </span>
                <span className="font-black text-[#D97706] text-sm">
                  {totalStockCount.toLocaleString()} {t('common.units')}
                </span>
              </div>
              <div className="border-l border-gray-300 pl-4 hidden md:block">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  {t('product.stockValue')}
                </span>
                <span className="font-black text-emerald-700 text-sm">
                  $
                  {totalStockValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* SKU Toolbar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRegenerateMatrix}
                className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-xs transition-colors shadow-2xs cursor-pointer"
                title={isTh ? 'สร้างรหัส SKU ใหม่ตามสีและไซส์ปัจจุบัน' : 'Regenerate SKU Matrix'}
              >
                <RefreshCw size={12} />
                <span>{t('product.regenerateSkus')}</span>
              </button>
            </div>
          </div>

          {/* SKU Table */}
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAF7F2] text-gray-600 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3.5 text-[10px] font-black uppercase tracking-wider text-[#2B1810]">
                      {t('product.skuCode')}
                    </th>
                    <th className="py-2.5 px-3.5 text-[10px] font-black uppercase tracking-wider text-[#2B1810] w-44">
                      {t('product.color')}
                    </th>
                    <th className="py-2.5 px-3.5 text-[10px] font-black uppercase tracking-wider text-[#2B1810] w-20 text-center">
                      {t('product.size')}
                    </th>
                    <th className="py-2.5 px-3.5 text-[10px] font-black uppercase tracking-wider text-[#2B1810] w-64 whitespace-nowrap">
                      {t('product.currentStockReadOnly')}
                    </th>
                    <th className="py-2.5 px-3.5 text-[10px] font-black uppercase tracking-wider text-[#2B1810] w-28 text-center">
                      {t('product.lowStockAlert')}
                    </th>
                    <th className="py-2.5 px-3.5 text-[10px] font-black uppercase tracking-wider text-[#2B1810] w-28 text-center">
                      {t('product.priceAdj')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {skuList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                        {t('product.noVariantsDefined')}
                      </td>
                    </tr>
                  ) : (
                    skuList.map((sku, index) => {
                    const stockNum = Number(sku.stock) || 0;
                    const thresholdNum = Number(sku.lowStockThreshold) || 5;
                    const isLowStock = stockNum <= thresholdNum && stockNum > 0;
                    const isOutOfStock = stockNum === 0;

                    return (
                      <tr
                        key={`${sku.sku}-${index}`}
                        className="hover:bg-amber-50/40 transition-colors"
                      >
                        <td className="py-2 px-3.5 font-mono">
                          <input
                            type="text"
                            required
                            value={sku.sku}
                            onChange={(e) =>
                              onUpdateSkuRow(index, 'sku', e.target.value.toUpperCase())
                            }
                            className="w-full text-[11px] p-1 font-mono uppercase border border-gray-300 rounded-xs bg-white focus:border-[#2B1810] outline-hidden"
                          />
                        </td>
                        <td className="py-2 px-3.5">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-gray-400 shadow-2xs flex-shrink-0"
                              style={{ backgroundColor: sku.colorHex }}
                            />
                            <span className="text-[11px] font-medium text-gray-800 truncate max-w-[120px]">
                              {sku.colorName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3.5 text-center">
                          <span className="inline-block bg-[#FAF7F2] border border-[#EAE3D9] text-[#2B1810] text-[10px] font-black px-2 py-0.5 rounded-xs">
                            {sku.size}
                          </span>
                        </td>
                        <td className="py-2 px-3.5">
                          <div className="flex items-center space-x-1.5 whitespace-nowrap">
                            <span
                              className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-xs border ${
                                isOutOfStock
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : isLowStock
                                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                                    : 'border-gray-200 bg-gray-50 text-gray-800'
                              }`}
                            >
                              {stockNum} {t('common.units')}
                            </span>
                            {isOutOfStock && (
                              <span className="text-[9px] font-bold text-red-600">
                                {t('product.outOfStock')}
                              </span>
                            )}
                            {isLowStock && (
                              <span className="text-[9px] font-bold text-amber-600">
                                {t('product.lowStock')}
                              </span>
                            )}
                            {!isEdit && stockNum === 0 && (
                              <span className="text-[9px] text-gray-400 italic">
                                ({t('product.restockAfter')})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3.5 text-center">
                          <input
                            type="number"
                            min="1"
                            value={sku.lowStockThreshold}
                            onChange={(e) =>
                              onUpdateSkuRow(
                                index,
                                'lowStockThreshold',
                                Math.max(1, parseInt(e.target.value, 10) || 1),
                              )
                            }
                            className="w-16 text-center text-[11px] p-1 font-mono border border-gray-300 rounded-xs bg-white outline-hidden mx-auto block"
                          />
                        </td>
                        <td className="py-2 px-3.5 text-center">
                          <input
                            type="number"
                            step="0.01"
                            value={sku.priceAdjustment ?? 0}
                            onChange={(e) =>
                              onUpdateSkuRow(
                                index,
                                'priceAdjustment',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            placeholder="0.00"
                            className="w-18 text-center text-[11px] p-1 font-mono border border-gray-300 rounded-xs bg-white outline-hidden mx-auto block"
                          />
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>

            <div className="p-2.5 border-t border-gray-100 bg-[#FAF7F2] flex items-center justify-between">
              <span className="text-[10px] text-gray-600 font-bold">
                {skuList.length} {t('common.variants')} ({activeSizes.length} {t('product.size')})
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {t('product.stockManagedInInventory')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Single SKU Mode */
        <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-4 rounded-md space-y-3">
          <div className="flex items-center space-x-2 text-gray-700">
            <Barcode size={18} className="text-[#D97706]" />
            <span className="text-xs font-bold">
              {t('product.singleStandardItem')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700">
                {t('product.masterSkuCode')}
              </label>
              <input
                type="text"
                required
                value={singleSkuCode}
                onChange={(e) => onSingleSkuCodeChange(e.target.value.toUpperCase())}
                placeholder="NIDA-GEN-STD-001"
                className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white font-mono uppercase outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700">
                {t('product.currentStockReadOnly')}
              </label>
              <div className="flex items-center space-x-2 h-[34px] px-2.5 bg-gray-100 border border-gray-200 rounded-md">
                <span className="font-mono text-xs font-bold text-gray-800">
                  {initialSingleStock} {t('common.units')}
                </span>
                <span className="text-[10px] text-gray-500 italic">
                  {isEdit
                    ? t('product.singleStockManageHint')
                    : t('product.singleStockInitialHint')}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700">
                {t('product.lowStockAlert')}
              </label>
              <input
                type="number"
                min="1"
                value={singleLowStock}
                onChange={(e) => onSingleLowStockChange(e.target.value)}
                placeholder="5"
                className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white font-mono outline-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
