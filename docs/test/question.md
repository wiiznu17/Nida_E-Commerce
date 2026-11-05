# สรุปคู่มือสัมภาษณ์ Full-Stack Developer — Mtel (ฉบับกระชับ & จำง่าย)
### (สูตรตอบไว + ตัวอย่างจริงจากสถาปัตยกรรม Nida Project)

---

## 🎯 เทคนิคการตอบ 3 จังหวะ (ใช้ได้ทุกคำถาม)
1. **ประโยคเดียวจบ (TL;DR)**: สรุปคำตอบสั้นๆ ใน 1 ประโยคทันที
2. **หลักการสั้นๆ**: อธิบายเหตุผลหรือกลไก 2-3 bullet points
3. **ยกตัวอย่าง Nida**: อ้างอิงโค้ดหรือปัญหาจริงที่เคยทำ

---

## 1. คุณสมบัติหลักที่ Mtel มองหา (Spec Quick-Check)
* **Core Skills**: JavaScript / TypeScript, REST APIs, PostgreSQL / Redis, Git Teamwork
* **AI & Code Ownership (สำคัญที่สุด)**: ใช้ AI ช่วยเขียนโค้ดได้ แต่ต้อง **"อธิบายเหตุผลและเป็นเจ้าของโค้ดทุกบรรทัด"** ไม่นำโค้ดมาวางโดยไม่เข้าใจ
* **Bonus Tech Stack**: React, Next.js (App Router), NestJS, Docker, Unit Testing (Vitest/Jest)

---

## 2. รวม 27 คำถามยอดฮิต (ตอบสั้น กระชับ มีตัวอย่างจริง)

---

### 🟢 หมวด JavaScript & TypeScript

#### 1. Execution Context, Call Stack และ Event Loop ทำงานร่วมกันอย่างไร?
* **TL;DR**: Call Stack รันโค้ดปกติ (Sync), งาน Asynchronous ถูกส่งไปรอใน Queue โดย Event Loop จะหยิบ **Microtask (Promise)** มาทำจนหมดก่อน แล้วค่อยหยิบ **Macrotask (setTimeout)**
* **หลักการ**:
  * `Call Stack` (LIFO) $\rightarrow$ รันโค้ดบรรทัดต่อบรรทัด
  * `Microtask Queue` $\rightarrow$ Promise, `async/await` (ความสำคัญสูงกว่า)
  * `Macrotask Queue` $\rightarrow$ `setTimeout`, `setInterval`
* **ตัวอย่างจริง Nida**:
  ```typescript
  // ใน orders.service.ts
  const subtotal = calculatePrice(items); // 1. Sync -> รันบน Call Stack ทันที
  await prisma.$transaction(...);         // 2. Async -> Promise รอใน Microtask Queue
  scheduleTimeoutWorker(order.id);        // 3. แยกงานหนักไปให้ Redis Queue ทำเบื้องหลัง ไม่บล็อก Main Thread
  ```

---

#### 2. `var`, `let`, และ `const` ต่างกันอย่างไร ทำไมถึงแบน `var`?
* **TL;DR**: `var` เป็น Function Scope และมี Hoisting แบบให้ค่า `undefined` ส่วน `let`/`const` เป็น Block Scope และมี Temporal Dead Zone (TDZ)
* **เปรียบเทียบ**:
  * `var`: ประกาศซ้ำได้, Scope รั่วไหลนอกปีกกา `{}` (เลิกใช้เพราะบั๊กง่าย)
  * `let`: Re-assign ได้, ห้ามประกาศซ้ำ, อยู่ใน Scope `{}`
  * `const`: Re-assign ไม่ได้ (Immutable binding), เหมาะเป็นค่าเริ่มต้นเสมอ
