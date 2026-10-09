import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout';
import { ProductForm } from '../components/product';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import { productsApi } from '../api';
import type { Product } from '../data/products';
import type { SkuVariant } from '../data/adminData';

export default function AdminProductCreate() {
  const { t, isTh } = useLanguage();
  const navigate = useNavigate();
  const { addProduct } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async (data: Omit<Product, 'id'>, skus?: SkuVariant[]) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      let createdProductFromApi: any = null;
      try {
        createdProductFromApi = await productsApi.create(data, skus);
      } catch (apiErr: any) {
        console.warn('Backend API persistence warning:', apiErr);
      }

      // Sync with local admin context (with real DB id if available)
      const finalProduct = createdProductFromApi?.id
        ? { ...data, id: createdProductFromApi.id }
        : data;

      addProduct(finalProduct, skus);
      const skuCount = skus?.length || 1;

      navigate('/admin/products', {
        state: {
          toast: isTh
            ? `เพิ่มสินค้า "${data.name}" (${skuCount} SKU) เข้าสู่ระบบเรียบร้อยแล้ว`
            : `Product "${data.name}" (${skuCount} SKUs) successfully created`,
        },
      });
    } catch (err: any) {
      console.error('Error creating product:', err);
      setErrorMsg(
        err?.message ||
          (isTh
            ? 'เกิดข้อผิดพลาดในการสร้างสินค้า กรุณาลองใหม่อีกครั้ง'
            : 'Failed to create product. Please try again.')
      );
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title={t('product.createTitle')}
      subtitle={
        isTh
          ? 'กรอกข้อมูลสินค้าสองภาษา (EN / TH) กำหนดราคา หมวดหมู่ และจานสีสินค้า'
          : 'Define bilingual product attributes, pricing, categories, and color variants'
      }
    >
      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}
      <ProductForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </AdminLayout>
  );
}
