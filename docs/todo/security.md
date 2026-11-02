# Backend Security & OWASP Top 10 Optimization Roadmap

เอกสารแผนงานและรายการตรวจสอบ (Checklist) สำหรับการยกระดับความปลอดภัย (Security Hardening) และการเพิ่มประสิทธิภาพหลังบ้าน (Backend Performance Optimization) ของแพลตฟอร์ม Nida Platform ครอบคลุมทั้ง Customer API (`apps/api`) และ Back-Office Admin API (`apps/admin-api`) ตามมาตรฐานสากล **OWASP API Security Top 10 (2023)**

---

## 1. ตารางเปรียบเทียบมาตรฐาน OWASP API Security Top 10 (2023)

| รหัส OWASP | ภัยคุกคาม / ช่องโหว่ | สถานะปัจจุบัน | แผนการยกระดับและการป้องกัน (Action Item) |
| :--- | :--- | :---: | :--- |
| **API1:2023** | **Broken Object Level Authorization (BOLA)** | ✅ ผ่าน | ตรวจสอบความเป็นเจ้าของ Resource (เช่น `userId` บน Order/Address/Cart) เสมอ |
| **API2:2023** | **Broken Authentication** | 🟡 ปานกลาง | ติดตั้ง Rate Limiting บน Login/OTP, นโยบาย Account Lockout, และ JWT Blacklist |
| **API3:2023** | **Broken Object Property Level Authorization** | 🟡 ปานกลาง | ทำ PII / Sensitive Data Sanitizer ใน Application Logger (Mask รหัสผ่าน, OTP, บัตร) |
| **API4:2023** | **Unrestricted Resource Consumption** | 🔴 เสี่ยง | ติดตั้ง `@nestjs/throttler` ร่วมกับ Redis Storage เพื่อจำกัด Rate Limit และกำหนด Request Body Limit |
| **API5:2023** | **Broken Function Level Authorization (BFLA)** | ✅ ผ่าน | บังคับใช้ `JwtAuthGuard` และ `PermissionsGuard` ครอบคลุมทุก Endpoint ของ Admin |
| **API6:2023** | **Unrestricted Access to Sensitive Business Flows** | 🔴 เสี่ยง | ดักจับ OTP / Email Pumping Attack (จำกัดการขอ OTP 1 ครั้ง/นาที ต่ออีเมล/IP) |
| **API7:2023** | **Server-Side Request Forgery (SSRF)** | ✅ ผ่าน | ป้องกันการดึง URL ภายนอกที่ไม่ได้รับอนุญาต และตรวจสอบ Webhook Signature |
| **API8:2023** | **Security Misconfiguration** | 🟡 ปานกลาง | ปรับแต่ง Helmet เต็มรูปแบบ (HSTS, CSP, X-Content-Type-Options) และปิด Swagger ใน Production |
| **API9:2023** | **Improper Inventory Management** | ✅ ผ่าน | ควบคุม API Versioning (`/api/v1`) ชัดเจน และไม่มี Shadow Endpoints |
| **API10:2023** | **Unsafe Consumption of Third-Party APIs** | ✅ ผ่าน | มี Wrapper ดักจับ Error และ Validation จาก Resend และ Omise ครบถ้วน |

---

## 2. รายการแผนงานจำแนกตามเฟส (Phase Breakdown & Checklists)

### 📌 เฟส 1: การป้องกันการโจมตีและการจำกัดทรัพยากร (Anti-Abuse & Rate Limiting)
> **เป้าหมาย:** อุดช่องโหว่ OWASP API4 & API2 ป้องกันการ Brute-force, สแปม OTP (Email Pumping) และ DDoS

- [ ] **1.1 ติดตั้ง `@nestjs/throttler` ร่วมกับ Redis Storage**
  - ติดตั้ง `@nestjs/throttler` และ `throttler-storage-redis` (หรือเขียน Custom Redis Throttler บน `RedisService` ที่มีอยู่แล้ว)
  - กำหนดค่า Global Throttler Module ใน `apps/api` และ `apps/admin-api`
  - ทดสอบการคืนค่า HTTP Status `429 Too Many Requests` พร้อม Header `Retry-After`
