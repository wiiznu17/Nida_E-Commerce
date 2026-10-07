import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { ProductForm } from '../components/ProductForm';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import type { Product } from '../data/products';

export default function AdminProductCreate() {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const navigate = useNavigate();
  const { addProduct } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = (data: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      addProduct(data);
      // Small timeout for smooth feedback
      setTimeout(() => {
        navigate('/admin/products', {
          state: {
            toast: isTh
              ? `เพิ่มสินค้า "${data.name}" เข้าสู่ระบบสำเร็จแล้ว`
              : `Product "${data.name}" successfully created`,
          },
        });
      }, 250);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title={isTh ? 'เพิ่มสินค้าใหม่' : 'Add New Product'}
      subtitle={
        isTh
          ? 'กรอกข้อมูลสินค้าสองภาษา (EN / TH) กำหนดราคา หมวดหมู่ และจานสีสินค้า'
          : 'Define bilingual product attributes, pricing, categories, and color variants'
      }
    >
      <ProductForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </AdminLayout>
  );
}
