# NIDA E-Commerce — Order Status Lifecycle & Cross-Entity Synchronization Test Scenarios

เอกสารสรุปข้อกำหนด Use Cases และ Scenarios ทั้งหมดสำหรับการจัดการสถานะคำสั่งซื้อ (Order Status Management) เพื่อใช้ในการรีวิวความสอดคล้องของสถานะข้ามระบบ (Cross-Entity Coherence) ก่อนเริ่มเขียนชุดทดสอบ Unit Tests

---

## 1. นิยามสถานะทั้งหมดในระบบ (Status Catalog)

ระบบคำสั่งซื้อของ NIDA แบ่งสถานะออกเป็น 6 มิติ ตามหลักการ **Separation of Concerns**:

| มิติ | Enum Type | ค่าที่เป็นไปได้ทั้งหมด (All Enum Values) | ความรับผิดชอบหลัก |
| :--- | :--- | :--- | :--- |
| **1. Order Status** | `OrderStatus` | `PENDING`, `PAID`, `PREORDER_AWAITING_STOCK`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED` | สถานะหลักของคำสั่งซื้อในระดับข้อตกลงธุรกิจ (Macro Aggregate) |
| **2. Payment Status** | `PaymentStatus` | `PENDING`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED` | สถานะธุรกรรมการเงินกับ Payment Gateway (Omise) |
| **3. Shipment Status** | `ShipmentStatus` | `LABEL_CREATED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED` | สถานะการเดินทางของพัสดุในระบบโลจิสติกส์ |
| **4. Cancellation** | `CancellationRequestStatus` | `PENDING`, `APPROVED`, `REJECTED` | กระบวนการขอยกเลิกคำสั่งซื้อก่อนจัดส่ง |
| **5. Return Request** | `ReturnStatus` | `REQUESTED`, `APPROVED`, `REJECTED`, `COMPLETED` | กระบวนการขอคืนสินค้าหลังรับมอบพัสดุ |
| **6. Refund Gateway** | `RefundStatus` | `PENDING`, `SUCCEEDED`, `FAILED` | สถานะการดำเนินการคืนเงินผ่าน Payment Gateway |

---

## 2. ตารางความสัมพันธ์ของสถานะในแต่ละจังหวะ (Status Synchronization Matrix)

