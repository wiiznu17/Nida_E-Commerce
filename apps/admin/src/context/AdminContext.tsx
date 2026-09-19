import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Product, products as initialProducts } from '../data/products';
import {
  type AdminOrder,
  type InventoryItem,
  type StockMovement,
  type PromoCoupon,
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
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

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

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod_${Date.now()}`;
    const product: Product = { ...newProd, id };
    const updated = [product, ...productsList];
    saveProducts(updated);

    // Also register default SKU in inventory
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
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    const updated = productsList.map((p) => (p.id === id ? { ...p, ...data } : p));
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    const updated = productsList.filter((p) => p.id !== id);
    saveProducts(updated);
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
