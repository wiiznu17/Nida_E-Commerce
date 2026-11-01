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

- [x] **2.1 ปรับปรุง Next.js Configuration (`apps/store/next.config.ts`)**
  - เพิ่ม `images.formats: ['image/avif', 'image/webp']` เพื่อแปลงภาพเป็นฟอร์แมตสมัยใหม่โดยอัตโนมัติ
  - เพิ่ม `remotePatterns` รองรับ `localhost:4000` สำหรับรูปภาพอัปโหลด
  - เพิ่ม `compress: true` สำหรับ Next.js production server
  - เพิ่ม `experimental.optimizePackageImports: ['lucide-react', '@base-ui/react']` เพื่อทำ tree-shaking ไอคอนขนาดใหญ่
- [x] **2.2 แปลงแท็กดิบ `<img>` เป็น `<Image />` (`next/image`) ครบทั้ง 13 จุด**
  - [x] `apps/store/src/components/home/HeroBillboard.tsx` (จุดสำคัญ LCP: กำหนด `priority`, `fill`, `sizes="100vw"`)
  - [x] `apps/store/src/components/home/HomeProductCard.tsx` (กำหนด `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"`)
  - [x] `apps/store/src/components/home/CategoryDiscoveryTiles.tsx`
  - [x] `apps/store/src/components/home/SplitEditorialBento.tsx`
  - [x] `apps/store/src/components/home/PromoRibbon.tsx`
  - [x] `apps/store/src/components/collection/CollectionBanner.tsx`
  - [x] `apps/store/src/components/collection/CollectionProductGrid.tsx`
  - [x] `apps/store/src/components/catalog/CatalogProductGrid.tsx`
  - [x] `apps/store/src/components/layout/MegaMenu.tsx`
  - [x] `apps/store/src/components/layout/CartDrawer.tsx`
  - [x] `apps/store/src/components/about/AboutContentView.tsx` (2 จุด)
  - [x] `apps/store/src/components/header/HeaderSearchBar.tsx`
- [x] **2.3 ขจัด Data Fetching Waterfall บนหน้ารายละเอียดสินค้า (`/product/[id]`)**
  - ปรับ `apps/store/src/app/product/[id]/page.tsx` ส่ง Server-fetched `product` เข้าเป็น prop `initialProduct` ของ `<ProductDetailView initialProduct={product} />`
  - ปรับ `useProductDetail.ts` ให้นำ `initialProduct` มาเป็นค่าเริ่มต้นและไม่ trigger client fetch ซ้ำซ้อน
  - ผลลัพธ์: ผู้ใช้ได้รับหน้าเว็บที่มีข้อมูลครบถ้วนตั้งแต่ First Contentful Paint (Instant Render) ไม่มี Loading Spinner Flash
- [x] **2.4 เพิ่ม Static Generation สำหรับ Collections หลัก (`/collections/[department]`)**
  - เพิ่ม `generateStaticParams()` ใน `apps/store/src/app/collections/[department]/page.tsx` สำหรับ static paths: `['men', 'women', 'shoes', 'bags', 'home']`
  - Pre-render หน้าคอลเลกชันเป็น Static HTML (SSG) เรียบร้อยทั้ง 5 หมวดหมู่
- [x] **2.5 ปรับแต่งและลดขนาด Web Fonts (`apps/store/src/app/layout.tsx`)**
  - ลดทอน font weights ส่วนเกิน เหลือเฉพาะที่ใช้งานจริง
  - เพิ่ม `display: 'swap'` ให้กับทุก font ป้องกัน FOIT (Flash of Invisible Text)

---

### เฟส 2.5: ปรับปรุง Loading State และป้องกัน Double-Submit / Spam Click ในฝั่ง Admin
> **เป้าหมาย**: ป้องกันการแสดงผล False Empty State ("ไม่พบข้อมูล") ขณะที่ API กำลังโหลด และป้องกันการกดปุ่มบันทึก/ปรับสถานะรัวๆ ซ้ำซ้อน

