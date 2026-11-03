-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'BANNED', 'INACTIVE');

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
ADD COLUMN "status_reason" VARCHAR(255),
ADD COLUMN "suspended_at" TIMESTAMP(3),
ADD COLUMN "suspended_until" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- AlterTable
ALTER TABLE "admin_users"
ADD COLUMN "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
ADD COLUMN "status_reason" VARCHAR(255),
ADD COLUMN "suspended_at" TIMESTAMP(3),
ADD COLUMN "suspended_until" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "admin_users_status_idx" ON "admin_users"("status");

-- Data Backfill:
-- 1) Synchronize admin_users status based on existing is_active flag
UPDATE "admin_users"
SET "status" = CASE
  WHEN "is_active" = true THEN 'ACTIVE'::"AccountStatus"
  ELSE 'INACTIVE'::"AccountStatus"
END;

-- 2) Synchronize users status based on existing is_verified flag
UPDATE "users"
SET "status" = CASE
  WHEN "is_verified" = true THEN 'ACTIVE'::"AccountStatus"
  ELSE 'PENDING_VERIFICATION'::"AccountStatus"
END;