| เหตุการณ์ / จุดกระตุ้น (Trigger Event) | OrderStatus | PaymentStatus | ShipmentStatus | Inventory Effect | Loyalty Points | หมายเหตุทางธุรกิจ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ลูกค้ากดยืนยันสั่งซื้อ (Checkout)** | `PENDING` | `PENDING` | *- (ยังไม่มี)* | ตัดสต็อกจอง (`ORDER_DEDUCT`) หรือเพิ่ม `preorderBooked` | บันทึก `REDEEMED_CHECKOUT` (ถ้าใช้แต้ม) | ออกเลขออเดอร์ + เริ่มนับเวลาชำระเงิน 30 นาที |
| **ชำระเงินสำเร็จ (สินค้าพร้อมส่ง)** | `PAID` | `CAPTURED` | *-* | สต็อกถูกตัดสมบูรณ์ | *-* | Gateway ยืนยันยอดเงิน (PromptPay/Card) |
| **ชำระเงินสำเร็จ (มีสินค้า Pre-Order)** | `PREORDER_AWAITING_STOCK` | `CAPTURED` | *-* | คงยอด `preorderBooked` | *-* | รอสินค้าผลิตเสร็จเข้าคลัง |
| **สินค้า Pre-Order เข้าคลังสินค้า** | `PROCESSING` | `CAPTURED` | *-* | รับเข้าคลัง (`PREORDER_RECEIVE`) และเคลียร์ `preorderBooked` | *-* | ปรับสถานะพร้อมหยิบแพ็ค |
| **คลังสินค้าเริ่มจัดเตรียมและแพ็คกล่อง** | `PROCESSING` | `CAPTURED` | *-* | สต็อกคงเดิม | *-* | เตรียมออกใบปะหน้ากล่อง |
| **ออกเลขพัสดุ / พิมพ์ใบปะหน้า (Fulfill)** | `PROCESSING` | `CAPTURED` | `LABEL_CREATED` | สต็อกคงเดิม | *-* | มี Tracking Number แล้ว แต่ยังไม่มอบให้รถขนส่ง |
| **รถขนส่งสแกนรับพัสดุออกจากคลัง** | `SHIPPED` | `CAPTURED` | `PICKED_UP` | สต็อกอยู่ระหว่างขนส่ง | *-* | พัสดุเริ่มเดินทาง |
| **พัสดุอยู่ระหว่างนำส่ง** | `SHIPPED` | `CAPTURED` | `IN_TRANSIT` / `OUT_FOR_DELIVERY` | สต็อกอยู่ระหว่างขนส่ง | *-* | บันทึกประวัติใน `ShipmentLog` |
| **ลูกค้าเซ็นรับพัสดุสำเร็จ** | `DELIVERED` | `CAPTURED` | `DELIVERED` | สิ้นสุดภาระการจัดส่ง | คำนวณแจกแต้ม `EARNED_ORDER` | สิ้นสุดกระบวนการขายปกติ เริ่มนับระยะเวลารับประกัน 14 วัน |
| **ชำระเงินไม่ผ่าน / บัตรถูกปฏิเสธ** | `PENDING` | `FAILED` | *-* | สต็อกยังคงจองอยู่จนกว่าจะหมดเวลา | *-* | ลูกค้าสามารถกดเปลี่ยนช่องทางหรือชำระใหม่ได้ |
| **หมดเวลาชำระเงิน (Timeout 30 นาที)** | `CANCELLED` | `FAILED` | *-* | คืนสต็อกกลับ (`RESTOCK`) | คืนแต้มที่ใช้ (`REFUND_CANCEL`) | ระบบ Auto-expire ยกเลิกออเดอร์อัตโนมัติ |
| **ลูกค้ายกเลิกเองขณะรอชำระ (Pending)** | `CANCELLED` | `FAILED` | *-* | คืนสต็อกกลับ (`RESTOCK`) | คืนแต้มที่ใช้ (`REFUND_CANCEL`) | ยกเลิกทันที ไม่ต้องรอแอดมินอนุมัติ |
| **ลูกค้ายื่นคำขอยกเลิก (ชำระเงินแล้ว)** | `PAID` หรือ `PROCESSING` | `CAPTURED` | *-* | สต็อกยังไม่อัปเดต | *-* | สร้าง `CancellationRequest` สถานะ `PENDING` |
| **แอดมินอนุมัติคำขอยกเลิก** | `REFUNDED` | `REFUNDED` | *-* | คืนสต็อกเข้าคลัง (`RESTOCK`) | คืนแต้มที่ใช้ (`REFUND_CANCEL`) | คืนเงินผ่าน Omise Gateway สำเร็จ (`SUCCEEDED`) |
| **แอดมินปฏิเสธคำขอยกเลิก** | `PAID` หรือ `PROCESSING` | `CAPTURED` | *-* | คงเดิม | *-* | ออเดอร์ดำเนินขั้นตอนเตรียมจัดส่งต่อไป |
| **ลูกค้ายื่นขอคืนสินค้าหลังรับของ** | `DELIVERED` | `CAPTURED` | `DELIVERED` | สต็อกอยู่ที่ลูกค้า | *-* | สร้าง `ReturnRequest` สถานะ `REQUESTED` |
| **แอดมินอนุมัติคำขอคืนสินค้า** | `DELIVERED` | `CAPTURED` | `DELIVERED` | สต็อกรอส่งกลับ | *-* | ส่งใบจัดส่งพัสดุตีกลับให้ลูกค้า |
| **ตรวจรับสินค้าคืนผ่าน QC สมบูรณ์** | `REFUNDED` | `REFUNDED` | `DELIVERED` | รับสินค้าคืนเข้าคลัง (`RETURNED`) | หักแต้มที่เคยแจกกลับ (`REFUND_CANCEL`) | ดำเนินการคืนเงินผ่าน Gateway สำเร็จ (`SUCCEEDED`) |

---

## 3. รายละเอียด Use Cases & Scenarios สำหรับการทดสอบ

### Scenario 1: Standard Happy Path (สินค้าพร้อมส่ง ชำระสำเร็จจนถึงส่งมอบ)
- **Starting State**: ลูกค้าทำรายการสั่งซื้อเสร็จสิ้น
  - `order.status = PENDING`
  - `payment.status = PENDING`
  - `shipment = null`
  - สต็อกถูกหักออกด้วยประเภท `ORDER_DEDUCT`
- **Step 1 — ชำระเงินสำเร็จ (Omise Webhook / 3DS Callback)**:
  - `payment.status` เปลี่ยนเป็น `CAPTURED`
  - `payment.paidAt` มีค่าประทับเวลา
  - `order.status` เปลี่ยนจาก `PENDING` -> `PAID`
