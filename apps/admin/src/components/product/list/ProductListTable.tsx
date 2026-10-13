import { Link } from 'react-router-dom';
import { Boxes, Edit, Eye, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { STOREFRONT_URL } from '../../../config';
import type { Product } from '../../../data/products';
import type { InventoryItem } from '../../../data/adminData';

interface ProductListTableProps {
  products: Product[];
  inventoryList: InventoryItem[];
  togglingId: string | null;
  isLoading?: boolean;
  onToggleStatus: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
}

export function ProductListTable({
  products,
  inventoryList,
  togglingId,
  isLoading = false,
  onToggleStatus,
  onDelete,
}: ProductListTableProps) {
  const { t, language } = useLanguage();

  const getProductTotalStock = (productId: string, productName: string) => {
    const matched = inventoryList.filter(
      (inv) =>
        inv.productId === productId ||
        inv.productName.toLowerCase() === productName.toLowerCase(),
    );
    if (matched.length > 0) {
      return matched.reduce((sum, item) => sum + item.availableStock, 0);
    }
    return 20; // fallback default
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center bg-white border border-[#EAE3D9] rounded-xs shadow-2xs flex flex-col items-center justify-center space-y-3">
        <Loader2 size={32} className="animate-spin text-[#2B1810]" />
        <p className="text-xs font-semibold text-gray-500">
          {language === 'th' ? 'กำลังโหลดรายการสินค้า...' : 'Loading products...'}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-14 text-center bg-white border border-[#EAE3D9] rounded-xs">
        <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm font-bold text-gray-700">
          {t('productList.noProductsFound')}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {t('productList.noProductsHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border border-[#EAE3D9] rounded-xs shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#EAE3D9] bg-[#FAF7F2] text-[10px] font-black uppercase tracking-wider text-gray-500">
            <th className="p-3.5 w-14 text-center">{language === 'th' ? 'รูป' : 'Image'}</th>
            <th className="p-3.5">{t('productList.table.product')}</th>
            <th className="p-3.5 w-28 text-right">{t('productList.table.price')}</th>
            <th className="p-3.5 w-32 text-center">{t('productList.table.category')}</th>
            <th className="p-3.5 w-28 text-center">{t('productList.table.stock')}</th>
            <th className="p-3.5 w-28 text-center">{t('productList.table.status')}</th>
            <th className="p-3.5 w-24 text-center">{t('productList.table.tag')}</th>
            <th className="p-3.5 w-32 text-right">{t('productList.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#FAF7F2]">
          {products.map((product) => {
            const stockCount = getProductTotalStock(product.id, product.name);
            const isPublished = product.isActive !== false;
            const isToggling = togglingId === product.id;

            return (
              <tr
                key={product.id}
                className="hover:bg-[#FAF7F2]/60 transition-colors group"
              >
                {/* Image */}
                <td className="p-3 text-center">
                  <div className="w-11 h-14 bg-gray-100 border border-[#EAE3D9] rounded-xs overflow-hidden mx-auto">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </td>

                {/* Name & Subtitle */}
                <td className="p-3">
                  <div className="space-y-0.5">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="font-bold text-gray-900 hover:text-[#D97706] transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    {product.nameTh && (
                      <p className="text-[11px] text-gray-500 line-clamp-1">
                        {product.nameTh}
                      </p>
                    )}
                    <div className="flex items-center space-x-1.5 pt-0.5">
                      <span className="text-[10px] text-gray-400 font-mono tracking-tight">
                        {product.slug || product.id.slice(0, 8)}
                      </span>
                      {product.isPreorder && (
                        <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase">
                          PRE-ORDER
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="p-3 text-right">
                  <div className="font-mono font-bold text-gray-900">
                    ฿{product.price.toLocaleString()}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-[10px] font-mono text-gray-400 line-through">
                      ฿{product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </td>

                {/* Category / Department */}
                <td className="p-3 text-center">
                  <span className="inline-block bg-[#FAF7F2] border border-[#EAE3D9] text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-tight">
                    {product.subCategory || product.category}
                  </span>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                    {product.department}
                  </div>
                </td>

                {/* Stock Level */}
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-bold rounded-xs ${
                      stockCount === 0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : stockCount <= 5
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        stockCount === 0
                          ? 'bg-rose-500'
                          : stockCount <= 5
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                    />
                    <span>{stockCount} {language === 'th' ? 'ชิ้น' : 'pcs'}</span>
                  </span>
                </td>

                {/* Status Toggle Switch */}
                <td className="p-3 text-center">
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => onToggleStatus(product)}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold rounded-xs transition-all cursor-pointer ${
                      isPublished
                        ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isPublished ? 'Click to set as Draft' : 'Click to Publish'}
                  >
                    {isToggling ? (
                      <Loader2 size={12} className="animate-spin text-gray-600" />
                    ) : (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPublished ? 'bg-emerald-600' : 'bg-gray-400'
                        }`}
                      />
                    )}
                    <span>
                      {isPublished
                        ? t('productList.published')
                        : t('productList.draft')}
                    </span>
                  </button>
                </td>

                {/* Tag */}
                <td className="p-3 text-center">
                  {product.tag ? (
                    <span className="bg-[#2B1810] text-[#F59E0B] text-[9px] font-black uppercase px-2 py-0.5 rounded-xs tracking-wider">
                      {product.tag}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>

                {/* Action Buttons */}
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Link
                      to={`/admin/inventory?search=${encodeURIComponent(product.name)}`}
                      className="p-1.5 text-gray-500 hover:text-[#D97706] hover:bg-amber-50 rounded-xs transition-colors"
                      title={language === 'th' ? 'จัดการสต็อกในหน้าคลังสินค้า' : 'Manage in Inventory'}
                    >
                      <Boxes size={15} />
                    </Link>
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="p-1.5 text-gray-500 hover:text-[#D97706] hover:bg-amber-50 rounded-xs transition-colors"
                      title={language === 'th' ? 'แก้ไขสเปกสินค้า' : 'Edit Product'}
                    >
                      <Edit size={15} />
                    </Link>
                    <a
                      href={`${STOREFRONT_URL}/products/${product.slug ?? product.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-500 hover:text-[#2B1810] hover:bg-gray-100 rounded-xs transition-colors"
                      title={language === 'th' ? 'ดูหน้าสินค้าบนเว็บ' : 'View on Store'}
                    >
                      <Eye size={15} />
                    </a>
                    <button
                      type="button"
                      onClick={() => onDelete(product.id, product.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                      title={language === 'th' ? 'ลบสินค้า' : 'Delete'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
