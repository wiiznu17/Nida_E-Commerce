# ระบบออกใบเสร็จรับเงิน / ใบกำกับภาษีเต็มรูปแบบ (Tax Invoicing & Receipts) — Roadmap & TODO

เอกสารรวบรวมแผนงานการพัฒนา ขอบเขตความต้องการ และรายการสิ่งที่ต้องทำ (Actionable Checklist) สำหรับ **ระบบออกใบเสร็จรับเงิน / ใบกำกับภาษีเต็มรูปแบบ (Full Tax Invoice & Receipt)** ของ Nida Platform ให้ถูกต้องตามประมวลรัษฎากรแห่งกรมสรรพากร (มาตรา 86/4) ครอบคลุมทั้งฝั่งหน้าร้าน (Storefront), ระบบประมวลผลคำนวณภาษีหลังบ้าน (Backend API), และระบบจัดการเอกสารพิมพ์ A4 ฝั่งแอดมิน (Admin Back-Office)

---

## 📊 สถานะภาพรวมของระบบ (System Status)

| ส่วนประกอบ / โมดูล | สถานะการพัฒนา | รายละเอียดความพร้อม |
| :--- | :---: | :--- |
| **Technical Specification** | ✅ พร้อม 100% | อ้างอิงเอกสาร [docs/specs/tax-invoice.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/tax-invoice.md) |
| **Database Schema & Migration** | ⏳ รอดำเนินการ | เตรียมเพิ่ม `TaxInvoice` Model, Enums และเชื่อม Foreign Key กับ `Order` |
| **Shared Contracts & Validators** | ⏳ รอดำเนินการ | กำหนด DTO ใน `@repo/types` และ Zod Schema ตรวจสอบเลข 13 หลักใน `@repo/validators` |
| **Storefront Checkout Integration** | ⏳ รอดำเนินการ | ช่องทางการขอใบกำกับภาษีในขั้นตอนชำระเงิน (`apps/store`) พร้อมสลับ บุคคล/นิติบุคคล |
| **Backend Sequential Engine** | ⏳ รอดำเนินการ | รันเลขเอกสาร `INV-YYYYMM-XXXXX` อัตโนมัติเมื่อออเดอร์ชำระเงินสำเร็จ (`PAID`) |
| **Storefront Document Download** | ⏳ รอดำเนินการ | หน้าประวัติออเดอร์ให้ลูกค้าเรียกดูและสั่งพิมพ์ A4 PDF ได้ด้วยตนเอง |
| **Admin Document Printing** | ⏳ รอดำเนินการ | ปุ่มพิมพ์ใบเสร็จ/ใบกำกับภาษี A4 ในหน้า Admin Order Detail พร้อมบันทึก Audit Log |
| **Unit Tests & Integrity Verification** | ⏳ รอดำเนินการ | ทดสอบการคำนวณฐานภาษี VAT 7%, เลข 13 หลัก, และลำดับเลขเอกสารห้ามชนกัน |

---

## 🎯 แผนภาพสถาปัตยกรรมและการไหลของข้อมูล (System Architecture & Flow)

```mermaid
graph TD
    A[ลูกค้าสั่งซื้อสินค้าหน้าร้าน Storefront] -->|เลือก: ขอใบกำกับภาษีเต็มรูป| B[กรอกข้อมูลผู้เสียภาษี 13 หลัก + ที่อยู่]
    B -->|POST /api/v1/orders พร้อม taxInvoiceReq| C[ระบบบันทึก Order + รอดำเนินการชำระเงิน]
    C -->|ลูกค้าชำระเงินสำเร็จ Omise/PromptPay| D[PaymentStatus = PAID]
    D -->|Atomic Event Trigger| E[Tax Invoice Sequential Engine]
    E -->|1. แยกฐานภาษี Pre-VAT 7%| F[บันทึก Immutable Snapshot ลง Table TaxInvoice]
    E -->|2. ออกเลข INV-YYYYMM-XXXXX| F
    F --> G[ลูกค้า: เรียกดูและพิมพ์ PDF จากหน้า Order Detail]
    F --> H[แอดมิน: พิมพ์ใบเสร็จ A4 จาก Admin Order Detail]
```

---

## 📋 แผนงานสิ่งที่ต้องทำตามลำดับขั้นตอน (Actionable Roadmap)