* **ตัวอย่างจริง Nida**:
  ```typescript
  const { items } = dto; // ใช้ const เป็นค่าตั้งต้นเสมอ ป้องกันการเปลี่ยน reference
  let subtotal = 0;       // ใช้ let เพราะต้องบวกยอดสะสมในลูป
  for (const item of items) {
    const itemTotal = item.price * item.quantity; // const แยกตาม block scope แต่ละรอบ
    subtotal += itemTotal;
  }
  ```

---

#### 3. `any`, `unknown`, และ `never` ต่างกันอย่างไร?
* **TL;DR**: `any` ปิด Type Check ทั้งหมด, `unknown` ปลอดภัยกว่าเพราะบังคับตรวจ Type ก่อนใช้, `never` แสดงค่าที่ไม่มีวันเกิดขึ้น (ใช้ตรวจเงื่อนไขตกหล่น)
* **เปรียบเทียบ**:
  * `any` $\rightarrow$ หลีกเลี่ยงเด็ดขาด เสี่ยงเกิด Runtime Error
  * `unknown` $\rightarrow$ รับข้อมูลดิบจากภายนอก แล้วใช้ Zod หรือ Type Guard ตรวจสอบ
  * `never` $\rightarrow$ Exhaustive check ใน `switch-case`
* **ตัวอย่างจริง Nida**:
  ```typescript
  // ดักจับ error เป็น unknown แล้ว Narrowing แทนที่จะใช้ any
  try { ... } catch (err: unknown) {
    if (err instanceof HttpException) throw err;
  }
  // ใช้ never ตรวจสถานะ OrderStatus ให้ครบทุกเงื่อนไข
  switch (order.status) {
    case 'PAID': ...; break;
    default: const _check: never = order.status; // ถ้ามีสถานะใหม่แล้วลืมเขียน case จะฟ้องตอน build ทันที
  }
  ```

---

#### 4. `type` กับ `interface` ใน TypeScript ต่างกันอย่างไร?
* **TL;DR**: `interface` เหมาะกับโครงสร้าง Object/Class (รองรับ `extends` และ Declaration Merging) ส่วน `type` ยืดหยุ่นกว่า กำหนด Union, Primitives, Tuples ได้
* **หลักการเลือกใช้**:
  * ข้อมูล Entity / Props / API Response $\rightarrow$ ใช้ `interface`
  * รวมค่า Union (`|`) / ฟังก์ชัน / Mapped Type $\rightarrow$ ใช้ `type`
* **ตัวอย่างจริง Nida**:
  ```typescript
  // Object Model ใช้ interface
  export interface ApiProduct { id: string; name: string; basePrice: number; }
  // รวมตัวเลือก Union ใช้ type
  export type CarrierCode = 'KERRY' | 'FLASH' | 'THAIPOST';
  ```

---

#### 5. Generics ใน TypeScript คืออะไร มีประโยชน์อย่างไร?
* **TL;DR**: การส่ง Type เข้าไปเป็นตัวแปร (เช่น `<T>`) เพื่อให้ฟังก์ชันหรืออินเทอร์เฟซรองรับข้อมูลหลายชนิดได้ โดยยังคง Type Safety 100% ไม่ต้องพึ่ง `any`
* **ตัวอย่างจริง Nida**:
  ```typescript
  // Wrapper กลางสำหรับ API response ทุกตัวในโปรเจกต์
  export interface ApiResponse<T> {
    success: true;
    data: T; // T จะเปลี่ยนตาม Entity เช่น ApiProduct หรือ ApiOrder[]
  }
  // เรียกใช้งาน: client.get<ApiResponse<ApiProduct>>('/product/1')
  ```

---

#### 6. Closure ใน JavaScript คืออะไร ใช้ใน React อย่างไร?
* **TL;DR**: ฟังก์ชันลูกที่จดจำตัวแปรใน Scope ของฟังก์ชันแม่ได้ แม้ฟังก์ชันแม่จะทำงานเสร็จไปแล้วก็ตาม
* **ตัวอย่างจริง Nida**:
  ```typescript
  // Custom Hook useDebounce สำหรับช่องค้นหาสินค้า
  export function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      // Callback ใน setTimeout จดจำ 'value' ผ่าน Closure เพื่อหน่วงเวลาไม่ให้ยิง API ถี่เกินไป
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
  }
  ```

