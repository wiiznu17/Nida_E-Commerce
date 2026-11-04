# Nida Platform — Technical Specification & Status Flows

ศูนย์รวมเอกสารข้อกำหนดเชิงเทคนิค (System Specifications) และแผนผังวงจรชีวิตสถานะ (State Machines) ของระบบ Nida Platform แยกตามโมดูลอย่างเป็นระเบียบ เพื่อใช้เป็นเอกสารอ้างอิงหลัก (Single Source of Truth) สำหรับนักพัฒนาและทีมงาน

---

## 📚 สารบัญโมดูลและสถานะ (Specifications Directory)

| เอกสาร                                                                                | โมดูล (Domain)               | ขอบเขตและสถานะที่เกี่ยวข้อง                                                                                                 |
| :------------------------------------------------------------------------------------ | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| [order.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/order.md)             | **Order & Cancellation**     | วงจรคำสั่งซื้อ (`OrderStatus`) และการขอยกเลิก (`CancellationRequestStatus`)                                                 |
| [payment.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/payment.md)         | **Payment & Refund**         | การชำระเงิน (`PaymentStatus`), เกตเวย์ Omise/PromptPay, และการคืนเงิน (`RefundStatus`)                                      |
| [shipment.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/shipment.md)       | **Logistics & Delivery**     | สถานะการจัดส่ง (`ShipmentStatus`), ผู้ให้บริการขนส่ง, และระบบ Auto-Complete                                                 |
| [return.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/return.md)           | **Return & Exchange**        | คำขอคืนสินค้า (`ReturnStatus`), การตรวจรับของคลัง, และเส้นตายการจัดส่ง                                                      |
| [inventory.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/inventory.md)     | **Inventory & Stock**        | การจองสต็อก (`quantityReserved`), การตัดสต็อก, และ Ledger (`StockChangeType`)                                               |
| [account.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/account.md)         | **Account & Security**       | สถานะบัญชี (`AccountStatus`: Active/Suspended/Banned), Guards, และ Auto-Lockout                                             |
| [security.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/security.md)       | **Network & Rate Limiting**  | การจัดการ Client IP (`trust proxy`), ป้องกัน IP Spoofing, และ 5-Tier Rate Limiting                                          |
| [coupon.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/coupon.md)           | **Promotions & Coupons**     | กลไกคำนวณส่วนลด (`DiscountType`), สิทธิ์การใช้งาน, และโควต้าคูปอง                                                           |
| [cart.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/cart.md)               | **Cart & Wishlist**          | ตะกร้าสินค้า, การรวมตะกร้า Guest (`Merge Cart`), การเช็คสต็อก, และรายการโปรด (`Wishlist`)                                   |
| [content.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/content.md)         | **Storefront CMS & Content** | แบนเนอร์หน้าแรก (`CmsBanner`), แถบประกาศ (`StoreSettings`), แคช CDN และ Live Preview                                        |
| [tax-invoice.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/tax-invoice.md) | **Tax Invoicing & Receipts** | การขอใบกำกับภาษีเต็มรูป (ม.86/4), การคำนวณ VAT 7%, เลขรันอัตโนมัติ (`INV-YYYYMM-XXXXX`) และเอกสารพิมพ์ A4                   |
| [reviews.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/reviews.md)         | **Reviews & Ratings**        | ระบบรีวิวสินค้า, สิทธิ์ Verified Buyer, การคำนวณคะแนนเฉลี่ย, และการดูแลรีวิวหลังบ้าน (Admin Moderation)                     |
| [mailer.md](file:///Users/wiiznu/project/Nida_Project/docs/specs/mailer.md)           | **Transactional Email**      | สถาปัตยกรรมอีเมลแจ้งเตือนอัตโนมัติ (Resend API), แม่แบบ Editorial Luxury, การตั้งค่า SPF/DKIM/DMARC และลิงก์ Tracking ขนส่ง |

---

## 🎯 กฎเหล็กของ Status Flows ใน Nida Platform

1. **Finite State Machines (FSM)**: ทุกสถานะต้องกำหนดจุดเริ่มต้น จุดสิ้นสุด และเส้นทางการเปลี่ยนผ่าน (Transition Matrix) ไว้อย่างชัดเจน ห้ามเปลี่ยนสถานะข้ามขั้นตอน
2. **Explicit Enums Only**: ห้ามใช้ Boolean Flag คลุมเครือ (เช่น `isPaid`, `isShipped`) แต่ให้ใช้ Database Enum เป็นแหล่งความจริงเดียว
3. **Atomic State Synchronization**: เมื่อสถานะหนึ่งเปลี่ยน จะต้องอัปเดตสถานะที่เกี่ยวเนื่องกันแบบ Atomic Transaction เสมอ (เช่น เมื่อ Payment เป็น `CAPTURED` ➔ Order ต้องเปลี่ยนเป็น `PAID` ทันที)
4. **Side Effects & Compensation**: หากเกิดข้อผิดพลาดระหว่างทาง (เช่น ตัดเงินผ่านแต่สต็อกไม่พอ) ต้องมีกระบวนการชดเชย (Rollback/Refund) อัตโนมัติ
