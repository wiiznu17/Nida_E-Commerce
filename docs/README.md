# Nida Platform — Documentation Portal

ศูนย์รวมเอกสารข้อกำหนดเชิงเทคนิค (Specs), รายการสิ่งที่ต้องทำ (Todos), คู่มือการติดตั้งและ Deploy, และคลังเอกสารประวัติการพัฒนาของ Nida Platform

---

## 📂 โครงสร้างโฟลเดอร์เอกสาร (Documentation Structure)

```
docs/
├── specs/       # 📐 ข้อกำหนดเชิงเทคนิค และแผนผังสถานะ (Pure Technical Specifications)
├── todo/        # 📋 รายการตรวจสอบและสิ่งที่ต้องทำ (Action Checklists & Todos)
├── deploy/      # 🚀 คู่มือการ Deploy และ Pre-flight Checklists
└── archive/     # 📦 คลังเอกสารประวัติการวางแผนช่วงเริ่มต้น
```

---

## 1. 📐 ข้อกำหนดเชิงเทคนิค และวงจรชีวิตสถานะ ([docs/specs/](file:///Users/wiiznu/project/Nida_Project/docs/specs/README.md))
*เอกสารอ้างอิงหลัก (Single Source of Truth) สำหรับนักพัฒนา ไม่มีรายการ Todo ปน*

- [order.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/order.md) — วงจรชีวิตคำสั่งซื้อ (`OrderStatus`) และการขอยกเลิก (`CancellationRequestStatus`)
- [payment.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/payment.md) — สถานะการชำระเงิน (`PaymentStatus`), Omise/PromptPay, และการคืนเงิน (`RefundStatus`)
- [shipment.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/shipment.md) — ขนส่ง (`ShipmentStatus`), ผู้ให้บริการ (`CarrierCode`), และไทม์ไลน์พัสดุ
- [return.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/return.md) — การขอคืนสินค้า (`ReturnStatus`), การตรวจรับของคลัง QC, และเส้นตาย 7 วัน
- [inventory.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/inventory.md) — การจองสต็อก (Reservation), การตัดสต็อก, และ Ledger (`StockChangeType`)
- [account.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/account.md) — สถานะบัญชี (`AccountStatus`), Guards สกัดกั้น API, และ Auto-Lockout
- [security.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/security.md) — การจัดการ Client IP (`trust proxy`), ป้องกัน IP Spoofing, และระบบ 5-Tier Rate Limiting
- [coupon.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/coupon.md) — เครื่องคำนวณส่วนลด (`DiscountType`), โควต้าคูปอง, และการคืนสิทธิ์

---

## 2. 📋 รายการสิ่งที่ต้องทำและแผนงาน ([docs/todo/](file:///Users/wiiznu/project/Nida_Project/docs/todo/))
*Checklists สำหรับติดตามความคืบหน้าการพัฒนาฟีเจอร์*

- [store.md](file:///Users/wiiznu/project/Nida_Project/docs/todo/store.md) — แผนงานและสิ่งที่ต้องทำฝั่ง Customer Storefront (`apps/store`)
- [admin.md](file:///Users/wiiznu/project/Nida_Project/docs/todo/admin.md) — แผนงานและสิ่งที่ต้องทำฝั่ง Back-Office Admin (`apps/admin`)
- [security.md](file:///Users/wiiznu/project/Nida_Project/docs/todo/security.md) — แผนงานความปลอดภัย OWASP API Top 10 และ Rate Limiting
- [optimization.md](file:///Users/wiiznu/project/Nida_Project/docs/todo/optimization.md) — แผนงานเพิ่มประสิทธิภาพ Bundle & Web Vitals
- [account.md](file:///Users/wiiznu/project/Nida_Project/docs/todo/account.md) — แผนงานการติดตั้ง `AccountStatus` และ Guards

---

## 3. 🚀 คู่มือการ Deploy และขึ้นระบบ ([docs/deploy/](file:///Users/wiiznu/project/Nida_Project/docs/deploy/))

- [multi-env.md](file:///Users/wiiznu/project/Nida_Project/docs/deploy/multi-env.md) — คู่มือการตั้งค่าสภาพแวดล้อม (Local, Staging/UAT, Production)
- [free-tier.md](file:///Users/wiiznu/project/Nida_Project/docs/deploy/free-tier.md) — คู่มือการ Deploy ขึ้น Free Tier (Supabase, Render, Vercel, Upstash)
- [checklist.md](file:///Users/wiiznu/project/Nida_Project/docs/deploy/checklist.md) — รายการตรวจสอบความพร้อมก่อนขึ้น Production จริง (Pre-deployment Checklist)

---

## 4. 📦 คลังเอกสารเก่าอ้างอิง ([docs/archive/](file:///Users/wiiznu/project/Nida_Project/docs/archive/))
*เอกสารแบบร่างและประวัติการออกแบบช่วงเริ่มต้นโครงการ (เก็บบันทึกเป็นประวัติ)*

- [order-flow.md](file:///Users/wiiznu/project/Nida_Project/docs/archive/order-flow.md) / [order-lifecycle.md](file:///Users/wiiznu/project/Nida_Project/docs/archive/order-lifecycle.md) / [order-scenarios.md](file:///Users/wiiznu/project/Nida_Project/docs/archive/order-scenarios.md)
- [admin-auth.md](file:///Users/wiiznu/project/Nida_Project/docs/archive/admin-auth.md)
- [roadmap.md](file:///Users/wiiznu/project/Nida_Project/docs/archive/roadmap.md)

