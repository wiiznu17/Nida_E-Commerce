# Nida — Modern Classic Apparel & Lifestyle Platform

Nida is a full-stack e-commerce platform designed for fashion and lifestyle brands. Built on a **Monorepo architecture powered by Turborepo**, it features a customer-facing storefront, an admin back-office portal, a robust NestJS backend API, and a PostgreSQL database managed via Prisma ORM.

## 🏗️ Workspace Architecture

```
Nida_Project/
├── apps/
│   ├── store/          # Next.js (Customer Storefront)
│   ├── admin/          # React (Admin Portal)
│   └── admin-api/      # NestJS Admin API
|   └── api/            # NestJS Store API
├── packages/
│   ├── database/       # Prisma Schema, PostgreSQL Client, Migrations, and Seed Scripts
│   ├── ui/             # Shared UI Component Library
│   ├── validators/     # Shared Zod Schemas & Validation Logic
│   ├── eslint-config/  # Shared ESLint Configuration
│   ├── prettier-config/# Shared Prettier Code Style
│   └── typescript-config/# Shared TypeScript Configuration
├── docker-compose.yml  # PostgreSQL 16 + pgAdmin 4 Container Setup
└── README.md           # Documentation & Usage Guide

```

## 🚀 Quick Setup Guide

### 1. Prerequisites

* **Node.js**: v20 or higher

* **Docker Desktop**: For running PostgreSQL and pgAdmin containers

### 2. Install Dependencies

```
npm install

```

### 3. Environment Variables

Copy `.env.example` to `.env` at the project root:

```
cp .env.example .env

```

*(Default values are pre-configured for local development.)*

## 🗄️ Database & Docker Setup

### 1. Start PostgreSQL and pgAdmin via Docker

Open **Docker Desktop** and run:

```
docker compose up -d

```

* **PostgreSQL**: Runs on port `5432` (`localhost:5432/ecommerce_db`)

* **pgAdmin 4**: Access via web browser at `http://localhost:5050`

  * **Email**: `admin@admin.com`

  * **Password**: `admin`

### 2. Push Schema to Database

```
npm run db:push -w @repo/database

```

### 3. Seed Mock Data

Populate the database with sample categories, products with sizes and stock levels, pre-order items, promotional coupons, and a default Super Admin account:

```
npm run db:seed -w @repo/database

```

#### 🔑 Seed Credentials & Sample Coupons:

* **Super Admin Credentials**:

  * **Email**: `admin@nida-apparel.com`

  * **Username**: `superadmin`

  * **Password**: `admin123`

* **Sample Coupon Codes**:

  * `NIDA20`: 20% off (Min. spend \$100, max discount $50)

  * `FREESHIP`: Free shipping (Min. spend \$50)

  * `WELCOME50`: Flat \$50 off (Min. spend $200)

### 4. Database GUI (Prisma Studio)

```
npm run db:studio -w @repo/database

```

Access Prisma Studio at `http://localhost:5555`.

## 🖥️ Local Development

You can start all services concurrently or run specific applications individually.

### Run All Services (Turborepo Dev Mode)

```
npm run dev
```

## 🌟 Core Database & Business Features

1. **Pre-Order Engine**: Supports advance order items, target release dates, and allocated reservation quotas.

2. **Promotion & Coupon Engine**: Flexible discount rules (percentage, fixed amount, free shipping, discount caps) with abuse-prevention logic.

3. **Weight & Dimensions Matrix**: Accurate shipping fee calculations based on package dimensions and weight (grams).

4. **Pro-rated Net Price Calculation**: Automated item-level net cost breakdown for compliant partial refunds.

5. **Partial Refund Ledger**: Dedicated refund transaction ledger with actor audit trails for financial integrity.

6. **Lightweight Return Workflow**: Streamlined return request lifecycle with customer submission and admin review/approval flows.

7. **Loyalty Points Ledger**: Immutable point balance and transaction history ledger to prevent credit loss or mismatch.

8. **Payment Security**: Built-in Idempotency Key handling and robust payment gateway webhook verification.