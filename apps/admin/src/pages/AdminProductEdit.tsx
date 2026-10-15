import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { EmptyState } from '../components/ui';
import { ProductForm } from '../components/product';
import { useLanguage } from '../context/LanguageContext';
import { productRequester } from '../api/requester/productRequester';
import type { ProductSkuVariant } from '@repo/types';
import type { CreateProductInput } from '@repo/validators';

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const { t, isTh } = useLanguage();
  const navigate = useNavigate();

  const [product, setProduct] = useState<CreateProductInput | null>(null);
  const [existingSkus, setExistingSkus] = useState<ProductSkuVariant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    productRequester
      .getBySlug(id)
      .then((detail) => {
        const skus: ProductSkuVariant[] = (detail.variants ?? []).map((v) => ({
          sku: v.sku,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stock: v.quantityAvailable ?? (v.inStock ? 20 : 0),
          lowStockThreshold: 5,
          priceAdjustment: Math.max(0, v.price - detail.basePrice),
        }));
        setExistingSkus(skus);

        const initialFormData: CreateProductInput = {
          name: detail.name,
          nameTh: detail.nameTh,
          price: detail.basePrice,
          basePrice: detail.basePrice,
          originalPrice: detail.originalPrice,
          image: detail.images?.[0]?.imageUrl ?? '',
          secondaryImage: detail.images?.[1]?.imageUrl,
          category: detail.category?.slug ?? 'apparel',
          department: detail.department?.toLowerCase() ?? 'women',
          subCategory: detail.category?.name,
          subCategoryTh: detail.category?.nameTh,
          tag: detail.tag,
          tagTh: detail.tagTh,
          description: detail.description,
          descriptionTh: detail.descriptionTh,
          materialsCare: detail.materialsCare,
          materialsCareTh: detail.materialsCareTh,
          colors: Array.from(
            new Set(detail.variants?.map((v) => v.colorHex) ?? []),
          ),
          rating: detail.rating,
          reviewsCount: detail.reviewsCount,
          isPreorder: detail.isPreorder,
          preorderReleaseDate: detail.preorderReleaseDate,
          preorderLimit: detail.preorderLimit,
          preorderDepositAmount: detail.preorderDepositAmount,
          skus,
          isActive: detail.isActive ?? true,
        };
        setProduct(initialFormData);
      })
      .catch((err) => {
        console.error('Failed to load product detail:', err);
        setProduct(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleUpdate = async (
    data: CreateProductInput,
    skus?: ProductSkuVariant[],
  ) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await productRequester.update(id, data, skus);
      navigate('/admin/products', {
        state: {
          toast: isTh
            ? `อัปเดตข้อมูลสินค้า "${data.name}" เรียบร้อยแล้ว`
            : `Product "${data.name}" successfully updated`,
        },
      });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        title={t('product.editTitle')}
        subtitle={
          isTh
            ? 'กำลังโหลดข้อมูลสินค้า...'
            : 'Loading product specifications...'
        }
      >
        <div className="bg-white border border-brand-border p-16 text-center rounded-xs flex flex-col items-center justify-center space-y-3">
          <Loader2 size={24} className="animate-spin text-brand-brown" />
          <p className="text-xs text-gray-500 font-medium">
            {isTh ? 'กำลังดึงข้อมูลจากระบบ...' : 'Retrieving catalog data...'}
          </p>
        </div>
      </AdminLayout>
    );
  }

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
        <div className="bg-white border border-brand-border p-8 rounded-xs">
          <EmptyState
            icon={AlertCircle}
            title={
              isTh
                ? `ไม่พบสินค้า ID: "${id}"`
                : `Product ID: "${id}" does not exist`
            }
            subtitle={
              isTh
                ? 'สินค้าอาจถูกลบออกไปแล้ว หรือลิงก์ไม่ถูกต้อง'
                : 'The item may have been removed or the URL is invalid.'
            }
            action={{
              label: isTh ? 'กลับไปยังรายการสินค้า' : 'Return to Catalog',
              onClick: () => navigate('/admin/products'),
            }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('product.editTitle')} hidePageHeader>
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
