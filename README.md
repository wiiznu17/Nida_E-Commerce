# Nida — Luxury Apparel & Lifestyle E-Commerce Platform

A production-grade, full-stack e-commerce platform built as a high-performance TypeScript monorepo with Turborepo. Engineered for high-end fashion retail with editorial luxury aesthetics, strict inventory integrity, pro-rated order economics, and role-based operational workflows.

---

## Architecture Overview

Nida separates customer-facing commerce from back-office administration into distinct applications while sharing single-source-of-truth domain types and validation contracts across the entire monorepo.

| Application / Package | Tech Stack                        | Role / Responsibility                                       | Port / Target           |
| :-------------------- | :-------------------------------- | :---------------------------------------------------------- | :---------------------- |
| `apps/store`          | Next.js (App Router), TailwindCSS | Customer storefront, editorial catalog, Cart & Checkout     | `http://localhost:3000` |
| `apps/admin`          | React, Vite, TailwindCSS          | Admin Back-Office (Products, Inventory, Orders, CMS, Staff) | `http://localhost:5173` |
| `apps/api`            | NestJS, Prisma, BullMQ, Redis     | Public Storefront API, OTP Auth, Checkout, Order Lifecycle  | `http://localhost:4001` |
| `apps/admin-api`      | NestJS, Prisma, Redis             | Back-office REST API, RBAC Guards, Auditing, Shipments      | `http://localhost:4000` |
| `packages/database`   | Prisma ORM, PostgreSQL            | Database schema, SQL migrations, idempotent seed engine     | Port `5432`             |
| `packages/types`      | TypeScript                        | Shared domain entities, DTOs, Enums, API contracts          | Monorepo Package        |
| `packages/validators` | Zod                               | Shared validation schemas for client forms & server pipes   | Monorepo Package        |
| `packages/ui`         | React, TailwindCSS                | Design system primitives and reusable UI components         | Monorepo Package        |

---

## Quick Start (Local Setup)

### 1. Prerequisites

- **Node.js**: `>= 20.0.0`
- **Docker Desktop**: For running PostgreSQL 16 and Redis containers

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/wiiznu17/Nida_E-Commerce.git
cd Nida_Project
npm install
```

### 3. Configure Environment Variables

This monorepo uses **separate `.env` files** per workspace. Each workspace reads its own `.env` — they are **not** inherited from root.

```bash
# Root (docker-compose only)
cp .env.example .env

# Database package (Prisma CLI reads DATABASE_URL from here)
cp packages/database/.env.example packages/database/.env

# Backend APIs
cp apps/api/.env.example apps/api/.env
cp apps/admin-api/.env.example apps/admin-api/.env
```

> **Note**: If using the default Docker Compose setup (local PostgreSQL + Redis), the `.env.example` files ship with working defaults — no edits needed. For Supabase or other cloud databases, update `DATABASE_URL` and `DIRECT_URL` in `packages/database/.env` and the backend `.env` files accordingly.

**Environment File Hierarchy:**

| File | Read By | Purpose |
| :--- | :--- | :--- |
| `.env` (root) | `docker-compose.yml` | Container names, ports, Postgres/Redis passwords |
| `packages/database/.env` | Prisma CLI (`db:push`, `db:seed`, `db:generate`, `db:studio`) | `DATABASE_URL`, `DIRECT_URL`, production seed secrets |
| `apps/api/.env` | Storefront NestJS API | DB connection, Redis, JWT customer secret, Omise keys |
| `apps/admin-api/.env` | Admin NestJS API | DB connection, Redis, JWT admin secrets, Cloudinary keys |
| `apps/store/.env.local` | Next.js Storefront | `NEXT_PUBLIC_API_URL` |
| `apps/admin/.env` | Vite Admin Portal | `VITE_API_URL`, `VITE_STOREFRONT_URL` |

### 4. Spin Up Infrastructure & Seed Database

```bash
# Start PostgreSQL 16, Redis 7, and pgAdmin containers
docker compose up -d

# Push database schema (reads DATABASE_URL from packages/database/.env)
npm run db:push -w @repo/database

# Seed mock catalog, demo staff accounts, and test coupons
npm run db:seed -w @repo/database
```

> **Tip**: You can also run Prisma commands directly from the package directory:
> ```bash
> cd packages/database
> npx prisma db push
> npx prisma studio
> ```

### 5. Start Development Servers

```bash
# Start all services concurrently (Store, Admin, API, Admin-API)
npm run dev
```

Alternatively, run specific application pairs during focused development:

```bash
npm run dev:store-full   # Storefront (Next.js) + Store API (NestJS)
npm run dev:admin-full   # Admin Portal (Vite) + Admin API (NestJS)
```

---

## Test Accounts & Pre-Seeded Credentials

Once the development seed finishes, the following accounts and resources are ready for evaluation:

### Admin Back-Office Portal (`http://localhost:5173`)

