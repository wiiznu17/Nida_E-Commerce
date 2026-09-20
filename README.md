# Nida (นิดา) — Modern Classic Apparel & Lifestyle Platform

Nida คือแพลตฟอร์ม E-Commerce สำหรับแบรนด์แฟชั่นและไลฟ์สไตล์ระดับพรีเมียม (Modern Classic Apparel & Lifestyle) พัฒนาบนสถาปัตยกรรม **Monorepo (Turborepo)** ที่มีทั้งหน้าร้าน (Storefront), ระบบแอดมินหลังบ้าน (Admin Portal), เซิร์ฟเวอร์ API (NestJS), และฐานข้อมูล (Prisma ORM บน PostgreSQL)

---

## 🏗️ โครงสร้าง Monorepo (Workspace Architecture)

```
Nida_Project/
├── apps/
│   ├── storefront/     # Next.js 16 (App Router) + React 19 + TailwindCSS v4 (สำหรับลูกค้า)
│   ├── admin/          # React 19 + Vite + TailwindCSS v4 (สำหรับทีมงานแอดมินหลังบ้าน)
│   └── api/            # NestJS Backend + Swagger API Documentation (พอร์ต 4000)
├── packages/
│   ├── database/       # Prisma Schema & PostgreSQL Client, Migrations, Seed script
│   ├── ui/             # Shared UI Component Library
│   ├── validators/     # Shared Zod Schemas & Validation Logic
│   ├── eslint-config/  # Shared ESLint Configuration
│   ├── prettier-config/# Shared Prettier Code Style
│   └── typescript-config/# Shared TypeScript tsconfig
├── docker-compose.yml  # PostgreSQL 16 + pgAdmin 4 Container Setup
└── README.md           # คู่มือการติดตั้งและคำสั่งใช้งาน
```

---

## 🚀 เริ่มต้นใช้งานอย่างรวดเร็ว (Quick Setup Guide)

### 1. ความต้องการของระบบ (Prerequisites)

- **Node.js**: v20 ขึ้นไป (แนะนำ v22 หรือ v24)
- **Docker Desktop**: สำหรับรัน PostgreSQL และ pgAdmin

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env` ที่ root ของโปรเจกต์:

```bash
cp .env.example .env
```

_(ค่าเริ่มต้นถูกกำหนดไว้สำหรับ Local Development เรียบร้อยแล้ว)_

---

## 🗄️ การจัดการฐานข้อมูล (Database & Docker)

### 1. เริ่มต้น PostgreSQL และ pgAdmin ผ่าน Docker

เปิดโปรแกรม **Docker Desktop** แล้วรันคำสั่ง:

```bash
docker compose up -d
```

- **PostgreSQL**: ทำงานที่พอร์ต `5432` (`localhost:5432/ecommerce_db`)
- **pgAdmin 4**: เข้าใช้งานผ่านเว็บเบราว์เซอร์ที่ `http://localhost:5050`
  - **Email**: `admin@admin.com`
  - **Password**: `admin`

### 2. ผลักดัน Schema เข้าฐานข้อมูล (Push Schema)

```bash
npm run db:push -w @repo/database
```

### 3. เติมข้อมูลตัวอย่าง (Run Seed Data)

คำสั่งนี้จะสร้างหมวดหมู่, สินค้าพร้อมไซส์และสต็อก, สินค้า Pre-order, คูปองส่วนลด, และบัญชี Super Admin:

```bash
npm run db:seed -w @repo/database
```

#### 🔑 ข้อมูลบัญชีและคูปองตัวอย่างที่ถูกสร้าง:

- **Super Admin Login**:
  - **Email**: `admin@nida-apparel.com`
  - **Username**: `superadmin`
  - **Password**: `admin123`
- **โค้ดคูปองส่วนลด (Sample Coupons)**:
  - `NIDA20`: ลด 20% (เมื่อซื้อขั้นต่ำ $100 ลดสูงสุด $50)
  - `FREESHIP`: ยกเว้นค่าจัดส่งฟรี (เมื่อซื้อขั้นต่ำ $50)
  - `WELCOME50`: ลดทันที $50 (เมื่อซื้อขั้นต่ำ $200)

### 4. เปิดดูตารางฐานข้อมูลผ่าน GUI (Prisma Studio)

```bash
npm run db:studio -w @repo/database
```

เปิดดูที่ `http://localhost:5555`

---

## 🖥️ การรัน Application เพื่อพัฒนา (Local Development)

คุณสามารถเลือกรันทีละระบบ หรือรันทั้งหมดพร้อมกันได้:

### รันทุกระบบพร้อมกัน (Turborepo Dev Mode)

```bash
npm run dev
```

### หรือเลือกรันเฉพาะระบบที่ต้องการ:

| ระบบ                               | คำสั่งรัน           | URL ในการเข้าใช้งาน                                              |
| :--------------------------------- | :------------------ | :--------------------------------------------------------------- |
| **Storefront (หน้าร้าน)**          | `npm run dev:store` | [http://localhost:3000](http://localhost:3000)                   |
| **Admin Portal (หลังบ้าน)**        | `npm run dev:admin` | [http://localhost:5173](http://localhost:5173)                   |
| **API Server (NestJS)**            | `npm run dev:api`   | [http://localhost:4000](http://localhost:4000)                   |
| **Interactive API Docs (Swagger)** | _(รัน API ก่อน)_    | [http://localhost:4000/api/docs](http://localhost:4000/api/docs) |

---

## 🛠️ คำสั่งตรวจสอบคุณภาพโค้ด (Quality & Verification)

```bash
# ตรวจสอบ TypeScript Types ทั่วทั้ง Monorepo
npm run check-types

# ตรวจสอบ Prettier Code Formatting
npm run format:check

# จัด Format โค้ดทั้งหมดอัตโนมัติ
npm run format

# Build ทุกโปรเจกต์
npm run build
```

---

## 🌟 ฟีเจอร์สำคัญที่รองรับในฐานข้อมูล (Core Database Features)

1. **Pre-Order Engine**: รองรับสินค้าสั่งจองล่วงหน้า, กำหนดวันปล่อยสินค้า, และโควตายอดจอง
2. **Promotion & Coupon Engine**: โค้ดส่วนลด %, บาท, ส่งฟรี, เพดานลดสูงสุด, และระบบป้องกันโกง
3. **Weight & Dimensions**: คำนวณค่าจัดส่งตามจริงจากน้ำหนักกรัมและขนาดพัสดุ
4. **Pro-rated Net Price Calculation**: คำนวณยอดเงินที่จ่ายจริงต่อชิ้นสำหรับกรณีขอคืนเงินบางส่วน
5. **Partial Refund Ledger**: สมุดบันทึกการคืนเงินย่อย พร้อม Audit ผู้ดำเนินการเพื่อตรวจสอบทางบัญชี
6. **Lightweight Return Request**: ระบบคำขอคืนสินค้าแบบเรียบง่าย ลูกค้าแจ้งขอ แอดมินอนุมัติ/ปฏิเสธ
7. **Loyalty Points Ledger**: สมุดบันทึกประวัติการได้/ใช้แต้มสะสม ป้องกันแต้มสูญหาย
8. **Payment Security**: รองรับ Idempotency Key และเกตเวย์ Webhook เพื่อความปลอดภัยสูงสุด
