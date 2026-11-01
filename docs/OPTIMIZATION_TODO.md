# System Performance & Production-Grade Optimization Roadmap

เอกสารแผนงานและรายการตรวจสอบ (Checklist) สำหรับการเพิ่มประสิทธิภาพระบบ Nida Platform ให้มีความเร็วและความเสถียรระดับ Production Luxury E-Commerce ครอบคลุมทั้ง Customer Storefront (`apps/store`), Back-Office Admin (`apps/admin`), Backend APIs (`apps/api`, `apps/admin-api`), และ Database Layer (`packages/database`).

---

## 1. เป้าหมายตัวชี้วัดประสิทธิภาพ (Target Performance KPIs)

| มิติ (Metric) | ค่าปัจจุบัน (Current) | ค่าเป้าหมาย (Target) | วิธีการวัดผล (Verification) |
| :--- | :--- | :--- | :--- |
| **Admin Initial Bundle (JS)** | `1,388.91 kB` (352 kB gzip) | `< 220 kB` (ลดลง ~84%) | `npm --prefix apps/admin run build` |
| **Store LCP (Largest Contentful Paint)** | ~2.8s – 3.5s | `< 1.2s – 1.5s` | Chrome DevTools Lighthouse / Core Web Vitals |
| **Store CLS (Cumulative Layout Shift)** | ~0.08 | `< 0.01` (Zero Shift) | Lighthouse Audit |
| **Catalog API Response TTFB** | ~80ms – 180ms | `< 20ms` (Redis Cache Hit) | Autocannon / API Benchmark |
| **API Response Payload Transfer** | 100% Uncompressed | ลดลง 65% – 80% | `Content-Encoding: gzip` verification |
| **Product Detail Render Flow** | Waterfall + Client Spinner | Zero-Flash Instant SSR | Next.js Server Components initial data |

---

## 2. รายการแผนงานจำแนกตามเฟส (Phase Breakdown & Action Items)

### เฟส 1: Quick Wins & Network Optimization (Backend APIs)
> **เป้าหมาย**: ลดขนาด Response payload ข้ามเครือข่ายทันที 60–80% และเปิดใช้งาน Response Compression

- [x] **1.1 ติดตั้ง `compression` middleware ใน `apps/api`**
  - ติดตั้ง `compression` และ `@types/compression` ใน `apps/api`
  - อัปเดต `apps/api/src/main.ts` เพื่อเรียกใช้งาน `app.use(compression({ threshold: 1024 }))`
  - ผ่านการทดสอบ Assertion ส่ง `Content-Encoding: gzip` สำหรับ response JSON ขนาด > 1KB
- [x] **1.2 ติดตั้ง `compression` middleware ใน `apps/admin-api`**
  - ติดตั้ง `compression` และ `@types/compression` ใน `apps/admin-api`
  - อัปเดต `apps/admin-api/src/main.ts` เพื่อเรียกใช้งาน `app.use(compression({ threshold: 1024 }))`
  - รองรับการบีบอัดสำหรับ endpoints ที่ส่งข้อมูลขนาดใหญ่ เช่น `/orders`, `/analytics`, `/audit-logs`
- [x] **1.3 กำหนด HTTP Caching Headers สำหรับ Public Catalog**
  - เพิ่ม `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600` ให้กับ `GET /catalog/categories`, `GET /content/home`, `GET /content/settings`
  - กำหนด Cache Header สำหรับ static assets `/uploads` ใน `apps/admin-api/src/main.ts` (`maxAge: '7d', immutable: true`)

---

### เฟส 2: Storefront Performance & Core Web Vitals (`apps/store`)
> **เป้าหมาย**: ดัน Core Web Vitals (LCP < 1.5s, CLS < 0.01), ปรับปรุง Image Pipeline และขจัด Data Waterfall

- [ ] **2.1 ปรับปรุง Next.js Configuration (`apps/store/next.config.ts`)**
  - เพิ่ม `images.formats: ['image/avif', 'image/webp']` เพื่อแปลงภาพเป็นฟอร์แมตสมัยใหม่โดยอัตโนมัติ
  - เพิ่ม `compress: true` สำหรับ Next.js production server
  - เพิ่ม `experimental.optimizePackageImports: ['lucide-react']` เพื่อทำ tree-shaking ไอคอนขนาดใหญ่