- [x] **แก้ไขหน้าจัดการสต็อก (`apps/admin/src/pages/AdminInventory.tsx`)**:
  - เพิ่มสถานะ `isSubmitting` และ `disabled` บนปุ่มบันทึกการปรับสต็อกใน Modal พร้อมแสดง `Loader2` แอนิเมชันหมุนขณะบันทึก ป้องกันการกดเบิ้ลส่งคำขอซ้ำ
  - ปิดการกดปุ่ม "ยกเลิก" ขณะกำลังส่งข้อมูล (`disabled={isSubmitting}`)
  - เพิ่ม `isLoading` (เริ่มต้นเป็น `true`) ในฟังก์ชัน `loadInventory()`
  - แสดง Loading Row ใน `TableBody` ขณะกำลังโหลด แทนการกะพริบแสดง `EmptyState` ("ไม่พบรายการสต็อกสินค้า")
  - ปรับยอดสรุปตัวเลขบนแถบ Filter Tabs ให้แสดง `...` ขณะกำลังโหลดข้อมูล แทนการกะพริบเป็น `(0)`
- [x] **แก้ไขหน้ารายละเอียดคำสั่งซื้อ (`apps/admin/src/pages/AdminOrderDetail.tsx`)**:
  - เพิ่มสถานะ `isLoading` (เริ่มต้นเป็น `true`) ใน `loadOrder()`
  - แสดง Loading Spinner Screen ระหว่างรอ API ดึงข้อมูลคำสั่งซื้อ ป้องกันการกะพริบแสดง `EmptyState` ("ไม่พบคำสั่งซื้อ") ก่อนที่ข้อมูลจะมาถึง
- [x] **แก้ไขหน้ารายการคำสั่งซื้อ (`apps/admin/src/pages/AdminOrders.tsx`)**:
  - กำหนดค่าเริ่มต้น `isLoading` เป็น `true` เพื่อไม่ให้แสดงผลว่างเปล่าในเฟรมแรก
  - แสดง Loading Row ใน `TableBody` ก่อนตรวจสอบเงื่อนไข `paginatedOrders.length === 0`
  - เพิ่ม `updatingOrderId` state เพื่อล็อค Dropdown สถานะคำสั่งซื้อในแถวตารางขณะกำลังอัปเดต ป้องกันการกดย้ำเปลี่ยนสถานะซ้ำซ้อน
- [x] **แก้ไขหน้าประวัติความเคลื่อนไหวสต็อก (`apps/admin/src/pages/AdminInventoryAudit.tsx`)**:
  - เพิ่มสถานะ `isLoading` ใน `loadMovements()`
  - แสดง Loading Row ในตาราง Ledger ขณะรอ API ตอบกลับ แทนการแสดง Empty State ล่วงหน้า
- [x] **แก้ไขตารางคำขอยกเลิกและคืนสินค้า (`CancellationTable.tsx`, `ReturnTable.tsx`, `AdminCancellations.tsx`, `AdminReturns.tsx`)**:
  - แก้ไข `CancellationTable` และ `ReturnTable` ให้นำ prop `isLoading` มาตรวจสอบก่อนเงื่อนไข `items.length === 0`
  - ปรับค่าเริ่มต้น `isLoading` ในหน้า `AdminCancellations` และ `AdminReturns` เป็น `true`
- [x] **แก้ไขหน้า Dashboard และ Analytics (`AdminDashboard.tsx`, `AdminAnalytics.tsx`)**:
  - เพิ่ม `isLoading` ใน `AdminDashboard` เพื่อแสดง Loading Spinner แทนการกะพริบตัวเลขเป็น `0 ฿`, `0 คำสั่งซื้อ`, `0%` ก่อนข้อมูลจริงจะมาถึง
  - ปรับค่าเริ่มต้น `isLoading` ใน `AdminAnalytics` เป็น `true` เพื่อให้ Skeletons และ Loading States แสดงผลทันทีตั้งแต่เริ่มโหลด

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

