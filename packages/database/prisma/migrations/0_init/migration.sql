-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MembershipTier" AS ENUM ('REGULAR', 'SILVER', 'VIP_GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('WOMEN', 'MEN', 'KIDS', 'BAGS', 'SHOES', 'HOME');

-- CreateEnum
CREATE TYPE "MarketingTag" AS ENUM ('NEW_ARRIVAL', 'BESTSELLER', 'TRENDING', 'SALE', 'EXCLUSIVE', 'LIMITED_EDITION', 'PRE_ORDER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PREORDER_AWAITING_STOCK', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'PROMPTPAY', 'BANK_TRANSFER', 'COD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'SHIPPED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CancellationRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('LABEL_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "CarrierCode" AS ENUM ('KERRY_EXPRESS', 'FLASH_EXPRESS', 'THAILAND_POST_EMS', 'DHL_EXPRESS');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "StockChangeType" AS ENUM ('RESTOCK', 'MANUAL_ADJUSTMENT', 'ORDER_DEDUCT', 'PREORDER_RECEIVE', 'DAMAGE', 'RETURNED');

-- CreateEnum
CREATE TYPE "PointChangeType" AS ENUM ('EARNED_ORDER', 'REDEEMED_CHECKOUT', 'REFUND_CANCEL', 'MANUAL_ADJUSTMENT', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'REFUND');

-- CreateEnum
CREATE TYPE "BannerPlacement" AS ENUM ('HERO_HOME', 'SEASONAL_SPOTLIGHT', 'PROMO_RIBBON', 'TOP_ANNOUNCEMENT', 'COLLECTION_TOP', 'PROMO_BAR');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "tier" "MembershipTier" NOT NULL DEFAULT 'REGULAR',
    "points" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "otp_code" VARCHAR(10) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "attempts_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recipient_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "address_line1" VARCHAR(255) NOT NULL,
    "address_line2" VARCHAR(255),
    "subdistrict" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "change_type" "PointChangeType" NOT NULL,
    "points_change" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "name_th" VARCHAR(100),
    "slug" VARCHAR(120) NOT NULL,
    "department" "Department" NOT NULL,
    "description" TEXT,
    "description_th" TEXT,
    "banner_tag" VARCHAR(100),
    "banner_tag_th" VARCHAR(100),
    "banner_image" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "name_th" VARCHAR(200),
    "slug" VARCHAR(220) NOT NULL,
    "description" TEXT,
    "description_th" TEXT,
    "materials_care" TEXT,
    "materials_care_th" TEXT,
    "base_price" DECIMAL(10,2) NOT NULL,
    "original_price" DECIMAL(10,2),
    "tag" "MarketingTag",
    "tag_th" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_preorder" BOOLEAN NOT NULL DEFAULT false,
    "preorder_release_date" TIMESTAMP(3),
    "preorder_limit" INTEGER,
    "preorder_deposit_amount" DECIMAL(10,2),
    "created_by_admin_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sku_code" VARCHAR(100) NOT NULL,
    "size" VARCHAR(50) NOT NULL,
    "color_name" VARCHAR(50) NOT NULL,
    "color_name_th" VARCHAR(50),
    "color_hex" VARCHAR(20) NOT NULL,
    "price_adjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "barcode" VARCHAR(100),
    "weight_grams" INTEGER NOT NULL DEFAULT 300,
    "length_cm" DECIMAL(6,2),
    "width_cm" DECIMAL(6,2),
    "height_cm" DECIMAL(6,2),
    "is_preorder" BOOLEAN,
    "preorder_limit" INTEGER,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "quantity_available" INTEGER NOT NULL DEFAULT 0,
    "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
    "preorder_booked" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "last_counted_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" VARCHAR(255),
    "alt_text_th" VARCHAR(255),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" VARCHAR(50) NOT NULL,
    "user_id" UUID,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "has_preorder_items" BOOLEAN NOT NULL DEFAULT false,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shipping_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'THB',
    "shipping_address_snapshot" JSONB NOT NULL,
    "coupon_id" UUID,
    "promo_code_used" VARCHAR(50),
    "placed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "product_name_snapshot" VARCHAR(200) NOT NULL,
    "variant_info_snapshot" VARCHAR(100) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount_share" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "net_price" DECIMAL(10,2) NOT NULL,
    "is_preorder" BOOLEAN NOT NULL DEFAULT false,
    "expected_ship_date" TIMESTAMP(3),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "transaction_reference" VARCHAR(150),
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'THB',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "card_last4" VARCHAR(4),
    "card_brand" VARCHAR(30),
    "idempotency_key" VARCHAR(100),
    "gateway_event_id" VARCHAR(150),
    "raw_webhook_payload" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "refund_number" VARCHAR(50) NOT NULL,
    "payment_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" VARCHAR(255),
    "gateway_refund_id" VARCHAR(150),
    "status" "RefundStatus" NOT NULL DEFAULT 'SUCCEEDED',
    "created_admin_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "carrier_code" "CarrierCode",
    "courier_name" VARCHAR(100) NOT NULL,
    "tracking_number" VARCHAR(100) NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'LABEL_CREATED',
    "shipped_at" TIMESTAMP(3),
    "estimated_delivery" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_logs" (
    "id" UUID NOT NULL,
    "shipment_id" UUID NOT NULL,
    "status_title" VARCHAR(150) NOT NULL,
    "status_description" TEXT,
    "location" VARCHAR(150),
    "log_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_requests" (
    "id" UUID NOT NULL,
    "request_number" VARCHAR(50) NOT NULL,
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "customer_note" TEXT,
    "admin_note" TEXT,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "return_carrier" VARCHAR(100),
    "return_tracking_number" VARCHAR(100),
    "return_shipping_fee" DECIMAL(10,2),
    "return_shipping_receipt_url" TEXT,
    "shipped_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_cancellation_requests" (
    "id" UUID NOT NULL,
    "request_number" VARCHAR(50) NOT NULL,
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "customer_note" TEXT,
    "admin_note" TEXT,
    "status" "CancellationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_cancellation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_items" (
    "id" UUID NOT NULL,
    "return_request_id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions_coupons" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "min_order_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "max_discount_amount" DECIMAL(10,2),
    "total_usage_limit" INTEGER NOT NULL DEFAULT 100,
    "user_usage_limit" INTEGER NOT NULL DEFAULT 1,
    "current_usage_count" INTEGER NOT NULL DEFAULT 0,
    "applicable_tier" "MembershipTier",
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_redemptions" (
    "id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,
    "user_id" UUID,
    "order_id" UUID NOT NULL,
    "discount_granted" DECIMAL(10,2) NOT NULL,
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "review_text" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "department" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "role_code" VARCHAR(50) NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "permission_code" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "admin_id" UUID,
    "change_type" "StockChangeType" NOT NULL,
    "quantity_change" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reason_note" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" UUID NOT NULL,
    "admin_id" UUID,
    "action_type" "AuditActionType" NOT NULL,
    "target_table" VARCHAR(50) NOT NULL,
    "target_id" VARCHAR(100) NOT NULL,
    "permission" VARCHAR(50),
    "performed_role" VARCHAR(50),
    "old_values_json" JSONB,
    "new_values_json" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_banners" (
    "id" UUID NOT NULL,
    "placement" "BannerPlacement" NOT NULL DEFAULT 'HERO_HOME',
    "title" VARCHAR(150) NOT NULL DEFAULT '',
    "title_th" VARCHAR(150),
    "title_en" VARCHAR(150),
    "subtitle" VARCHAR(255),
    "subtitle_th" VARCHAR(255),
    "subtitle_en" VARCHAR(255),
    "tag_th" VARCHAR(50),
    "tag_en" VARCHAR(50),
    "target_url" VARCHAR(255),
    "image_desktop_url" VARCHAR(500) NOT NULL,
    "image_mobile_url" VARCHAR(500),
    "cta_primary_text_th" VARCHAR(50),
    "cta_primary_text_en" VARCHAR(50),
    "cta_primary_link" VARCHAR(255),
    "cta_secondary_text_th" VARCHAR(50),
    "cta_secondary_text_en" VARCHAR(50),
    "cta_secondary_link" VARCHAR(255),
    "coupon_code" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_by_admin_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_settings" (
    "id" VARCHAR(50) NOT NULL DEFAULT 'default-store-settings',
    "announcement_active" BOOLEAN NOT NULL DEFAULT true,
    "announcement_text_th" VARCHAR(255),
    "announcement_text_en" VARCHAR(255),
    "announcement_badge_th" VARCHAR(50),
    "announcement_badge_en" VARCHAR(50),
    "announcement_link" VARCHAR(255),
    "free_shipping_threshold" DECIMAL(10,2) NOT NULL DEFAULT 1000,
    "return_window_days" INTEGER NOT NULL DEFAULT 7,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "otp_verifications_email_is_used_expires_at_idx" ON "otp_verifications"("email", "is_used", "expires_at");

-- CreateIndex
CREATE INDEX "user_addresses_user_id_idx" ON "user_addresses"("user_id");

-- CreateIndex
CREATE INDEX "point_transactions_user_id_created_at_idx" ON "point_transactions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_variant_id_key" ON "cart_items"("cart_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_department_is_active_idx" ON "categories"("department", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_is_active_idx" ON "products"("category_id", "is_active");

-- CreateIndex
CREATE INDEX "products_is_preorder_is_active_idx" ON "products"("is_preorder", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_code_key" ON "product_variants"("sku_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_barcode_key" ON "product_variants"("barcode");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_variant_id_key" ON "inventory_items"("variant_id");

-- CreateIndex
CREATE INDEX "product_images_product_id_is_primary_idx" ON "product_images"("product_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_user_id_status_idx" ON "orders"("user_id", "status");

-- CreateIndex
CREATE INDEX "orders_has_preorder_items_status_idx" ON "orders"("has_preorder_items", "status");

-- CreateIndex
CREATE INDEX "orders_placed_at_idx" ON "orders"("placed_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_refund_number_key" ON "refunds"("refund_number");

-- CreateIndex
CREATE INDEX "refunds_order_id_idx" ON "refunds"("order_id");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- CreateIndex
CREATE INDEX "shipments_order_id_idx" ON "shipments"("order_id");

-- CreateIndex
CREATE INDEX "shipments_tracking_number_idx" ON "shipments"("tracking_number");

-- CreateIndex
CREATE INDEX "shipment_logs_shipment_id_idx" ON "shipment_logs"("shipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "return_requests_request_number_key" ON "return_requests"("request_number");

-- CreateIndex
CREATE INDEX "return_requests_user_id_status_idx" ON "return_requests"("user_id", "status");

-- CreateIndex
CREATE INDEX "return_requests_order_id_idx" ON "return_requests"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_cancellation_requests_request_number_key" ON "order_cancellation_requests"("request_number");

-- CreateIndex
CREATE INDEX "order_cancellation_requests_user_id_status_idx" ON "order_cancellation_requests"("user_id", "status");

-- CreateIndex
CREATE INDEX "order_cancellation_requests_order_id_idx" ON "order_cancellation_requests"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_coupons_code_key" ON "promotions_coupons"("code");

-- CreateIndex
CREATE INDEX "promotions_coupons_code_is_active_idx" ON "promotions_coupons"("code", "is_active");

-- CreateIndex
CREATE INDEX "coupon_redemptions_coupon_id_user_id_idx" ON "coupon_redemptions"("coupon_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_user_id_product_id_key" ON "wishlists"("user_id", "product_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_is_approved_idx" ON "reviews"("product_id", "is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_code_key" ON "roles"("role_code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_code_key" ON "permissions"("permission_code");

-- CreateIndex
CREATE INDEX "stock_movements_variant_id_idx" ON "stock_movements"("variant_id");

-- CreateIndex
CREATE INDEX "stock_movements_created_at_idx" ON "stock_movements"("created_at");

-- CreateIndex
CREATE INDEX "admin_audit_logs_target_table_target_id_idx" ON "admin_audit_logs"("target_table", "target_id");

-- CreateIndex
CREATE INDEX "admin_audit_logs_permission_idx" ON "admin_audit_logs"("permission");

-- CreateIndex
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "cms_banners_placement_is_active_idx" ON "cms_banners"("placement", "is_active");

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "promotions_coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_created_admin_id_fkey" FOREIGN KEY ("created_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_logs" ADD CONSTRAINT "shipment_logs_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_cancellation_requests" ADD CONSTRAINT "order_cancellation_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_cancellation_requests" ADD CONSTRAINT "order_cancellation_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_cancellation_requests" ADD CONSTRAINT "order_cancellation_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_return_request_id_fkey" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "promotions_coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_banners" ADD CONSTRAINT "cms_banners_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