### เฟส 1: โครงสร้างฐานข้อมูลและการย้ายข้อมูล (Database Schema & Migration)
> **เป้าหมาย**: สร้างตาราง `TaxInvoice` พร้อม Enum และ Foreign Key ใน `packages/database/prisma/schema.prisma` พร้อมไฟล์ Migration แท้จริง

- [ ] **Prisma Enums**:
  - [ ] `TaxInvoicePayerType`: `PERSONAL` (บุคคลธรรมดา), `COMPANY` (นิติบุคคล)
  - [ ] `TaxInvoiceBranchType`: `HEADQUARTERS` (สำนักงานใหญ่), `BRANCH` (สาขา)
- [ ] **Prisma Model `TaxInvoice`**:
  - [ ] `id`: UUIDv7 (`@id @default(uuid(7)) @db.Uuid`)
  - [ ] `orderId`: UUIDv7 เชื่อม 1-to-1 กับ `Order` (`@unique @map("order_id")`)
  - [ ] `invoiceNumber`: รหัสใบกำกับภาษี (`@unique @map("invoice_number") @db.VarChar(50)`)
  - [ ] `payerType`: `TaxInvoicePayerType`
  - [ ] `taxId`: เลขประจำตัวผู้เสียภาษีอากร 13 หลัก (`@map("tax_id") @db.VarChar(20)`)
  - [ ] `name`: ชื่อบุคคลธรรมดา หรือ ชื่อบริษัท/นิติบุคคล (`@db.VarChar(255)`)
  - [ ] `branchType`: `TaxInvoiceBranchType?`
  - [ ] `branchCode`: รหัสสาขา 5 หลัก เช่น `00000` (`@map("branch_code") @db.VarChar(10)?`)
  - [ ] `address`: ที่อยู่จดทะเบียน / ที่อยู่ตามบัตรประชาชน (`@db.Text`)
  - [ ] `subtotal`: ยอดรวมสินค้าก่อนหักส่วนลด (`@db.Decimal(12, 2)`)
  - [ ] `discount`: ส่วนลดคูปอง/โปรโมชัน (`@default(0) @db.Decimal(12, 2)`)
  - [ ] `shippingFee`: ค่าจัดส่ง (`@default(0) @db.Decimal(12, 2)`)
  - [ ] `totalAmount`: ยอดชำระสุทธิรวม VAT (`@map("total_amount") @db.Decimal(12, 2)`)
  - [ ] `preVatAmount`: มูลค่าก่อนภาษีมูลค่าเพิ่ม (`@map("pre_vat_amount") @db.Decimal(12, 2)`)
  - [ ] `vatAmount`: ภาษีมูลค่าเพิ่ม 7% (`@map("vat_amount") @db.Decimal(12, 2)`)
  - [ ] `itemsSnapshot`: JSON Snapshot รายการสินค้า ณ เวลาออกใบกำกับภาษี (`@map("items_snapshot") @db.JsonB`)
  - [ ] `issuedAt`: วันที่ออกเอกสาร (`@default(now()) @map("issued_at")`)
- [ ] **Migration & Client Generation**:
  - [ ] สร้างไฟล์ Migration SQL: `packages/database/prisma/migrations/<timestamp>_add_tax_invoice_model/migration.sql`
  - [ ] รัน `npm --prefix packages/database run db:generate`
  - [ ] อัปเดต Prisma Mock ใน Test Suite ของทั้งสอง API

---

### เฟส 2: กำหนด Contract และ Zod Validators ส่วนกลาง (`@repo/types`, `@repo/validators`)
> **เป้าหมาย**: รักษาความปลอดภัยของข้อมูลตามกฎ Single Source of Truth โดยเขียน Zod Schema ตรวจสอบความถูกต้องของเลขประจำตัวผู้เสียภาษีและข้อมูลสาขา

- [ ] **`packages/types`**:
  - [ ] ประกาศ Interface `TaxInvoice`, `TaxInvoicePayerType`, `TaxInvoiceBranchType`
  - [ ] ประกาศ Request Payload `CreateTaxInvoiceRequestDto`
  - [ ] ประกาศ Response Contract `TaxInvoiceResponseDto`
  - [ ] Export ผ่าน `packages/types/src/index.ts` และรัน `npm --prefix packages/types run build`
