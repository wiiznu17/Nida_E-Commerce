# Nida — Modern Classic Apparel & Lifestyle Platform

Nida is a full-stack e-commerce platform designed for fashion and lifestyle brands. Built on a **Monorepo architecture powered by Turborepo**, it features a customer-facing storefront, an admin back-office portal, a robust NestJS backend API, and a PostgreSQL database managed via Prisma ORM.

## 🏗️ Workspace Architecture

```
Nida_Project/
├── apps/
│   ├── store/          # Next.js (Customer Storefront)
│   ├── admin/          # React (Admin Portal)
│   └── admin-api/      # NestJS Admin API
|   └── api/            # NestJS Store API
├── packages/
│   ├── database/       # Prisma Schema, PostgreSQL Client, Migrations, and Seed Scripts
│   ├── ui/             # Shared UI Component Library
│   ├── validators/     # Shared Zod Schemas & Validation Logic
│   ├── eslint-config/  # Shared ESLint Configuration
│   ├── prettier-config/# Shared Prettier Code Style
│   └── typescript-config/# Shared TypeScript Configuration
├── docker-compose.yml  # PostgreSQL 16 + pgAdmin 4 Container Setup
└── README.md           # Documentation & Usage Guide

```

## 🚀 Quick Setup Guide

### 1. Prerequisites

- **Node.js**: v20 or higher

- **Docker Desktop**: For running PostgreSQL and pgAdmin containers

### 2. Install Dependencies

```
npm install

```

### 3. Environment Variables

Copy `.env.example` to `.env` at the project root:

```
cp .env.example .env

```

_(Default values are pre-configured for local development.)_

## 🗄️ Database & Docker Setup

### 1. Start PostgreSQL and pgAdmin via Docker

Open **Docker Desktop** and run:

```
docker compose up -d

```

- **PostgreSQL**: Runs on port `5432` (`localhost:5432/ecommerce_db`)

- **pgAdmin 4**: Access via web browser at `http://localhost:5050`

  - **Email**: `admin@admin.com`

  - **Password**: `admin`

### 2. Push Schema to Database

```
npm run db:push -w @repo/database

```

### 3. Database Seeding (Development vs. Production)

คำสั่งสำหรับ Seed ข้อมูล**เหมือนเดิมทุกประการ** โดยแยกตาม Environment อย่างชัดเจน:

#### 🧪 สำหรับ Development (Mock Data ครบวงจร)
ใช้สำหรับเครื่อง Local / Staging เพื่อสร้างข้อมูลจำลองสำหรับการพัฒนา (สินค้า 21 รายการพร้อม SKU Matrix, คำสั่งซื้อตัวอย่าง, Demo Staff, Demo Customers, CMS Banners, คูปองส่วนลด):

```bash
npm run db:seed -w @repo/database
# หรือ
npm --prefix packages/database run db:seed
```

> **🛡️ Production Safeguard**: สคริปต์นี้มี Safety Guard ในตัว หากรันบน `NODE_ENV=production` หรือ Connection String ของ Production ตัวสคริปต์จะปฏิเสธการทำงานทันทีเพื่อป้องกันข้อมูลสูญหาย (Data Loss)

##### 🔑 ข้อมูลเข้าระบบเริ่มต้น (Dev Seed Credentials):
- **Super Administrator**:
  - **Email**: `admin@nida-apparel.com`
  - **Username**: `superadmin`
  - **Password**: `admin123`
- **Demo Staff Users**:
  - `inventory@nida-apparel.com` (บทบาท: `INVENTORY_MANAGER` / รหัสผ่าน: `admin123`)
  - `fulfillment@nida-apparel.com` (บทบาท: `ORDER_MANAGER` / รหัสผ่าน: `admin123`)
  - `marketing@nida-apparel.com` (บทบาท: `MARKETING_ADMIN` / รหัสผ่าน: `admin123`)
- **Demo Customers (Storefront)**:
  - `phannida@nida.com` / `customer@example.com` (รหัสผ่าน: `Password123!`)
- **Sample Coupons**:
  - `NIDA20`: ส่วนลด 20% (ช้อปขั้นต่ำ ฿1,000 ลดสูงสุด ฿500)
  - `FREESHIP`: ส่งฟรีเมื่อช้อปครบ ฿1,000
  - `WELCOME200`: ส่วนลด ฿200 เมื่อช้อปครบ ฿1,500

---

#### 🛡️ สำหรับ Production (Safe Idempotent Setup)
ใช้สำหรับขึ้นระบบจริงครั้งแรกหรือหลังการ Deploy Migration เพื่อเตรียม Master Data พื้นฐาน โดย**ไม่มีการลบข้อมูลเดิม** และ**ไม่มี Demo/Mock Users หลุดไปในระบบจริง**:

```bash
npm run db:seed:prod -w @repo/database
# หรือ
npm --prefix packages/database run db:seed:prod
```

##### ⚙️ สิ่งที่ Production Seed จัดการ:
1. **RBAC Matrix**: ซิงค์ Granular Permissions (10 รายการ) และ Default Roles (4 บทบาท)
2. **Super Admin Initialization**: ตรวจสอบและสร้าง Super Admin (หากยังไม่มี) โดยอ่านจากค่า ENV:
   - `INITIAL_ADMIN_EMAIL` (ค่าเริ่มต้น: `admin@nida-apparel.com`)
   - `INITIAL_ADMIN_USERNAME` (ค่าเริ่มต้น: `superadmin`)
   - `INITIAL_ADMIN_PASSWORD_HASH` *(จำเป็นต้องกำหนดใน Production มิฉะนั้นระบบจะ Abort ทันทีเพื่อความปลอดภัย)*
3. **Core Categories (Taxonomy)**: Upsert หมวดหมู่สินค้าหลักและหมวดย่อยทั้ง 26 หมวดหมู่ (ไทย/อังกฤษ)
4. **Default StoreSettings**: สร้างการตั้งค่าร้านค้าเริ่มต้น (เกณฑ์ส่งฟรี ฿1,000, นโยบายคืนสินค้า 7 วัน, แถบประกาศ)

### 4. Database GUI (Prisma Studio)

```
npm run db:studio -w @repo/database

```

Access Prisma Studio at `http://localhost:5555`.

## 🖥️ Local Development

You can start all services concurrently or run specific applications individually.

### Run All Services (Turborepo Dev Mode)

```
npm run dev
```

## 🌟 Core Database & Business Features

1. **Pre-Order Engine**: Supports advance order items, target release dates, and allocated reservation quotas.

2. **Promotion & Coupon Engine**: Flexible discount rules (percentage, fixed amount, free shipping, discount caps) with abuse-prevention logic.

3. **Weight & Dimensions Matrix**: Accurate shipping fee calculations based on package dimensions and weight (grams).

4. **Pro-rated Net Price Calculation**: Automated item-level net cost breakdown for compliant partial refunds.

5. **Partial Refund Ledger**: Dedicated refund transaction ledger with actor audit trails for financial integrity.

6. **Lightweight Return Workflow**: Streamlined return request lifecycle with customer submission and admin review/approval flows.

7. **Loyalty Points Ledger**: Immutable point balance and transaction history ledger to prevent credit loss or mismatch.

8. **Payment Security**: Built-in Idempotency Key handling and robust payment gateway webhook verification.