- [ ] **2.2 แปลงแท็กดิบ `<img>` เป็น `<Image />` (`next/image`) ให้ครบ 13 จุด**
  - [ ] `apps/store/src/components/home/HeroBillboard.tsx` (จุดสำคัญ LCP: กำหนด `priority`, `fill`, `sizes="100vw"`)
  - [ ] `apps/store/src/components/home/HomeProductCard.tsx` (กำหนด `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"`)
  - [ ] `apps/store/src/components/home/CategoryDiscoveryTiles.tsx`
  - [ ] `apps/store/src/components/home/SplitEditorialBento.tsx`
  - [ ] `apps/store/src/components/home/PromoRibbon.tsx`
  - [ ] `apps/store/src/components/collection/CollectionBanner.tsx`
  - [ ] `apps/store/src/components/collection/CollectionProductGrid.tsx`
  - [ ] `apps/store/src/components/catalog/CatalogProductGrid.tsx`
  - [ ] `apps/store/src/components/layout/MegaMenu.tsx`
  - [ ] `apps/store/src/components/layout/CartDrawer.tsx`
  - [ ] `apps/store/src/components/about/AboutContentView.tsx` (2 จุด)
  - [ ] `apps/store/src/components/header/HeaderSearchBar.tsx`
- [ ] **2.3 ขจัด Data Fetching Waterfall บนหน้ารายละเอียดสินค้า (`/product/[id]`)**
  - ปรับ `apps/store/src/app/product/[id]/page.tsx` ให้ส่ง `product` ที่ดึงจาก Server เข้าเป็น prop `initialProduct` ของ `<ProductDetailView initialProduct={product} />`
  - อัปเดต `useProductDetail.ts` ให้ใช้ `initialProduct` เป็น initial state ในทันที เพื่อตัดอาการจอขาวและ Loading Spinner Flash
  - ผลลัพธ์: ผู้ใช้ได้รับหน้าเว็บที่มีข้อมูลครบถ้วนตั้งแต่ First Contentful Paint (Instant Render)
- [ ] **2.4 เพิ่ม Static Generation สำหรับ Collections หลัก (`/collections/[department]`)**
  - เพิ่ม `generateStaticParams()` ใน `apps/store/src/app/collections/[department]/page.tsx` สำหรับ static paths: `['men', 'women', 'shoes', 'bags', 'home', 'sale']`
  - ส่งข้อมูล Category เริ่มต้นผ่าน Server เพื่อให้หน้า Collection โหลดทันทีไม่ต้องรอ Client Query
- [ ] **2.5 ปรับแต่งและลดขนาด Web Fonts (`apps/store/src/app/layout.tsx`)**
  - ลดทอน font weights ที่ไม่จำเป็นจาก 18 weights เหลือเฉพาะที่ใช้งานจริง:
    - `Montserrat`: `['400', '600', '700', '900']` (ลดจาก 6 เหลือ 4)
    - `Inter`: `['400', '500', '600']` (ลดจาก 4 เหลือ 3)
    - `Playfair_Display`: `['400', '700']` (ลดจาก 3 เหลือ 2)
    - `IBM_Plex_Sans_Thai`: `['400', '500', '600', '700']` (ลดจาก 5 เหลือ 4)
  - เพิ่ม `display: 'swap'` ให้กับทุก font เพื่อป้องกัน FOIT (Flash of Invisible Text)
- [ ] **2.6 ป้องกัน Client Over-fetching ใน `CatalogProvider`**
  - ปรับ `CatalogProvider` (`apps/store/src/context/CatalogContext.tsx`) ไม่ให้ดึงข้อมูลรายการสินค้าทั้งหมด (full catalog) มาเก็บไว้ใน Client state ตั้งแต่ครั้งแรกที่เปิดเว็บ หากหน้านั้นไม่ได้เรียกใช้งาน (Lazy Fetch on Demand)

---

### เฟส 3: Admin Bundle & Code-Splitting (`apps/admin`)
> **เป้าหมาย**: ทำลาย Monolithic JS Chunk ขนาด 1.39 MB ให้เหลือ Initial Bundle < 220 KB

- [ ] **3.1 แปลงการนำเข้า Route เป็นแบบ Lazy Loading (`React.lazy` + `Suspense`)**
  - แก้ไข `apps/admin/src/App.tsx` โดยเปลี่ยนจากการ `import` หน้าแบบ Static ทั้งหมด 20+ หน้า ให้เป็น Dynamic `React.lazy(() => import('./pages/...'))`
  - ห่อ `RouterProvider` หรือ Route elements ด้วย `<Suspense fallback={<AdminLoadingFallback />}>`
  - แยกหน้าหนักที่ใช้งานเฉพาะทาง (เช่น `AdminOrders`, `AdminAnalytics`, `AdminAuditLogs`, `AdminProductCreate`) ออกจาก Initial Chunk