---

#### 7. `Promise.all` กับ `Promise.allSettled` ต่างกันอย่างไร?
* **TL;DR**: `Promise.all` จะล่มทันทีถ้ามีตัวใดตัวหนึ่งพัง (Fail-Fast) ส่วน `Promise.allSettled` จะรอจนจบครบทุกตัวเสมอ ไม่ว่าจะสำเร็จหรือล้มเหลว
* **ตัวอย่างจริง Nida**:
  ```typescript
  // หน้า Dashboard แอดมิน: ดึงยอดขาย, จำนวนออเดอร์, และสินค้าสต็อกต่ำ
  // ใช้ Promise.allSettled เพื่อให้ถ้าเซอร์วิสสต็อกพัง ยอดขายกับออเดอร์ยังแสดงผลได้ตามปกติ
  const results = await Promise.allSettled([fetchSales(), fetchOrders(), fetchLowStock()]);
  ```

---

### ⚛️ หมวด React & Frontend

#### 8. ปัญหา Re-rendering ใน React เกิดจากอะไร แก้ได้อย่างไร?
* **TL;DR**: เกิดจาก State/Props เปลี่ยน หรือ Parent Re-render โดยสาเหตุหลักมักเกิดจาก Object/Function Reference เปลี่ยนใหม่ทุกรอบ แก้ด้วย `useMemo`, `useCallback`, และแยก State
* **ตัวอย่างจริง Nida**:
  ```typescript
  // ใน AdminProducts.tsx: ใช้ useMemo ล็อก Object ตัวกรอง ไม่ให้สร้างใหม่ทุกครั้งที่พิมพ์ค้นหา
  const queryParams = useMemo(() => ({
    page: currentPage,
    search: activeFilters.search.trim() || undefined,
  }), [currentPage, activeFilters.search]);
  ```

---

#### 9. ความแตกต่างระหว่าง Props กับ State และหลักการ Lifting State Up?
* **TL;DR**: Props ส่งมาจากภายนอกและห้ามแก้ไข (Read-only) ส่วน State เป็นข้อมูลภายในคอมโพเนนต์ที่เปลี่ยนค่าได้ ส่วน Lifting State Up คือการยก State ขึ้นไปไว้ที่พ่อแม่ร่วมกันเพื่อให้ลูกๆ ซิงก์ข้อมูลกันได้
* **ตัวอย่างจริง Nida**:
  * ใน `AdminProducts.tsx`: ยก State ตัวกรอง (`activeFilters`) และหน้า (`currentPage`) ไว้ที่หน้าหลัก เพื่อให้ทั้งกล่องค้นหา (`ProductFilterBar`) และตารางสินค้า (`ProductTable`) ได้ข้อมูลตรงกัน

---

#### 10. Props Drilling คืออะไร แก้อย่างไร และ Cleanup ใน `useEffect` มีไว้ทำไม?
* **TL;DR**: Props Drilling คือการส่ง Props ผ่านคอมโพเนนต์หลายชั้นที่ไม่จำเป็น แก้ด้วย Context API ส่วน Cleanup function มีไว้ล้าง Side Effect (เช่น Timer, AbortController) ป้องกัน Memory Leak
* **ตัวอย่างจริง Nida**:
  ```typescript
  // 1. แก้ Props Drilling ด้วย CartContext ให้ Header badge และ Drawer เข้าถึงตะกร้าได้ตรงๆ
  // 2. ใช้ AbortController ใน useEffect Cleanup เพื่อยกเลิกยิง API เมื่อเปลี่ยนหน้าก่อนโหลดเสร็จ
  useEffect(() => {
    const controller = new AbortController();
    fetchData({ signal: controller.signal });
    return () => controller.abort(); // Cleanup ยกเลิก request
  }, [category]);
  ```