- **Step 2 — คลังสินค้าเริ่มจัดเตรียม (Pick & Pack)**:
  - แอดมินหรือระบบเปลี่ยนสถานะ `order.status` จาก `PAID` -> `PROCESSING`
- **Step 3 — ออกเลขพัสดุและจัดส่ง (Fulfill Order)**:
  - มีการสร้าง Shipment Record (`carrierCode`, `trackingNumber`, `ShipmentStatus.LABEL_CREATED`)
  - เมื่องานขนส่งเข้ารับ: `shipment.status = PICKED_UP`
  - `order.status` เปลี่ยนจาก `PROCESSING` -> `SHIPPED`
- **Step 4 — ขนส่งนำจ่ายสำเร็จ (Courier Webhook / Status Update)**:
  - `shipment.status` เปลี่ยนเป็น `DELIVERED`
  - `order.status` เปลี่ยนจาก `SHIPPED` -> `DELIVERED`
  - ลูกค้าได้รับแต้มสะสม Loyalty Points (`PointChangeType.EARNED_ORDER`)
- **Assertions**:
  - `order.status === OrderStatus.DELIVERED`
  - `payment.status === PaymentStatus.CAPTURED`
  - `shipment.status === ShipmentStatus.DELIVERED`
  - ประวัติสต็อกบันทึกถูกต้องและแต้มถูกเครดิตเข้าบัญชีสมาชิก

---

### Scenario 2: Pre-Order Flow (สินค้าพรีออเดอร์ รอสินค้าเข้าคลัง)
- **Starting State**: ลูกค้าสั่งซื้อสินค้าที่มีชิ้นใดชิ้นหนึ่งเป็น `isPreorder: true`
  - `order.hasPreorderItems = true`
  - `order.status = PENDING`
  - `payment.status = PENDING`
  - ยอดสต็อก `preorderBooked` เพิ่มขึ้นตามจำนวนสั่ง
- **Step 1 — ชำระเงินสำเร็จ**:
  - `payment.status = CAPTURED`
  - `order.status` ต้องเปลี่ยนเป็น **`PREORDER_AWAITING_STOCK`** (ห้ามเป็น `PAID` เพราะต้องรอสต็อกเข้าคลังก่อน)
- **Step 2 — สินค้าผลิตเสร็จและเข้าคลัง (Restock Preorder)**:
  - บันทึก `StockMovementType.PREORDER_RECEIVE`
  - `preorderBooked` ถูกเคลียร์/ลดลง
  - `order.status` เปลี่ยนจาก `PREORDER_AWAITING_STOCK` -> `PROCESSING`
- **Step 3 — ดำเนินการจัดส่งต่อ**:
  - ออกเลขพัสดุ -> `SHIPPED` -> `DELIVERED` ตามขั้นตอนปกติ
- **Assertions**:
  - ตรวจสอบว่าระบบกั้นไม่ให้เปลี่ยนข้ามจาก `PREORDER_AWAITING_STOCK` ไป `SHIPPED` ทันทีโดยไม่ผ่าน `PROCESSING`

---

### Scenario 3: Payment Retry & Deliberate Method Switching (ชำระเงินใหม่ / เปลี่ยนช่องทางด้วยการยืนยัน)
- **Starting State**: ลูกค้าสั่งซื้อสินค้าแล้วยังไม่ได้ชำระเงิน หรือชำระเงินไม่ผ่าน
  - `order.status = PENDING`
  - `payment.status = PENDING` หรือ `FAILED`
- **Case 3A — ปุ่ม "Pay Now (ชำระเงินทันที)" (ชำระตามช่องทางเดิม)**:
  - ลูกค้ากด "Pay Now" ระบบจะเปิดหน้าต่างชำระเงินตามช่องทางเดิมที่เคยเลือกไว้ (เช่น แสดง PromptPay QR Code เดิม หรือ ฟอร์มกรอกบัตรเครดิต)
  - **ไม่ยิง API เปลี่ยนแปลงข้อมูลไปยัง Server**: ไม่สร้าง Charge ใหม่ ไม่สร้างภาระให้ Server
