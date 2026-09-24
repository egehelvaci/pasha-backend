BEGIN;
ALTER TABLE "Product" ADD COLUMN "canonical_product_id" TEXT;
ALTER TABLE "Product" ADD CONSTRAINT "Product_canonical_product_id_fkey"
  FOREIGN KEY ("canonical_product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_no_self_alias" CHECK ("canonical_product_id" IS DISTINCT FROM "product_id");
COMMIT;