---

#### 11. Virtual DOM ทำงานอย่างไร และทำไมใน `.map()` ถึงห้ามใช้ `key={index}`?
* **TL;DR**: Virtual DOM เปรียบเทียบส่วนต่าง (Diffing) แล้วแก้เฉพาะจุดบน DOM จริง ส่วน `key` ใช้ระบุตัวตนไอเทม ถ้าใช้ `index` เมื่อลบแถวบนสุด React จะจำตำแหน่งผิด ทำให้ฟอร์มหรือ Input ของแถวถัดไปเพี้ยน
* **ตัวอย่างจริง Nida**:
  ```tsx
  // ใช้ unique ID จาก Database เสมอ ห้ามใช้ index เด็ดขาด
  {cartItems.map((item) => (
    <CartItem key={item.variantId} item={item} />
  ))}
  ```

---

#### 12. Controlled Component กับ Uncontrolled Component ต่างกันอย่างไร?
* **TL;DR**: Controlled ผูกข้อมูลกับ React State (`value` + `onChange`) เหมาะกับการ Validate ทันที ส่วน Uncontrolled ปล่อยให้ DOM จัดการเองและดึงค่าผ่าน `useRef` เมื่อต้องการ ไม่เปลือง Re-render
* **ตัวอย่างจริง Nida**:
  * ช่องชื่อสินค้าและราคาใช้ **Controlled Component** เพื่อตรวจ Zod ทันที
  * ปุ่มเลือกรูปภาพใช้ **`useRef`** ชี้ไปที่ `<input type="file" ref={fileInputRef} hidden />` แล้วสั่ง `.click()` โดยไม่ต้องมี State มากระตุ้นการเรนเดอร์

---

### 🌐 หมวด Next.js

#### 13. Server Components (RSC) กับ Client Components ต่างกันอย่างไร?
* **TL;DR**: Server Components เรนเดอร์บนเซิร์ฟเวอร์โดยตรง ได้ HTML พร้อมใช้ทันที Bundle Size 0 KB เหมาะกับ SEO ส่วน Client Components (`'use client'`) รันบนเบราว์เซอร์ เพื่อรองรับการคลิก/State
* **ตัวอย่างจริง Nida**:
  * `apps/store/src/app/product/[id]/page.tsx`: เป็น **Server Component** ดึงข้อมูลสินค้าและสร้าง OpenGraph SEO
  * ปุ่มเลือกสี/ไซส์ และปุ่ม 'Add to Bag': แยกเป็น **Client Component (`'use client'`)** เฉพาะจุดที่มีการคลิก

---

#### 14. CSR, SSR, SSG และ ISR ใน Next.js ต่างกันอย่างไร?
* **TL;DR**:
  * **CSR**: ดึงข้อมูลบนเบราว์เซอร์ $\rightarrow$ ใช้กับ **ระบบหลังบ้าน (Admin)**
  * **SSG**: เรนเดอร์เป็น HTML ตั้งแต่ตอน Build $\rightarrow$ ใช้กับ **หน้า About/Terms**
  * **SSR**: เรนเดอร์ใหม่ทุก Request $\rightarrow$ ใช้กับ **หน้า Checkout / Cart** ที่ราคาเปลี่ยนตลอดเวลา
  * **ISR**: เหมือน SSG แต่แอบคำนวณใหม่เบื้องหลังตามเวลา $\rightarrow$ ใช้กับ **หน้าหมวดหมู่สินค้า (`revalidate: 60`)**

---