- [ ] **`packages/validators`**:
  - [ ] ฟังก์ชันคำนวณ Checksum เลขประจำตัวผู้เสียภาษี 13 หลัก (Mod 11 Algorithm)
  - [ ] Zod Schema `taxInvoiceRequestSchema`:
    - ตรวจสอบ `payerType`: `PERSONAL` vs `COMPANY`
    - ตรวจสอบ `taxId`: 13 หลัก ตัวเลขล้วน และผ่าน Checksum Algorithm
    - กรณี `COMPANY`: บังคับระบุ `branchType` และถ้าเป็น `BRANCH` ต้องมี `branchCode` 5 หลัก
    - ตรวจสอบ `address`: ความยาวขั้นต่ำ 10 ตัวอักษร
  - [ ] รวม `taxInvoice` เข้ากับ `checkoutOrderSchema` (Optional field)
  - [ ] Export ผ่าน `packages/validators/src/index.ts` และรัน `npm --prefix packages/validators run build`

---

### เฟส 3: หน้าร้านค้า — เช็คเอาต์และแบบฟอร์มขอใบกำกับภาษี (`apps/store`)
> **เป้าหมาย**: ให้ลูกค้าหน้าร้านสามารถเลือกขอรับใบกำกับภาษีเต็มรูปได้สะดวกรวดเร็วตามมาตรฐาน Editorial Luxury

- [ ] **Component สถาปัตยกรรมย่อยใน `apps/store/src/components/checkout/`**:
  - [ ] สร้าง `TaxInvoiceFormSection.tsx`:
    - Switch / Checkbox: "ขอรับใบเสร็จรับเงิน/ใบกำกับภาษีเต็มรูปแบบ (Full Tax Invoice)"
    - Radio Selector: "บุคคลธรรมดา (Personal)" vs "นิติบุคคล (Corporate / Company)"
    - ช่องกรอก:
      - บุคคล: ชื่อ-นามสกุล, เลขบัตรประชาชน 13 หลัก, ที่อยู่ตามทะเบียนบ้าน
      - นิติบุคคล: ชื่อบริษัท/ห้างหุ้นส่วน, เลขประจำตัวผู้เสียภาษี 13 หลัก, สำนักงานใหญ่ / สาขา, รหัสสาขา 5 หลัก, ที่อยู่จดทะเบียน
    - Checkbox: "ใช้ที่อยู่เดียวกันกับที่อยู่จัดส่ง" (Auto-fill sync)
- [ ] **Internationalization (i18n)**:
  - [ ] เพิ่มคำแปลครบถ้วนใน `apps/store/src/locales/th.json` และ `en.json` (Zero Emojis, Editorial Tone)
- [ ] **Checkout Submission**:
  - [ ] แนบ Payload `taxInvoice` ส่งต่อไปยัง API `POST /api/v1/orders`

---

### เฟส 4: เครื่องยนต์คำนวณภาษีและออกเลขเอกสารอัตโนมัติ (`apps/api`)
> **เป้าหมาย**: ออกเลขเอกสารตามลำดับ (Sequential) ที่ไม่ซ้ำซ้อน และคำนวณฐานภาษี VAT 7% ตามประมวลรัษฎากร ม.86/4

- [ ] **Sequential Numbering Generator (`TaxInvoiceService`)**:
  - [ ] ฟอร์แมต: `INV-YYYYMM-XXXXX` (เช่น `INV-202611-00001`)
  - [ ] รับประกันความต่อเนื่องและป้องกัน Race Condition ด้วย Atomic Counter (Redis / Postgres Transaction)
- [ ] **VAT Calculation Engine**:
  - [ ] สูตรแยกฐานภาษี:
    $$\text{Pre-VAT Base} = \text{Total} / 1.07$$
    $$\text{VAT Amount} = \text{Total} - \text{Pre-VAT Base}$$
  - [ ] ปัดเศษ 2 ตำแหน่งสากล (`Half-Up Rounding`)
- [ ] **Trigger Lifecycle**:
  - [ ] เมื่อ Order ถูกเปลี่ยนสถานะเป็น `PAID` (หลังชำระผ่าน Omise / Credit Card / PromptPay สำเร็จ) ➔ หากมีคำขอใบกำกับภาษี ให้ทำการ Generate และบันทึก `TaxInvoice` ทันที