- **Case 3B — ปุ่ม "Change Payment Method (เปลี่ยนช่องทางชำระเงิน)" (เลือกช่องทางใหม่และต้องกดยืนยัน)**:
  - ลูกค้ากด "Change Payment Method" หน้าต่างจะเข้าสู่โหมดเลือกวิธีชำระเงินใหม่
  - ลูกค้าเลือกช่องทางใหม่ (PromptPay หรือ บัตรเครดิต)
  - **ต้องกดยืนยัน (Confirm Change)** ก่อนเท่านั้น: หากกดยกเลิกจะไม่เกิดการเรียก API ใดๆ
  - เมื่องานกดยืนยัน: ระบบจะเรียก `updatePaymentMethod` เพื่ออัปเดตช่องทาง และหากเปลี่ยนเป็น PromptPay จะขอ QR Code ใหม่จาก Omise
  - เมื่อชำระเงินตามช่องทางใหม่สำเร็จ:
    - `payment.status = CAPTURED`
    - `order.status = PAID`
- **Assertions**:
  - การสลับดูหน้าต่างชำระเงินไม่สร้าง Network/Server Load โดยไม่จำเป็น
  - สต็อกไม่ถูกตัดซ้ำซ้อนสองรอบ (คงสถานะการจองเดิมไว้)
  - `order.status === OrderStatus.PAID` และ `payment.status === PaymentStatus.CAPTURED`

---

### Scenario 4: Payment Timeout & Cancellation (หมดเวลาชำระเงินหรือลูกค้ายกเลิกเอง)
- **Case 4A — ลูกค้ายกเลิกเองตอน Pending**:
  - `order.status = PENDING`
  - ลูกค้ากดยกเลิกคำสั่งซื้อ
  - `order.status` เปลี่ยนเป็น `CANCELLED`
  - `payment.status` เปลี่ยนเป็น `FAILED`
  - ระบบคืนสต็อกทันที (`StockChangeType.RESTOCK`)
- **Case 4B — ระบบ Auto-expire เมื่อเกินเวลา (Cron / Timeout Service)**:
  - คำสั่งซื้อค้างสถานะ `PENDING` เกิน 30 นาที
  - ระบบรันงานยกเลิก: `order.status = CANCELLED`, `payment.status = FAILED`
  - ปลดล็อกสต็อกและคืนแต้มที่ใช้ไป (`PointChangeType.REFUND_CANCEL`)
- **Assertions**:
  - ออเดอร์ที่อยู่ในสถานะ `CANCELLED` จะไม่สามารถนำไปชำระเงินต่อได้ (ระบบปฏิเสธการชำระเงินถ้า order.status === CANCELLED)

---

### Scenario 5: Customer Paid Cancellation Request (ยกเลิกหลังชำระเงินแล้ว)
- **Starting State**: ลูกค้าชำระเงินแล้ว `order.status = PAID` หรือ `PROCESSING`
- **Step 1 — ลูกค้าส่งคำขอยกเลิก (`requestCancellation`)**:
  - ตรวจสอบว่าออเดอร์ยังไม่ถูกจัดส่ง (`order.status !== SHIPPED` และ `!== DELIVERED`)
  - สร้าง `OrderCancellationRequest` สถานะ `PENDING`
  - ออเดอร์หลักยังคงสถานะเดิม (`PAID` หรือ `PROCESSING`) จนกว่าแอดมินจะพิจารณา
- **Step 2A — แอดมินอนุมัติคำขอ (`APPROVE`)**:
  - `cancellationRequest.status = APPROVED`
  - ดำเนินการคืนเงินอัตโนมัติผ่าน Omise Payment Gateway (`processRefund`)
  - สร้าง `Refund` record สถานะ `SUCCEEDED`
  - `payment.status` เปลี่ยนเป็น `REFUNDED`
  - `order.status` เปลี่ยนเป็น `REFUNDED` (หรือ `CANCELLED`)
  - คืนสินค้าเข้าสต็อก (`StockChangeType.RESTOCK`)
- **Step 2B — แอดมินปฏิเสธคำขอ (`REJECT`)**:
  - `cancellationRequest.status = REJECTED`
  - `order.status` คงเดิม (`PAID` หรือ `PROCESSING`) และดำเนินการจัดส่งต่อตามปกติ
- **Assertions**:
  - หาก `order.status` เป็น `SHIPPED` หรือ `DELIVERED` แล้ว ลูกค้าจะไม่สามารถส่ง Cancellation Request ได้ (ต้องแจ้งเตือนให้ใช้ขั้นตอน Return Request แทน)

---

### Scenario 6: Post-Delivery Return & Inspection Flow (การคืนสินค้าหลังรับมอบ)
- **Starting State**: ออเดอร์ส่งมอบสำเร็จแล้ว
  - `order.status = DELIVERED`
  - `shipment.status = DELIVERED`
  - `payment.status = CAPTURED`
