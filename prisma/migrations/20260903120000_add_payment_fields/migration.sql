-- Additive (non-destructive) migration for the Payment Gateway Integration
-- stage. Adds nullable payment metadata columns to the existing "orders" table
-- and an index for webhook / verification lookups by gateway reference.
-- No data is dropped, altered, or reseeded.

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "paymentProvider" TEXT,
ADD COLUMN "paymentReference" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_paymentReference_idx" ON "orders"("paymentReference");