- [ ] **API Endpoints สำหรับหน้าร้าน**:
  - [ ] `GET /api/v1/orders/:orderNumber/tax-invoice`: ดึงข้อมูลใบกำกับภาษีเฉพาะออเดอร์ของตนเอง (Customer Auth Guard)

---

### เฟส 5: แสดงผลและพิมพ์เอกสารทั้งหน้าร้านและหลังบ้าน (`apps/store` & `apps/admin`)
> **เป้าหมาย**: เอกสารพิมพ์ A4 ที่จัดเลย์เอาต์ประณีตตามแบบฟอร์มสรรพากร ถูกต้องตามมาตรฐาน Editorial Luxury

- [ ] **Storefront Customer Portal (`apps/store`)**:
  - [ ] เพิ่มปุ่ม "ดาวน์โหลด / พิมพ์ใบกำกับภาษี" ในหน้าประวัติออเดอร์ (`/profile/orders/[orderNumber]`)
  - [ ] สร้าง Modal / Printable View (`TaxInvoiceDocumentView.tsx`) รองรับ `@media print` สำหรับกระดาษ A4
- [ ] **Admin Back-Office Portal (`apps/admin`)**:
  - [ ] เพิ่มปุ่ม "พิมพ์ใบกำกับภาษี (Tax Invoice)" ในหน้า Admin Order Detail (`/admin/orders/[id]`)
  - [ ] สร้าง `OrderTaxInvoicePrintModal.tsx` ใน `apps/admin/src/components/order/`
  - [ ] รองรับการแสดงผล:
    - ตราสัญลักษณ์และข้อมูลบริษัท NIDA
    - เลขประจำตัวผู้เสียภาษี 13 หลักของบริษัท
    - ข้อมูลผู้ซื้อ (บุคคลธรรมดา หรือ นิติบุคคล + สำนักงานใหญ่/สาขา)
    - รายการสินค้า, ราคาต่อหน่วย, ส่วนลด, ค่าส่ง
    - สรุปยอด: มูลค่าสินค้าก่อน VAT, ภาษีมูลค่าเพิ่ม 7%, และยอดสุทธิ
  - [ ] รองรับคำสั่งพิมพ์ของเบราว์เซอร์ (`window.print()`) จัดหน้ากระดาษ A4 สวยงาม ขอบกระดาษพอดี
- [ ] **Admin Security & Audit Trail**:
  - [ ] ผูก Guard สิทธิ์ `ORDERS_READ`
  - [ ] บันทึก `admin_audit_logs` ทุกครั้งที่มีการสั่งพิมพ์หรือเปิดดูใบกำกับภาษีของลูกค้า

---

### เฟส 6: การทดสอบและความสมบูรณ์ของระบบ (Testing & Verification)
> **เป้าหมาย**: ครอบคลุม 100% ตามข้อกำหนด Mandatory Feature Unit Testing Policy

- [ ] **Unit Tests (`apps/api/test/orders/tax-invoice.spec.ts`)**:
  - [ ] ทดสอบสูตรคำนวณ VAT 7% ยอดต่างๆ (ยอดลงตัว, ยอดมีเศษสตางค์, ยอดมีส่วนลดคูปอง)
  - [ ] ทดสอบการตรวจสอบเลข 13 หลัก (Mod 11 Checksum: Valid, Invalid, Bad Length)
  - [ ] ทดสอบการออกเลข `INV-YYYYMM-XXXXX` อัตโนมัติและไม่ซ้ำกัน
  - [ ] ทดสอบ Security Guard: ลูกค้าคนอื่นไม่สามารถดึงใบกำกับภาษีของผู้อื่นได้
- [ ] **Unit Tests (`apps/admin-api/test/orders/admin-tax-invoice.spec.ts`)**:
  - [ ] ทดสอบ Admin Endpoint และการบันทึก Audit Log
- [ ] **Monorepo Build Verification**:
  - [ ] `npm --prefix packages/types run build`
  - [ ] `npm --prefix packages/validators run build`
  - [ ] `npm --prefix apps/api run build`
  - [ ] `npm --prefix apps/admin-api run build`
  - [ ] `npm --prefix apps/admin run build`
  - [ ] `npm --prefix apps/store run build`
  - [ ] รันการทดสอบ Unit Tests ทั้งหมดต้องผ่าน 100%

