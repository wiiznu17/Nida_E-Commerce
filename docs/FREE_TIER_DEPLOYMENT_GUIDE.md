# NIDA E-Commerce — Free Tier Production Deployment Guide (คู่มือ Deploy สู่ Production สายฟรี 100%)

คู่มือนี้สรุปขั้นตอนการนำโปรเจกต์ **NIDA E-Commerce (Monorepo Turborepo)** ขึ้นสู่ระบบจริง (Production) โดยใช้บริการ **Cloud Free Tier 100%** ที่มีประสิทธิภาพสูง รองรับ SSL อัตโนมัติ และไม่มีค่าใช้จ่ายรายเดือน

---

## สารบัญ
1. [สถาปัตยกรรมระบบสายฟรี (Free-Tier Architecture Map)](#1-สถาปัตยกรรมระบบสายฟรี-free-tier-architecture-map)
2. [ขั้นตอนที่ 1: ติดตั้งฐานข้อมูล PostgreSQL (Neon / Supabase)](#ขั้นตอนที่-1-ติดตั้งฐานข้อมูล-postgresql-neon--supabase)
3. [ขั้นตอนที่ 2: ติดตั้ง Redis สำหรับระบบคิว BullMQ (Upstash Redis)](#ขั้นตอนที่-2-ติดตั้ง-redis-สำหรับระบบคิว-bullmq-upstash-redis)
4. [ขั้นตอนที่ 3: ติดตั้งที่เก็บรูปภาพ (Cloudinary / Supabase Storage)](#ขั้นตอนที่-3-ติดตั้งที่เก็บรูปภาพ-cloudinary--supabase-storage)
5. [ขั้นตอนที่ 4: Deploy แบ็กเอนด์ API ทั้งสองตัว (Render / Koyeb)](#ขั้นตอนที่-4-deploy-แบ็กเอนด์-api-ทั้งสองตัว-render--koyeb)
6. [ขั้นตอนที่ 5: เทคนิคแก้ปัญหา Free Server หลับ (Keep-Alive ด้วย UptimeRobot)](#ขั้นตอนที่-5-เทคนิคแก้ปัญหา-free-server-หลับ-keep-alive-ด้วย-uptimerobot)
7. [ขั้นตอนที่ 6: Deploy หน้าร้าน Storefront Web (Vercel)](#ขั้นตอนที่-6-deploy-หน้าร้าน-storefront-web-vercel)
8. [ขั้นตอนที่ 7: Deploy แอดมิน Admin Portal Web (Cloudflare Pages)](#ขั้นตอนที่-7-deploy-แอดมิน-admin-portal-web-cloudflare-pages)
9. [ขั้นตอนที่ 8: ผูกโดเมนเนมและตั้งค่า DNS (Cloudflare DNS)](#ขั้นตอนที่-8-ผูกโดเมนเนมและตั้งค่า-dns-cloudflare-dns)
10. [สรุปตารางขีดจำกัดและข้อควรระวังของสายฟรี](#10-สรุปตารางขีดจำกัดและข้อควรระวังของสายฟรี)

---

## 1. สถาปัตยกรรมระบบสายฟรี (Free-Tier Architecture Map)

```mermaid
flowchart TD
    subgraph Clients["🌐 ฝั่งผู้ใช้งาน (Frontends)"]
        Store["🛍️ apps/store (Next.js 16)<br/>Host บน Vercel Free Tier"]
        Admin["🛡️ apps/admin (Vite SPA)<br/>Host บน Cloudflare Pages Free Tier"]
    end

    subgraph APIs["⚡ ฝั่งบริการ API (Backends)"]
        StoreAPI["Customer API (Port 4001)<br/>Host บน Render / Koyeb Free"]
        AdminAPI["Admin API (Port 4000)<br/>Host บน Render / Koyeb Free"]
        Worker["BullMQ Worker (Queue Lifecycle)<br/>ทำงานภายใน Process เดียวกับ API"]
    end

    subgraph CloudServices["☁️ ฐานข้อมูลและบริการคลาวด์ (Cloud Infrastructure)"]
        NeonDB[("🐘 PostgreSQL DB<br/>Neon.tech / Supabase Free<br/>(Pooled Connection)")]
        UpstashRedis[("⚡ Redis Cache & Queue<br/>Upstash Serverless Free<br/>(10,000 req/day)")]
        MediaCDN["🖼️ Cloudinary / Supabase<br/>เก็บภาพสินค้าและสลิปฟรี"]
        Mailer["✉️ Resend / Brevo<br/>ส่ง OTP & อีเมลฟรี 3,000 ฉบับ/ด."]
    end

    subgraph Automation["⏰ ตัวช่วยเฝ้าระวังไม่ให้เซิร์ฟเวอร์หลับ"]
        Uptime["🤖 UptimeRobot (Free)<br/>Ping ทุก 5-10 นาที"]
    end

    Store --> StoreAPI
    Admin --> AdminAPI
    StoreAPI --> NeonDB
    StoreAPI --> UpstashRedis
    StoreAPI --> MediaCDN
    StoreAPI --> Mailer
    AdminAPI --> NeonDB
    AdminAPI --> UpstashRedis
    AdminAPI --> MediaCDN
    Uptime -.->|Keep Alive| StoreAPI
    Uptime -.->|Keep Alive| AdminAPI
```

---

## ขั้นตอนที่ 1: ติดตั้งฐานข้อมูล PostgreSQL (Neon / Supabase)

แนะนำให้ใช้ **[Neon.tech](https://neon.tech)** (Serverless PostgreSQL ฟรี 0.5 GB พร้อม Connection Pooling ในตัว) หรือ **[Supabase](https://supabase.com)** (ฟรี 500 MB):

1. **สมัครสมาชิกและสร้าง Project ใหม่** ใน Neon.tech
2. **คัดลอก Connection String**:
   - เลือกโหมด **"Pooled connection"** (ใช้พอร์ต 6543 หรือ `?sslmode=require&pgbouncer=true`)
   - ตัวอย่าง Connection String:
     ```env
     DATABASE_URL="postgresql://user:pass@ep-cool-sample.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connection_limit=10"
     ```
3. **รัน Migration ขึ้น Database ใหม่จากเครื่องคอมพิวเตอร์ของคุณ**:
   ```bash
   # ตั้งค่าชั่วคราวในเครื่องเพื่อยิง Migration ขึ้น Neon
   export DATABASE_URL="postgresql://user:pass@ep-cool-sample.../neondb?sslmode=require"
   
   # รัน Migration
   npm --prefix packages/database run prisma:migrate:deploy
   
   # รัน Seed ข้อมูลตั้งต้น (หมวดหมู่, สิทธิ์, บัญชีแอดมิน)
   npm --prefix packages/database run prisma:seed
   ```

---

## ขั้นตอนที่ 2: ติดตั้ง Redis สำหรับระบบคิว BullMQ (Upstash Redis)

**[Upstash](https://upstash.com)** ให้บริการ Serverless Redis ฟรี 10,000 requests/วัน ซึ่งเพียงพอต่อระบบคิวจัดการออเดอร์ของร้านค้า:

1. สมัครสมาชิก Upstash และกด **"Create Database"**
2. เลือก Region: **Singapore** หรือโซนที่ใกล้กับฐานข้อมูล PostgreSQL
3. ในหน้า Database Details ดูหัวข้อ **Node.js / ioredis**:
   - คัดลอกค่า:
     - `REDIS_HOST` (เช่น `apn1-super-redis-12345.upstash.io`)
     - `REDIS_PORT` (เช่น `6379`)
     - `REDIS_PASSWORD` (Token รหัสผ่านยาว)
   - หรือคัดลอก Connection URL: `rediss://default:password@host:6379`

---

## ขั้นตอนที่ 3: ติดตั้งที่เก็บรูปภาพ (Cloudinary / Supabase Storage)

เนื่องจาก Cloud Server ฟรีเป็นแบบ **Ephemeral Filesystem** (ไฟล์โลคอลจะหายไปทุกครั้งที่ Deploy หรือเซิร์ฟเวอร์รีสตาร์ท):

1. สมัครใช้งาน **[Cloudinary](https://cloudinary.com)** (ฟรี 25 Credits/เดือน รองรับรูปภาพสินค้าได้หลักหมื่นรูป)
2. คัดลอกค่า:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
*(หรือใช้ Supabase Storage Bucket ฟรี 1GB โดยเปิด Bucket เป็น Public เพื่อแสดงรูปภาพสินค้า)*

---

## ขั้นตอนที่ 4: Deploy แบ็กเอนด์ API ทั้งสองตัว (Render / Koyeb)

เราจะใช้ **[Render.com](https://render.com)** (ฟรี 750 ชม./เดือน สำหรับ Web Service) หรือ **[Koyeb.com](https://koyeb.com)** (ฟรี Eco Instance 1 ตัวตลอดชีพ):

### 4.1 Deploy Customer API (`apps/api` - Port 4001)
1. เข้า Render Dashboard > กด **New +** > เลือก **Web Service**
2. เชื่อมต่อ Git Repository ของโปรเจกต์ `Nida_Project`
3. ตั้งค่าการตั้งค่า Service:
   - **Name**: `nida-customer-api`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: ปล่อยว่าง (อยู่ที่ Root ของ Monorepo)
   - **Runtime**: Node
   - **Build Command**:
     ```bash
     npm install && npm --prefix packages/types run build && npm --prefix packages/validators run build && npm --prefix apps/api run build
     ```
   - **Start Command**:
     ```bash
     node apps/api/dist/main.js
     ```
   - **Instance Type**: Free
4. เพิ่ม **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=10000
   STORE_API_PORT=10000
   DATABASE_URL=postgresql://user:pass@ep-...neon.tech/neondb?sslmode=require&connection_limit=10
   REDIS_HOST=apn1-super-redis-12345.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your_upstash_password
   JWT_CUSTOMER_SECRET=generate_your_random_64_char_secret_key
   OMISE_PUBLIC_KEY=pkey_live_...
   OMISE_SECRET_KEY=skey_live_...
   STORE_FRONTEND_URL=https://your-store.vercel.app
   ```

### 4.2 Deploy Admin API (`apps/admin-api` - Port 4000)
1. ทำขั้นตอนแบบเดียวกับด้านบนใน Render อีก 1 Web Service
2. ตั้งค่า Service:
   - **Name**: `nida-admin-api`
   - **Build Command**:
     ```bash
     npm install && npm --prefix packages/types run build && npm --prefix packages/validators run build && npm --prefix apps/admin-api run build
     ```
   - **Start Command**:
     ```bash
     node apps/admin-api/dist/src/main.js
     ```
3. เพิ่ม **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=10000
   ADMIN_API_PORT=10000
   DATABASE_URL=postgresql://user:pass@ep-...neon.tech/neondb?sslmode=require&connection_limit=10
   REDIS_HOST=apn1-super-redis-12345.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your_upstash_password
   JWT_ACCESS_SECRET=generate_your_random_admin_access_secret
   JWT_REFRESH_SECRET=generate_your_random_admin_refresh_secret
   ADMIN_FRONTEND_URL=https://your-admin.pages.dev
   ```

---

## ขั้นตอนที่ 5: เทคนิคแก้ปัญหา Free Server หลับ (Keep-Alive ด้วย UptimeRobot)

> [!IMPORTANT]
> **ปัญหาของ Render Free Tier**: หากไม่มีคำขอเรียกใช้งาน (HTTP Request) นานเกิน 15 นาที เซิร์ฟเวอร์จะตัดเข้าสู่โหมด "Sleep" (หลับ) และเมื่อมีผู้ใช้เปิดเว็บคนแรกจะต้องรอ Cold Start นาน 30-50 วินาที

### วิธีแก้ปัญหาให้เซิร์ฟเวอร์ตื่นตัวตลอด 24 ชั่วโมง (ฟรี 100%):
1. สมัครใช้งาน **[UptimeRobot](https://uptimerobot.com)** (ฟรี 50 จอมอนิเตอร์)
2. กด **"Add New Monitor"**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Nida Customer API Keep-Alive`
   - **URL (or IP)**: `https://nida-customer-api.onrender.com/api/v1/health`
   - **Monitoring Interval**: ทุก `5 minutes`
3. เพิ่มอีก 1 Monitor สำหรับ Admin API:
   - **URL**: `https://nida-admin-api.onrender.com/api/v1/health`
   - **Monitoring Interval**: ทุก `5 minutes`
4. **ผลลัพธ์**: UptimeRobot จะยิง Health Check ส่งสัญญาณเบาๆ ทุก 5 นาที ทำให้ Render คิดว่ามีผู้ใช้งานตลอดเวลา และจะไม่หลับอีกต่อไป

---

## ขั้นตอนที่ 6: Deploy หน้าร้าน Storefront Web (Vercel)

Next.js 16 App Router ทำงานได้เต็มประสิทธิภาพสูงสุดบน **[Vercel](https://vercel.com)**:

1. เข้า Vercel Dashboard > กด **Add New...** > **Project**
2. เลือก Repository `Nida_Project`
3. ตั้งค่าโปรเจกต์:
   - **Framework Preset**: Next.js
   - **Root Directory**: กด Edit และเลือกโฟลเดอร์ `apps/store`
   - **Build Command**:
     ```bash
     cd ../.. && npm --prefix packages/types run build && npm --prefix apps/store run build
     ```
   - **Output Directory**: `.next`
4. เพิ่ม **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://nida-customer-api.onrender.com/api/v1
   NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_live_...
   NEXT_PUBLIC_SITE_URL=https://your-store.vercel.app
   ```
5. กด **Deploy**

---

## ขั้นตอนที่ 7: Deploy แอดมิน Admin Portal Web (Cloudflare Pages)

แอดมินพอร์ทัล (`apps/admin`) เป็น Single Page Application (Vite + React) ซึ่งเหมาะกับการโฮสต์บน **[Cloudflare Pages](https://pages.cloudflare.com)** (ฟรี Bandwidth ไม่จำกัด, ทั่วโลก CDN รวดเร็วมาก):

1. สมัคร Cloudflare > เข้าเมนู **Workers & Pages** > **Create application** > แท็บ **Pages** > **Connect to Git**
2. เลือก Repository `Nida_Project`
3. ตั้งค่าการ Build:
   - **Project Name**: `nida-admin-portal`
   - **Production Branch**: `main`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/admin`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Build Output Directory**: `dist`
4. เพิ่ม **Environment Variable**:
   ```env
   VITE_API_URL=https://nida-admin-api.onrender.com/api/v1
   ```
5. กด **Save and Deploy**
6. **ตั้งค่า SPA Routing Rule**:
   - ใน Cloudflare Pages ไปที่แท็บ Settings > สร้างไฟล์ `_redirects` ในโฟลเดอร์ `apps/admin/public/_redirects`:
     ```text
     /*    /index.html   200
     ```
   - เพื่อให้เวลา Refresh หน้าแล้วไม่ติด 404 Not Found

---

## ขั้นตอนที่ 8: ผูกโดเมนเนมและตั้งค่า DNS (Cloudflare DNS)

หากคุณมีโดเมนเนมส่วนตัว (เช่น ซื้อจาก Namecheap หรือ GoDaddy ราคา ~300 บาท/ปี):

1. นำ Nameservers ของโดเมนไปชี้ที่ **Cloudflare** (ฟรี DNS Management + Free SSL)
2. กำหนด DNS Records ดังนี้:

| Type | Name (Host) | Target (ชี้ไปที่) | บริการปลายทาง |
| :--- | :--- | :--- | :--- |
| **CNAME** | `@` หรือ `www` | `cname.vercel-dns.com` | หน้าร้าน (Vercel) |
| **CNAME** | `admin` | `nida-admin-portal.pages.dev` | แอดมินพอร์ทัล (Cloudflare Pages) |
| **CNAME** | `api` | `nida-customer-api.onrender.com` | Customer API (Render) |
| **CNAME** | `admin-api` | `nida-admin-api.onrender.com` | Admin API (Render) |

3. เมื่อตั้งค่า DNS แล้ว อย่าลืมอัปเดต **CORS Whitelist** ใน API ทั้งสองตัวให้ยอมรับโดเมนจริงของคุณ

---

## 10. สรุปตารางขีดจำกัดและข้อควรระวังของสายฟรี

| บริการ | ขีดจำกัด Free Tier | ความเสี่ยงที่ต้องระวัง | วิธีจัดการ |
| :--- | :--- | :--- | :--- |
| **Vercel** (Storefront) | 100 GB Bandwidth/เดือน | โควต้า Serverless Function Execution | เปิดใช้งาน Image Optimization แคชอย่างเหมาะสม |
| **Cloudflare Pages** (Admin) | Unlimited Bandwidth | ไม่มี | เสถียรและเร็วที่สุด เหมาะกับ SPA |
| **Render** (APIs) | 750 ชั่วโมง/เดือน (Instance หลับใน 15 นาที) | Cold Start นาน 30-50 วินาที | ใช้ UptimeRobot คอยยิง Ping ทุก 5 นาที |
| **Neon** (Postgres DB) | 0.5 GB Storage | ขีดจำกัด Active Connections ต่ำ | ต้องใช้ Pooled Connection (`pgbouncer`) เสมอ |
| **Upstash** (Redis) | 10,000 requests/วัน | คิว BullMQ อาจยิงคำสั่งถี่เกินโควต้า | ปรับ Delay ของ Worker ให้เหมาะสม |
| **Resend** (Email) | 3,000 emails/เดือน (100 ฉบับ/วัน) | เกินโควต้าวันละ 100 ฉบับ | ใช้เฉพาะ Transactional Email สำคัญ (OTP, ใบสั่งซื้อ) |