- **Step 1 — ลูกค้าแจ้งขอคืนสินค้า (`requestReturn`)**:
  - ตรวจสอบว่า `order.status === DELIVERED`
  - สร้าง `ReturnRequest` สถานะ `REQUESTED` พร้อมระบุรายการสินค้าและเหตุผล
- **Step 2 — แอดมินอนุมัติคำขอเบื้องต้น**:
  - `returnRequest.status = APPROVED` (ออกเอกสารให้ส่งของกลับคลัง)
- **Step 3 — คลังสินค้าตรวจรับสินค้าและตรวจสอบคุณภาพ (QC Complete)**:
  - แอดมินกด `COMPLETE`
  - `returnRequest.status = COMPLETED`
  - ดำเนินการคืนเงินผ่าน Payment Gateway (`RefundStatus.SUCCEEDED`)
  - สินค้าผ่าน QC นำกลับเข้าสต็อก (`StockChangeType.RETURNED`)
  - หักแต้มสะสมที่เคยได้รับจากออเดอร์นี้กลับคืน (`PointChangeType.REFUND_CANCEL`)
  - `payment.status` เปลี่ยนเป็น `REFUNDED`
  - `order.status` เปลี่ยนเป็น `REFUNDED`
- **Assertions**:
  - `order.status === OrderStatus.REFUNDED`
  - `payment.status === PaymentStatus.REFUNDED`
  - `returnRequest.status === ReturnStatus.COMPLETED`

---

### Scenario 7: Partial Return & Partial Refund (ขอคืนสินค้าบางชิ้น)
- **Starting State**: ออเดอร์ประกอบด้วยสินค้า 2 ชิ้น ยอดรวม ฿5,000 ชำระสำเร็จและส่งมอบแล้ว (`DELIVERED`)
- **Step 1 — ขอคืนสินค้า 1 ชิ้น (มูลค่า ฿2,000)**:
  - สร้าง `ReturnRequest` ระบุคืนเฉพาะ Item 1 จำนวน 1 ชิ้น
- **Step 2 — ตรวจรับของคืนและคืนเงินเฉพาะส่วน**:
  - ยอดเงินคืนคือ ฿2,000 (น้อยกว่ายอดชำระเต็ม ฿5,000)
  - สร้าง Refund Record จำนวน ฿2,000 สถานะ `SUCCEEDED`
  - สินค้าชิ้นที่ 1 ถูกนำกลับเข้าคลัง
- **Step 3 — ตรวจสอบสถานะ Order & Payment**:
  - เนื่องจากเป็นการคืนเงินบางส่วน (Partial Refund):
    - `payment.status` ยังคงเป็น `CAPTURED` (เนื่องจากยังมีมูลค่าคงเหลือ ฿3,000)
    - `order.status` ยังคงเป็น `DELIVERED` (สินค้าชิ้นที่ 2 ลูกค้ายังเก็บไว้ใช้งาน)
  - บันทึกยอด Already Refunded รวม = ฿2,000
- **Assertions**:
  - ไม่เปลี่ยน `order.status` เป็น `REFUNDED` จนกว่าจะคืนครบเต็มจำนวนเงิน 100%

---

### Scenario 8: Logistics Delivery Failure & Return to Sender (นำจ่ายไม่สำเร็จ / พัสดุตีกลับ)
- **Starting State**: ออเดอร์จัดส่งแล้ว
  - `order.status = SHIPPED`
  - `shipment.status = OUT_FOR_DELIVERY`
- **Step 1 — ขนส่งนำจ่ายไม่สำเร็จรอบที่ 1-2**:
  - `shipment.status` เปลี่ยนเป็น `FAILED`
  - มีการบันทึกสาเหตุใน `ShipmentLog` (เช่น "ติดต่อผู้รับไม่ได้")
  - `order.status` ยังคงเป็น `SHIPPED` (เพื่อให้โอกาสขนส่งวนส่งซ้ำในวันถัดไป)
- **Step 2 — นำจ่ายไม่สำเร็จครบ 3 ครั้ง พัสดุตีกลับคลัง (Return to Sender - RTS)**:
  - พัสดุถูกส่งกลับถึงศูนย์คลังสินค้า NIDA
  - คลังสแกนรับสินค้ากลับเข้าคลัง (`RESTOCK`)
  - แอดมินเลือกดำเนินการ:
    - กรณีที่ A: ปรับสถานะเป็น `PROCESSING` เพื่อเตรียมจัดส่งใหม่ (หลังลูกค้าแจ้งที่อยู่ใหม่)
    - กรณีที่ B: ยกเลิกคำสั่งซื้อและคืนเงิน -> `order.status = REFUNDED`, `payment.status = REFUNDED`