- [ ] **1.2 กำหนด Tiered Rate Limiting ตามระดับความเสี่ยงของ Endpoint**
  - **Public Read (ทั่วไป):** `100 requests / 1 นาที`
  - **Login / Password Setup:** `5 requests / 1 นาที` (ป้องกัน Brute-force รหัสผ่าน)
  - **Customer OTP Request (`/auth/otp/send`):** `1 request / 60 วินาที` ต่อ 1 อีเมลและ IP (ป้องกันค่าใช้จ่าย Resend บานปลาย)
  - **OTP Verify (`/auth/otp/verify`):** `5 attempts / OTP session` (ถ้าใส่ผิดเกิน 5 ครั้ง ให้ Void OTP ทันที)
- [ ] **1.3 นโยบาย Account Lockout สำหรับผู้ดูแลระบบ (Admin Account Lockout)**
  - บันทึกจำนวนครั้งที่ Login ล้มเหลวลงใน Redis key `admin:login_fails:<username>`
  - หากใส่รหัสผ่านผิดติดต่อกัน 5 ครั้ง ให้ล็อคบัญชีชั่วคราวเป็นเวลา 15 นาที
  - ส่ง Security Alert เข้าสู่ `AdminAuditLog` ทันทีเมื่อเกิดการล็อคบัญชี
- [ ] **1.4 กำหนด Request Payload Size Limits (Anti-Buffer Overflow / ReDoS)**
  - กำหนด `express.json({ limit: '1mb' })` สำหรับคำขอทั่วไปใน `main.ts`
  - อนุญาตขนาดพิเศษ `10mb` เฉพาะ Multipart Upload Route (`/admin/upload`)

---

### 📌 เฟส 2: การรักษาความปลอดภัยข้อมูลและสิทธิ์ผู้ใช้ (Data Protection & Authentication)
> **เป้าหมาย:** อุดช่องโหว่ OWASP API2, API3 & API8 ป้องกันข้อมูลรั่วไหลใน Logs และจัดการ Session วงจรปิด

- [ ] **2.1 ระบบ JWT Token Revocation & Blacklist บน Redis**
  - สร้าง `TokenBlacklistService` จัดเก็บ Token Identifier (`jti` หรือ Token Hash) บน Redis
  - เมื่อผู้ใช้หรือแอดมินกด Logout (`POST /auth/logout`) ให้นำ Access Token ไปขึ้นบัญชีดำตามอายุ TTL ที่เหลืออยู่
  - อัปเดต `JwtAuthGuard` ให้ตรวจสอบ Redis Blacklist ก่อนอนุญาตให้ Request ผ่าน
- [ ] **2.2 ระบบปิดบังข้อมูลสำคัญใน Logs (PII & Sensitive Data Sanitizer)**
  - สร้าง Logging Interceptor / Custom Winston Formatter ที่ทำการ Mask ข้อมูลก่อนบันทึก:
    - ฟิลด์ที่ต้อง Mask 100%: `password`, `newPassword`, `currentPassword`, `otpCode`, `cardNumber`, `cvv`
    - ฟิลด์ PII ที่ต้อง Mask บางส่วน: อีเมล (`w***@gmail.com`), เบอร์โทร (`081-***-1234`)
  - ตรวจสอบให้แน่ใจว่าไม่มี Payload อ่อนไหวหลุดเข้าไปใน Render / Supabase / CloudWatch logs
- [ ] **2.3 ยกระดับ HTTP Security Headers ผ่าน Helmet**
  - เพิ่ม `Strict-Transport-Security` (HSTS: `max-age=31536000; includeSubDomains; preload`)
  - กำหนด `X-Content-Type-Options: nosniff` เพื่อป้องกัน MIME-sniffing
  - กำหนด `Referrer-Policy: strict-origin-when-cross-origin`
  - ลบ Header `X-Powered-By: Express` เพื่อไม่ให้เปิดเผยเทคโนโลยีฝั่งเซิร์ฟเวอร์
- [ ] **2.4 ปิดการเข้าถึง Swagger / OpenAPI ในโหมด Production**
  - ซ่อน Route `/api/docs` เมื่อ `NODE_ENV === 'production'` หรือต้องผ่าน Basic Auth เฉพาะทีมงานภายใน