- [ ] **3.2 ปรับแต่ง Rollup Chunk Splitting ใน `vite.config.ts`**
  - เพิ่มการตั้งค่า `build.rollupOptions.output.manualChunks` ใน `apps/admin/vite.config.ts`:
    - `vendor-react`: `['react', 'react-dom', 'react-router-dom']`
    - `vendor-ui`: `['lucide-react', 'clsx', 'tailwind-merge']`
    - `vendor-form`: `['zod', 'react-hook-form', '@hookform/resolvers']`
  - กำหนด `chunkSizeWarningLimit: 600`
- [ ] **3.3 แก้ปัญหา Ineffective Dynamic Import**
  - ปรับการ import ใน `src/utils/cloudinary.ts` และ `src/api/index.ts` เพื่อไม่ให้เกิด circular static/dynamic import ตามคำเตือนของ Vite build

---

### เฟส 4: Database Indexing & Redis Caching
> **เป้าหมาย**: เพิ่มความเร็ว Query แคตตาล็อกและการค้นหาลงเหลือ < 20ms และรองรับ Concurrent High-Traffic

- [ ] **4.1 เพิ่ม Composite Indexes ใน Prisma Schema (`packages/database/prisma/schema.prisma`)**
  - [ ] `Product`: เพิ่ม `@@index([isActive, createdAt(sort: Desc)])` สำหรับการดึงรายการสินค้าล่าสุด (Default Catalog View)
  - [ ] `Product`: เพิ่ม `@@index([tag, isActive])` สำหรับการกรองแคมเปญ (NEW_ARRIVAL, BESTSELLER, SALE)
  - [ ] `ProductVariant`: เพิ่ม `@@index([colorHex])` สำหรับการกรองตัวเลือกสี
  - [ ] `ProductVariant`: เพิ่ม `@@index([productId, isActive])` สำหรับดึง SKU ตัวที่เปิดใช้งาน
- [ ] **4.2 สร้าง Migration File ตามมาตรฐานโปรเจกต์**
  - สร้างไฟล์ migration ใต้ `packages/database/prisma/migrations/<timestamp>_add_performance_indexes/migration.sql`
  - รัน `npm --prefix packages/database run db:generate`
- [ ] **4.3 เพิ่ม Redis Cache-Aside ใน `apps/api` (Catalog Service)**
  - เพิ่ม Cache-Aside Pattern ให้กับ:
    - `CustomerCatalogService.getProducts()`: แคช Default query (page 1, limit 24, newest) ด้วย TTL 120 วินาที
    - `CustomerCatalogService.getCategories()`: แคชโครงสร้างหมวดหมู่ด้วย TTL 600 วินาที
    - `CustomerCatalogService.getProductByIdOrSlug()`: แคชข้อมูลรายละเอียดสินค้าด้วย TTL 180 วินาที
  - เพิ่ม Cache Invalidation Hooks:
    - ล้างแคช Catalog เมื่อ Admin ทำการสร้าง, แก้ไข, ลบ สินค้า หรืออัปเดตสถานะหมวดหมู่

---

## 3. ขั้นตอนการตรวจสอบและทดสอบ (Verification Procedures)

หลังจากดำเนินงานแต่ละเฟส ต้องทำการทดสอบและผ่านเกณฑ์ดังต่อไปนี้:

1. **การตรวจสอบ Build ของทุก Workspace**:
   ```bash
   npm --prefix packages/types run build
   npm --prefix packages/validators run build
   npm --prefix packages/database run db:generate
   npm --prefix apps/api run build
   npm --prefix apps/admin-api run build
   npm --prefix apps/admin run build
   npm --prefix apps/store run build
   ```
   *เกณฑ์ผ่าน: ไม่มี Build Error, ไม่มี Type Error, ขนาด Initial JS Bundle ของ Admin < 250 kB*

2. **การรัน Unit Tests ทั่วทั้งระบบ**:
   ```bash
   npm --prefix apps/api run test
   npm --prefix apps/admin-api run test
   ```
   *เกณฑ์ผ่าน: 389+ Tests ต้องผ่าน 100% ไม่มี Regression*

3. **การทดสอบ Core Web Vitals (Lighthouse / DevTools Audit)**:
   - ตรวจสอบหน้า `/` (Home) และ `/product/[id]` (Product Detail)
   - LCP < 1.5s
   - CLS < 0.01
   - Total Blocking Time (TBT) < 150ms

4. **การทดสอบ Network Header & Compression**:
   ```bash
   curl -I -H "Accept-Encoding: gzip" http://localhost:4001/api/v1/catalog/products
   ```
   *เกณฑ์ผ่าน: มี header `Content-Encoding: gzip` ส่งกลับมา*

