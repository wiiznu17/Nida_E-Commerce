import type { DepartmentMeta } from './collectionTypes';

export const DEPARTMENT_INFO: Record<string, DepartmentMeta> = {
  women: {
    title: "WOMEN'S COLLECTION",
    titleTh: 'คอลเลกชันสำหรับผู้หญิง',
    subtitle:
      'Classic prep meets modern relaxed tailoring. Sweaters, trench coats, shirts, and versatile denim.',
    subtitleTh:
      'สไตล์เพรปปี้คลาสสิกผสานโครงเสื้อผ่อนคลายร่วมสมัย สเวตเตอร์ไหมพรม เทรนช์โค้ท และยีนส์อเนกประสงค์',
    bannerTag: 'AUTUMN / WINTER 2026',
    bannerTagTh: 'ฤดูใบไม้ร่วง / หนาว 2026',
    bgImage:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  },
  men: {
    title: "MEN'S COLLECTION",
    titleTh: 'คอลเลกชันสำหรับผู้ชาย',
    subtitle:
      'Heritage American cool. Iconic pique polos, oxford shirts, varsity outerwear, and tailored chinos.',
    subtitleTh:
      'มรดกความเท่สไตล์อเมริกันคลาสสิก โปโลผ้าปิเก้ไอคอนิก เชิ้ตอ็อกซ์ฟอร์ด และชิโน่คัตติ้งเนี้ยบ',
    bannerTag: 'HERITAGE ICONS',
    bannerTagTh: 'เฮอริเทจไอคอน',
    bgImage:
      'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  },
  kids: {
    title: 'KIDS & MINI PREP',
    titleTh: 'คอลเลกชันเด็ก & มินิเพรป',
    subtitle:
      'Durable, comfortable, and vibrant clothing designed for young explorers and school days.',
    subtitleTh:
      'เสื้อผ้าที่ทนทาน สวมใส่สบาย สีสันสดใส ออกแบบเพื่อวัยแห่งการเรียนรู้และการเล่นสนุก',
    bannerTag: 'BACK TO SCHOOL',
    bannerTagTh: 'เปิดเทอมสดใส',
    bgImage:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  },
  bags: {
    title: 'BAGS & LEATHER ACCESSORIES',
    titleTh: 'กระเป๋าและเครื่องหนังพรีเมียม',
    subtitle:
      'Crafted with supple pebble leather, signature ribbon accents, and durable brass hardware.',
    subtitleTh:
      'รังสรรค์ด้วยหนังเกรนแท้เนื้อละเอียด สายริบบิ้นสามสีเอกลักษณ์ และอะไหล่ทองเหลืองสุดประณีต',
    bannerTag: 'LEATHER WORKSHOP',
    bannerTagTh: 'เวิร์กช็อปเครื่องหนัง',
    bgImage:
      'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  },
  shoes: {
    title: 'FOOTWEAR & SNEAKERS',
    titleTh: 'รองเท้าสนีกเกอร์และโลฟเฟอร์',
    subtitle:
      'Clean retro court silhouettes and handcrafted loafers made for cushioned everyday ease.',
    subtitleTh:
      'ทรงคอร์ทเทนนิสเรโทรสุดคลีน และรองเท้าโลฟเฟอร์งานฝีมือ พื้นรองรับน้ำหนักเพื่อความนุ่มสบายตลอดวัน',
    bannerTag: 'EVERYDAY PERFORMANCE',
    bannerTagTh: 'ความสบายในทุกวัน',
    bgImage:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  },
  home: {
    title: 'HOME & LIFESTYLE',
    titleTh: 'ของแต่งบ้านและไลฟ์สไตล์',
    subtitle:
      'Elevate your sanctuary with striped organic towels, hinoki wood candles, and artisan ceramics.',
    subtitleTh:
      'เติมเต็มความสงบในบ้านด้วยผ้าขนหนูออร์แกนิก เทียนหอมไม้ฮิโนกิ และเครื่องเคลือบดินเผางานช่างศิลป์',
    bannerTag: 'INTENTIONAL LIVING',
    bannerTagTh: 'วิถีชีวิตอย่างมีระดับ',
    bgImage:
      'https://images.unsplash.com/photo-1583847268964-b28ce8f31161?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  },
  sale: {
    title: 'SALE MARKDOWNS',
    titleTh: 'สินค้าลดราคาพิเศษ',
    subtitle:
      'Exclusive savings across past-season icons, premium outerwear, and lifestyle signatures.',
    subtitleTh:
      'ข้อเสนอสุดพิเศษสำหรับไอเทมไอคอนิก เสื้อกันหนาวพรีเมียม และสินค้าไลฟ์สไตล์ประจำฤดูกาล',
    bannerTag: 'UP TO 50% OFF',
    bannerTagTh: 'ลดสูงสุด 50%',
    bgImage:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  },
};

export const COLOR_PRESETS = [
  '#2B1810',
  '#FFFFFF',
  '#F59E0B',
  '#D4B996',
  '#111827',
  '#4B5563',
  '#78350F',
];
