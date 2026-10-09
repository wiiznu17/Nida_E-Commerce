import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { ProductForm } from '../components/product';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import type { Product } from '../data/products';
import type { SkuVariant } from '../data/adminData';

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const { t, isTh } = useLanguage();
  const navigate = useNavigate();
  const { productsList, updateProduct, inventoryList } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = productsList.find((p) => p.id === id);

  if (!product) {
    return (
      <AdminLayout
        title={isTh ? 'ไม่พบสินค้า' : 'Product Not Found'}
        subtitle={
          isTh
            ? 'รหัสสินค้าที่ท่านต้องการแก้ไขไม่มีอยู่ในระบบ'
            : 'The requested product could not be located in the catalog'
        }
      >
        <div className="bg-white border border-[#EAE3D9] p-8 text-center rounded-md space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {isTh ? `ไม่พบสินค้า ID: "${id}"` : `Product ID: "${id}" does not exist`}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isTh
                ? 'สินค้าอาจถูกลบออกไปแล้ว หรือลิงก์ไม่ถูกต้อง'
                : 'The item may have been removed or the URL is invalid.'}
            </p>
          </div>
          <Link
            to="/admin/products"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#2B1810] text-white text-xs font-bold rounded-md hover:bg-[#D97706] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{isTh ? 'กลับไปยังรายการสินค้า' : 'Return to Catalog'}</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // Preload existing SKUs from inventory list
  const existingSkus: SkuVariant[] = inventoryList
    .filter((item) => item.productId === product.id)
    .map((item) => ({
      sku: item.sku,
      size: item.size,
      colorName: item.colorName,
      colorHex: item.colorHex,
      stock: item.availableStock,
      lowStockThreshold: item.lowStockThreshold,
      priceAdjustment: Math.max(0, item.price - product.price),
    }));

  const handleUpdate = (data: Omit<Product, 'id'>, skus?: SkuVariant[]) => {
    setIsSubmitting(true);
    try {
      updateProduct(product.id, data, skus);
      setTimeout(() => {
        navigate('/admin/products', {
          state: {
            toast: isTh
              ? `อัปเดตข้อมูลสินค้า "${data.name}" เรียบร้อยแล้ว`
              : `Product "${data.name}" successfully updated`,
          },
        });
      }, 250);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const productTitle = isTh && product.nameTh ? product.nameTh : product.name;

  return (
    <AdminLayout
      title={`${t('product.editTitle')}: ${productTitle}`}
      subtitle={
        isTh
          ? `แก้ไขข้อมูลสต็อก ราคา และรายละเอียดสินค้า SKU: ${product.id}`
          : `Update catalog specifications, pricing, and media for SKU: ${product.id}`
      }
    >
      <ProductForm
        initialData={product}
        initialSkus={existingSkus}
        isEdit
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  );
}
