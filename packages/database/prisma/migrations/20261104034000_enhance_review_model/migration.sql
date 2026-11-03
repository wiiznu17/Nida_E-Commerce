-- AlterTable: Enhance reviews table for Verified Buyer, Moderation, Admin Reply, and Soft Delete
ALTER TABLE "reviews" ADD COLUMN "order_id" UUID;
ALTER TABLE "reviews" ADD COLUMN "title" VARCHAR(150);
ALTER TABLE "reviews" ADD COLUMN "is_verified_purchase" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reviews" ALTER COLUMN "is_approved" SET DEFAULT true;
ALTER TABLE "reviews" ADD COLUMN "admin_reply" TEXT;
ALTER TABLE "reviews" ADD COLUMN "replied_at" TIMESTAMP(3);
ALTER TABLE "reviews" ADD COLUMN "replied_by" UUID;
ALTER TABLE "reviews" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "reviews" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- AddForeignKey: Link reviews to orders
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Link reviews to admin_users (for admin replies)
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_replied_by_fkey" FOREIGN KEY ("replied_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old index
DROP INDEX IF EXISTS "reviews_product_id_is_approved_idx";

-- Create new optimized performance indexes
CREATE INDEX "reviews_product_id_is_approved_deleted_at_created_at_idx" ON "reviews"("product_id", "is_approved", "deleted_at", "created_at" DESC);
CREATE INDEX "reviews_user_id_deleted_at_idx" ON "reviews"("user_id", "deleted_at");
CREATE INDEX "reviews_order_id_idx" ON "reviews"("order_id");

-- CreateUniqueIndex: Enforce 1 review per product per order per customer
CREATE UNIQUE INDEX "reviews_product_id_user_id_order_id_key" ON "reviews"("product_id", "user_id", "order_id");