| Account Role            | Email                          | Password   | Scope of Access                                    |
| :---------------------- | :----------------------------- | :--------- | :------------------------------------------------- |
| **Super Administrator** | `admin@nida-apparel.com`       | `admin123` | Full system control, Staff RBAC, Audit logs, CMS   |
| **Inventory Manager**   | `inventory@nida-apparel.com`   | `admin123` | Stock balance, Warehouse adjustments, SKU tracking |
| **Order Officer**       | `fulfillment@nida-apparel.com` | `admin123` | Order processing, Shipments, Returns review        |
| **Marketing Admin**     | `marketing@nida-apparel.com`   | `admin123` | Coupons, Campaign tags, Discounts                  |

### Customer Storefront (`http://localhost:3000`)

| Customer Account | Email                  | Password       | Tier / Initial Balance            |
| :--------------- | :--------------------- | :------------- | :-------------------------------- |
| VIP Customer     | `phannida@nida.com`    | `Password123!` | `VIP_GOLD` (1,250 loyalty points) |
| Regular Customer | `customer@example.com` | `Password123!` | `REGULAR` (200 loyalty points)    |

### Active Demo Promotion Coupons

- `NIDA20`: 20% off orders over ฿1,000 (Max discount ฿500)
- `FREESHIP`: Complimentary shipping on orders over ฿1,000
- `WELCOME200`: Flat ฿200 discount on orders over ฿1,500

---

## Key Engineering Highlights

### 1. Dual-API Monorepo Separation

Unlike monolithic APIs that mix customer shopping logic with administrative mutations, Nida isolates public storefront endpoints (`apps/api`) from staff back-office endpoints (`apps/admin-api`). Each service maintains its own Swagger documentation (`/api/docs`), middleware, and security boundary, while sharing data contracts through `@repo/types` and `@repo/validators`.

### 2. Atomic Inventory & Pre-Order Reservation

- SKU stock updates are never performed through loose mutation. Inventory is systematically tracked through `InventoryItem` with distinct fields for `quantityAvailable`, `quantityReserved`, and `preorderBooked`.
- Order placement executes transactional stock holds, preventing overselling during concurrent checkouts.
- Pre-order items feature quota caps (`preorderLimit`) and target fulfillment release dates.

### 3. Pro-Rated Financial Economics & Partial Refunds

- When multi-item orders utilize coupons or tiered discounts, the discount value is distributed pro-rata across eligible items.
- Item-level snapshots (`productNameSnapshot`, `variantInfoSnapshot`, `discountShare`, `netPrice`) guarantee that customer return requests and partial refunds calculate refund totals accurately without financial discrepancies.

### 4. Idempotent & Production-Guarded Seeding Engine

- **Development Seed (`npm run db:seed -w @repo/database`)**: Destructive refresh for local testing. Armed with environment guards that abort immediately if executed against a production database or with `NODE_ENV=production`.
- **Production Seed (`npm run db:seed:prod -w @repo/database`)**: Non-destructive, idempotent master data initialization. Syncs RBAC definitions, initializes the root Super Admin from environment secrets, and upserts product taxonomy without deleting operational data.

### 5. Granular RBAC & Audit Trails

- Staff accounts are decoupled from hardcoded roles. Administrative controllers enforce permissions via `@RequirePermissions(...)` guards against an immutable permission catalog.
- Sensitive administrative mutations (stock adjustments, refunds, price updates) are automatically recorded to `AdminAuditLog` with actor attribution, client IP, and state diffs.

---

## Code Quality & Verification

The codebase adheres to strict engineering constraints:

- **Zero `any`**: Explicit type narrowing, generics, and strict TypeScript configurations across all apps.
- **Contract Parity**: Shared Zod schemas (`@repo/validators`) are consumed directly by NestJS `ZodValidationPipe` on the server and React Hook Form on the client.

### Run Verification Commands

```bash
# Type check across all workspaces
npm run check-types

# Run backend unit tests (389+ tests covering happy paths, negative guards & edge cases)
npm --prefix apps/api run test
npm --prefix apps/admin-api run test

# Code formatting check
npm run format:check
```

---

## Infrastructure Services

| Service               | Port   | Local URL / Details                                   |
| :-------------------- | :----- | :---------------------------------------------------- |
| Storefront Web        | `3000` | `http://localhost:3000`                               |
| Admin Web             | `5173` | `http://localhost:5173`                               |
| Storefront REST API   | `4001` | `http://localhost:4001/api/docs` (Swagger)            |
| Admin Back-Office API | `4000` | `http://localhost:4000/api/docs` (Swagger)            |
| PostgreSQL 16         | `5432` | `localhost:5432/ecommerce_db`                         |
| Redis 7               | `6379` | `localhost:6379`                                      |
| pgAdmin 4             | `5050` | `http://localhost:5050` (`admin@admin.com` / `admin`) |
| Prisma Studio         | `5555` | `npm run db:studio -w @repo/database`                 |
