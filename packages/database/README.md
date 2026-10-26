# @repo/database — Database Layer & Seeding Documentation

โมดูลจัดการฐานข้อมูล PostgreSQL ผ่าน Prisma ORM ครอบคลุม Schema, Migrations และ Modular Seeding Architecture

---

## 📜 คำสั่งสำหรับใช้งาน (CLI Scripts)

สามารถรันคำสั่งเหล่านี้จาก root workspace ด้วย flag `-w @repo/database` หรือรันตรงภายในโฟลเดอร์ `packages/database`:

| คำสั่ง                      | การทำงาน                    | จุดประสงค์                                                     |
| :-------------------------- | :-------------------------- | :------------------------------------------------------------- |
| `npm run db:seed`           | รัน `tsx src/seed.ts`       | 🧪 **Development Seed** (ล้างตาราง + ข้อมูลจำลองครบวงจร)       |
| `npm run db:seed:prod`      | รัน `tsx src/seed-prod.ts`  | 🛡️ **Production Seed** (ปลอดภัย 100%, Idempotent, ไม่ลบข้อมูล) |
| `npm run db:generate`       | รัน `prisma generate`       | สร้าง Prisma Client ไปยัง `src/generated/prisma`               |
| `npm run db:push`           | รัน `prisma db push`        | Push Schema เข้า DB ตรงโดยไม่ผ่าน Migration (Local Dev)        |
| `npm run db:migrate:deploy` | รัน `prisma migrate deploy` | รัน Migration SQL ที่ยังค้างอยู่ใน Production/Staging          |
| `npm run db:migrate:status` | รัน `prisma migrate status` | ตรวจสอบสถานะของ Migration                                      |
| `npm run db:studio`         | รัน `prisma studio`         | เปิด GUI สำหรับดูและแก้ไขข้อมูลในตารางผ่าน Web Browser         |

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
