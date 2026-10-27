-- AlterTable: Add original_shipping_fee and shipping_discount to orders
ALTER TABLE "orders" ADD COLUMN "original_shipping_fee" DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "shipping_discount" DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Backfill existing orders:
UPDATE "orders"
SET "original_shipping_fee" = 50, "shipping_discount" = 50
WHERE "shipping_fee" = 0;

UPDATE "orders"
SET "original_shipping_fee" = "shipping_fee", "shipping_discount" = 0
WHERE "shipping_fee" > 0;
