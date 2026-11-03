# Storefront Content & CMS Specification (`content.md`)

เอกสารข้อกำหนดเชิงเทคนิคสำหรับระบบจัดการเนื้อหาหน้าร้าน (`Content CMS`), แบนเนอร์ประชาสัมพันธ์ (`CmsBanner`), การตั้งค่านโยบายร้านค้า (`StoreSettings`), ระบบแคชประสิทธิภาพสูง และระบบจำลองผลลัพธ์แบบเรียลไทม์ (Live Preview Mode) ของ Nida Platform

---

## 1. โครงสร้างข้อมูลระดับฐานข้อมูล (Prisma Database Schema)

### 1.1 โมเดล `CmsBanner`
เก็บบันทึกข้อมูลแบนเนอร์และภาพสไลด์สำหรับตำแหน่งต่างๆ บนหน้าแรกของหน้าร้าน

```prisma
enum BannerPlacement {
  HERO
  PROMO_RIBBON
  SPLIT_BENTO
}

model CmsBanner {
  id              String          @id @default(uuid()) @db.Uuid
  placement       BannerPlacement @default(HERO)
  titleTh         String?         @map("title_th") @db.VarChar(100)
  titleEn         String?         @map("title_en") @db.VarChar(100)
  subtitleTh      String?         @map("subtitle_th") @db.VarChar(255)
  subtitleEn      String?         @map("subtitle_en") @db.VarChar(255)
  imageUrlDesktop String          @map("image_url_desktop") @db.VarChar(500)
  imageUrlMobile  String?         @map("image_url_mobile") @db.VarChar(500)
  linkUrl         String?         @map("link_url") @db.VarChar(500)
  ctaLabelTh      String?         @map("cta_label_th") @db.VarChar(50)
  ctaLabelEn      String?         @map("cta_label_en") @db.VarChar(50)
  displayOrder    Int             @default(0) @map("display_order")
  isActive        Boolean         @default(true) @map("is_active")
  startsAt        DateTime?       @map("starts_at")
  endsAt          DateTime?       @map("ends_at")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@index([placement, isActive, displayOrder])
  @@map("cms_banners")
}
```

### 1.2 โมเดล `StoreSettings`
เก็บบันทึกแถบประกาศด้านบนสุด (Top Announcement Bar) และเกณฑ์นโยบายร้านค้า

```prisma
model StoreSettings {
  id                    String   @id @default(uuid()) @db.Uuid
  announcementTextTh    String?  @map("announcement_text_th") @db.VarChar(255)
  announcementTextEn    String?  @map("announcement_text_en") @db.VarChar(255)
  announcementIsActive  Boolean  @default(true) @map("announcement_is_active")
  freeShippingThreshold Decimal  @default(1000) @map("free_shipping_threshold") @db.Decimal(10, 2)
  returnWindowDays      Int      @default(7) @map("return_window_days")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@map("store_settings")
}
```

---

## 2. ข้อมูลจำเพาะ API การจัดการเนื้อหา (API Specifications)

### 2.1 Public Storefront Endpoints (`apps/api`)
ออกแบบด้วยนโยบายแคชระดับ Edge / CDN (`Cache-Control`) เพื่อความเร็วระดับพรีเมียม (LCP < 2.0 วินาที)

- **`GET /api/v1/content/home`**:
  - แคช: `public, max-age=60, s-maxage=300, stale-while-revalidate=600`
  - คืนค่า: Hero Banners (`placement: HERO`), Promo Ribbon และ StoreSettings ที่เปิดใช้งาน (`isActive: true`)
- **`GET /api/v1/content/settings`**:
  - คืนค่า: แถบประกาศ Top Announcement และเกณฑ์นโยบายร้านค้า (Free Shipping / Return Window)

### 2.2 Back-Office Admin Endpoints (`apps/admin-api`)
ควบคุมสิทธิ์ด้วย `AdminJwtGuard` พร้อมการตรวจสอบ Payload ด้วย Zod Schema 100%:

| Method   | Endpoint Path                     | คำอธิบาย                                                   | Zod Validation Pipe                |
| :------- | :-------------------------------- | :--------------------------------------------------------- | :--------------------------------- |
| `GET`    | `/api/v1/content/home`            | ดึงรายการแบนเนอร์ทั้งหมด (ทั้ง Active และ Inactive)        | -                                  |
| `POST`   | `/api/v1/content/banners`         | สร้างแบนเนอร์ใหม่                                          | `saveCmsBannerSchema`              |
| `PUT`    | `/api/v1/content/banners/:id`     | แก้ไขข้อมูลแบนเนอร์                                        | `saveCmsBannerSchema`              |
| `DELETE` | `/api/v1/content/banners/:id`     | ลบแบนเนอร์                                                 | -                                  |
| `PATCH`  | `/api/v1/content/banners/reorder` | สลับลำดับการแสดงผลของแบนเนอร์ (`ids: string[]`)            | `reorderBannersSchema`             |
| `PUT`    | `/api/v1/content/settings`        | อัปเดตแถบประกาศและเกณฑ์นโยบายร้านค้า                       | `updateStoreSettingsSchema`        |

---

## 3. ระบบจำลองผลลัพธ์แบบสด (Live Interactive Preview Mode)

หน้าจอจัดการเนื้อหาในระบบหลังบ้าน ([`AdminCmsContent.tsx`](file:///apps/admin/src/pages/AdminCmsContent.tsx)) ได้รับการออกแบบตามมาตรฐาน **Editorial Luxury 1:1 Mirroring**:

1. **Device Viewport Switcher**:
   - **Desktop Viewport**: จำลองขนาดความกว้างหน้าจอ 1440px
   - **Mobile Frame**: จำลองกรอบสมาร์ตโฟนขนาด 375px เพื่อตรวจเช็คความพอดีของภาพตัดครอบ (Crop) และขนาดตัวอักษร
2. **Bilingual Switcher**:
   - สลับแสดงผลภาษาไทย (TH) และอังกฤษ (EN) เพื่อให้มั่นใจว่าการจัดวางข้อความไม่ตกหล่นหรือขึ้นบรรทัดใหม่ผิดที่
3. **Graceful Fallback Policy**:
   - หากยังไม่มีการตั้งค่าแบนเนอร์ในระบบ หรือฐานข้อมูลว่างเปล่า ระบบจะเรนเดอร์ Default Editorial Bento / Fallback Banners เสมอ เพื่อป้องกันไม่ให้หน้าเว็บล่มหรือเกิดช่องว่างสีขาว

