export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImage?: string;
  category: string;
  department?: string;
  subCategory?: string;
  tag?: string;
  colors?: string[];
  rating?: number;
  reviewsCount?: number;
};

export const products: Product[] = [
  // --- WOMEN ---
  {
    id: 'w1',
    name: 'Iconic Cable-Knit Crewneck Sweater',
    price: 129,
    originalPrice: 179,
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    secondaryImage:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Sweaters & Knits',
    tag: 'BESTSELLER',
    colors: ['#2B1810', '#FFFFFF', '#F59E0B', '#D4C3B3'],
    rating: 4.9,
    reviewsCount: 142,
  },
  {
    id: 'w2',
    name: 'Heritage Double-Breasted Trench Coat',
    price: 289,
    originalPrice: 380,
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    secondaryImage:
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Coats & Jackets',
    tag: 'NEW ARRIVAL',
    colors: ['#D4B996', '#2B1810', '#1F2937'],
    rating: 4.8,
    reviewsCount: 88,
  },
  {
    id: 'w3',
    name: 'Classic Tailored Oxford Shirt',
    price: 89,
    originalPrice: 119,
    image:
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Shirts & Tops',
    tag: 'CLASSIC',
    colors: ['#FFFFFF', '#FEF08A', '#2B1810'],
    rating: 4.7,
    reviewsCount: 64,
  },
  {
    id: 'w4',
    name: 'Pleated Varsity Tennis Skort Dress',
    price: 115,
    originalPrice: 150,
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Dresses',
    tag: 'TRENDING',
    colors: ['#2B1810', '#FFFFFF', '#F59E0B'],
    rating: 4.9,
    reviewsCount: 52,
  },
  {
    id: 'w5',
    name: 'High-Rise Straight Vintage Denim',
    price: 135,
    originalPrice: 165,
    image:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Denim & Pants',
    tag: 'EXTRA 20% OFF',
    colors: ['#D97706', '#2B1810', '#111827'],
    rating: 4.8,
    reviewsCount: 110,
  },

  // --- MEN ---
  {
    id: 'm1',
    name: 'Signature Slim Fit Pique Polo',
    price: 79,
    originalPrice: 98,
    image:
      'https://images.unsplash.com/photo-1625910513413-568b209a3c03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'men',
    subCategory: 'Polos & T-Shirts',
    tag: 'HERITAGE',
    colors: ['#2B1810', '#F59E0B', '#FFFFFF', '#1E110A'],
    rating: 4.9,
    reviewsCount: 290,
  },
  {
    id: 'm2',
    name: 'Colorblock Sailing Windbreaker Jacket',
    price: 195,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'men',
    subCategory: 'Coats & Jackets',
    tag: 'POPULAR',
    colors: ['#2B1810', '#F59E0B', '#FFFFFF'],
    rating: 4.9,
    reviewsCount: 175,
  },
  {
    id: 'm3',
    name: 'Essential Cotton Twill Chino Trousers',
    price: 99,
    originalPrice: 130,
    image:
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'men',
    subCategory: 'Pants & Shorts',
    tag: 'ESSENTIAL',
    colors: ['#D2B48C', '#2B1810', '#4B5563'],
    rating: 4.6,
    reviewsCount: 94,
  },
  {
    id: 'm4',
    name: 'Wool Blend Varsity Letterman Bomber',
    price: 260,
    originalPrice: 340,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'men',
    subCategory: 'Coats & Jackets',
    tag: 'LIMITED EDITION',
    colors: ['#2B1810', '#F59E0B'],
    rating: 5.0,
    reviewsCount: 83,
  },

  // --- KIDS ---
  {
    id: 'k1',
    name: 'Kids Classic Logo Pique Polo',
    price: 49,
    originalPrice: 65,
    image:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'kids',
    department: 'kids',
    subCategory: 'Polos & Tees',
    tag: 'KIDS FAVORITE',
    colors: ['#2B1810', '#F59E0B', '#FFFFFF'],
    rating: 4.9,
    reviewsCount: 45,
  },
  {
    id: 'k2',
    name: 'Kids Hooded Colorblock Zip Windbreaker',
    price: 75,
    originalPrice: 95,
    image:
      'https://images.unsplash.com/photo-1503944547408-b6559a445e0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'kids',
    department: 'kids',
    subCategory: 'Outerwear',
    tag: 'NEW',
    colors: ['#2B1810', '#F59E0B', '#FEF08A'],
    rating: 4.8,
    reviewsCount: 38,
  },

  // --- BAGS & LEATHER ---
  {
    id: 'b1',
    name: 'Signature Stripe Leather Crossbody Bag',
    price: 145,
    originalPrice: 195,
    image:
      'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'bags',
    department: 'bags',
    subCategory: 'Crossbody Bags',
    tag: 'BESTSELLER',
    colors: ['#2B1810', '#F59E0B', '#D4B996'],
    rating: 4.9,
    reviewsCount: 165,
  },
  {
    id: 'b2',
    name: 'Heritage Heavy Canvas Weekender Duffle',
    price: 185,
    originalPrice: 240,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'bags',
    department: 'bags',
    subCategory: 'Travel & Duffles',
    tag: 'TRAVEL PICK',
    colors: ['#2B1810', '#D4B996', '#1C1917'],
    rating: 4.8,
    reviewsCount: 88,
  },
  {
    id: 'b3',
    name: 'Polished Pebble Leather Zip Wallet',
    price: 65,
    originalPrice: 85,
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'bags',
    department: 'bags',
    subCategory: 'Wallets & Cardholders',
    colors: ['#2B1810', '#F59E0B', '#1E110A'],
    rating: 4.7,
    reviewsCount: 62,
  },

  // --- SHOES ---
  {
    id: 's1',
    name: 'Court Heritage Low-Top Leather Sneakers',
    price: 110,
    originalPrice: 140,
    image:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'shoes',
    department: 'shoes',
    subCategory: 'Sneakers',
    tag: 'TRENDING',
    colors: ['#FFFFFF', '#2B1810', '#F59E0B'],
    rating: 4.9,
    reviewsCount: 210,
  },
  {
    id: 's2',
    name: 'Classic Handcrafted Leather Loafers',
    price: 185,
    originalPrice: 235,
    image:
      'https://images.unsplash.com/photo-1608256246200-53e65389ea8ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'shoes',
    department: 'shoes',
    subCategory: 'Dress Shoes',
    colors: ['#2B1810', '#451A03', '#1E110A'],
    rating: 4.8,
    reviewsCount: 77,
  },

  // --- ACCESSORIES ---
  {
    id: 'a1',
    name: 'Washed Twill Collegiate Logo Cap',
    price: 39,
    originalPrice: 48,
    image:
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'accessories',
    department: 'accessories',
    subCategory: 'Hats & Caps',
    colors: ['#2B1810', '#F59E0B', '#FFFFFF', '#D4B996'],
    rating: 4.8,
    reviewsCount: 132,
  },
  {
    id: 'a2',
    name: 'Heritage Reversible Leather Dress Belt',
    price: 55,
    originalPrice: 70,
    image:
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'accessories',
    department: 'accessories',
    subCategory: 'Belts',
    colors: ['#2B1810', '#1E110A', '#78350F'],
    rating: 4.6,
    reviewsCount: 49,
  },

  // --- HOME & LIFESTYLE ---
  {
    id: 'h1',
    name: 'Signature Striped Organic Bath Towel Set',
    price: 68,
    originalPrice: 90,
    image:
      'https://images.unsplash.com/photo-1583847268964-b28ce8f31161?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'home',
    department: 'home',
    subCategory: 'Bath & Bedding',
    tag: 'SUSTAINABLE',
    colors: ['#2B1810', '#FFFFFF', '#F59E0B'],
    rating: 4.9,
    reviewsCount: 91,
  },
  {
    id: 'h2',
    name: 'Artisan Ceramic Scented Candle - Hinoki Woods',
    price: 45,
    originalPrice: 55,
    image:
      'https://images.unsplash.com/photo-1602921516766-3d3f9b2d978a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'home',
    department: 'home',
    subCategory: 'Home Fragrance',
    tag: 'TOP GIFT',
    rating: 4.9,
    reviewsCount: 114,
  },
];
