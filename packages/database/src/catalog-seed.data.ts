// ====================================================
// @repo/database — Catalog Master Seed Data
// ====================================================
// 21 Predefined Products with rich variants, categories, and inventory

export const CATEGORIES_SEED_DATA = [
  {
    "name": "Women Apparel",
    "nameTh": "เสื้อผ้าสตรี",
    "slug": "women-apparel",
    "department": "WOMEN",
    "displayOrder": 1
  },
  {
    "name": "Men Apparel",
    "nameTh": "เสื้อผ้าบุรุษ",
    "slug": "men-apparel",
    "department": "MEN",
    "displayOrder": 2
  },
  {
    "name": "Kids Collection",
    "nameTh": "เสื้อผ้าเด็ก",
    "slug": "kids-apparel",
    "department": "KIDS",
    "displayOrder": 3
  },
  {
    "name": "Classic Bags",
    "nameTh": "กระเป๋าและเครื่องหนัง",
    "slug": "bags-accessories",
    "department": "BAGS",
    "displayOrder": 4
  },
  {
    "name": "Footwear & Shoes",
    "nameTh": "รองเท้าพรีเมียม",
    "slug": "footwear-shoes",
    "department": "SHOES",
    "displayOrder": 5
  },
  {
    "name": "Accessories",
    "nameTh": "เครื่องประดับและแอคเซสเซอรี่",
    "slug": "accessories",
    "department": "MEN",
    "displayOrder": 6
  },
  {
    "name": "Home & Living",
    "nameTh": "ของแต่งบ้านและเครื่องหอม",
    "slug": "home-living",
    "department": "HOME",
    "displayOrder": 7
  },
  {
    "name": "Sweaters & Knits",
    "nameTh": "สเวตเตอร์และเสื้อไหมพรม",
    "slug": "women-sweaters-knits",
    "department": "WOMEN",
    "parentSlug": "women-apparel",
    "displayOrder": 10
  },
  {
    "name": "Coats & Jackets",
    "nameTh": "เสื้อโค้ทและแจ็คเก็ต",
    "slug": "women-coats-jackets",
    "department": "WOMEN",
    "parentSlug": "women-apparel",
    "displayOrder": 11
  },
  {
    "name": "Shirts & Tops",
    "nameTh": "เสื้อเชิ้ตและเสื้อท็อป",
    "slug": "women-shirts-tops",
    "department": "WOMEN",
    "parentSlug": "women-apparel",
    "displayOrder": 12
  },
  {
    "name": "Dresses",
    "nameTh": "เดรสและชุดกระโปรง",
    "slug": "women-dresses",
    "department": "WOMEN",
    "parentSlug": "women-apparel",
    "displayOrder": 13
  },
  {
    "name": "Denim & Pants",
    "nameTh": "เดนิมและกางเกงขายาว",
    "slug": "women-denim-pants",
    "department": "WOMEN",
    "parentSlug": "women-apparel",
    "displayOrder": 14
  },
  {
    "name": "Polos & T-Shirts",
    "nameTh": "เสื้อโปโลและเสื้อยืด",
    "slug": "men-polos-tshirts",
    "department": "MEN",
    "parentSlug": "men-apparel",
    "displayOrder": 20
  },
  {
    "name": "Coats & Jackets",
    "nameTh": "เสื้อโค้ทและแจ็คเก็ต",
    "slug": "men-coats-jackets",
    "department": "MEN",
    "parentSlug": "men-apparel",
    "displayOrder": 21
  },
  {
    "name": "Pants & Shorts",
    "nameTh": "กางเกงขายาวและขาสั้น",
    "slug": "men-pants-shorts",
    "department": "MEN",
    "parentSlug": "men-apparel",
    "displayOrder": 22
  },
  {
    "name": "Polos & Tees",
    "nameTh": "เสื้อโปโลและเสื้อยืดเด็ก",
    "slug": "kids-polos-tees",
    "department": "KIDS",
    "parentSlug": "kids-apparel",
    "displayOrder": 30
  },
  {
    "name": "Outerwear",
    "nameTh": "เสื้อคลุมและแจ็คเก็ตเด็ก",
    "slug": "kids-outerwear",
    "department": "KIDS",
    "parentSlug": "kids-apparel",
    "displayOrder": 31
  },
  {
    "name": "Crossbody Bags",
    "nameTh": "กระเป๋าสะพายข้าง",
    "slug": "bags-crossbody",
    "department": "BAGS",
    "parentSlug": "bags-accessories",
    "displayOrder": 40
  },
  {
    "name": "Travel & Duffles",
    "nameTh": "กระเป๋าเดินทางและดัฟเฟิล",
    "slug": "bags-travel-duffles",
    "department": "BAGS",
    "parentSlug": "bags-accessories",
    "displayOrder": 41
  },
  {
    "name": "Wallets & Cardholders",
    "nameTh": "กระเป๋าสตางค์และที่ใส่บัตร",
    "slug": "bags-wallets-cardholders",
    "department": "BAGS",
    "parentSlug": "bags-accessories",
    "displayOrder": 42
  },
  {
    "name": "Sneakers",
    "nameTh": "รองเท้าสนีกเกอร์",
    "slug": "shoes-sneakers",
    "department": "SHOES",
    "parentSlug": "footwear-shoes",
    "displayOrder": 50
  },
  {
    "name": "Dress Shoes",
    "nameTh": "รองเท้าหนังทางการ",
    "slug": "shoes-dress-shoes",
    "department": "SHOES",
    "parentSlug": "footwear-shoes",
    "displayOrder": 51
  },
  {
    "name": "Hats & Caps",
    "nameTh": "หมวกและหมวกแก๊ป",
    "slug": "accessories-hats-caps",
    "department": "MEN",
    "parentSlug": "accessories",
    "displayOrder": 60
  },
  {
    "name": "Belts",
    "nameTh": "เข็มขัด",
    "slug": "accessories-belts",
    "department": "MEN",
    "parentSlug": "accessories",
    "displayOrder": 61
  },
  {
    "name": "Bath & Bedding",
    "nameTh": "เครื่องนอนและห้องน้ำ",
    "slug": "home-bath-bedding",
    "department": "HOME",
    "parentSlug": "home-living",
    "displayOrder": 70
  },
  {
    "name": "Home Fragrance",
    "nameTh": "เครื่องหอมและตกแต่งบ้าน",
    "slug": "home-fragrance",
    "department": "HOME",
    "parentSlug": "home-living",
    "displayOrder": 71
  }
];