---

### 📌 เฟส 3: การเพิ่มประสิทธิภาพแคชและฐานข้อมูล (High-Performance Caching & DB Tuning)
> **เป้าหมาย:** ลดความหน่วง (Latency) ของ API ลง 80% และลดภาระงานของ PostgreSQL ในช่วงที่มี Traffic สูง

- [ ] **3.1 ระบบ High-Speed Redis Caching สำหรับ Read-Heavy Endpoints**
  - นำ `RedisService` มาทำ Caching สำหรับ Public Endpoints หน้าร้าน:
    - `GET /api/v1/catalog/categories` (TTL: 1 ชั่วโมง)
    - `GET /api/v1/content/home` (TTL: 15 นาที)
    - `GET /api/v1/content/settings` (TTL: 1 ชั่วโมง)
  - **Cache Invalidation Automation:** เมื่อแอดมินแก้ไขสินค้า หมวดหมู่ หรือแบนเนอร์ผ่าน `apps/admin-api` ให้ทำการล้าง Redis Cache ที่เกี่ยวข้องทันที (`delByPattern('cache:catalog:*')`)
- [ ] **3.2 Prisma Slow Query Logger (ตรวจจับคอขวดเชิงรุก)**
  - ติดตั้ง Prisma Client Extension ตรวจจับเวลาในการ Query ทุกครั้ง
  - หากคำสั่งใดใช้เวลาเกินเกณฑ์ที่กำหนด (Threshold: `> 200ms`) ให้บันทึก Warning Log พร้อม SQL Statement และ Execution Duration ทันที เพื่อให้ทีมงานรู้จุดที่ต้องเพิ่ม Index ล่วงหน้า
- [ ] **3.3 Connection Pool & PgBouncer Fine-Tuning**
  - ปรับแต่ง `connection_limit` ใน Prisma URL ให้เหมาะสมกับ Tier ของ Supabase
  - ตรวจสอบให้แน่ใจว่า Background Worker (BullMQ) ใช้ Connection ที่แยกจาก HTTP Requests

---

### 📌 เฟส 4: ความพร้อมในการดำเนินงานและการตรวจสอบ (Monitoring & Auditability)
> **เป้าหมาย:** ระบบสังเกตการณ์ (Observability) และประวัติการทำธุรกรรมที่โปร่งใส

- [ ] **4.1 ระบบบันทึก Health Status เชิงลึก (Deep Health Checks)**
  - ปรับปรุง `/health` ให้ตรวจสอบสถานะการเชื่อมต่อของ:
    - PostgreSQL Database (Ping query)
    - Redis Cache & BullMQ Queue connection
    - ผู้ให้บริการภายนอก (Resend API status)
- [ ] **4.2 ตรวจสอบ Audit Log Immutability**
  - ตรวจสอบให้แน่ใจว่าตาราง `AdminAuditLog` ไม่มี Endpoint สำหรับ `UPDATE` หรือ `DELETE` (Append-only โดยสมบูรณ์)
  - บันทึก IP Address และ User Agent ของผู้กระทำทุกครั้ง

---

## 3. สรุป KPI ความสำเร็จหลังดำเนินการครบถ้วน

| มิติความปลอดภัยและประสิทธิภาพ | ก่อนปรับปรุง | หลังปรับปรุง (Target) |
| :--- | :--- | :--- |
| **Brute-force / OTP Flood Resistance** | ไม่จำกัด (เสี่ยงโดนสแปม) | ป้องกัน 100% ด้วย 429 Rate Limiter |
| **Token Invalidation on Logout** | Token ยังใช้ได้จนหมดอายุ | ตัดสิทธิ์ทันทีผ่าน Redis Blacklist |
| **Sensitive PII in Logs** | มีโอกาสหลุด Plaintext | Mask ข้อมูลอ่อนไหว 100% อัตโนมัติ |
| **Catalog API Response Latency** | 80ms – 180ms (DB Hit) | `< 15ms` (Redis Cache Hit) |
| **Security Headers Score** | Grade B | **Grade A+ (SecurityHeaders.com)** |

