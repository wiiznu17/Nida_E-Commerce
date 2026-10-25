-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "image_url_snapshot" VARCHAR(500),
ADD COLUMN     "product_snapshot" JSONB,
ADD COLUMN     "sku_code_snapshot" VARCHAR(100);

-- CreateIndex
CREATE INDEX "order_items_sku_code_snapshot_idx" ON "order_items"("sku_code_snapshot");