#### 15. ทำไมควรใช้ `<Image>` (`next/image`) แทนแท็ก `<img>` ธรรมดา?
* **TL;DR**: ช่วยบีบอัดเป็น WebP/AVIF อัตโนมัติ (ขนาดลดลง 60%), ปรับขนาดตามหน้าจออุปกรณ์, บังคับใส่สัดส่วนเพื่อกันหน้าเว็บกระตุก (CLS), และทำ Lazy Loading อัตโนมัติ
* **ตัวอย่างจริง Nida**:
  ```tsx
  <Image
    src={displayImage}
    alt={title}
    fill
    sizes="(max-width: 640px) 100vw, 25vw"
    className="object-cover"
  />
  ```

---

### ⚙️ หมวด Backend, APIs & Network

#### 16. Authentication: Session-based vs JWT ต่างกันอย่างไร?
* **TL;DR**: Session เป็น Stateful (เซิร์ฟเวอร์จำ Session ID ปลอดภัย/Revoke ได้ทันที แต่ Scale แนวนอนยาก), JWT เป็น Stateless (พกข้อมูลใน Token ขยายระบบง่าย แต่สั่งยกเลิกก่อนหมดอายุยาก)
* **ตัวอย่างจริง Nida (Hybrid)**:
  * **Access Token (JWT)**: อายุสั้น 15 นาที ตรวจสิทธิ์ได้เร็วระดับ Microsecond โดยไม่ต้องค้นหา DB
  * **Refresh Token + Redis**: อายุ 7 วัน เก็บใน Redis เพื่อให้สั่ง **Revoke/บล็อก** สิทธิ์ผู้ใช้ได้ทันทีหากพบความผิดปกติ

---

#### 17. Concurrency / Race Condition ในการตัดสต็อกสินค้า จัดการอย่างไร?
* **TL;DR**: ใช้ **Atomic Conditional Update** ภายใต้ Database Transaction สั่งหักสต็อกโดยมีเงื่อนไข `stock >= quantity` ในคำสั่งเดียว หากมีคนชิงตัดไปก่อนผลลัพธ์จะกระทบ 0 แถวและสั่ง Rollback ทันที
* **ตัวอย่างจริง Nida**:
  ```typescript
  // ใน apps/api/src/modules/orders/orders.service.ts
  const result = await tx.inventoryItem.updateMany({
    where: { id: variantId, quantityAvailable: { gte: quantity } }, // ตรวจสอบเงื่อนไขระดับ DB
    data: { quantityAvailable: { decrement: quantity } },           // ตัดสต็อกแบบ Atomic
  });
  if (result.count === 0) {
    throw new BadRequestException('สินค้าในสต็อกไม่เพียงพอ'); // Rollback ทันที สต็อกไม่มีวันติดลบ
  }
  ```

---

#### 18. HTTP Status Codes: 401 vs 403 และ 400 vs 409 ต่างกันอย่างไร?
* **TL;DR**:
  * **401**: ไม่รู้ว่าเป็นใคร (Unauthenticated - ไม่มี Token หรือหมดอายุ)
  * **403**: รู้ว่าเป็นใคร แต่ไม่มีสิทธิ์ (Forbidden - Role ไม่ถึง)
  * **400**: Payload ผิดรูปแบบ / ไวยากรณ์ไม่ถูกต้อง (Bad Request)
  * **409**: Payload ถูกต้อง แต่ขัดแย้งกับสถานะปัจจุบันของระบบ เช่น ราคาเปลี่ยนกะทันหัน หรือ อีเมลซ้ำ (Conflict)
* **ตัวอย่างจริง Nida**:
  * ส่ง `400` เมื่อจำนวนสินค้าติดลบ (ติด Zod validation)
  * ส่ง `409` เมื่อราคาในตะกร้าลูกค้าไม่ตรงกับราคาปัจจุบันในฐานข้อมูล (`PRICE_MISMATCH`)

---