- **Assertions**:
  - ตรวจสอบว่าระบบมี Log บันทึกชัดเจน และสต็อกไม่สูญหาย

---

### Scenario 9: Negative Cases & State Machine Guard Rails (การป้องกันสถานะผิดกฎ)

| กรณีทดสอบ (Forbidden Transition Test Case) | สถานะเริ่มต้น | สถานะที่พยายามเปลี่ยนไป | ผลลัพธ์ที่คาดหวัง |
| :--- | :--- | :--- | :--- |
| **ข้ามขั้นตอน: ยังไม่ชำระเงินแต่ขอกระโดดไป SHIPPED** | `PENDING` | `SHIPPED` | **BadRequestException**: ไม่อนุญาต ต้องชำระเงิน (`PAID`) และเตรียมของ (`PROCESSING`) ก่อน |
| **ข้ามขั้นตอน: ชำระเงินแล้วแต่ขอกระโดดไป DELIVERED ทันที** | `PAID` | `DELIVERED` | **BadRequestException**: ต้องผ่าน `PROCESSING` และ `SHIPPED` ก่อน |
| **จัดส่งสินค้าโดยไม่มี Tracking Number** | `PROCESSING` | `SHIPPED` | **BadRequestException**: ต้องระบุเลขพัสดุ (Tracking Number) ก่อนเปลี่ยนสถานะ |
| **ยกเลิกออเดอร์ที่จัดส่งไปแล้ว** | `SHIPPED` | `CANCELLED` | **BadRequestException**: พัสดุถูกส่งออกไปแล้ว ไม่อนุญาตให้ยกเลิกตรง ต้องใช้ Return Request |
| **ยกเลิกออเดอร์ที่ลูกค้ารับของไปแล้ว** | `DELIVERED` | `CANCELLED` | **BadRequestException**: ส่งมอบสำเร็จแล้ว ต้องเปิด Return Request เท่านั้น |
| **พยายามชำระเงินในออเดอร์ที่ถูกยกเลิกไปแล้ว** | `CANCELLED` | `PAID` | **BadRequestException**: คำสั่งซื้อนี้ถูกยกเลิกแล้ว ไม่สามารถทำรายการชำระเงินได้ |
| **พยายามเปลี่ยนสถานะต่อจาก Terminal State** | `CANCELLED` หรือ `REFUNDED` | สถานะใดๆ | **BadRequestException**: สถานะสิ้นสุดแล้ว ไม่สามารถแก้ไขได้ |
| **พยายามคืนเงินเกินยอดที่จ่ายจริง** | `PAID` ยอด ฿3,000 | ขอคืน ฿3,500 | **BadRequestException**: ยอดเงินคืนเกินยอดคงเหลือที่สามารถคืนได้ |
| **ขอคืนเงินซ้ำในออเดอร์ที่คืนเงินเต็มจำนวนไปแล้ว** | `REFUNDED` | ขอคืนเงินอีกรอบ | **BadRequestException**: คำสั่งซื้อนี้ได้รับการคืนเงินเต็มจำนวนไปแล้ว |

---

## 4. โครงสร้างชุดทดสอบ Unit Tests ที่จะดำเนินการ (Implementation Blueprint)

หลังจากผ่านการรีวิวความสอดคล้องข้างต้น จะสร้างชุดทดสอบครอบคลุมทุก Scenario:

- **ตำแหน่งไฟล์ทดสอบหลัก**:
  1. `apps/api/test/orders/order-lifecycle-status.spec.ts` (Store API & Customer Lifecycle Transitions)
  2. `apps/admin-api/test/orders/order-lifecycle-status.spec.ts` (Admin Fulfillment, Cancellation Review, Return Review, and Guard Rails)
- **ขอบเขตการทดสอบ (Test Coverage Plan)**:
  - ทุกสถานะของ `OrderStatus` (ครบทั้ง 8 สถานะ)
  - ทุกสถานะของ `PaymentStatus` (ครบทั้ง 5 สถานะ)
  - ทุกสถานะของ `ShipmentStatus` (ครบทั้ง 6 สถานะ)
  - `CancellationRequestStatus` และ `ReturnStatus`
  - การตรวจสอบ Inventory Stock Movements และ Loyalty Points
  - ความถูกต้องของ Transition State Guard (`validateOrderStatusTransition`)
