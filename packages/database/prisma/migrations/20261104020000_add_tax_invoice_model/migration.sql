-- CreateEnum
CREATE TYPE "TaxInvoicePayerType" AS ENUM ('PERSONAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "TaxInvoiceBranchType" AS ENUM ('HEADQUARTERS', 'BRANCH');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "tax_invoice_request" JSONB;

-- CreateTable
CREATE TABLE "tax_invoices" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "payer_type" "TaxInvoicePayerType" NOT NULL DEFAULT 'PERSONAL',
    "tax_id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "branch_type" "TaxInvoiceBranchType",
    "branch_code" VARCHAR(10),
    "address" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shipping_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "pre_vat_amount" DECIMAL(10,2) NOT NULL,
    "vat_amount" DECIMAL(10,2) NOT NULL,
    "items_snapshot" JSONB NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tax_invoices_order_id_key" ON "tax_invoices"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_invoices_invoice_number_key" ON "tax_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "tax_invoices_tax_id_idx" ON "tax_invoices"("tax_id");

-- CreateIndex
CREATE INDEX "tax_invoices_issued_at_idx" ON "tax_invoices"("issued_at");

-- AddForeignKey
ALTER TABLE "tax_invoices" ADD CONSTRAINT "tax_invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

