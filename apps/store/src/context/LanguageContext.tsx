'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../data/products';

export type Language = 'th' | 'en';

type Translations = Record<string, { th: string; en: string }>;

export const translations: Translations = {
  // Navigation & Utility Header
  'nav.storeLocator': { th: 'ค้นหาสาขา', en: 'Store Locator' },
  'nav.about': { th: 'เกี่ยวกับแบรนด์ Nida', en: 'About Nida' },
  'nav.women': { th: 'ผู้หญิง', en: 'WOMEN' },
  'nav.men': { th: 'ผู้ชาย', en: 'MEN' },
  'nav.kids': { th: 'เด็ก', en: 'KIDS' },
  'nav.bags': { th: 'กระเป๋าและเครื่องหนัง', en: 'BAGS & ACCESSORIES' },
  'nav.shoes': { th: 'รองเท้า', en: 'SHOES' },
  'nav.home': { th: 'ของแต่งบ้านและไลฟ์สไตล์', en: 'HOME & LIFESTYLE' },
  'nav.sale': { th: 'ลดพิเศษ', en: 'SALE' },
  'nav.search': { th: 'ค้นหา', en: 'SEARCH' },
  'nav.account': { th: 'บัญชีของฉัน', en: 'My Account' },
  'nav.signIn': { th: 'เข้าสู่ระบบ', en: 'Sign In' },
  'nav.signOut': { th: 'ออกจากระบบ', en: 'Sign Out' },
  'nav.bag': { th: 'ถุงช้อปปิ้ง', en: 'BAG' },
  'nav.wishlist': { th: 'รายการที่ถูกใจ', en: 'Wishlist' },
  'nav.allProducts': { th: 'สินค้าทั้งหมด', en: 'All Products' },

  // Top Promo Bar
  'promo.limited': { th: 'จำกัดเวลา', en: 'LIMITED TIME' },
  'promo.saleTitle': {
    th: 'FALL SALE: ลดสูงสุด 50% + โค้ดลดเพิ่ม 20%: ',
    en: 'FALL SALE: UP TO 50% OFF + EXTRA 20% WITH CODE: ',
  },
  'promo.code': { th: 'NIDA20', en: 'NIDA20' },
  'promo.freeShipping': { th: '| ส่งฟรีเมื่อครบ $100', en: '| FREE SHIPPING OVER $100' },

  // Desktop Mega Menu
  'mega.featuredTrends': { th: 'เทรนด์และคอลเลกชันเด่น', en: 'Featured & Trends' },
  'mega.clothing': { th: 'เสื้อผ้า', en: 'Clothing' },
  'mega.shoesAccessories': { th: 'รองเท้าและเครื่องประดับ', en: 'Shoes & Accessories' },
  'mega.shopThisEdit': { th: 'เลือกชมคอลเลกชันนี้', en: 'SHOP THIS EDIT' },
  'mega.womenTag': { th: 'คอลเลกชันใหม่', en: 'NEW SEASON EDIT' },
  'mega.womenTitle': { th: "คอลเลกชันฤดูใบไม้ร่วงสำหรับผู้หญิง", en: "Women's Autumn Collection" },
  'mega.womenSubtitle': {
    th: 'สไตล์เพรปปี้ร่วมสมัย ทอด้วยผ้าวูลออร์แกนิกสัมผัสหรูหรา',
    en: 'Modern preppy silhouettes reimagined with luxe sustainable wools.',
  },
  'mega.menTag': { th: 'เฮอริเทจคลาสสิก', en: 'HERITAGE CLASSIC' },
  'mega.menTitle': { th: "เสื้อโปโลและสเวตเตอร์ไอคอนิกสำหรับผู้ชาย", en: "Men's Iconic Polos & Knits" },
  'mega.menSubtitle': {
    th: 'ผ้าปิเก้พรีเมียมและการตัดเย็บสไตล์วาร์ซิตี้เพื่อความภูมิฐานในทุกวัน',
    en: 'Premium pique and varsity tailoring built for everyday distinction.',
  },
  'mega.kidsTag': { th: 'มินิเพรป', en: 'MINI PREP' },
  'mega.kidsTitle': { th: 'คอลเลกชันคลาสสิกสำหรับเด็ก', en: 'Kids Classic Collection' },
  'mega.kidsSubtitle': {
    th: 'ดีไซน์สวมใส่สบาย ทนทาน ได้รับแรงบันดาลใจจากสไตล์ดั้งเดิม',
    en: 'Comfortable, durable designs inspired by our iconic heritage.',
  },
  'mega.bagsTag': { th: 'งานฝีมือประณีต', en: 'CRAFTSMANSHIP' },
  'mega.bagsTitle': { th: 'คอลเลกชันเครื่องหนังเฮอริเทจ', en: 'Heritage Leather Collection' },
  'mega.bagsSubtitle': {
    th: 'หนังเกรนแท้สัมผัสนุ่มจับคู่กับอะไหล่สั่งทำพิเศษ',
    en: 'Supple full-grain leather paired with custom palladium hardware.',
  },
  'mega.homeTag': { th: 'วิถีชีวิตอย่างมีระดับ', en: 'INTENTIONAL LIVING' },
  'mega.homeTitle': { th: 'ของตกแต่งและเครื่องใช้ในบ้าน Nida', en: 'Nida Home & Décor' },
  'mega.homeSubtitle': {
    th: 'ความสง่างามเรียบง่ายเพื่อพื้นที่พักผ่อนส่วนตัวของคุณ',
    en: 'Calm, architectural elegance for your personal sanctuary.',
  },
  'mega.saleTag': { th: 'ระยะเวลาจำกัด', en: 'LIMITED TIME ONLY' },
  'mega.saleTitle': { th: 'มหกรรมลดราคากลางฤดูกาล', en: 'Mid-Season Spectacular' },
  'mega.saleSubtitle': {
    th: 'ประหยัดสูงสุด 50% สำหรับสินค้าสไตล์คลาสสิก ส่งฟรีเมื่อช้อปครบ $100',
    en: 'Save up to 50% off timeless styles. Free shipping over $100.',
  },

  // Search Modal
  'search.placeholder': {
    th: 'ค้นหาสินค้าที่คุณต้องการ (เช่น สเวตเตอร์, เสื้อโปโล, โค้ท, กระเป๋าหนัง)...',
    en: 'What are you looking for? (e.g., Cable-Knit, Polo, Trench Coat, Leather Bag)...',
  },
  'search.trending': { th: 'คำค้นหายอดนิยม:', en: 'Trending:' },
  'search.matchingProducts': { th: 'สินค้าที่ตรงกัน', en: 'Matching Products' },
  'search.viewAll': { th: 'ดูผลการค้นหาทั้งหมด', en: 'View All Results' },
  'search.noResults': { th: 'ไม่พบสินค้าที่ตรงกับการค้นหา', en: 'No matching products found' },

  // Cart Drawer
  'cart.title': { th: 'ถุงช้อปปิ้งของคุณ', en: 'YOUR SHOPPING BAG' },
  'cart.freeShippingQualified': {
    th: 'ยินดีด้วย! คุณได้รับสิทธิ์จัดส่งฟรีมาตรฐาน',
    en: 'Congratulations! You qualify for FREE Standard Delivery.',
  },
  'cart.freeShippingAddMore': { th: 'ซื้อเพิ่มอีก $', en: 'Add $' },
  'cart.forFreeShipping': { th: ' เพื่อรับสิทธิ์ส่งฟรี', en: ' more for FREE SHIPPING' },
  'cart.emptyTitle': { th: 'ถุงช้อปปิ้งของคุณว่างเปล่า', en: 'YOUR BAG IS CURRENTLY EMPTY' },
  'cart.emptyDesc': {
    th: 'เลือกชมสินค้ามาใหม่และไอเทมคลาสสิกเพื่อเพิ่มลงในถุงของคุณ',
    en: 'Explore our new arrivals and iconic preppy essentials to fill your bag.',
  },
  'cart.startShopping': { th: 'เริ่มเลือกซื้อสินค้า', en: 'START SHOPPING' },
  'cart.subtotal': { th: 'ยอดรวมโดยประมาณ', en: 'ESTIMATED SUBTOTAL' },
  'cart.disclaimer': {
    th: 'ภาษีและค่าจัดส่งจะคำนวณในขั้นตอนชำระเงิน • คืนสินค้าได้ใน 30 วัน',
    en: 'Taxes and shipping calculated at checkout. Free 30-day returns.',
  },
  'cart.checkoutBtn': { th: 'ดำเนินการสั่งซื้อ', en: 'PROCEED TO CHECKOUT' },
  'cart.continueShopping': { th: 'เลือกซื้อสินค้าต่อ', en: 'CONTINUE SHOPPING' },
  'cart.remove': { th: 'นำออก', en: 'REMOVE' },
  'cart.size': { th: 'ไซส์', en: 'SIZE' },
  'cart.qty': { th: 'จำนวน', en: 'QTY' },

  // Footer
  'footer.joinClub': { th: 'สมัครสมาชิกร่วม NIDA REWARDS CLUB', en: 'JOIN THE NIDA REWARDS CLUB' },
  'footer.getDiscount': { th: 'รับส่วนลด 20% สำหรับคำสั่งซื้อแรก', en: 'GET 20% OFF YOUR FIRST ORDER' },
  'footer.discountDesc': {
    th: 'ลงทะเบียนเพื่อรับข้อเสนอพิเศษ การแจ้งเตือนสินค้ามาใหม่ และสิทธิ์เข้าถึงงานเซลล์ส่วนตัวก่อนใคร',
    en: 'Sign up to receive exclusive offers, new arrival alerts, and members-only private sale access.',
  },
  'footer.emailPlaceholder': { th: 'กรอกอีเมลของคุณ', en: 'Enter your email address' },
  'footer.joinBtn': { th: 'สมัครเลย', en: 'JOIN NOW' },
  'footer.welcomeClub': {
    th: 'ยินดีต้อนรับสู่คลับ! ใช้โค้ด: NIDA20 ตอนชำระเงิน',
    en: 'Welcome to the club! Use code: NIDA20 at checkout.',
  },
  'footer.brandStory': {
    th: 'ก่อตั้งโดยคุณพรรณนิดา (นิดา / นีด้า) สร้างสรรค์เครื่องแต่งกายสไตล์โมเดิร์นคลาสสิก กระเป๋าหนังแท้ และของใช้ในบ้านที่งดงามเหนือกาลเวลา',
    en: 'Founded by Phannida (นิดา / นีด้า), crafting modern classic apparel, fine leather bags, and refined lifestyle objects inspired by enduring design.',
  },
  'footer.fastDelivery': { th: 'จัดส่งรวดเร็ว', en: 'Fast Delivery' },
  'footer.securePay': { th: 'ชำระเงินปลอดภัย', en: 'Secure Pay' },
  'footer.customerAssistance': { th: 'ฝ่ายบริการลูกค้า', en: 'CUSTOMER ASSISTANCE' },
  'footer.trackOrder': { th: 'ติดตามสถานะพัสดุ', en: 'Track Your Order' },
  'footer.shippingPolicy': { th: 'นโยบายการจัดส่งสินค้า', en: 'Shipping & Delivery Policy' },
  'footer.returnsExchange': { th: 'การเปลี่ยนและคืนสินค้าใน 30 วัน', en: 'Returns & 30-Day Exchanges' },
  'footer.sizeGuide': { th: 'คู่มือเลือกไซส์สินค้า', en: 'Size Guide & Fit Advisor' },
  'footer.contactSupport': { th: 'ติดต่อฝ่ายบริการลูกค้า: support@nida.com', en: 'Contact Support: support@nida.com' },
  'footer.exploreCollections': { th: 'เลือกชมคอลเลกชัน', en: 'EXPLORE COLLECTIONS' },
  'footer.nidaClub': { th: 'คลับและแบรนด์ NIDA', en: 'THE NIDA CLUB' },
  'footer.brandPhilosophy': { th: 'เรื่องราวและปรัชญาแบรนด์', en: 'Brand Story & Philosophy' },
  'footer.sustainability': { th: 'ความยั่งยืนและการคัดสรรวัตถุดิบ', en: 'Sustainability & Organic Sourcing' },
  'footer.rewardsProgram': { th: 'สิทธิพิเศษสำหรับสมาชิก', en: 'Member Rewards Program' },
  'footer.storeLocations': { th: 'สาขาและกิจกรรมพิเศษ', en: 'Store Locations & Events' },
  'footer.careers': { th: 'ร่วมงานกับ Nida', en: 'Careers at Nida' },
  'footer.copyright': {
    th: '© 2026 NIDA BRANDS GLOBAL. สงวนลิขสิทธิ์ ออกแบบเพื่อการใช้ชีวิตอย่างมีระดับ',
    en: '© 2026 NIDA BRANDS GLOBAL. ALL RIGHTS RESERVED. DESIGNED FOR INTENTIONAL LIVING.',
  },
  'footer.privacy': { th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy Notice' },
  'footer.terms': { th: 'ข้อกำหนดการจำหน่าย', en: 'Terms of Sale' },
  'footer.accessibility': { th: 'การเข้าถึงเว็บไซต์', en: 'Accessibility' },

  // Home Page
  'home.heroTag': { th: 'แคมเปญ AUTUMN / WINTER 2026', en: 'THE AUTUMN / WINTER 2026 CAMPAIGN' },
  'home.heroTitle1': { th: 'ความคลาสสิกเหนือกาลเวลา', en: 'ICONIC PREP.' },
  'home.heroTitle2': { th: 'สู่วิถีชีวิตร่วมสมัย', en: 'MODERN LIVING.' },
  'home.heroDesc': {
    th: 'โครงเสื้อผ่อนคลายตัดเย็บด้วยความประณีตระดับมรดกตกทอด สัมผัสสเวตเตอร์ไหมพรมถัก เสื้อโค้ทสไตล์วาร์ซิตี้ และเครื่องหนังอันทรงคุณค่า',
    en: 'Effortless silhouettes tailored with heritage precision. Explore new season cable-knit sweaters, collegiate outerwear, and timeless leather goods.',
  },
  'home.shopWomen': { th: 'ช้อปคอลเลกชันผู้หญิง', en: 'SHOP WOMEN' },
  'home.shopMen': { th: 'ช้อปคอลเลกชันผู้ชาย', en: 'SHOP MEN' },
  'home.shopSale': { th: 'ช้อปสินค้าลดราคา (สูงสุด 50%)', en: 'SHOP SALE (UP TO 50%)' },
  'home.freeShippingTitle': { th: 'จัดส่งฟรี', en: 'FREE SHIPPING' },
  'home.freeShippingSub': { th: 'สำหรับคำสั่งซื้อตั้งแต่ $100 ขึ้นไป', en: 'On all orders over $100' },
  'home.returnsTitle': { th: 'คืนสินค้าได้ใน 30 วัน', en: '30-DAY RETURNS' },
  'home.returnsSub': { th: 'สะดวกสบายทั้งทางพัสดุและหน้าร้าน', en: 'Hassle-free mail or in-store' },
  'home.guaranteeTitle': { th: 'การันตีคุณภาพ NIDA', en: 'NIDA GUARANTEE' },
  'home.guaranteeSub': { th: 'เส้นใยออร์แกนิกแท้ ผลิตอย่างยั่งยืน', en: 'Sustainable, authentic fabrics' },
  'home.perksTitle': { th: 'สิทธิพิเศษสมาชิก NIDA CLUB', en: 'NIDA CLUB PERKS' },
  'home.perksSub': { th: 'ใช้โค้ด NIDA20 รับส่วนลด 20%', en: 'Use code NIDA20 for 20% off' },
  'home.curatedStories': { th: 'เรื่องราวคัดสรร', en: 'CURATED STORIES' },
  'home.seasonalSpotlight': { th: 'ไฮไลต์ประจำฤดูกาล', en: 'THE SEASONAL SPOTLIGHT' },
  'home.storyWomenTag': { th: 'สเวตเตอร์และโค้ทรับลมหนาว', en: 'AUTUMN KNITWEAR & COATS' },
  'home.storyWomenTitle': { th: 'ความคลาสสิกเหนือกาลเวลาสำหรับผู้หญิง', en: "WOMEN'S TIMELESS CLASSICS" },
  'home.storyWomenDesc': {
    th: 'สเวตเตอร์ไหมพรมถักพรีเมียม เทรนช์โค้ทวูลทรงสง่า และโครงเสื้อตัดเย็บเนี้ยบสำหรับทุกเช้าวันใหม่',
    en: 'Elevated cable knits, structured wool trenches, and tailored silhouettes made for crisp mornings.',
  },
  'home.discoverWomen': { th: 'ค้นพบคอลเลกชันผู้หญิง', en: 'DISCOVER WOMEN' },
  'home.storyMenTag': { th: 'สไตล์นักศึกษาและวาร์ซิตี้', en: 'COLLEGIATE PREP & VARSITY' },
  'home.storyMenTitle': { th: 'มรดกความเท่สไตล์โมเดิร์นของผู้ชาย', en: "MEN'S MODERN HERITAGE" },
  'home.storyMenDesc': {
    th: 'เสื้อโปโลผ้าปิเก้เฮอริเทจ แจ็คเก็ตเซิร์ฟกันลม และกางเกงชิโน่คัตติ้งเนี้ยบ สไตล์อเมริกันคูลที่โดดเด่น',
    en: 'Heritage pique polos, colorblock sailing jackets, and tailored chinos with American cool swagger.',
  },
  'home.discoverMen': { th: 'ค้นพบคอลเลกชันผู้ชาย', en: 'DISCOVER MEN' },
  'home.promoRibbonTag': { th: 'โปรโมชันจำกัดเวลา', en: 'LIMITED TIME PROMOTION' },
  'home.promoRibbonTitle': { th: 'ลดเพิ่ม 20% เมื่อสั่งซื้อครบ $120', en: 'EXTRA 20% OFF ON ORDERS OVER $120' },
  'home.promoRibbonDesc': {
    th: 'กรอกโค้ดตอนชำระเงิน ใช้ได้ทั้งสินค้าลดราคาและสินค้ามาใหม่',
    en: 'Apply code at checkout. Includes sale items and new season arrivals.',
  },
  'home.copyCode': { th: 'คัดลอกโค้ด', en: 'COPY CODE' },
  'home.copied': { th: 'คัดลอกแล้ว!', en: 'COPIED!' },
  'home.dontMissOut': { th: 'ห้ามพลาด', en: "DON'T MISS OUT" },
  'home.trendingTitle': { th: 'สินค้ายอดนิยมในขณะนี้', en: "WHAT'S TRENDING NOW" },
  'home.tabAll': { th: 'สินค้าทั้งหมด', en: 'ALL ITEMS' },
  'home.tabWomen': { th: 'ผู้หญิง', en: 'WOMEN' },
  'home.tabMen': { th: 'ผู้ชาย', en: 'MEN' },
  'home.tabBags': { th: 'กระเป๋าและรองเท้า', en: 'BAGS & SHOES' },
  'home.quickAdd': { th: 'เพิ่มลงถุงทันที', en: 'QUICK ADD' },
  'home.addedToBag': { th: 'เพิ่มลงถุงแล้ว', en: 'ADDED TO BAG' },
  'home.viewAllProducts': { th: 'ดูสินค้าทั้งหมด', en: 'VIEW ALL PRODUCTS' },
  'home.discoverDept': { th: 'เลือกดูตามหมวดหมู่', en: 'DISCOVER BY DEPARTMENT' },
  'home.essentialCategories': { th: 'หมวดหมู่สินค้าหลัก', en: 'ESSENTIAL CATEGORIES' },
  'home.heritageTag': { th: 'มรดกแห่ง NIDA', en: 'THE NIDA HERITAGE' },
  'home.heritageTitle1': { th: 'ดีไซน์ที่เปี่ยมด้วยความตั้งใจ', en: 'INTENTIONAL DESIGN.' },
  'home.heritageTitle2': { th: 'จิตวิญญาณที่ไม่ประนีประนอม', en: 'UNCOMPROMISED SPIRIT.' },
  'home.heritageDesc': {
    th: 'ก่อตั้งโดยคุณพรรณนิดา เพื่อนำเสนอการแต่งกายสไตล์โมเดิร์นคลาสสิก ผสานความสดใสและความประณีตของช่างฝีมืออย่างลงตัว',
    en: 'Founded by Phannida, Nida celebrates the spirit of modern classic dressing — bridging collegiate optimism with mindful, enduring craftsmanship that transcends fast seasons.',
  },
  'home.readOurStory': { th: 'อ่านเรื่องราวของเรา', en: 'READ OUR STORY' },

  // Collections & Catalog
  'catalog.filterBy': { th: 'ตัวกรอง', en: 'FILTER BY' },
  'catalog.allCategories': { th: 'ทุกหมวดหมู่ย่อย', en: 'All Sub-Categories' },
  'catalog.allColors': { th: 'ทุกสี', en: 'All Colors' },
  'catalog.clearFilters': { th: 'ล้างตัวกรองทั้งหมด', en: 'Clear All Filters' },
  'catalog.sortBy': { th: 'เรียงตาม', en: 'Sort By' },
  'catalog.sortFeatured': { th: 'สินค้าแนะนำ', en: 'Featured' },
  'catalog.sortPriceAsc': { th: 'ราคา: ต่ำไปสูง', en: 'Price: Low to High' },
  'catalog.sortPriceDesc': { th: 'ราคา: สูงไปต่ำ', en: 'Price: High to Low' },
  'catalog.sortRating': { th: 'คะแนนรีวิวสูงสุด', en: 'Customer Rating' },
  'catalog.showing': { th: 'แสดง', en: 'Showing' },
  'catalog.items': { th: 'รายการ', en: 'items' },
  'catalog.noProducts': { th: 'ไม่พบสินค้าตามเงื่อนไขที่เลือก', en: 'No products match your selected filters.' },
  'catalog.resetFilters': { th: 'รีเซ็ตตัวกรอง', en: 'Reset Filters' },

  // Product Detail Page
  'product.home': { th: 'หน้าแรก', en: 'HOME' },
  'product.selectSize': { th: 'เลือกขนาดไซส์', en: 'Select Size' },
  'product.sizeGuide': { th: 'คู่มือไซส์', en: 'Size Guide' },
  'product.selectColor': { th: 'เลือกโทนสี', en: 'Select Color' },
  'product.addToBag': { th: 'เพิ่มลงในถุงช้อปปิ้ง', en: 'ADD TO BAG' },
  'product.added': { th: 'เพิ่มลงถุงเรียบร้อยแล้ว!', en: 'ADDED TO YOUR BAG!' },
  'product.saveWishlist': { th: 'บันทึกลงรายการที่ถูกใจ', en: 'Save to wishlist' },
  'product.details': { th: 'รายละเอียดสินค้าและเนื้อผ้า', en: 'Product Details & Fabrics' },
  'product.materials': { th: 'วัสดุและการดูแลรักษา', en: 'Materials & Care' },
  'product.deliveryReturns': { th: 'การจัดส่งและการคืนสินค้าใน 30 วัน', en: 'Shipping & 30-Day Returns' },
  'product.youMayAlsoLike': { th: 'สินค้าที่คุณอาจชอบ', en: 'YOU MAY ALSO LIKE' },
  'product.customerReviews': { th: 'รีวิวจากลูกค้า', en: 'Customer Reviews' },
  'product.writeReview': { th: 'เขียนรีวิวสินค้า', en: 'Write a Review' },

  // Checkout Page
  'checkout.emptyBag': { th: 'ถุงช้อปปิ้งของคุณว่างเปล่า', en: 'YOUR BAG IS EMPTY' },
  'checkout.returnToShop': { th: 'กลับไปเลือกซื้อสินค้า', en: 'RETURN TO SHOP' },
  'checkout.step1': { th: '1. ที่อยู่จัดส่งสินค้า', en: '1. SHIPPING DETAILS' },
  'checkout.step2': { th: '2. การชำระเงินและตรวจสอบ', en: '2. PAYMENT & REVIEW' },
  'checkout.shippingAddress': { th: 'ที่อยู่สำหรับการจัดส่ง', en: 'SHIPPING ADDRESS' },
  'checkout.firstName': { th: 'ชื่อจริง *', en: 'First Name *' },
  'checkout.lastName': { th: 'นามสกุล *', en: 'Last Name *' },
  'checkout.email': { th: 'อีเมลแอดเดรส *', en: 'Email Address *' },
  'checkout.phone': { th: 'เบอร์โทรศัพท์ติดต่อ *', en: 'Phone Number *' },
  'checkout.address': { th: 'ที่อยู่ (บ้านเลขที่, ซอย, ถนน) *', en: 'Street Address *' },
  'checkout.city': { th: 'จังหวัด / เมือง *', en: 'City / Province *' },
  'checkout.postalCode': { th: 'รหัสไปรษณีย์ *', en: 'Postal Code *' },
  'checkout.continueToPayment': { th: 'ต่อไปยังขั้นตอนชำระเงิน', en: 'CONTINUE TO PAYMENT' },
  'checkout.backToShipping': { th: '← กลับไปแก้ไขที่อยู่จัดส่ง', en: '← Back to Shipping Details' },
  'checkout.paymentMethod': { th: 'เลือกวิธีชำระเงิน', en: 'PAYMENT METHOD' },
  'checkout.promptPay': { th: 'พร้อมเพย์ QR Code (สแกนจ่ายทันที)', en: 'PromptPay QR (Instant Pay)' },
  'checkout.creditCard': { th: 'บัตรเครดิต / เดบิต', en: 'Credit / Debit Card' },
  'checkout.bankTransfer': { th: 'โอนเงินผ่านบัญชีธนาคาร', en: 'Bank Transfer' },
  'checkout.orderSummary': { th: 'สรุปคำสั่งซื้อ', en: 'ORDER SUMMARY' },
  'checkout.promoCode': { th: 'โค้ดส่วนลด (เช่น NIDA20)', en: 'Promo Code (e.g. NIDA20)' },
  'checkout.apply': { th: 'ใช้งาน', en: 'APPLY' },
  'checkout.discount': { th: 'ส่วนลดพิเศษ (20% NIDA20)', en: 'Discount (20% Promo)' },
  'checkout.shipping': { th: 'ค่าจัดส่ง', en: 'Shipping' },
  'checkout.free': { th: 'จัดส่งฟรี', en: 'FREE' },
  'checkout.total': { th: 'ยอดชำระสุทธิ', en: 'Total' },
  'checkout.placeOrder': { th: 'ยืนยันและชำระเงิน', en: 'PLACE ORDER' },
  'checkout.secureNotice': {
    th: 'ระบบชำระเงินปลอดภัยด้วยการเข้ารหัส SSL 256-bit',
    en: 'Encrypted with 256-bit SSL Security',
  },

  // Order Success Page
  'orderSuccess.title': { th: 'ยืนยันคำสั่งซื้อสำเร็จ!', en: 'ORDER CONFIRMED!' },
  'orderSuccess.thankYou': {
    th: 'ขอบคุณสำหรับการสั่งซื้อสินค้าแบรนด์ Nida ทางเราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว และระบบได้ส่งอีเมลยืนยันพร้อมใบเสร็จให้คุณทันที',
    en: 'Thank you for your order with Nida. We have received your order and sent a confirmation receipt to your email.',
  },
  'orderSuccess.orderNumberLabel': { th: 'หมายเลขคำสั่งซื้อ', en: 'Order Number' },
  'orderSuccess.status': {
    th: '✓ ชำระเงินสำเร็จ • บันทึกคะแนนสมาชิก Nida VIP เรียบร้อย',
    en: '✓ Payment Successful • Nida VIP points credited',
  },
  'orderSuccess.trackOrder': { th: 'ติดตามสถานะพัสดุ', en: 'Track Shipment' },
  'orderSuccess.continueShopping': { th: 'เลือกซื้อสินค้าต่อ', en: 'Continue Shopping' },

  // Track Order Page
  'trackOrder.backToProfile': { th: 'กลับสู่หน้าโปรไฟล์', en: 'Back to Account' },
  'trackOrder.liveStatus': { th: 'สถานะการจัดส่งแบบเรียลไทม์', en: 'Live Shipment Tracking' },
  'trackOrder.order': { th: 'ออเดอร์', en: 'Order' },
  'trackOrder.courier': { th: 'ขนส่งโดย:', en: 'Carrier:' },
  'trackOrder.trackingNumber': { th: 'หมายเลขพัสดุ:', en: 'Tracking Number:' },
  'trackOrder.inTransit': { th: 'กำลังจัดส่ง', en: 'In Transit' },
  'trackOrder.estimatedArrival': { th: 'กำหนดส่งถึง:', en: 'Estimated Delivery:' },
  'trackOrder.milestones': { th: 'ขั้นตอนการจัดส่งสินค้า', en: 'Tracking Milestones' },
  'trackOrder.stepPlaced': { th: 'รับคำสั่งซื้อแล้ว', en: 'Order Placed' },
  'trackOrder.stepProcessing': { th: 'กำลังจัดเตรียมสินค้า', en: 'Processing & Packaged' },
  'trackOrder.stepShipped': { th: 'ส่งมอบพัสดุให้ขนส่ง', en: 'Shipped (In Transit)' },
  'trackOrder.stepDelivered': { th: 'จัดส่งสำเร็จ', en: 'Delivered' },

  // About Page
  'about.heroTag': { th: 'เรื่องราวของ NIDA', en: 'THE STORY OF NIDA' },
  'about.heroTitle': { th: 'มรดกและวิสัยทัศน์', en: 'HERITAGE & VISION' },
  'about.heroSubtitle': {
    th: 'เรื่องราวของแบรนด์ไลฟ์สไตล์ร่วมสมัย จากแรงบันดาลใจของคุณพรรณนิดา สู่คอลเลกชันระดับสากล',
    en: 'The story of a contemporary lifestyle brand, from founder Phannida to timeless global collections.',
  },
  'about.aboutFounder': { th: 'เกี่ยวกับเรา • เรื่องราวของผู้ก่อตั้ง', en: 'ABOUT US • OUR FOUNDER' },
  'about.founderHeading': {
    th: '"NIDA" — นีด้า หรือ นิดา จากชื่อคุณพรรณนิดา',
    en: '"NIDA" — An Enduring Name Born From Vision',
  },
  'about.founderP1': {
    th: 'ชื่อแบรนด์ "Nida" ได้รับการออกแบบให้สามารถอ่านออกเสียงได้อย่างไพเราะทั้งสองแบบคือ "นีด้า" และ "นิดา" โดยมีที่มาจากชื่อจริงของผู้ก่อตั้ง คุณพรรณนิดา (Phannida) ผู้หลงใหลในศิลปะแห่งความคลาสสิกสไตล์ American Prep ผสานความประณีตและความร่วมสมัยในทุกจังหวะของชีวิต',
    en: 'The brand name "Nida" is crafted to be pronounced gracefully as both "Nee-da" and "Ni-da", honoring founder Phannida whose passion for classic American collegiate tailoring meets contemporary ease in every walk of life.',
  },
  'about.founderP2': {
    th: 'Nida เติบโตเป็นแบรนด์ Lifestyle Destination ครอบคลุมทั้งเสื้อผ้า (Apparel), กระเป๋าหนังพรีเมียม (Bags & Leather), รองเท้า (Shoes) และของแต่งบ้าน (Home & Living) พร้อมแถบสามสีเอกลักษณ์ประจำแบรนด์ Yellow, Brown, White ที่สื่อถึงความอบอุ่น ความมั่นคง และความสดใสเปี่ยมพลัง',
    en: 'Nida has blossomed into a complete Lifestyle Destination spanning tailored apparel, fine leather goods, footwear, and home living objects — unified by our signature Yellow, Brown, and White tri-color ribbon emblem symbolizing warmth, integrity, and optimism.',
  },
  'about.value1Title': { th: 'ความคลาสสิกเหนือกาลเวลา', en: 'AUTHENTIC HERITAGE' },
  'about.value1Desc': {
    th: 'ดีไซน์ที่ได้รับแรงบันดาลใจจากสไตล์ดั้งเดิม ถ่ายทอดความมั่นใจและอัตลักษณ์ที่ชัดเจน',
    en: 'Timeless silhouettes designed to empower personal confidence with enduring classic taste.',
  },
  'about.value2Title': { th: 'เอกลักษณ์ 3 สี: เหลือง น้ำตาล ขาว', en: 'YELLOW, BROWN, WHITE' },
  'about.value2Desc': {
    th: 'แถบสามสีสัญลักษณ์แห่งความอบอุ่น ความภูมิฐาน และความประณีตระดับงานช่างฝีมือชั้นสูง',
    en: 'Signature tricolor ribbon emblem representing warmth, grounded heritage, and artisanal precision.',
  },
  'about.value3Title': { th: 'ไลฟ์สไตล์ครบวงจร', en: 'MULTI-CATEGORY LIFESTYLE' },
  'about.value3Desc': {
    th: 'ครบครันทั้งเสื้อผ้า กระเป๋า รองเท้า เครื่องแต่งกาย และของใช้ในบ้านสำหรับทุกคนในครอบครัว',
    en: 'A holistic destination for apparel, fine leather, footwear, and mindful home objects.',
  },

  // Auth & Profile Pages
  'auth.signInTitle': { th: 'เข้าสู่ระบบสมาชิก', en: 'MEMBER SIGN IN' },
  'auth.signInSubtitle': {
    th: 'กรอกอีเมลของคุณเพื่อรับรหัสผ่าน OTP ยืนยันตัวตนแบบไร้รหัสผ่าน (Passwordless)',
    en: 'Enter your email to receive a passwordless 6-digit OTP verification code',
  },
  'auth.emailLabel': { th: 'อีเมลบัญชีผู้ใช้ *', en: 'Email Address *' },
  'auth.otpNotice': { th: 'รหัส OTP 6 หลักจะถูกส่งไปยังอีเมลของคุณ', en: 'A 6-digit OTP code will be sent to your email' },
  'auth.signInBtn': { th: 'เข้าสู่ระบบด้วย OTP', en: 'SIGN IN WITH OTP' },
  'auth.quickDemo': { th: 'บัญชีทดสอบด่วน:', en: 'Quick Demo Accounts:' },
  'auth.noAccount': { th: 'ยังไม่มีบัญชีสมาชิก?', en: "Don't have an account yet?" },
  'auth.joinClub': { th: 'สมัครสมาชิก Nida Club', en: 'Join Nida Club' },
  'auth.registerTitle': { th: 'สมัครสมาชิก NIDA CLUB', en: 'JOIN NIDA CLUB' },
  'auth.registerSubtitle': {
    th: 'สร้างบัญชีใหม่เพื่อรับสิทธิพิเศษ ส่วนลด 20% และการยืนยันตัวตนด้วย OTP',
    en: 'Create your account for exclusive perks, 20% discount code, and secure OTP sign-in',
  },
  'auth.registerPerk': {
    th: 'สมัครวันนี้รับทันทีโค้ด NIDA20 ลด 20% ทุกออเดอร์',
    en: 'Join today to enjoy code NIDA20 for 20% off all orders',
  },
  'auth.firstName': { th: 'ชื่อจริง *', en: 'First Name *' },
  'auth.lastName': { th: 'นามสกุล *', en: 'Last Name *' },
  'auth.phone': { th: 'เบอร์โทรศัพท์ *', en: 'Phone Number *' },
  'auth.agreeTerms': {
    th: 'ฉันยอมรับเงื่อนไขและนโยบายความเป็นส่วนตัวของ Nida',
    en: 'I agree to the Terms of Service and Privacy Policy of Nida',
  },
  'auth.createAccountBtn': { th: 'สร้างบัญชีสมาชิก', en: 'CREATE ACCOUNT' },
  'auth.alreadyMember': { th: 'เป็นสมาชิกอยู่แล้ว?', en: 'Already a member?' },
  'auth.verifyOtpTitle': { th: 'ยืนยันรหัส OTP', en: 'VERIFY OTP CODE' },
  'auth.verifyOtpSubtitle': { th: 'กรอกรหัส 6 หลักที่ระบบส่งไปยัง', en: 'Enter the 6-digit code sent to' },
  'auth.resendCode': { th: 'ส่งรหัสใหม่อีกครั้ง', en: 'Resend Code' },
  'auth.verifyBtn': { th: 'ยืนยันรหัสและเข้าสู่ระบบ', en: 'VERIFY & CONTINUE' },
  'auth.demoTip': {
    th: '💡 โหมดทดสอบ: คลิกเพื่อกรอกรหัสด้านบนอัตโนมัติ',
    en: '💡 Demo Mode: Click above to auto-fill the test OTP code',
  },
  'auth.profileTitle': { th: 'บัญชีสมาชิก NIDA', en: 'NIDA MEMBER ACCOUNT' },
  'auth.memberSince': { th: 'สมาชิกตั้งแต่: 2026', en: 'Member since: 2026' },
  'auth.tabProfile': { th: 'ข้อมูลส่วนตัว', en: 'Profile Info' },
  'auth.tabOrders': { th: 'ประวัติคำสั่งซื้อ', en: 'Order History' },
  'auth.tabAddresses': { th: 'สมุดที่อยู่', en: 'Saved Addresses' },
  'auth.editProfile': { th: 'แก้ไขข้อมูล', en: 'Edit Profile' },
  'auth.saveChanges': { th: 'บันทึกการเปลี่ยนแปลง', en: 'Save Changes' },
  'auth.cancel': { th: 'ยกเลิก', en: 'Cancel' },
  'auth.profileUpdated': { th: 'อัปเดตข้อมูลสำเร็จเรียบร้อยแล้ว!', en: 'Profile updated successfully!' },
  'auth.logout': { th: 'ออกจากระบบ', en: 'Sign Out' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isTh: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('th');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nida_lang');
      if (saved === 'th' || saved === 'en') {
        setLanguageState(saved);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('nida_lang', lang);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'th' ? 'en' : 'th';
    setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = translations[key];
    if (entry) {
      return entry[language] || entry.en;
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isTh: language === 'th',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Localized Product Accessor Helpers
export function getProductTitle(product: Product, lang: Language): string {
  if (lang === 'th' && product.nameTh) {
    return product.nameTh;
  }
  return product.name;
}

export function getProductSubCategory(product: Product, lang: Language): string {
  if (lang === 'th' && product.subCategoryTh) {
    return product.subCategoryTh;
  }
  return product.subCategory || product.category;
}

export function getProductTag(product: Product, lang: Language): string | undefined {
  if (lang === 'th' && product.tagTh) {
    return product.tagTh;
  }
  return product.tag;
}

export function getProductDescription(product: Product, lang: Language): string | undefined {
  if (lang === 'th' && product.descriptionTh) {
    return product.descriptionTh;
  }
  return product.description;
}
