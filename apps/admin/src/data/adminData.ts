export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: {
    productId: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  totalAmount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  courierName?: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productId: string;
  productName: string;
  department: string;
  category: string;
  size: string;
  colorName: string;
  colorHex: string;
  availableStock: number;
  reservedStock: number;
  lowStockThreshold: number;
  price: number;
  image: string;
}

export interface StockMovement {
  id: string;
  sku: string;
  productName: string;
  changeType: 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE' | 'ORDER_DEDUCT';
  quantityChange: number;
  balanceAfter: number;
  reason: string;
  adminName: string;
  timestamp: string;
}

export interface PromoCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  usageCount: number;
  usageLimit: number;
  isActive: boolean;
  expiresAt: string;
}

export const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'NIDA-918274',
    customerName: 'พรรณนิดา วิศณุ',
    customerEmail: 'wissanu0531@gmail.com',
    customerPhone: '081-892-3456',
    shippingAddress: '108 สุขุมวิท ซอย 24 คลองเตย',
    city: 'กรุงเทพมหานคร',
    postalCode: '10110',
    totalAmount: 340.0,
    paymentMethod: 'Credit Card (•••• 4242)',
    status: 'SHIPPED',
    courierName: 'Kerry Express TH',
    trackingNumber: 'KER-982147392TH',
    createdAt: '2026-09-17 09:30',
    items: [
      {
        productId: 'w2',
        productName: 'Heritage Double-Breasted Trench Coat',
        size: 'M',
        color: 'Classic Khaki',
        quantity: 1,
        price: 289.0,
        image:
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'NIDA-847291',
    customerName: 'ธนดล วงศ์สุวรรณ',
    customerEmail: 'thanadol.w@gmail.com',
    customerPhone: '089-112-9844',
    shippingAddress: '45/1 ถนนสาทรใต้ แขวงยานนาวา',
    city: 'กรุงเทพมหานคร',
    postalCode: '10120',
    totalAmount: 129.0,
    paymentMethod: 'PromptPay QR',
    status: 'DELIVERED',
    courierName: 'Flash Express',
    trackingNumber: 'FL-209148721TH',
    createdAt: '2026-09-15 14:20',
    items: [
      {
        productId: 'w1',
        productName: 'Iconic Cable-Knit Crewneck Sweater',
        size: 'S',
        color: 'Ivory White',
        quantity: 1,
        price: 129.0,
        image:
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: 'NIDA-761298',
    customerName: 'ศิรดา มณีรัตน์',
    customerEmail: 'sirada.m@outlook.com',
    customerPhone: '084-556-7890',
    shippingAddress: '88 หมู่บ้านนภาลัย บางนา',
    city: 'กรุงเทพมหานคร',
    postalCode: '10260',
    totalAmount: 495.0,
    paymentMethod: 'Credit Card (•••• 8812)',
    status: 'PROCESSING',
    createdAt: '2026-09-18 08:15',
    items: [
      {
        productId: 'bg1',
        productName: 'Signature Pebble Leather Crossbody Bag',
        size: 'One Size',
        color: 'Espresso Brown',
        quantity: 1,
        price: 320.0,
        image:
          'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      },
      {
        productId: 'm1',
        productName: 'Signature Pique Oxford Polo',
        size: 'L',
        color: 'Amber Gold',
        quantity: 2,
        price: 85.0,
        image:
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'ord-104',
    orderNumber: 'NIDA-632190',
    customerName: 'อภิเชษฐ์ ปรีชานนท์',
    customerEmail: 'apichet.p@gmail.com',
    customerPhone: '082-998-3321',
    shippingAddress: '234/12 ซอยทองหล่อ 13',
    city: 'กรุงเทพมหานคร',
    postalCode: '10110',
    totalAmount: 185.0,
    paymentMethod: 'Credit Card (•••• 1092)',
    status: 'PAID',
    createdAt: '2026-09-18 02:40',
    items: [
      {
        productId: 'sh1',
        productName: 'Heritage Tennis Leather Court Sneaker',
        size: '42',
        color: 'White / Gold',
        quantity: 1,
        price: 185.0,
        image:
          'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    sku: 'NIDA-COAT-KHK-M',
    productId: 'w2',
    productName: 'Heritage Double-Breasted Trench Coat',
    department: 'women',
    category: 'apparel',
    size: 'M',
    colorName: 'Classic Khaki',
    colorHex: '#D4B996',
    availableStock: 8,
    reservedStock: 2,
    lowStockThreshold: 10,
    price: 289,
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'inv-2',
    sku: 'NIDA-COAT-KHK-L',
    productId: 'w2',
    productName: 'Heritage Double-Breasted Trench Coat',
    department: 'women',
    category: 'apparel',
    size: 'L',
    colorName: 'Classic Khaki',
    colorHex: '#D4B996',
    availableStock: 3,
    reservedStock: 1,
    lowStockThreshold: 5,
    price: 289,
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'inv-3',
    sku: 'NIDA-SWT-IVR-S',
    productId: 'w1',
    productName: 'Iconic Cable-Knit Crewneck Sweater',
    department: 'women',
    category: 'apparel',
    size: 'S',
    colorName: 'Ivory White',
    colorHex: '#FFFFFF',
    availableStock: 24,
    reservedStock: 3,
    lowStockThreshold: 10,
    price: 129,
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'inv-4',
    sku: 'NIDA-BAG-ESP-OS',
    productId: 'bg1',
    productName: 'Signature Pebble Leather Crossbody Bag',
    department: 'bags',
    category: 'accessories',
    size: 'One Size',
    colorName: 'Espresso Brown',
    colorHex: '#2B1810',
    availableStock: 4,
    reservedStock: 1,
    lowStockThreshold: 8,
    price: 320,
    image:
      'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'inv-5',
    sku: 'NIDA-SNK-WHT-42',
    productId: 'sh1',
    productName: 'Heritage Tennis Leather Court Sneaker',
    department: 'shoes',
    category: 'footwear',
    size: '42',
    colorName: 'White / Gold Trim',
    colorHex: '#F59E0B',
    availableStock: 18,
    reservedStock: 2,
    lowStockThreshold: 6,
    price: 185,
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'inv-6',
    sku: 'NIDA-POLO-AMB-M',
    productId: 'm1',
    productName: 'Signature Pique Oxford Polo',
    department: 'men',
    category: 'apparel',
    size: 'M',
    colorName: 'Amber Gold',
    colorHex: '#F59E0B',
    availableStock: 35,
    reservedStock: 4,
    lowStockThreshold: 10,
    price: 85,
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm-1',
    sku: 'NIDA-COAT-KHK-M',
    productName: 'Heritage Double-Breasted Trench Coat',
    changeType: 'RESTOCK',
    quantityChange: 15,
    balanceAfter: 10,
    reason: 'นำเข้าล็อตใหม่จากโรงงานตัดเย็บ PO-2026-09',
    adminName: 'วิศณุ (Wissanu)',
    timestamp: '2026-09-17 11:20',
  },
  {
    id: 'sm-2',
    sku: 'NIDA-BAG-ESP-OS',
    productName: 'Signature Pebble Leather Crossbody Bag',
    changeType: 'ORDER_DEDUCT',
    quantityChange: -1,
    balanceAfter: 4,
    reason: 'ตัดสต็อกตามออเดอร์ #NIDA-761298',
    adminName: 'ระบบอัตโนมัติ (System)',
    timestamp: '2026-09-18 08:15',
  },
  {
    id: 'sm-3',
    sku: 'NIDA-COAT-KHK-L',
    productName: 'Heritage Double-Breasted Trench Coat',
    changeType: 'DAMAGE',
    quantityChange: -1,
    balanceAfter: 3,
    reason: 'พบตำหนิกระดุมชำรุดระหว่าง QC คัดแยกออก',
    adminName: 'ธนภัทร (QC Inspector)',
    timestamp: '2026-09-16 16:45',
  },
];

export const INITIAL_COUPONS: PromoCoupon[] = [
  {
    id: 'c-1',
    code: 'NIDA20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderAmount: 100,
    usageCount: 142,
    usageLimit: 500,
    isActive: true,
    expiresAt: '2026-12-31',
  },
  {
    id: 'c-2',
    code: 'FALL50',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    minOrderAmount: 200,
    usageCount: 89,
    usageLimit: 200,
    isActive: true,
    expiresAt: '2026-10-31',
  },
  {
    id: 'c-3',
    code: 'WELCOME100',
    discountType: 'FIXED',
    discountValue: 100,
    minOrderAmount: 300,
    usageCount: 37,
    usageLimit: 100,
    isActive: true,
    expiresAt: '2026-11-15',
  },
];