export const PRODUCTS_SEED_DATA = [
  {
    "name": "Iconic Cable-Knit Crewneck Sweater",
    "nameTh": "สเวตเตอร์ไหมพรมถักลายเคเบิล ซิกเนเจอร์",
    "slug": "iconic-cable-knit-crewneck-sweater",
    "description": "Iconic cable-knit crewneck sweater crafted from premium sustainable wool blend. Delivers timeless collegiate elegance and cozy warmth.",
    "descriptionTh": "สเวตเตอร์ไหมพรมถักลายเคเบิลระดับไอคอนิก ทอจากผ้าวูลผสมออร์แกนิกสัมผัสนุ่มละมุน มอบความอบอุ่นและความภูมิฐานสไตล์ Preppy",
    "materialsCare": "100% Fine Merino Wool. Dry clean or hand wash cold.",
    "materialsCareTh": "ผ้าวูลเมอริโน 100%. แนะนำซักแห้งหรือซักมือด้วยน้ำเย็น",
    "basePrice": 129,
    "originalPrice": 179,
    "tag": "BESTSELLER",
    "tagTh": "สินค้าขายดี",
    "categorySlug": "women-sweaters-knits",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-W1-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-FFF-S",
        "size": "S",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-FFF-M",
        "size": "M",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-FFF-L",
        "size": "L",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-F59-S",
        "size": "S",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-F59-M",
        "size": "M",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-F59-L",
        "size": "L",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-D4C-S",
        "size": "S",
        "color": "Oatmeal Beige",
        "colorTh": "เบจอ็อตมีล",
        "hex": "#D4C3B3",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-D4C-M",
        "size": "M",
        "color": "Oatmeal Beige",
        "colorTh": "เบจอ็อตมีล",
        "hex": "#D4C3B3",
        "stock": 30,
        "weight": 400
      },
      {
        "sku": "NIDA-W1-D4C-L",
        "size": "L",
        "color": "Oatmeal Beige",
        "colorTh": "เบจอ็อตมีล",
        "hex": "#D4C3B3",
        "stock": 30,
        "weight": 400
      }
    ]
  },
  {
    "name": "Heritage Double-Breasted Trench Coat",
    "nameTh": "เสื้อโค้ทเทรนช์ ดับเบิลเบรสต์ เฮอริเทจ",
    "slug": "heritage-double-breasted-trench-coat",
    "description": "Double-breasted trench coat with tailored architectural lines, weather-resistant cotton twill, and horn button accents.",
    "descriptionTh": "เสื้อโค้ททรงกระดุมสองแถว คัตติ้งเนี้ยบ ปกป้องจากลมหนาวและละอองฝนด้วยผ้าคอตตอนทวิลกันน้ำเกรดพรีเมียม",
    "materialsCare": "Cotton gabardine with water-repellent finish. Professional dry clean.",
    "materialsCareTh": "ผ้าคอตตอนกาบาร์ดีนเคลือบกันละอองน้ำ แนะนำซักแห้งโดยผู้เชี่ยวชาญ",
    "basePrice": 289,
    "originalPrice": 380,
    "tag": "NEW ARRIVAL",
    "tagTh": "สินค้ามาใหม่",
    "categorySlug": "women-coats-jackets",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-W2-D4B-S",
        "size": "S",
        "color": "Classic Beige",
        "colorTh": "เบจคลาสสิก",
        "hex": "#D4B996",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-W2-D4B-M",
        "size": "M",
        "color": "Classic Beige",
        "colorTh": "เบจคลาสสิก",
        "hex": "#D4B996",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-W2-D4B-L",
        "size": "L",
        "color": "Classic Beige",
        "colorTh": "เบจคลาสสิก",
        "hex": "#D4B996",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-W2-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-W2-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-W2-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-W2-1F2-S",
        "size": "S",
        "color": "Charcoal Grey",
        "colorTh": "เทาชาร์โคล",
        "hex": "#1F2937",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-W2-1F2-M",
        "size": "M",
        "color": "Charcoal Grey",
        "colorTh": "เทาชาร์โคล",
        "hex": "#1F2937",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-W2-1F2-L",
        "size": "L",
        "color": "Charcoal Grey",
        "colorTh": "เทาชาร์โคล",
        "hex": "#1F2937",
        "stock": 30,
        "weight": 850
      }
    ]
  },
  {
    "name": "Classic Tailored Oxford Shirt",
    "nameTh": "เสื้อเชิ้ตผ้าอ็อกซ์ฟอร์ดทรงคลาสสิก",
    "slug": "classic-tailored-oxford-shirt",
    "description": "Pure combed cotton Oxford cloth button-down with authentic mother-of-pearl buttons and relaxed tailored cut.",
    "descriptionTh": "เสื้อเชิ้ตผ้าอ็อกซ์ฟอร์ดทอพิเศษ ทรงพอดีตัวสวมใส่สบาย เหมาะสำหรับทั้งวันทำงานและลุคลำลอง",
    "materialsCare": "100% Organic Combed Cotton. Machine wash cold with like colors.",
    "materialsCareTh": "ผ้าฝ้ายออร์แกนิกหวี 100%. ซักเครื่องด้วยน้ำเย็นร่วมกับผ้าสีใกล้เคียง",
    "basePrice": 89,
    "originalPrice": 119,
    "tag": "CLASSIC",
    "tagTh": "คลาสสิกยอดนิยม",
    "categorySlug": "women-shirts-tops",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-W3-FFF-S",
        "size": "S",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-W3-FFF-M",
        "size": "M",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-W3-FFF-L",
        "size": "L",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-W3-FEF-S",
        "size": "S",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#FEF08A",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-W3-FEF-M",
        "size": "M",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#FEF08A",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-W3-FEF-L",
        "size": "L",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#FEF08A",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-W3-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-W3-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-W3-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 220
      }
    ]
  },
  {
    "name": "Pleated Varsity Tennis Skort Dress",
    "nameTh": "เดรสกระโปรงเทนนิสพลีต สไตล์วาร์ซิตี้",
    "slug": "pleated-varsity-tennis-skort-dress",
    "description": "Varsity tennis skort dress featuring sharp pleats, moisture-wicking stretch knit, and built-in shorts for effortless movement.",
    "descriptionTh": "เดรสพลีตสไตล์สปอร์ตวาร์ซิตี้พร้อมกางเกงซับใน มอบความคล่องตัวและเสน่ห์ความสดใสสไตล์โมเดิร์นคลาสสิก",
    "materialsCare": "Premium materials. Follow garment care tag instructions.",
    "materialsCareTh": "วัสดุคุณภาพสูง ปฏิบัติตามคำแนะนำบนป้ายดูแลรักษา",
    "basePrice": 115,
    "originalPrice": 150,
    "tag": "TRENDING",
    "tagTh": "กำลังเป็นที่นิยม",
    "categorySlug": "women-dresses",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-W4-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-W4-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-W4-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-W4-FFF-S",
        "size": "S",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-W4-FFF-M",
        "size": "M",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-W4-FFF-L",
        "size": "L",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-W4-F59-S",
        "size": "S",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-W4-F59-M",
        "size": "M",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-W4-F59-L",
        "size": "L",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 300
      }
    ]
  },
  {
    "name": "High-Rise Straight Vintage Denim",
    "nameTh": "กางเกงยีนส์เอวสูงทรงตรง วินเทจเดนิม",
    "slug": "high-rise-straight-vintage-denim",
    "description": "High-rise straight leg vintage denim woven with rigid sustainable cotton for an authentic heirloom break-in.",
    "descriptionTh": "กางเกงยีนส์ทรงขากระบอกตรงเอวสูง ผลิตจากผ้าเดนิมคอตตอนแท้ 100% สไตล์เรโทรที่คงทนตลอดกาล",
    "materialsCare": "98% Cotton, 2% Elastane. Wash inside out in cold water.",
    "materialsCareTh": "คอตตอน 98%, อีลาสเทน 2%. กลับด้านซักด้วยน้ำเย็น",
    "basePrice": 135,
    "originalPrice": 165,
    "tag": "EXTRA 20% OFF",
    "tagTh": "ลดเพิ่ม 20%",
    "categorySlug": "women-denim-pants",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-W5-D97-S",
        "size": "S",
        "color": "Khaki Tan",
        "colorTh": "กากีแทน",
        "hex": "#D97706",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-W5-D97-M",
        "size": "M",
        "color": "Khaki Tan",
        "colorTh": "กากีแทน",
        "hex": "#D97706",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-W5-D97-L",
        "size": "L",
        "color": "Khaki Tan",
        "colorTh": "กากีแทน",
        "hex": "#D97706",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-W5-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-W5-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-W5-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-W5-111-S",
        "size": "S",
        "color": "Noir Black",
        "colorTh": "ดำนัวร์",
        "hex": "#111827",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-W5-111-M",
        "size": "M",
        "color": "Noir Black",
        "colorTh": "ดำนัวร์",
        "hex": "#111827",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-W5-111-L",
        "size": "L",
        "color": "Noir Black",
        "colorTh": "ดำนัวร์",
        "hex": "#111827",
        "stock": 30,
        "weight": 500
      }
    ]
  },
  {
    "name": "Signature Slim Fit Pique Polo",
    "nameTh": "เสื้อโปโลผ้าปิเก้ ซิกเนเจอร์ สลิมฟิต",
    "slug": "signature-slim-fit-pique-polo",
    "description": "Breathable combed cotton pique polo with tailored collar and embroidered signature tri-color flag emblem.",
    "descriptionTh": "เสื้อโปโลผ้าปิเก้คอตตอนแท้ นุ่มระบายอากาศดีเยี่ยม ปักแถบสามสีสัญลักษณ์ Nida เอกลักษณ์ของความภูมิฐาน",
    "materialsCare": "100% Organic Combed Cotton. Machine wash cold with like colors.",
    "materialsCareTh": "ผ้าฝ้ายออร์แกนิกหวี 100%. ซักเครื่องด้วยน้ำเย็นร่วมกับผ้าสีใกล้เคียง",
    "basePrice": 79,
    "originalPrice": 98,
    "tag": "HERITAGE",
    "tagTh": "เฮอริเทจไอคอน",
    "categorySlug": "men-polos-tshirts",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1625910513413-568b209a3c03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-M1-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-F59-S",
        "size": "S",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-F59-M",
        "size": "M",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-F59-L",
        "size": "L",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-FFF-S",
        "size": "S",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-FFF-M",
        "size": "M",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-FFF-L",
        "size": "L",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-1E1-S",
        "size": "S",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1E110A",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-1E1-M",
        "size": "M",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1E110A",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-M1-1E1-L",
        "size": "L",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1E110A",
        "stock": 30,
        "weight": 220
      }
    ]
  },
  {
    "name": "Colorblock Sailing Windbreaker Jacket",
    "nameTh": "แจ็คเก็ตวินด์เบรกเกอร์ เซลลิ่ง คัลเลอร์บล็อก",
    "slug": "colorblock-sailing-windbreaker-jacket",
    "description": "Colorblocked sailing jacket engineered with weather-shield nylon, packable hood, and heritage color palette.",
    "descriptionTh": "แจ็คเก็ตกันลมสไตล์กะลาสีเรือบล็อกสีน้ำตาล-ขาว-มัสตาร์ด กันละอองน้ำ น้ำหนักเบา คล่องตัวในทุกการเดินทาง",
    "materialsCare": "Cotton gabardine with water-repellent finish. Professional dry clean.",
    "materialsCareTh": "ผ้าคอตตอนกาบาร์ดีนเคลือบกันละอองน้ำ แนะนำซักแห้งโดยผู้เชี่ยวชาญ",
    "basePrice": 195,
    "originalPrice": 249,
    "tag": "POPULAR",
    "tagTh": "ยอดนิยม",
    "categorySlug": "men-coats-jackets",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-M2-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M2-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M2-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M2-F59-S",
        "size": "S",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M2-F59-M",
        "size": "M",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M2-F59-L",
        "size": "L",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M2-FFF-S",
        "size": "S",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M2-FFF-M",
        "size": "M",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M2-FFF-L",
        "size": "L",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 850
      }
    ]
  },
  {
    "name": "Essential Cotton Twill Chino Trousers",
    "nameTh": "กางเกงชิโน่ผ้าคอตตอนทวิล เอสเซนเชียล",
    "slug": "essential-cotton-twill-chino-trousers",
    "description": "Tailored flat-front chinos crafted from brushed cotton twill with subtle stretch for effortless daily refinement.",
    "descriptionTh": "กางเกงชิโน่คัตติ้งเนี้ยบ ตัดเย็บจากผ้าคอตตอนทวิลสัมผัสนุ่ม ยืดหยุ่นเล็กน้อยเพื่อความสบายตลอดวัน",
    "materialsCare": "98% Cotton, 2% Elastane. Wash inside out in cold water.",
    "materialsCareTh": "คอตตอน 98%, อีลาสเทน 2%. กลับด้านซักด้วยน้ำเย็น",
    "basePrice": 99,
    "originalPrice": 130,
    "tag": "ESSENTIAL",
    "tagTh": "ไอเทมประจำตู้",
    "categorySlug": "men-pants-shorts",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-M3-D2B-S",
        "size": "S",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#D2B48C",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-M3-D2B-M",
        "size": "M",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#D2B48C",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-M3-D2B-L",
        "size": "L",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#D2B48C",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-M3-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-M3-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-M3-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-M3-4B5-S",
        "size": "S",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#4B5563",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-M3-4B5-M",
        "size": "M",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#4B5563",
        "stock": 30,
        "weight": 500
      },
      {
        "sku": "NIDA-M3-4B5-L",
        "size": "L",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#4B5563",
        "stock": 30,
        "weight": 500
      }
    ]
  },
  {
    "name": "Wool Blend Varsity Letterman Bomber",
    "nameTh": "เสื้อแจ็คเก็ตบอมเบอร์ เลตเตอร์แมน วูลเบลนด์",
    "slug": "wool-blend-varsity-letterman-bomber",
    "description": "Heavyweight Melton wool varsity jacket with supple leather sleeves and custom collegiate ribbing.",
    "descriptionTh": "แจ็คเก็ตบอมเบอร์สไตล์นักศึกษาสหรัฐฯ ผ้าขนสัตว์ผสมหนังแท้ เดินด้ายประณีตทุกจุด สัญลักษณ์แห่งความสำเร็จ",
    "materialsCare": "Cotton gabardine with water-repellent finish. Professional dry clean.",
    "materialsCareTh": "ผ้าคอตตอนกาบาร์ดีนเคลือบกันละอองน้ำ แนะนำซักแห้งโดยผู้เชี่ยวชาญ",
    "basePrice": 260,
    "originalPrice": 340,
    "tag": "LIMITED EDITION",
    "tagTh": "รุ่นลิมิเต็ด",
    "categorySlug": "men-coats-jackets",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-M4-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M4-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M4-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M4-F59-S",
        "size": "S",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M4-F59-M",
        "size": "M",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 850
      },
      {
        "sku": "NIDA-M4-F59-L",
        "size": "L",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 850
      }
    ]
  },
  {
    "name": "Kids Classic Logo Pique Polo",
    "nameTh": "เสื้อโปโลเด็ก ผ้าปิเก้ โลโก้คลาสสิก",
    "slug": "kids-classic-logo-pique-polo",
    "description": "Super-soft 100% organic cotton pique polo crafted for active days, everyday play, and durable comfort.",
    "descriptionTh": "เสื้อโปโลเด็กสัมผัสนุ่ม อ่อนโยนต่อผิว ระบายอากาศได้ดี ทนทานต่อการซัก เหมาะสำหรับวัยเรียนรู้",
    "materialsCare": "100% Organic Combed Cotton. Machine wash cold with like colors.",
    "materialsCareTh": "ผ้าฝ้ายออร์แกนิกหวี 100%. ซักเครื่องด้วยน้ำเย็นร่วมกับผ้าสีใกล้เคียง",
    "basePrice": 49,
    "originalPrice": 65,
    "tag": "KIDS FAVORITE",
    "tagTh": "ขวัญใจเด็กๆ",
    "categorySlug": "kids-polos-tees",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-K1-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-K1-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-K1-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-K1-F59-S",
        "size": "S",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-K1-F59-M",
        "size": "M",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-K1-F59-L",
        "size": "L",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-K1-FFF-S",
        "size": "S",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-K1-FFF-M",
        "size": "M",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 220
      },
      {
        "sku": "NIDA-K1-FFF-L",
        "size": "L",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 220
      }
    ]
  },
  {
    "name": "Kids Hooded Colorblock Zip Windbreaker",
    "nameTh": "เสื้อแจ็คเก็ตกันลมมีฮู้ด ซิปหน้า คัลเลอร์บล็อกเด็ก",
    "slug": "kids-hooded-colorblock-zip-windbreaker",
    "description": "Lightweight weather-resistant windbreaker featuring an ergonomic hood and playful retro colorblocking.",
    "descriptionTh": "เสื้อคลุมกันลมเด็กพร้อมหมวกฮู้ด น้ำหนักเบา ป้องกันละอองฝนและลมหนาว สดใสด้วยบล็อกสีอันเป็นเอกลักษณ์",
    "materialsCare": "Premium materials. Follow garment care tag instructions.",
    "materialsCareTh": "วัสดุคุณภาพสูง ปฏิบัติตามคำแนะนำบนป้ายดูแลรักษา",
    "basePrice": 75,
    "originalPrice": 95,
    "tag": "NEW",
    "tagTh": "มาใหม่",
    "categorySlug": "kids-outerwear",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1503944547408-b6559a445e0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-K2-2B1-S",
        "size": "S",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-K2-2B1-M",
        "size": "M",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-K2-2B1-L",
        "size": "L",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-K2-F59-S",
        "size": "S",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-K2-F59-M",
        "size": "M",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-K2-F59-L",
        "size": "L",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-K2-FEF-S",
        "size": "S",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#FEF08A",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-K2-FEF-M",
        "size": "M",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#FEF08A",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-K2-FEF-L",
        "size": "L",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#FEF08A",
        "stock": 30,
        "weight": 300
      }
    ]
  },
  {
    "name": "Signature Stripe Leather Crossbody Bag",
    "nameTh": "กระเป๋าสะพายข้างหนังแท้ แถบซิกเนเจอร์",
    "slug": "signature-stripe-leather-crossbody-bag",
    "description": "Full-grain pebble leather crossbody bag featuring our signature tri-color ribbon strap and custom brushed brass hardware.",
    "descriptionTh": "กระเป๋าสะพายข้างหนังเกรนแท้เนื้อละเอียด ตกแต่งแถบริบบิ้น 3 สีพร้อมอะไหล่ทองเหลืองรมดำ ทรงสวยทนทาน",
    "materialsCare": "100% Full-Grain Calfskin Leather. Clean with soft dry cloth and leather conditioner.",
    "materialsCareTh": "หนังวัวแท้ฟูลเกรน 100%. ทำความสะอาดด้วยผ้านุ่มแห้งและน้ำยาบำรุงหนังแท้",
    "basePrice": 145,
    "originalPrice": 195,
    "tag": "BESTSELLER",
    "tagTh": "สินค้าขายดี",
    "categorySlug": "bags-crossbody",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-B1-2B1-OS",
        "size": "One Size",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 600
      },
      {
        "sku": "NIDA-B1-F59-OS",
        "size": "One Size",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 600
      },
      {
        "sku": "NIDA-B1-D4B-OS",
        "size": "One Size",
        "color": "Classic Beige",
        "colorTh": "เบจคลาสสิก",
        "hex": "#D4B996",
        "stock": 30,
        "weight": 600
      }
    ]
  },
  {
    "name": "Heritage Heavy Canvas Weekender Duffle",
    "nameTh": "กระเป๋าเดินทางดัฟเฟิลผ้าแคนวาสหนาพิเศษ เฮอริเทจ",
    "slug": "heritage-heavy-canvas-weekender-duffle",
    "description": "Durable 18oz waxed cotton canvas duffle reinforced with saddle leather handles and spacious interior compartments.",
    "descriptionTh": "กระเป๋าเดินทางวีคเอนเดอร์ จุสัมภาระได้ครบครัน ผลิตจากผ้าแคนวาสคอตตอนหนาพิเศษแต่งขอบหนังแท้",
    "materialsCare": "Premium materials. Follow garment care tag instructions.",
    "materialsCareTh": "วัสดุคุณภาพสูง ปฏิบัติตามคำแนะนำบนป้ายดูแลรักษา",
    "basePrice": 185,
    "originalPrice": 240,
    "tag": "TRAVEL PICK",
    "tagTh": "แนะนำสำหรับการเดินทาง",
    "categorySlug": "bags-travel-duffles",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-B2-2B1-OS",
        "size": "One Size",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-B2-D4B-OS",
        "size": "One Size",
        "color": "Classic Beige",
        "colorTh": "เบจคลาสสิก",
        "hex": "#D4B996",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-B2-1C1-OS",
        "size": "One Size",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1C1917",
        "stock": 30,
        "weight": 300
      }
    ]
  },
  {
    "name": "Polished Pebble Leather Zip Wallet",
    "nameTh": "กระเป๋าสตางค์ซิปรอบ หนังเพบเบิลขัดเงา",
    "slug": "polished-pebble-leather-zip-wallet",
    "description": "Compact zip-around wallet constructed from scratch-resistant pebbled leather with 8 card slots and coin pocket.",
    "descriptionTh": "กระเป๋าสตางค์ซิปรอบหนังแท้ ช่องใส่บัตรและธนบัตรครบครัน ขนาดกะทัดรัดพกพาสะดวก ทนทานต่อรอยขีดข่วน",
    "materialsCare": "100% Full-Grain Calfskin Leather. Clean with soft dry cloth and leather conditioner.",
    "materialsCareTh": "หนังวัวแท้ฟูลเกรน 100%. ทำความสะอาดด้วยผ้านุ่มแห้งและน้ำยาบำรุงหนังแท้",
    "basePrice": 65,
    "originalPrice": 85,
    "tag": "CLASSIC",
    "tagTh": "คลาสสิก",
    "categorySlug": "bags-wallets-cardholders",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-B3-2B1-OS",
        "size": "One Size",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 150
      },
      {
        "sku": "NIDA-B3-F59-OS",
        "size": "One Size",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 150
      },
      {
        "sku": "NIDA-B3-1E1-OS",
        "size": "One Size",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1E110A",
        "stock": 30,
        "weight": 150
      }
    ]
  },
  {
    "name": "Court Heritage Low-Top Leather Sneakers",
    "nameTh": "รองเท้าสนีกเกอร์หนังแท้ ทรงคอร์ทโลว์ท็อป เฮอริเทจ",
    "slug": "court-heritage-low-top-leather-sneakers",
    "description": "Retro court sneaker constructed from supple Italian calfskin leather with cushioned OrthoLite insole for all-day comfort.",
    "descriptionTh": "สนีกเกอร์หนังแท้ทรงคอร์ทเทนนิสเรโทร พื้นรองเท้าซัพพอร์ตอุ้งเท้า นุ่มเบาสบายทุกก้าวเดิน",
    "materialsCare": "Premium calf leather and natural rubber sole. Wipe clean with damp cloth.",
    "materialsCareTh": "หนังวัวพรีเมียมและพื้นยางธรรมชาติ เช็ดทำความสะอาดด้วยผ้าชุบน้ำหมาด",
    "basePrice": 110,
    "originalPrice": 140,
    "tag": "TRENDING",
    "tagTh": "กำลังเป็นที่นิยม",
    "categorySlug": "shoes-sneakers",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-S1-FFF-US8",
        "size": "US 8",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-FFF-US9",
        "size": "US 9",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-FFF-US10",
        "size": "US 10",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-FFF-US11",
        "size": "US 11",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-2B1-US8",
        "size": "US 8",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-2B1-US9",
        "size": "US 9",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-2B1-US10",
        "size": "US 10",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-2B1-US11",
        "size": "US 11",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-F59-US8",
        "size": "US 8",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-F59-US9",
        "size": "US 9",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-F59-US10",
        "size": "US 10",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S1-F59-US11",
        "size": "US 11",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 750
      }
    ]
  },
  {
    "name": "Classic Handcrafted Leather Loafers",
    "nameTh": "รองเท้าโลฟเฟอร์หนังแท้แฮนด์คราฟต์ ทรงคลาสสิก",
    "slug": "classic-handcrafted-leather-loafers",
    "description": "Artisan hand-stitched penny loafers crafted from burnished box calf leather with Goodyear-welted leather soles.",
    "descriptionTh": "รองเท้าเพนนีโลฟเฟอร์ตัดเย็บด้วยมือแบบดั้งเดิม หนังเงางาม พื้นเย็บกู๊ดเยียร์เวลต์ ทนทานยาวนานนับสิบปี",
    "materialsCare": "Premium calf leather and natural rubber sole. Wipe clean with damp cloth.",
    "materialsCareTh": "หนังวัวพรีเมียมและพื้นยางธรรมชาติ เช็ดทำความสะอาดด้วยผ้าชุบน้ำหมาด",
    "basePrice": 185,
    "originalPrice": 235,
    "tag": "HANDCRAFTED",
    "tagTh": "งานฝีมือประณีต",
    "categorySlug": "shoes-dress-shoes",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1608256246200-53e65389ea8ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-S2-2B1-US8",
        "size": "US 8",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-2B1-US9",
        "size": "US 9",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-2B1-US10",
        "size": "US 10",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-2B1-US11",
        "size": "US 11",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-451-US8",
        "size": "US 8",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#451A03",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-451-US9",
        "size": "US 9",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#451A03",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-451-US10",
        "size": "US 10",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#451A03",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-451-US11",
        "size": "US 11",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#451A03",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-1E1-US8",
        "size": "US 8",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1E110A",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-1E1-US9",
        "size": "US 9",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1E110A",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-1E1-US10",
        "size": "US 10",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1E110A",
        "stock": 30,
        "weight": 750
      },
      {
        "sku": "NIDA-S2-1E1-US11",
        "size": "US 11",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1E110A",
        "stock": 30,
        "weight": 750
      }
    ]
  },
  {
    "name": "Washed Twill Collegiate Logo Cap",
    "nameTh": "หมวกแก๊ปผ้าทวิลฟอก โลโก้วาร์ซิตี้",
    "slug": "washed-twill-collegiate-logo-cap",
    "description": "Pre-washed six-panel baseball cap embroidered with collegiate Nida monogram and adjustable leather strap.",
    "descriptionTh": "หมวกแก๊ปผ้าคอตตอนทวิลฟอกนุ่ม ปักโลโก้ Nida อักษรนูน สายรัดปรับขนาดด้านหลังเป็นหนังแท้",
    "materialsCare": "Premium materials. Follow garment care tag instructions.",
    "materialsCareTh": "วัสดุคุณภาพสูง ปฏิบัติตามคำแนะนำบนป้ายดูแลรักษา",
    "basePrice": 39,
    "originalPrice": 48,
    "tag": "DAILY PICK",
    "tagTh": "ไอเทมประจำวัน",
    "categorySlug": "accessories-hats-caps",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-A1-2B1-OS",
        "size": "One Size",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 120
      },
      {
        "sku": "NIDA-A1-F59-OS",
        "size": "One Size",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 120
      },
      {
        "sku": "NIDA-A1-FFF-OS",
        "size": "One Size",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 120
      },
      {
        "sku": "NIDA-A1-D4B-OS",
        "size": "One Size",
        "color": "Classic Beige",
        "colorTh": "เบจคลาสสิก",
        "hex": "#D4B996",
        "stock": 30,
        "weight": 120
      }
    ]
  },
  {
    "name": "Heritage Reversible Leather Dress Belt",
    "nameTh": "เข็มขัดหนังแท้ใส่ได้สองด้าน เฮอริเทจ",
    "slug": "heritage-reversible-leather-dress-belt",
    "description": "Reversible fine bridle leather belt offering dark espresso brown on one side and midnight black on the other with swivel buckle.",
    "descriptionTh": "เข็มขัดหนังแท้พรีเมียม สลับใส่ได้ทั้งด้านสีน้ำตาลและสีดำ หัวเข็มขัดทองเหลืองขัดเงาหมุนได้ 360 องศา",
    "materialsCare": "100% Full-Grain Calfskin Leather. Clean with soft dry cloth and leather conditioner.",
    "materialsCareTh": "หนังวัวแท้ฟูลเกรน 100%. ทำความสะอาดด้วยผ้านุ่มแห้งและน้ำยาบำรุงหนังแท้",
    "basePrice": 55,
    "originalPrice": 70,
    "tag": "VERSATILE",
    "tagTh": "อเนกประสงค์",
    "categorySlug": "accessories-belts",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-A2-2B1-OS",
        "size": "One Size",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 180
      },
      {
        "sku": "NIDA-A2-1E1-OS",
        "size": "One Size",
        "color": "Classic Shade",
        "colorTh": "เฉดสีคลาสสิก",
        "hex": "#1E110A",
        "stock": 30,
        "weight": 180
      },
      {
        "sku": "NIDA-A2-783-OS",
        "size": "One Size",
        "color": "Saddle Brown",
        "colorTh": "น้ำตาลแซดเดิล",
        "hex": "#78350F",
        "stock": 30,
        "weight": 180
      }
    ]
  },
  {
    "name": "Signature Striped Organic Bath Towel Set",
    "nameTh": "เซ็ตผ้าขนหนูออร์แกนิก ลายทางซิกเนเจอร์",
    "slug": "signature-striped-organic-bath-towel-set",
    "description": "Plush 650 GSM Aegean organic cotton towel bundle featuring jacquard woven collegiate stripe border.",
    "descriptionTh": "เซ็ตผ้าขนหนูคอตตอนออร์แกนิก 100% ทอหนา 650 GSM ซับน้ำได้ดีเยี่ยม นุ่มละมุนผิว ไม่ระคายเคือง",
    "materialsCare": "100% Turkish Organic Cotton 600 GSM. Machine wash warm, tumble dry low.",
    "materialsCareTh": "ผ้าฝ้ายออร์แกนิกตุรกี 100% ความหนา 600 GSM. ซักเครื่องน้ำอุ่น อบแห้งความร้อนต่ำ",
    "basePrice": 68,
    "originalPrice": 90,
    "tag": "SUSTAINABLE",
    "tagTh": "ผลิตจากวัสดุรักษ์โลก",
    "categorySlug": "home-bath-bedding",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1583847268964-b28ce8f31161?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-H1-2B1-OS",
        "size": "One Size",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-H1-FFF-OS",
        "size": "One Size",
        "color": "Pure White",
        "colorTh": "ขาวบริสุทธิ์",
        "hex": "#FFFFFF",
        "stock": 30,
        "weight": 300
      },
      {
        "sku": "NIDA-H1-F59-OS",
        "size": "One Size",
        "color": "Imperial Gold",
        "colorTh": "ทองอิมพีเรียล",
        "hex": "#F59E0B",
        "stock": 30,
        "weight": 300
      }
    ]
  },
  {
    "name": "Artisan Ceramic Scented Candle - Hinoki Woods",
    "nameTh": "เทียนหอมกระถางเซรามิก กลิ่นไม้ฮิโนกิ",
    "slug": "artisan-ceramic-scented-candle-hinoki-woods",
    "description": "Hand-poured coconut soy candle in handmade ceramic vessel with essential oils of cypress, hinoki, and cedarwood.",
    "descriptionTh": "เทียนหอมไขถั่วเหลืองธรรมชาติ 100% บรรจุในกระถางเซรามิกทำมือ กลิ่นไม้ฮิโนกิผสานสนซีดาร์และชาขาว ให้ความสงบ ผ่อนคลาย",
    "materialsCare": "Natural soy wax with cotton wick and pure essential oils. Burn within sight.",
    "materialsCareTh": "ไขถั่วเหลืองธรรมชาติ ไส้เทียนผ้าฝ้าย และน้ำมันหอมระเหยบริสุทธิ์",
    "basePrice": 45,
    "originalPrice": 55,
    "tag": "TOP GIFT",
    "tagTh": "ของขวัญยอดนิยม",
    "categorySlug": "home-fragrance",
    "isPreorder": false,
    "images": [
      "https://images.unsplash.com/photo-1602921516766-3d3f9b2d978a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-H2-2B1-OS",
        "size": "One Size",
        "color": "Nida Espresso",
        "colorTh": "เอสเปรสโซ่ ซิกเนเจอร์",
        "hex": "#2B1810",
        "stock": 30,
        "weight": 300
      }
    ]
  },
  {
    "name": "Pre-Order: Limited Edition Cashmere Overcoat (Winter 2026)",
    "nameTh": "พรีออเดอร์: เสื้อโค้ทแคชเมียร์ ลิมิเต็ดเอดิชัน (วินเทอร์ 2026)",
    "slug": "preorder-limited-cashmere-overcoat",
    "description": "Exclusive artisanal overcoat crafted in limited quantities from Italian double-faced cashmere.",
    "descriptionTh": "เสื้อคลุมแคชเมียร์สั่งตัดพิเศษ ผลิตจำนวนจำกัดจากผ้าแคชเมียร์อิตาลีสองหน้าเกรดพรีเมียม",
    "materialsCare": "100% Italian Cashmere. Specialist dry clean.",
    "materialsCareTh": "ผ้าแคชเมียร์อิตาลี 100%. ซักแห้งโดยผู้เชี่ยวชาญเท่านั้น",
    "basePrice": 490,
    "originalPrice": 590,
    "tag": "PRE-ORDER",
    "tagTh": "เปิดพรีออเดอร์",
    "categorySlug": "men-coats-jackets",
    "isPreorder": true,
    "preorderReleaseDate": "2026-11-15T00:00:00.000Z",
    "preorderLimit": 50,
    "preorderDepositAmount": 100,
    "images": [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80"
    ],
    "variants": [
      {
        "sku": "NIDA-PRE-BLK-M",
        "size": "M",
        "color": "Noir Black",
        "colorTh": "ดำนัวร์",
        "hex": "#111827",
        "stock": 0,
        "weight": 1200
      },
      {
        "sku": "NIDA-PRE-BLK-L",
        "size": "L",
        "color": "Noir Black",
        "colorTh": "ดำนัวร์",
        "hex": "#111827",
        "stock": 0,
        "weight": 1250
      },
      {
        "sku": "NIDA-PRE-CML-M",
        "size": "M",
        "color": "Classic Beige",
        "colorTh": "เบจคลาสสิก",
        "hex": "#D4B996",
        "stock": 0,
        "weight": 1200
      },
      {
        "sku": "NIDA-PRE-CML-L",
        "size": "L",
        "color": "Classic Beige",
        "colorTh": "เบจคลาสสิก",
        "hex": "#D4B996",
        "stock": 0,
        "weight": 1250
      }
    ]
  }
];
