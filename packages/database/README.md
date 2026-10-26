# @repo/database — Database Layer & Seeding Documentation

โมดูลจัดการฐานข้อมูล PostgreSQL ผ่าน Prisma ORM ครอบคลุม Schema, Migrations และ Modular Seeding Architecture

---

## 📜 คำสั่งสำหรับใช้งาน (CLI Scripts)

สามารถรันคำสั่งเหล่านี้จาก root workspace ด้วย flag `-w @repo/database` หรือรันตรงภายในโฟลเดอร์ `packages/database`:

| คำสั่ง                      | การทำงาน                    | จุดประสงค์                                                        |
| :-------------------------- | :-------------------------- | :---------------------------------------------------------------- |
| `npm run db:migrate:deploy` | รัน `prisma migrate deploy` | 🚀 รัน Migration SQL ที่ยังค้างอยู่ใน Production/Staging/Supabase |
| `npm run db:migrate:reset`  | รัน `prisma migrate reset`  | ⚠️ Drop ฐานข้อมูล, Replay Migrations ทั้งหมดจากศูนย์ และรัน Seed  |
| `npm run db:migrate:status` | รัน `prisma migrate status` | ตรวจสอบสถานะของ Migration เทียบกับฐานข้อมูลจริง                   |
| `npm run db:seed:prod`      | รัน `tsx src/seed-prod.ts`  | 🛡️ **Production Seed** (ปลอดภัย 100%, Idempotent, ไม่ลบข้อมูล)    |
| `npm run db:seed`           | รัน `tsx src/seed.ts`       | 🧪 **Development Seed** (ล้างตาราง + ข้อมูลจำลองครบวงจร)          |
| `npm run db:generate`       | รัน `prisma generate`       | สร้าง Prisma Client ไปยัง `src/generated/prisma`                  |
| `npm run db:studio`         | รัน `prisma studio`         | เปิด GUI สำหรับดูและแก้ไขข้อมูลในตารางผ่าน Web Browser            |
| `npm run db:push`           | รัน `prisma db push`        | Push Schema เข้า DB ตรงโดยไม่ผ่าน Migration _(เฉพาะ Local Dev)_   |

---

## 🗂️ โครงสร้างไฟล์ Seed (Modular Structure)

```
packages/database/src/
├── seeds/
│   ├── common/                       # 🟢 Master Data พื้นฐาน (Idempotent 100%)
│   │   ├── seed-rbac.ts              # ซิงค์ Permissions (10 รายการ) และ Roles (4 บทบาท)
│   │   ├── seed-categories.ts        # Upsert หมวดหมู่สินค้าหลักและย่อย (26 รายการ)
│   │   └── seed-settings.ts          # Upsert ค่าเริ่มต้น StoreSettings (ส่งฟรี ฿1,000, คืน 7 วัน)
│   │
│   ├── prod/                         # 🛡️ Production Initialization
│   │   └── seed-superadmin.ts        # ตรวจสอบและสร้าง Super Admin พร้อม Production Guard
│   │
│   └── dev/                          # 🧪 Mock Data สำหรับการพัฒนาเท่านั้น
│       ├── seed-demo-users.ts        # Demo Staff (3 บัญชี) และ Demo Customers (2 บัญชี)
│       ├── seed-catalog.ts           # เสื้อผ้า สินค้าตัวอย่าง 21 ชิ้น พร้อม SKU Matrix
│       ├── seed-coupons.ts           # คูปองโปรโมชันจำลอง (NIDA20, FREESHIP, WELCOME200)
│       ├── seed-orders.ts            # คำสั่งซื้อจำลอง 6 รายการ พร้อม Tracking & Payment
│       └── seed-cms.ts               # Demo Hero Banners และ Promo Strips
│
├── seed.ts                           # 🚀 Dev Entrypoint (ล้างข้อมูล + รันทุกโมดูล + ติด Guard ดัก Prod)
├── seed-prod.ts                      # 🛡️ Prod Entrypoint (รันเฉพาะ Common + Prod ปลอดภัย 100% ไม่ลบข้อมูล)
└── catalog-seed.data.ts              # ข้อมูล Array หมวดหมู่และสินค้า
```

