# NIDA E-Commerce — Pre-Deployment Checklist (สิ่งที่ต้องเตรียมและทำให้เสร็จก่อน Deploy)

เอกสารรวบรวมรายการตรวจสอบ (Checklist) ขั้นวิกฤตที่ต้องดำเนินการให้เสร็จสิ้นก่อนนำระบบ **NIDA E-Commerce** (Storefront, Admin Portal, Customer API, Admin API, Database, Redis) ขึ้นสู่สภาพแวดล้อมจริง (Production Environment) เพื่อความปลอดภัย เสถียรภาพ และความพร้อมในการรองรับลูกค้าจริง

---

## สารบัญ
1. [ความปลอดภัยและการจัดการ Secret Keys](#1-ความปลอดภัยและการจัดการ-secret-keys)
2. [ระบบฐานข้อมูลและการจัดการ Schema (Database & Migrations)](#2-ระบบฐานข้อมูลและการจัดการ-schema-database--migrations)
3. [ระบบจัดเก็บไฟล์รูปภาพ (Cloud Storage & Assets)](#3-ระบบจัดเก็บไฟล์รูปภาพ-cloud-storage--assets)
4. [เกตเวย์การชำระเงินและ Webhook (Payment Gateway: Omise)](#4-เกตเวย์การชำระเงินและ-webhook-payment-gateway-omise)
5. [ระบบคิวและ Background Workers (Redis & BullMQ)](#5-ระบบคิวและ-background-workers-redis--bullmq)
6. [ระบบส่งอีเมลแจ้งเตือนและ OTP (Transactional Mailer)](#6-ระบบส่งอีเมลแจ้งเตือนและ-otp-transactional-mailer)
7. [การตั้งค่า CORS และความปลอดภัยระดับ HTTP](#7-การตั้งค่า-cors-และความปลอดภัยระดับ-http)
8. [การตรวจสอบความถูกต้องของโค้ดและการทดสอบ (Build & Verification)](#8-การตรวจสอบความถูกต้องของโค้ดและการทดสอบ-build--verification)
9. [รายการ Environment Variables รวมทุก Service](#9-รายการ-environment-variables-รวมทุก-service)

---

## 1. ความปลอดภัยและการจัดการ Secret Keys

- [ ] **เปลี่ยน JWT Secrets ให้เป็น Cryptographic Random Strings**
  - ห้ามใช้ Default Secret จากโค้ดสำหรับ Production เด็ดขาด
  - ต้องสร้างคีย์ความยาวอย่างน้อย 64 ตัวอักษร (เช่น ใช้ `openssl rand -base64 48`):
    - `JWT_CUSTOMER_SECRET`: คีย์เข้ารหัส Token ของลูกค้าหน้าร้าน (`apps/api`)
    - `JWT_ACCESS_SECRET`: คีย์เข้ารหัส Access Token ของแอดมิน (`apps/admin-api`)
    - `JWT_REFRESH_SECRET`: คีย์เข้ารหัส Refresh Token ของแอดมิน (`apps/admin-api`)
- [x] **ป้องกัน Swagger API Documentation บน Production**
  - ปิดการเข้าถึง Swagger หรือครอบด้วย Basic Auth บน Production เพื่อไม่ให้โครงสร้าง API และ Schema รั่วไหล:
  ```ts
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api/docs', app, document);
  }
  ```
- [x] **เปิดใช้งาน HTTP Security Headers (Helmet)**
  - ติดตั้งและเปิดใช้งาน `helmet` บนทั้ง `apps/api` และ `apps/admin-api` เพื่อป้องกัน XSS, Clickjacking, MIME sniffing
- [ ] **เปิดใช้งาน API Rate Limiting (Throttler)**
  - ป้องกันการยิง Brute-force OTP, รหัสผ่านแอดมิน, หรือ DDoS ด้วย `@nestjs/throttler`

---

## 2. ระบบฐานข้อมูลและการจัดการ Schema (Database & Migrations)

- [ ] **ห้ามใช้ `prisma db push` บน Production**
  - ใช้เฉพาะคำสั่ง Migration ที่ผ่านการทดสอบแล้ว:
    ```bash
    npm --prefix packages/database run prisma:migrate:deploy
    ```
- [ ] **ตั้งค่า Connection Pooler (สำคัญมากสำหรับ Free/Serverless Tier)**
  - ผู้ให้บริการ PostgreSQL ฟรี (เช่น Supabase, Neon) มีขีดจำกัด Connection พร้อมกันต่ำ (เช่น 10-20 connections)
  - ต้องเชื่อมต่อผ่าน Connection Pooler (PgBouncer หรือ Prisma Data Proxy) โดยใช้ `connection_limit=10` หรือ `pgbouncer=true` ใน `DATABASE_URL`
- [ ] **รัน Seed ข้อมูลระบบที่จำเป็น (Initial System Seed)**
  - รันคำสั่ง Seed เพื่อสร้าง:
    1. Roles & Granular Permissions พื้นฐาน
    2. บัญชี Super Admin แรกเริ่มสำหรับเข้าระบบ (บังคับเปลี่ยนรหัสผ่านทันทีหลังล็อกอินครั้งแรก)
    3. หมวดหมู่สินค้าหลัก (Departments, Categories, Sub-Categories)

---

## 3. ระบบจัดเก็บไฟล์รูปภาพ (Cloud Storage & Assets)

- [ ] **ย้ายโฟลเดอร์ Local Uploads ขึ้น Cloud Storage**
  - ปัจจุบัน `apps/admin-api/uploads/` เก็บไฟล์ไว้ในเครื่อง Server โลคอล ซึ่งบน Cloud Free Tier (เช่น Render, Railway, Vercel) ไฟล์จะหายไปทันทีเมื่อ Server Restart หรือ Redeploy (Ephemeral Filesystem)
  - สิ่งที่ต้องต่อบริการจริง:
    - รูปภาพสินค้าและ Cover Colors
    - รูปภาพ CMS Banners
    - รูปภาพสลิปชำระเงินโอนบัญชี (Bank Transfer Receipts)
    - ใบเสร็จค่าจัดส่งพัสดุคืนของลูกค้า (Return Shipping Receipts)
  - **ผู้ให้บริการฟรีที่แนะนำ**: Cloudinary (ฟรี 25GB/เดือน), Supabase Storage (ฟรี 1GB), หรือ Cloudflare R2 (ฟรี 10GB/เดือน ไม่มีค่า Egress Transfer)

---

## 4. เกตเวย์การชำระเงินและ Webhook (Payment Gateway: Omise)

- [ ] **สลับ Omise API Keys จาก Test Mode เป็น Live Mode**
  - หน้าร้าน (`apps/store`): `NEXT_PUBLIC_OMISE_PUBLIC_KEY` (เปลี่ยนจาก `pkey_test_...` เป็น `pkey_...`)
  - แบ็กเอนด์ (`apps/api`, `apps/admin-api`): `OMISE_SECRET_KEY` (เปลี่ยนจาก `skey_test_...` เป็น `skey_...`)
- [ ] **ลงทะเบียน Webhook Endpoint บน Omise Dashboard**
  - เข้าสู่ Omise Dashboard > Settings > Webhooks
  - เพิ่ม URL: `https://<your-storefront-api-domain>/api/v1/orders/webhook/omise`
  - ตรวจสอบให้แน่ใจว่า Webhook รองรับ Event:
    - `charge.complete`
    - `refund.create`
- [ ] **ทดสอบ Return URL / Callback URL**
  - ตรวจสอบ `STORE_FRONTEND_URL` ใน backend ให้ชี้ไปยังโดเมนจริงของหน้าร้าน เช่น `https://www.nidabrand.com` เพื่อให้ระบบพาลูกค้ากลับมาหน้า `/payment/omise-callback` อย่างถูกต้องหลังสแกน PromptPay หรือตัดบัตรเสร็จ

---

## 5. ระบบคิวและ Background Workers (Redis & BullMQ)

- [ ] **ตั้งค่า Redis Production Connection**
  - เชื่อมต่อกับ Redis ที่มีรหัสผ่านและรองรับ SSL/TLS (เช่น `rediss://...`)
  - ตรวจสอบว่าคิว BullMQ ต่อไปนี้ทำงานอย่างต่อเนื่อง:
    1. `order-timeout` (ยกเลิกออเดอร์ที่ยังไม่ชำระเงินอัตโนมัติ)
    2. `cancellation-review` (อนุมัติคำขอยกเลิกออเดอร์อัตโนมัติหากแอดมินไม่ตอบรับใน 48 ชม.)
    3. `delivery-complete` (เปลี่ยนสถานะออเดอร์เป็น Completed อัตโนมัติใน 5 วันหลังจัดส่ง)
    4. `return-shipment` (หมดอายุคำขอคืนสินค้าอัตโนมัติหากลูกค้าไม่ส่งเลขพัสดุใน 7 วัน)
- [ ] **ป้องกัน Redis Server Sleep บน Free Tier**
  - หากใช้ Redis ฟรี (เช่น Upstash หรือ Aiven) ตรวจสอบโควต้า Max Daily Commands ไม่ให้เกินขีดจำกัด

---

## 6. ระบบส่งอีเมลแจ้งเตือนและ OTP (Transactional Mailer)

- [x] **เปลี่ยนจาก Log/Mock Mailer เป็น Production SMTP/API Mailer**
  - ติดตั้งและตั้งค่า Nodemailer SMTP Transport พร้อม Development Logger Fallback เรียบร้อยแล้ว
  - รองรับทั้ง SMTP Host, Port, Secure, User, Pass, และ From Name/Address
  - ตั้งค่า Environment Variables:
    - `MAIL_HOST` (หรือ `SMTP_HOST`), `MAIL_PORT` (หรือ `SMTP_PORT`), `MAIL_USER` (หรือ `SMTP_USER`), `MAIL_PASSWORD` (หรือ `SMTP_PASS`), `MAIL_FROM`

---

## 7. การตั้งค่า CORS และความปลอดภัยระดับ HTTP

- [x] **ระบุ Origin ใน CORS Whitelist อย่างเข้มงวด**
  - รองรับการตั้งค่าผ่าน `ALLOWED_ORIGINS` (comma-separated), `STORE_FRONTEND_URL`, และ `ADMIN_FRONTEND_URL`
  - หากอยู่ในโหมด Production จะปฏิเสธ Origin แปลกปลอมที่ไม่ตรงกับ Whitelist ทันที
  - ใน `apps/api/src/main.ts`:
    ```ts
    const isProd = process.env.NODE_ENV === 'production';
    app.enableCors({
      origin: isProd ? allowedOrigins : (origin, callback) => { /* dev allowed */ },
      credentials: true,
    });
    ```
  - ใน `apps/admin-api/src/main.ts`:
    ```ts
    const isProd = process.env.NODE_ENV === 'production';
    app.enableCors({
      origin: isProd ? allowedOrigins : (origin, callback) => { /* dev allowed */ },
      credentials: true,
    });
    ```

---

## 8. การตรวจสอบความถูกต้องของโค้ดและการทดสอบ (Build & Verification)

รันคำสั่งเหล่านี้บนเครื่อง Development หรือ CI/CD ก่อนเริ่ม Deploy และต้องผ่าน 100% โดยไม่มี Error:

```bash
# 1. ทดสอบสร้าง Package Types และ Validators
npm --prefix packages/types run build
npm --prefix packages/validators run build

# 2. รัน Unit Tests ทุกชุดบนทั้งสอง API (ต้องผ่านทั้งหมด)
npm --prefix apps/api run test
npm --prefix apps/admin-api run test

# 3. ทดสอบการ Build Production Bundle ครบทุกแอปพลิเคชัน
npm --prefix apps/api run build
npm --prefix apps/admin-api run build
npm --prefix apps/admin run build
npm --prefix apps/store run build
```

---

## 9. รายการ Environment Variables รวมทุก Service

### 🛍️ Storefront Web (`apps/store` - Next.js)
```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api/v1"
NEXT_PUBLIC_OMISE_PUBLIC_KEY="pkey_live_..."
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### 🛡️ Admin Portal Web (`apps/admin` - Vite React)
```env
VITE_API_URL="https://admin-api.yourdomain.com/api/v1"
```

### ⚡ Customer API (`apps/api` - NestJS)
```env
PORT=4001
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@dbhost:5432/dbname?schema=public&connection_limit=10"
REDIS_HOST="redishost"
REDIS_PORT=6379
REDIS_PASSWORD="strongredispassword"
JWT_CUSTOMER_SECRET="your-64-char-customer-jwt-secret"
OMISE_PUBLIC_KEY="pkey_live_..."
OMISE_SECRET_KEY="skey_live_..."
STORE_FRONTEND_URL="https://yourdomain.com"
```

### ⚙️ Admin API (`apps/admin-api` - NestJS)
```env
PORT=4000
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@dbhost:5432/dbname?schema=public&connection_limit=10"
REDIS_HOST="redishost"
REDIS_PORT=6379
REDIS_PASSWORD="strongredispassword"
JWT_ACCESS_SECRET="your-64-char-admin-access-secret"
JWT_REFRESH_SECRET="your-64-char-admin-refresh-secret"
OMISE_PUBLIC_KEY="pkey_live_..."
OMISE_SECRET_KEY="skey_live_..."
ADMIN_FRONTEND_URL="https://admin.yourdomain.com"
```