#### 19. CORS Error คืออะไร ทำไมเบราว์เซอร์ถึงบล็อก และแก้ปัญหาที่ฝั่ง Backend อย่างไร?
* **TL;DR**: กลไกความปลอดภัยของเบราว์เซอร์ที่บล็อกการยิงข้าม Domain/Port แก้ไขโดยให้ Backend ตอบ Header `Access-Control-Allow-Origin` ยืนยันอนุญาต
* **ตัวอย่างจริง Nida**:
  ```typescript
  // ใน apps/api/src/main.ts: เปิดรับข้าม Port ระหว่าง Next.js (3000), Vite (5173), และ NestJS (4000)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', /\.vercel\.app$/],
    credentials: true, // อนุญาตให้ส่ง Cookies / Auth Header ข้ามโดเมน
  });
  ```

---

### 🏛️ หมวด OOP & NestJS Architecture

#### 20. 4 เสาหลักของ OOP นำมาใช้ใน NestJS อย่างไร?
* **TL;DR**:
  * **Encapsulation**: ซ่อนข้อมูลด้วย `private readonly prisma` ใน Service ป้องกัน Controller เข้าถึง DB ตรงๆ
  * **Abstraction**: Service เปิดฟังก์ชัน `createOrder(dto)` ซ่อนตรรกะความซับซ้อน 200 บรรทัดไว้ข้างใน
  * **Inheritance**: `JwtStrategy extends PassportStrategy(Strategy)` สืบทอดคลาสแม่
  * **Polymorphism**: `HttpExceptionFilter` ตรวจจับ `exception instanceof HttpException` ซึ่งจัดการ Exception ทุกตัว (`BadRequest`, `NotFound`, `Conflict`) ได้พร้อมกัน

---

#### 21. Dependency Injection (DI) และ IoC คืออะไร มีผลดีต่อ Unit Test อย่างไร?
* **TL;DR**: แทนที่คลาสจะสร้าง Dependency เองด้วย `new Class()` เราให้ NestJS IoC Container ฉีดผ่าน `constructor` เข้ามา ทำให้เราส่ง **Mock Object** เข้าไปแทนที่ใน Unit Test ได้ง่ายดาย
* **ตัวอย่างจริง Nida**:
  ```typescript
  // ใน Production: NestJS ส่ง PrismaService จริงให้
  constructor(private readonly prisma: PrismaService) {}

  // ใน Unit Test (Vitest): สลับส่ง prismaMock จำลองเข้าไปแทน รันเทสเสร็จใน 2 วินาทีโดยไม่ต้องต่อ DB จริง
  const service = new CustomerOrdersService(prismaMock, mailerMock, omiseMock);
  ```

---

#### 22. Singleton และ Strategy Pattern ใช้ตอนไหนในระบบจริง?
* **TL;DR**:
  * **Singleton**: มี Instance เดียวตลอดกาล $\rightarrow$ Service ใน NestJS ทุกตัวเป็น Singleton เพื่อแชร์ Database Connection Pool
  * **Strategy**: สับเปลี่ยนอัลกอริทึมได้ภายใต้ Interface เดียวกัน $\rightarrow$ ใช้แยกวิธีชำระเงินใน `OmiseService` (Credit Card Tokenization vs PromptPay QR Code)

---

### 🗄️ หมวด Database & Optimization

#### 23. Database Indexing ทำงานอย่างไร และสร้างมากเกินไปมีข้อเสียอะไร?
* **TL;DR**: ใช้โครงสร้าง **B-Tree** ช่วยลดเวลาค้นหาจาก $O(N)$ เป็น $O(\log N)$ ช่วยให้คำสั่ง `SELECT` เร็วขึ้นมหาศาล แต่จะทำให้ `INSERT/UPDATE/DELETE` ช้าลงเพราะต้องเขียนต้นไม้ใหม่ทุกครั้ง และเปลืองพื้นที่ Storage
* **ตัวอย่างจริง Nida**:
  * ทำ Index บนคอลัมน์ High Cardinality: `orderNumber`, `slug`, และ Compound Index `@@index([userId, status])`
  * หลีกเลี่ยงการทำ Index บน Boolean เดี่ยวๆ เช่น `isPrimary` หรือ `isActive` เพราะมีแค่ 2 ค่า ไม่ช่วยให้ค้นหาเร็วขึ้น