---

## 🛡️ Production Safety & Environment Variables

สำหรับการรันบน Production (`npm run db:seed:prod`):

- `INITIAL_ADMIN_EMAIL` — อีเมลของ Super Admin (default: `admin@nida-apparel.com`)
- `INITIAL_ADMIN_USERNAME` — Username ของ Super Admin (default: `superadmin`)
- `INITIAL_ADMIN_PASSWORD_HASH` — **จำเป็นต้องระบุใน Production** (bcrypt hash) หากไม่ได้ระบุ ระบบจะปฏิเสธการทำงานทันทีเพื่อป้องกันการใช้รหัสผ่านเริ่มต้น

---

## ☁️ การรีเซ็ตและ Seed ฐานข้อมูลบน Supabase (Migration Workflow)

สำหรับ Supabase เรา**เน้นยึดตามมาตรฐาน SQL Migrations** (`prisma migrate`) โดยไม่ใช้ `db:push`:

### ขั้นที่ 1: ตรวจสอบ Connection ใน `packages/database/.env`

เชื่อมต่อไปยัง Supabase (จำเป็นต้องมีทั้ง Transaction Pooler และ Direct URL):

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### ขั้นที่ 2: เลือกระดับการล้างและ Seed ใหม่

#### ทางเลือก A: ล้างเฉพาะข้อมูลในตารางแล้ว Seed ใหม่ (Data Reset — ปลอดภัยต่อ Schema)

วิธีนี้จะรักษาประวัติ Migration SQL และตารางเดิมไว้ 100% โดยสั่งล้างข้อมูลทุกตารางผ่าน `deleteMany` แล้วลงข้อมูลชุดใหม่:

```bash
# ล้างข้อมูลและ Seed ข้อมูลตัวอย่างใหม่
FORCE_DEV_SEED=true npm --prefix packages/database run db:seed
```

---

#### ทางเลือก B: ล้างโครงสร้างและ Replay Migration จากศูนย์ (Migration Reset)

หากต้องการล้าง Schema ทั้งหมดบน Supabase แล้วนำไฟล์ Migration SQL ในโฟลเดอร์ `prisma/migrations/` มารันใหม่ตั้งแต่ Migration แรก:

```bash
# 1. Drop Schema บน Supabase และ Re-apply Migration SQL ทั้งหมดจากศูนย์
npm --prefix packages/database run db:migrate:reset -- --force

# 2. เลือกลง Seed ที่ต้องการ:
# แบบ Production (มีเฉพาะ Super Admin, RBAC, หมวดหมู่ 26 หมวด, StoreSettings):
npm --prefix packages/database run db:seed:prod

# หรือแบบ Development (มีสินค้าจำลอง 21 รายการ, ออเดอร์, คูปอง):
FORCE_DEV_SEED=true npm --prefix packages/database run db:seed
```

> **กรณีขึ้นระบบใหม่ / Deploy ปกติ (ไม่ลบข้อมูล)**:
> ใช้คำสั่งมาตรฐานเพื่อรันเฉพาะไฟล์ Migration ใหม่ที่ยังค้างอยู่:
>
> ```bash
> npm --prefix packages/database run db:migrate:deploy
> npm --prefix packages/database run db:seed:prod
> ```

### ขั้นที่ 3: ตรวจสอบข้อมูลผ่าน GUI

ตรวจสอบสถานะตารางและข้อมูลบน Supabase:

```bash
# ตรวจสอบสถานะไฟล์ Migration
npm --prefix packages/database run db:migrate:status

# เปิดดูข้อมูลในตารางผ่าน Web Browser
npm --prefix packages/database run db:studio
```
