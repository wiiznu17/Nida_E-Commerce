export type Product = {
  id: string;
  slug?: string;
  name: string;
  nameTh?: string;
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImage?: string;
  category: string;
  department?: string;
  subCategory?: string;
  subCategoryTh?: string;
  tag?: string;
  tagTh?: string;
  description?: string;
  descriptionTh?: string;
  materialsCare?: string;
  materialsCareTh?: string;
  colors?: string[];
  colorImages?: Record<string, string>;
  rating?: number;
  reviewsCount?: number;
  isPreorder?: boolean;
  preorderReleaseDate?: string;
  preorderLimit?: number;
  preorderDepositAmount?: number;
};

export const products: Product[] = [
  // --- WOMEN ---
  {
    id: 'w1',
    name: 'Iconic Cable-Knit Crewneck Sweater',
    nameTh: 'สเวตเตอร์ไหมพรมถักลายเคเบิล ซิกเนเจอร์',
    price: 129,
    originalPrice: 179,
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    secondaryImage:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Sweaters & Knits',
    subCategoryTh: 'สเวตเตอร์และเสื้อไหมพรม',
    tag: 'BESTSELLER',
    tagTh: 'สินค้าขายดี',
    description:
      'Iconic cable-knit crewneck sweater crafted from premium sustainable wool blend. Delivers timeless collegiate elegance and cozy warmth.',
    descriptionTh:
      'สเวตเตอร์ไหมพรมถักลายเคเบิลระดับไอคอนิก ทอจากผ้าวูลผสมออร์แกนิกสัมผัสนุ่มละมุน มอบความอบอุ่นและความภูมิฐานสไตล์ Preppy',
    colors: ['#2B1810', '#FFFFFF', '#F59E0B', '#D4C3B3'],
    rating: 4.9,
    reviewsCount: 142,
  },
  {
    id: 'w2',
    name: 'Heritage Double-Breasted Trench Coat',
    nameTh: 'เสื้อโค้ทเทรนช์ ดับเบิลเบรสต์ เฮอริเทจ',
    price: 289,
    originalPrice: 380,
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    secondaryImage:
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Coats & Jackets',
    subCategoryTh: 'เสื้อโค้ทและแจ็คเก็ต',
    tag: 'NEW ARRIVAL',
    tagTh: 'สินค้ามาใหม่',
    description:
      'Double-breasted trench coat with tailored architectural lines, weather-resistant cotton twill, and horn button accents.',
    descriptionTh:
      'เสื้อโค้ททรงกระดุมสองแถว คัตติ้งเนี้ยบ ปกป้องจากลมหนาวและละอองฝนด้วยผ้าคอตตอนทวิลกันน้ำเกรดพรีเมียม',
    colors: ['#D4B996', '#2B1810', '#1F2937'],
    rating: 4.8,
    reviewsCount: 88,
  },
  {
    id: 'w3',
    name: 'Classic Tailored Oxford Shirt',
    nameTh: 'เสื้อเชิ้ตผ้าอ็อกซ์ฟอร์ดทรงคลาสสิก',
    price: 89,
    originalPrice: 119,
    image:
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Shirts & Tops',
    subCategoryTh: 'เสื้อเชิ้ตและเสื้อท็อป',
    tag: 'CLASSIC',
    tagTh: 'คลาสสิกยอดนิยม',
    description:
      'Pure combed cotton Oxford cloth button-down with authentic mother-of-pearl buttons and relaxed tailored cut.',
    descriptionTh:
      'เสื้อเชิ้ตผ้าอ็อกซ์ฟอร์ดทอพิเศษ ทรงพอดีตัวสวมใส่สบาย เหมาะสำหรับทั้งวันทำงานและลุคลำลอง',
    colors: ['#FFFFFF', '#FEF08A', '#2B1810'],
    rating: 4.7,
    reviewsCount: 64,
  },
  {
    id: 'w4',
    name: 'Pleated Varsity Tennis Skort Dress',
    nameTh: 'เดรสกระโปรงเทนนิสพลีต สไตล์วาร์ซิตี้',
    price: 115,
    originalPrice: 150,
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Dresses',
    subCategoryTh: 'เดรสและชุดกระโปรง',
    tag: 'TRENDING',
    tagTh: 'กำลังเป็นที่นิยม',
    description:
      'Varsity tennis skort dress featuring sharp pleats, moisture-wicking stretch knit, and built-in shorts for effortless movement.',
    descriptionTh:
      'เดรสพลีตสไตล์สปอร์ตวาร์ซิตี้พร้อมกางเกงซับใน มอบความคล่องตัวและเสน่ห์ความสดใสสไตล์โมเดิร์นคลาสสิก',
    colors: ['#2B1810', '#FFFFFF', '#F59E0B'],
    rating: 4.9,
    reviewsCount: 52,
  },
  {
    id: 'w5',
    name: 'High-Rise Straight Vintage Denim',
    nameTh: 'กางเกงยีนส์เอวสูงทรงตรง วินเทจเดนิม',
    price: 135,
    originalPrice: 165,
    image:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'women',
    subCategory: 'Denim & Pants',
    subCategoryTh: 'เดนิมและกางเกงขายาว',
    tag: 'EXTRA 20% OFF',
    tagTh: 'ลดเพิ่ม 20%',
    description:
      'High-rise straight leg vintage denim woven with rigid sustainable cotton for an authentic heirloom break-in.',
    descriptionTh:
      'กางเกงยีนส์ทรงขากระบอกตรงเอวสูง ผลิตจากผ้าเดนิมคอตตอนแท้ 100% สไตล์เรโทรที่คงทนตลอดกาล',
    colors: ['#D97706', '#2B1810', '#111827'],
    rating: 4.8,
    reviewsCount: 110,
  },

  // --- MEN ---
  {
    id: 'm1',
    name: 'Signature Slim Fit Pique Polo',
    nameTh: 'เสื้อโปโลผ้าปิเก้ ซิกเนเจอร์ สลิมฟิต',
    price: 79,
    originalPrice: 98,
    image:
      'https://images.unsplash.com/photo-1625910513413-568b209a3c03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'men',
    subCategory: 'Polos & T-Shirts',
    subCategoryTh: 'เสื้อโปโลและเสื้อยืด',
    tag: 'HERITAGE',
    tagTh: 'เฮอริเทจไอคอน',
    description:
      'Breathable combed cotton pique polo with tailored collar and embroidered signature tri-color flag emblem.',
    descriptionTh:
      'เสื้อโปโลผ้าปิเก้คอตตอนแท้ นุ่มระบายอากาศดีเยี่ยม ปักแถบสามสีสัญลักษณ์ Nida เอกลักษณ์ของความภูมิฐาน',
    colors: ['#2B1810', '#F59E0B', '#FFFFFF', '#1E110A'],
    rating: 4.9,
    reviewsCount: 290,
  },
  {
    id: 'm2',
    name: 'Colorblock Sailing Windbreaker Jacket',
    nameTh: 'แจ็คเก็ตวินด์เบรกเกอร์ เซลลิ่ง คัลเลอร์บล็อก',
    price: 195,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'men',
    subCategory: 'Coats & Jackets',
    subCategoryTh: 'เสื้อโค้ทและแจ็คเก็ต',
    tag: 'POPULAR',
    tagTh: 'ยอดนิยม',
    description:
      'Colorblocked sailing jacket engineered with weather-shield nylon, packable hood, and heritage color palette.',
    descriptionTh:
      'แจ็คเก็ตกันลมสไตล์กะลาสีเรือบล็อกสีน้ำตาล-ขาว-มัสตาร์ด กันละอองน้ำ น้ำหนักเบา คล่องตัวในทุกการเดินทาง',
    colors: ['#2B1810', '#F59E0B', '#FFFFFF'],
    rating: 4.9,
    reviewsCount: 175,
  },
  {
    id: 'm3',
    name: 'Essential Cotton Twill Chino Trousers',
    nameTh: 'กางเกงชิโน่ผ้าคอตตอนทวิล เอสเซนเชียล',
    price: 99,
    originalPrice: 130,
    image:
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'men',
    subCategory: 'Pants & Shorts',
    subCategoryTh: 'กางเกงขายาวและขาสั้น',
    tag: 'ESSENTIAL',
    tagTh: 'ไอเทมประจำตู้',
    description:
      'Tailored flat-front chinos crafted from brushed cotton twill with subtle stretch for effortless daily refinement.',
    descriptionTh:
      'กางเกงชิโน่คัตติ้งเนี้ยบ ตัดเย็บจากผ้าคอตตอนทวิลสัมผัสนุ่ม ยืดหยุ่นเล็กน้อยเพื่อความสบายตลอดวัน',
    colors: ['#D2B48C', '#2B1810', '#4B5563'],
    rating: 4.6,
    reviewsCount: 94,
  },
  {
    id: 'm4',
    name: 'Wool Blend Varsity Letterman Bomber',
    nameTh: 'เสื้อแจ็คเก็ตบอมเบอร์ เลตเตอร์แมน วูลเบลนด์',
    price: 260,
    originalPrice: 340,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'men',
    subCategory: 'Coats & Jackets',
    subCategoryTh: 'เสื้อโค้ทและแจ็คเก็ต',
    tag: 'LIMITED EDITION',
    tagTh: 'รุ่นลิมิเต็ด',
    description:
      'Heavyweight Melton wool varsity jacket with supple leather sleeves and custom collegiate ribbing.',
    descriptionTh:
      'แจ็คเก็ตบอมเบอร์สไตล์นักศึกษาสหรัฐฯ ผ้าขนสัตว์ผสมหนังแท้ เดินด้ายประณีตทุกจุด สัญลักษณ์แห่งความสำเร็จ',
    colors: ['#2B1810', '#F59E0B'],
    rating: 5.0,
    reviewsCount: 83,
  },
  {
    id: 'm5',
    slug: 'preorder-limited-cashmere-overcoat',
    name: 'Pre-Order: Limited Edition Cashmere Overcoat (Winter 2026)',
    nameTh: 'พรีออเดอร์: เสื้อโค้ทแคชเมียร์ ลิมิเต็ดเอดิชัน (วินเทอร์ 2026)',
    price: 490,
    originalPrice: 590,
    image:
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    secondaryImage:
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
    category: 'apparel',
    department: 'men',
    subCategory: 'Coats & Jackets',
    subCategoryTh: 'เสื้อโค้ทและแจ็คเก็ต',
    tag: 'PRE-ORDER',
    tagTh: 'เปิดพรีออเดอร์',
    description:
      'Exclusive artisanal overcoat crafted in limited quantities from Italian double-faced cashmere.',
    descriptionTh:
      'เสื้อคลุมแคชเมียร์สั่งตัดพิเศษ ผลิตจำนวนจำกัดจากผ้าแคชเมียร์อิตาลีสองหน้าเกรดพรีเมียม',
    materialsCare: '100% Italian Cashmere. Specialist dry clean.',
    materialsCareTh: 'ผ้าแคชเมียร์อิตาลี 100%. ซักแห้งโดยผู้เชี่ยวชาญเท่านั้น',
    colors: ['#111827', '#D4B996'],
    rating: 5.0,
    reviewsCount: 0,
    isPreorder: true,
    preorderReleaseDate: '2026-11-15T00:00:00.000Z',
    preorderLimit: 50,
    preorderDepositAmount: 100,
  },

  // --- KIDS ---
  {
    id: 'k1',
    name: 'Kids Classic Logo Pique Polo',
    nameTh: 'เสื้อโปโลเด็ก ผ้าปิเก้ โลโก้คลาสสิก',
    price: 49,
    originalPrice: 65,
    image:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'kids',
    department: 'kids',
    subCategory: 'Polos & Tees',
    subCategoryTh: 'เสื้อโปโลและเสื้อยืดเด็ก',
    tag: 'KIDS FAVORITE',
    tagTh: 'ขวัญใจเด็กๆ',
    description:
      'Super-soft 100% organic cotton pique polo crafted for active days, everyday play, and durable comfort.',
    descriptionTh:
      'เสื้อโปโลเด็กสัมผัสนุ่ม อ่อนโยนต่อผิว ระบายอากาศได้ดี ทนทานต่อการซัก เหมาะสำหรับวัยเรียนรู้',
    colors: ['#2B1810', '#F59E0B', '#FFFFFF'],
    rating: 4.9,
    reviewsCount: 45,
  },
  {
    id: 'k2',
    name: 'Kids Hooded Colorblock Zip Windbreaker',
    nameTh: 'เสื้อแจ็คเก็ตกันลมมีฮู้ด ซิปหน้า คัลเลอร์บล็อกเด็ก',
    price: 75,
    originalPrice: 95,
    image:
      'https://images.unsplash.com/photo-1503944547408-b6559a445e0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'kids',
    department: 'kids',
    subCategory: 'Outerwear',
    subCategoryTh: 'เสื้อคลุมและแจ็คเก็ตเด็ก',
    tag: 'NEW',
    tagTh: 'มาใหม่',
    description:
      'Lightweight weather-resistant windbreaker featuring an ergonomic hood and playful retro colorblocking.',
    descriptionTh:
      'เสื้อคลุมกันลมเด็กพร้อมหมวกฮู้ด น้ำหนักเบา ป้องกันละอองฝนและลมหนาว สดใสด้วยบล็อกสีอันเป็นเอกลักษณ์',
    colors: ['#2B1810', '#F59E0B', '#FEF08A'],
    rating: 4.8,
    reviewsCount: 38,
  },

  // --- BAGS & LEATHER ---
  {
    id: 'b1',
    name: 'Signature Stripe Leather Crossbody Bag',
    nameTh: 'กระเป๋าสะพายข้างหนังแท้ แถบซิกเนเจอร์',
    price: 145,
    originalPrice: 195,
    image:
      'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'bags',
    department: 'bags',
    subCategory: 'Crossbody Bags',
    subCategoryTh: 'กระเป๋าสะพายข้าง',
    tag: 'BESTSELLER',
    tagTh: 'สินค้าขายดี',
    description:
      'Full-grain pebble leather crossbody bag featuring our signature tri-color ribbon strap and custom brushed brass hardware.',
    descriptionTh:
      'กระเป๋าสะพายข้างหนังเกรนแท้เนื้อละเอียด ตกแต่งแถบริบบิ้น 3 สีพร้อมอะไหล่ทองเหลืองรมดำ ทรงสวยทนทาน',
    colors: ['#2B1810', '#F59E0B', '#D4B996'],
    rating: 4.9,
    reviewsCount: 165,
  },
  {
    id: 'b2',
    name: 'Heritage Heavy Canvas Weekender Duffle',
    nameTh: 'กระเป๋าเดินทางดัฟเฟิลผ้าแคนวาสหนาพิเศษ เฮอริเทจ',
    price: 185,
    originalPrice: 240,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'bags',
    department: 'bags',
    subCategory: 'Travel & Duffles',
    subCategoryTh: 'กระเป๋าเดินทางและดัฟเฟิล',
    tag: 'TRAVEL PICK',
    tagTh: 'แนะนำสำหรับการเดินทาง',
    description:
      'Durable 18oz waxed cotton canvas duffle reinforced with saddle leather handles and spacious interior compartments.',
    descriptionTh:
      'กระเป๋าเดินทางวีคเอนเดอร์ จุสัมภาระได้ครบครัน ผลิตจากผ้าแคนวาสคอตตอนหนาพิเศษแต่งขอบหนังแท้',
    colors: ['#2B1810', '#D4B996', '#1C1917'],
    rating: 4.8,
    reviewsCount: 88,
  },
  {
    id: 'b3',
    name: 'Polished Pebble Leather Zip Wallet',
    nameTh: 'กระเป๋าสตางค์ซิปรอบ หนังเพบเบิลขัดเงา',
    price: 65,
    originalPrice: 85,
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'bags',
    department: 'bags',
    subCategory: 'Wallets & Cardholders',
    subCategoryTh: 'กระเป๋าสตางค์และที่ใส่บัตร',
    tag: 'CLASSIC',
    tagTh: 'คลาสสิก',
    description:
      'Compact zip-around wallet constructed from scratch-resistant pebbled leather with 8 card slots and coin pocket.',
    descriptionTh:
      'กระเป๋าสตางค์ซิปรอบหนังแท้ ช่องใส่บัตรและธนบัตรครบครัน ขนาดกะทัดรัดพกพาสะดวก ทนทานต่อรอยขีดข่วน',
    colors: ['#2B1810', '#F59E0B', '#1E110A'],
    rating: 4.7,
    reviewsCount: 62,
  },

  // --- SHOES ---
  {
    id: 's1',
    name: 'Court Heritage Low-Top Leather Sneakers',
    nameTh: 'รองเท้าสนีกเกอร์หนังแท้ ทรงคอร์ทโลว์ท็อป เฮอริเทจ',
    price: 110,
    originalPrice: 140,
    image:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'shoes',
    department: 'shoes',
    subCategory: 'Sneakers',
    subCategoryTh: 'รองเท้าสนีกเกอร์',
    tag: 'TRENDING',
    tagTh: 'กำลังเป็นที่นิยม',
    description:
      'Retro court sneaker constructed from supple Italian calfskin leather with cushioned OrthoLite insole for all-day comfort.',
    descriptionTh:
      'สนีกเกอร์หนังแท้ทรงคอร์ทเทนนิสเรโทร พื้นรองเท้าซัพพอร์ตอุ้งเท้า นุ่มเบาสบายทุกก้าวเดิน',
    colors: ['#FFFFFF', '#2B1810', '#F59E0B'],
    rating: 4.9,
    reviewsCount: 210,
  },
  {
    id: 's2',
    name: 'Classic Handcrafted Leather Loafers',
    nameTh: 'รองเท้าโลฟเฟอร์หนังแท้แฮนด์คราฟต์ ทรงคลาสสิก',
    price: 185,
    originalPrice: 235,
    image:
      'https://images.unsplash.com/photo-1608256246200-53e65389ea8ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'shoes',
    department: 'shoes',
    subCategory: 'Dress Shoes',
    subCategoryTh: 'รองเท้าหนังทางการ',
    tag: 'HANDCRAFTED',
    tagTh: 'งานฝีมือประณีต',
    description:
      'Artisan hand-stitched penny loafers crafted from burnished box calf leather with Goodyear-welted leather soles.',
    descriptionTh:
      'รองเท้าเพนนีโลฟเฟอร์ตัดเย็บด้วยมือแบบดั้งเดิม หนังเงางาม พื้นเย็บกู๊ดเยียร์เวลต์ ทนทานยาวนานนับสิบปี',
    colors: ['#2B1810', '#451A03', '#1E110A'],
    rating: 4.8,
    reviewsCount: 77,
  },

  // --- ACCESSORIES ---
  {
    id: 'a1',
    name: 'Washed Twill Collegiate Logo Cap',
    nameTh: 'หมวกแก๊ปผ้าทวิลฟอก โลโก้วาร์ซิตี้',
    price: 39,
    originalPrice: 48,
    image:
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'accessories',
    department: 'accessories',
    subCategory: 'Hats & Caps',
    subCategoryTh: 'หมวกและหมวกแก๊ป',
    tag: 'DAILY PICK',
    tagTh: 'ไอเทมประจำวัน',
    description:
      'Pre-washed six-panel baseball cap embroidered with collegiate Nida monogram and adjustable leather strap.',
    descriptionTh:
      'หมวกแก๊ปผ้าคอตตอนทวิลฟอกนุ่ม ปักโลโก้ Nida อักษรนูน สายรัดปรับขนาดด้านหลังเป็นหนังแท้',
    colors: ['#2B1810', '#F59E0B', '#FFFFFF', '#D4B996'],
    rating: 4.8,
    reviewsCount: 132,
  },
  {
    id: 'a2',
    name: 'Heritage Reversible Leather Dress Belt',
    nameTh: 'เข็มขัดหนังแท้ใส่ได้สองด้าน เฮอริเทจ',
    price: 55,
    originalPrice: 70,
    image:
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'accessories',
    department: 'accessories',
    subCategory: 'Belts',
    subCategoryTh: 'เข็มขัด',
    tag: 'VERSATILE',
    tagTh: 'อเนกประสงค์',
    description:
      'Reversible fine bridle leather belt offering dark espresso brown on one side and midnight black on the other with swivel buckle.',
    descriptionTh:
      'เข็มขัดหนังแท้พรีเมียม สลับใส่ได้ทั้งด้านสีน้ำตาลและสีดำ หัวเข็มขัดทองเหลืองขัดเงาหมุนได้ 360 องศา',
    colors: ['#2B1810', '#1E110A', '#78350F'],
    rating: 4.6,
    reviewsCount: 49,
  },

  // --- HOME & LIFESTYLE ---
  {
    id: 'h1',
    name: 'Signature Striped Organic Bath Towel Set',
    nameTh: 'เซ็ตผ้าขนหนูออร์แกนิก ลายทางซิกเนเจอร์',
    price: 68,
    originalPrice: 90,
    image:
      'https://images.unsplash.com/photo-1583847268964-b28ce8f31161?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'home',
    department: 'home',
    subCategory: 'Bath & Bedding',
    subCategoryTh: 'เครื่องนอนและห้องน้ำ',
    tag: 'SUSTAINABLE',
    tagTh: 'ผลิตจากวัสดุรักษ์โลก',
    description:
      'Plush 650 GSM Aegean organic cotton towel bundle featuring jacquard woven collegiate stripe border.',
    descriptionTh:
      'เซ็ตผ้าขนหนูคอตตอนออร์แกนิก 100% ทอหนา 650 GSM ซับน้ำได้ดีเยี่ยม นุ่มละมุนผิว ไม่ระคายเคือง',
    colors: ['#2B1810', '#FFFFFF', '#F59E0B'],
    rating: 4.9,
    reviewsCount: 91,
  },
  {
    id: 'h2',
    name: 'Artisan Ceramic Scented Candle - Hinoki Woods',
    nameTh: 'เทียนหอมกระถางเซรามิก กลิ่นไม้ฮิโนกิ',
    price: 45,
    originalPrice: 55,
    image:
      'https://images.unsplash.com/photo-1602921516766-3d3f9b2d978a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'home',
    department: 'home',
    subCategory: 'Home Fragrance',
    subCategoryTh: 'เครื่องหอมและตกแต่งบ้าน',
    tag: 'TOP GIFT',
    tagTh: 'ของขวัญยอดนิยม',
    description:
      'Hand-poured coconut soy candle in handmade ceramic vessel with essential oils of cypress, hinoki, and cedarwood.',
    descriptionTh:
      'เทียนหอมไขถั่วเหลืองธรรมชาติ 100% บรรจุในกระถางเซรามิกทำมือ กลิ่นไม้ฮิโนกิผสานสนซีดาร์และชาขาว ให้ความสงบ ผ่อนคลาย',
    rating: 4.9,
    reviewsCount: 114,
  },
];