---

#### 24. ปัญหา N+1 Query ใน ORM คืออะไร และป้องกันอย่างไร?
* **TL;DR**: เกิดจากการยิงคำสั่งหลัก 1 ครั้ง แล้ววนลูปในโค้ดเพื่อยิงคำสั่งย่อยอีก $N$ ครั้ง แก้ด้วยการทำ **Eager Loading (`include`)** หรือ **Batch Query (`IN (...)`)**
* **ตัวอย่างจริง Nida**:
  ```typescript
  // ห้ามวนลูปยิง findUnique ทีละรายการ! แต่ให้รวบรวม ID แล้วยิง Batch ทีเดียว:
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  const variantMap = new Map(variants.map(v => [v.id, v])); // ทำ Lookup O(1) ใน Memory
  ```

---

### 👥 หมวด Teamwork, Testing & AI Ownership

#### 25. Workflow การทำงานร่วมกันผ่าน Git และวิธีแก้ Merge Conflict?
* **TL;DR**: ใช้ Feature Branch (`feat/name`), คอมมิตโค้ดเป็นชิ้นเล็กๆ ที่มีความหมาย, ดึง `main` เข้ามา Rebase/Merge ในเครื่องตัวเองก่อนเปิด PR เสมอ และรัน Test ก่อน Merge
* **ตัวอย่างจริง Nida**:
  * หากแก้ Type ใน `@repo/types` ชนกัน ให้เปิดดู Diff ร่วมกับเพื่อนร่วมทีม คุยตกลงกัน และรัน `npm run build` ตรวจสอบทั้ง Monorepo ให้ผ่าน 100% ก่อนส่งเข้า `main`

---

#### 26. ทำไมต้องเขียน Unit Test และการทำ Mocking จำเป็นอย่างไร?
* **TL;DR**: Unit Test ช่วยป้องกัน Regression (แก้ตรงนี้ไปพังตรงโน้น) และช่วยให้กล้า Refactor โค้ด ส่วน Mocking คือการจำลองระบบภายนอก (DB, Payment Gateway) เพื่อให้เทสรันได้เร็วและปลอดภัย ไม่ตัดเงินจริง
* **ตัวอย่างจริง Nida**:
  * ใน `orders.service.spec.ts` เราใช้ Vitest ทำการ Mock `OmiseService.createCreditCardCharge` เพื่อทดสอบเคสบัตรถูกปฏิเสธ หรือสต็อกไม่พอ โดยไม่ต้องยิงเงินจริง

---

#### 27. "Code with AI, review every line" (ค่านิยมหลักของ Mtel) คุณมีวิธีทำงานร่วมกับ AI อย่างไร?
* **TL;DR**: ใช้ AI เพื่อสร้าง Boilerplate และร่าง Test Cases แต่ตัวเราต้องทำหน้าที่เป็น **Gatekeeper 4 ด่าน** เพื่อรักษาความเป็นเจ้าของโค้ด (Code Ownership)
* **ขั้นตอน 4 ด่านของ Nida**:
  1. **Strict Types & Zero `any`**: ตรวจสอบว่าต้องมี Zod Schema Validation เสมอ
  2. **Database Migration**: ห้ามแก้ `schema.prisma` ลอยๆ ต้องสร้างไฟล์ Migration SQL ควบคู่เสมอ
  3. **No Fake Mocks**: ระบบจริง (เช่น Omise) ห้ามเขียนโค้ดโกงข้ามการตัดเงิน ต้องมี Error Handling จริง
  4. **Unit Test Coverage**: โค้ดที่ AI สร้าง ต้องมี Unit Test ทดสอบทั้งกรณีผ่านและกรณีพังทุกครั้ง
