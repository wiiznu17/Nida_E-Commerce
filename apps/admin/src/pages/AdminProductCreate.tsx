import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout';
import {
  ProductForm,
  ProductCreateSuccessModal,
  ProductCreateErrorModal,
} from '../components/product';
import { useLanguage } from '../context/LanguageContext';
import { productsApi, extractApiError } from '../api';
import { STOREFRONT_URL } from '../config';
import type { Product } from '../data/products';
import type { SkuVariant } from '../data/adminData';

export default function AdminProductCreate() {
  const { t, isTh } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal State
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [createdSkus, setCreatedSkus] = useState<SkuVariant[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Error Modal State
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formResetKey, setFormResetKey] = useState(0);

  const handleCreate = async (data: Omit<Product, 'id'>, skus?: SkuVariant[]) => {
    setIsSubmitting(true);
    try {
      const apiResponse = await productsApi.create(data, skus);
      setCreatedProduct(apiResponse);
      setCreatedSkus(skus ?? []);
      setIsSuccessModalOpen(true);
    } catch (err: unknown) {
      console.error('Error creating product:', err);
      const { message, issues } = extractApiError(err, t('common.createProductError'));
      setErrorMessage(message);
      setValidationErrors(issues);
      setIsErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewList = () => {
    setIsSuccessModalOpen(false);
    navigate('/admin/products');
  };

  const handleCreateAnother = () => {
    setIsSuccessModalOpen(false);
    setCreatedProduct(null);
    setCreatedSkus([]);
    setFormResetKey((prev) => prev + 1);
  };

  const handleViewStore = () => {
    if (createdProduct?.slug) {
      window.open(`${STOREFRONT_URL}/products/${createdProduct.slug}`, '_blank');
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
      <ProductForm
        key={formResetKey}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      {/* Success Dialog */}
      <ProductCreateSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        product={createdProduct}
        skus={createdSkus}
        onViewList={handleViewList}
        onCreateAnother={handleCreateAnother}
        onViewStore={createdProduct?.slug ? handleViewStore : undefined}
      />

      {/* Error Dialog */}
      <ProductCreateErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errorMessage={errorMessage}
        validationErrors={validationErrors}
      />
    </AdminLayout>
  );
}
