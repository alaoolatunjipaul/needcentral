-- AlterTable
ALTER TABLE "products" ADD COLUMN     "listingStatus" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "sellers" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "products_sellerId_listingStatus_idx" ON "products"("sellerId", "listingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_userId_key" ON "sellers"("userId");

-- AddForeignKey
ALTER TABLE "sellers" ADD CONSTRAINT "sellers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;