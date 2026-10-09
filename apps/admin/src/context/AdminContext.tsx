import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Product, products as initialProducts } from '../data/products';
import { productsApi } from '../api/products.api';
import {
  type AdminOrder,
  type InventoryItem,
  type StockMovement,
  type PromoCoupon,
  type SkuVariant,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_MOVEMENTS,
  INITIAL_COUPONS,
} from '../data/adminData';

interface AdminContextType {
  productsList: Product[];
  ordersList: AdminOrder[];
  inventoryList: InventoryItem[];
  movementsList: StockMovement[];
  couponsList: PromoCoupon[];

  // Product actions
  addProduct: (product: Omit<Product, 'id'> & { id?: string }, skus?: SkuVariant[]) => void;
  updateProduct: (id: string, data: Partial<Product>, skus?: SkuVariant[]) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string, nextStatus?: boolean) => void;

  // Order actions
  updateOrderStatus: (
    orderId: string,
    status: AdminOrder['status'],
    courierName?: string,
    trackingNumber?: string,
  ) => void;

  // Inventory actions
  adjustStock: (sku: string, delta: number, reason: string, adminName?: string) => void;

  // Coupon actions
  addCoupon: (coupon: Omit<PromoCoupon, 'id' | 'usageCount'>) => void;
  toggleCouponActive: (couponId: string) => void;
  deleteCoupon: (couponId: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [productsList, setProductsList] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nida_admin_products');
      return saved ? JSON.parse(saved) : initialProducts;
    }
    return initialProducts;
  });

  const [ordersList, setOrdersList] = useState<AdminOrder[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nida_admin_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    }
    return INITIAL_ORDERS;
  });

  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nida_admin_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    }
    return INITIAL_INVENTORY;
  });

  const [movementsList, setMovementsList] = useState<StockMovement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nida_admin_movements');
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    }
    return INITIAL_MOVEMENTS;
  });

  const [couponsList, setCouponsList] = useState<PromoCoupon[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nida_admin_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    }
    return INITIAL_COUPONS;
  });

  // Automatically sync catalog products from database API on mount
  useEffect(() => {
    productsApi
      .getAll()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Product[] = data.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            nameTh: item.nameTh,
            price: Number(item.basePrice ?? item.price ?? 0),
            originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
            image: item.primaryImage || item.image || item.images?.[0]?.imageUrl || '',
            secondaryImage: item.secondaryImage || item.images?.[1]?.imageUrl || undefined,
            category: item.categorySlug || item.category?.slug || 'apparel',
            department: (item.department || item.category?.department || 'women').toLowerCase(),
            subCategory: item.categoryName || item.category?.name || item.subCategory,
            subCategoryTh: item.categoryNameTh || item.category?.nameTh || item.subCategoryTh,
            tag: item.tag,
            tagTh: item.tagTh,
            description: item.description,
            descriptionTh: item.descriptionTh,
            materialsCare: item.materialsCare,
            materialsCareTh: item.materialsCareTh,
            colors: Array.isArray(item.colors)
              ? item.colors.map((c: any) => (typeof c === 'string' ? c : c.hex))
              : [],
            rating: item.rating ?? 5.0,
            reviewsCount: item.reviewsCount ?? 0,
            isPreorder: item.isPreorder ?? false,
            isActive: item.isActive !== undefined ? item.isActive : true,
          }));
          setProductsList(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('nida_admin_products', JSON.stringify(mapped));
          }
        }
      })
      .catch((err) => {
        console.warn('API sync unavailable, using seed products:', err);
      });
  }, []);

  // Sync to localStorage
  const saveProducts = (updated: Product[]) => {
    setProductsList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nida_admin_products', JSON.stringify(updated));
    }
  };

  const saveOrders = (updated: AdminOrder[]) => {
    setOrdersList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nida_admin_orders', JSON.stringify(updated));
    }
  };

  const saveInventory = (updated: InventoryItem[]) => {
    setInventoryList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nida_admin_inventory', JSON.stringify(updated));
    }
  };

  const saveMovements = (updated: StockMovement[]) => {
    setMovementsList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nida_admin_movements', JSON.stringify(updated));
    }
  };

  const saveCoupons = (updated: PromoCoupon[]) => {
    setCouponsList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nida_admin_coupons', JSON.stringify(updated));
    }
  };

  const addProduct = (newProd: Omit<Product, 'id'> & { id?: string }, skus?: SkuVariant[]) => {
    const id = newProd.id || `prod_${Date.now()}`;
    const product: Product = { ...newProd, id };
    const updated = [product, ...productsList];
    saveProducts(updated);

    // Persist to backend API if not already persisted with DB UUID
    const isDbUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isDbUuid) {
      productsApi.create(newProd, skus).then((created) => {
        if (created?.id) {
          setProductsList((prev) =>
            prev.map((p) => (p.id === id ? { ...p, id: created.id } : p))
          );
        }
      }).catch((err) => {
        console.warn('Backend API create failed, kept in local state:', err);
      });
    }

    if (skus && skus.length > 0) {
      const newInvItems: InventoryItem[] = skus.map((s, idx) => ({
        id: `inv-${Date.now()}-${idx}`,
        sku: s.sku,
        productId: id,
        productName: product.name,
        department: product.department || 'general',
        category: product.category,
        size: s.size,
        colorName: s.colorName,
        colorHex: s.colorHex,
        availableStock: Number(s.stock) || 0,
        reservedStock: 0,
        lowStockThreshold: Number(s.lowStockThreshold) || 5,
        price: product.price + (Number(s.priceAdjustment) || 0),
        image: (product.colorImages && product.colorImages[s.colorHex]) || product.image,
      }));
      saveInventory([...newInvItems, ...inventoryList]);
    } else {
      // Default single fallback SKU
      const newInv: InventoryItem = {
        id: `inv-${Date.now()}`,
        sku: `NIDA-${product.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        productId: id,
        productName: product.name,
        department: product.department || 'general',
        category: product.category,
        size: 'Standard',
        colorName: 'Default',
        colorHex: product.colors?.[0] || '#2B1810',
        availableStock: 20,
        reservedStock: 0,
        lowStockThreshold: 5,
        price: product.price,
        image: product.image,
      };
      saveInventory([newInv, ...inventoryList]);
    }
  };

  const updateProduct = (id: string, data: Partial<Product>, skus?: SkuVariant[]) => {
    const updated = productsList.map((p) => (p.id === id ? { ...p, ...data } : p));
    saveProducts(updated);

    // Persist update to backend API
    productsApi.update(id, data, skus).catch((err) => {
      console.warn('Backend API update failed, kept in local state:', err);
    });

    if (skus && skus.length > 0) {
      const remainingInventory = inventoryList.filter((i) => i.productId !== id);
      const product = updated.find((p) => p.id === id);
      const newInvItems: InventoryItem[] = skus.map((s, idx) => ({
        id: `inv-${Date.now()}-${idx}`,
        sku: s.sku,
        productId: id,
        productName: product?.name || 'Product',
        department: product?.department || 'general',
        category: product?.category || 'apparel',
        size: s.size,
        colorName: s.colorName,
        colorHex: s.colorHex,
        availableStock: Number(s.stock) || 0,
        reservedStock: 0,
        lowStockThreshold: Number(s.lowStockThreshold) || 5,
        price: (product?.price || 0) + (Number(s.priceAdjustment) || 0),
        image:
          (product?.colorImages && product.colorImages[s.colorHex]) ||
          product?.image ||
          '',
      }));
      saveInventory([...newInvItems, ...remainingInventory]);
    }
  };

  const deleteProduct = (id: string) => {
    const updated = productsList.filter((p) => p.id !== id);
    saveProducts(updated);
    saveInventory(inventoryList.filter((i) => i.productId !== id));

    // Persist deletion to backend API
    productsApi.delete(id).catch((err) => {
      console.warn('Backend API delete failed, kept in local state:', err);
    });
  };

  const toggleProductStatus = (id: string, nextStatus?: boolean) => {
    setProductsList((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;
      const finalActive = nextStatus !== undefined ? nextStatus : !(target.isActive ?? true);
      const updated = prev.map((p) => (p.id === id ? { ...p, isActive: finalActive } : p));
      saveProducts(updated);

      const isDbUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isDbUuid) {
        productsApi.toggleStatus(id, finalActive).catch((err) => {
          console.warn('Backend toggleStatus failed:', err);
        });
      }
      return updated;
    });
  };

  const updateOrderStatus = (
    orderId: string,
    status: AdminOrder['status'],
    courierName?: string,
    trackingNumber?: string,
  ) => {
    const updated = ordersList.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status,
          courierName: courierName || ord.courierName,
          trackingNumber: trackingNumber || ord.trackingNumber,
        };
      }
      return ord;
    });
    saveOrders(updated);
  };

  const adjustStock = (sku: string, delta: number, reason: string, adminName = 'วิศณุ (Wissanu)') => {
    const target = inventoryList.find((i) => i.sku === sku);
    if (!target) return;

    const newStock = Math.max(0, target.availableStock + delta);
    const updatedInv = inventoryList.map((i) => (i.sku === sku ? { ...i, availableStock: newStock } : i));
    saveInventory(updatedInv);

    const movement: StockMovement = {
      id: `sm-${Date.now()}`,
      sku,
      productName: target.productName,
      changeType:
        delta >= 0 ? 'RESTOCK' : reason.includes('ชำรุด') || reason.includes('damage') ? 'DAMAGE' : 'ADJUSTMENT',
      quantityChange: delta,
      balanceAfter: newStock,
      reason,
      adminName,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    saveMovements([movement, ...movementsList]);
  };

  const addCoupon = (couponData: Omit<PromoCoupon, 'id' | 'usageCount'>) => {
    const newCoupon: PromoCoupon = {
      ...couponData,
      id: `c-${Date.now()}`,
      usageCount: 0,
    };
    saveCoupons([newCoupon, ...couponsList]);
  };

  const toggleCouponActive = (couponId: string) => {
    const updated = couponsList.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c));
    saveCoupons(updated);
  };

  const deleteCoupon = (couponId: string) => {
    const updated = couponsList.filter((c) => c.id !== couponId);
    saveCoupons(updated);
  };

  return (
    <AdminContext.Provider
      value={{
        productsList,
        ordersList,
        inventoryList,
        movementsList,
        couponsList,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        updateOrderStatus,
        adjustStock,
        addCoupon,
        toggleCouponActive,
        deleteCoupon,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
