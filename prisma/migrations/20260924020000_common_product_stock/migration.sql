-- Additive common product stock model.
-- This migration does not drop, truncate, or reset existing business data.

CREATE TABLE "product_stocks" (
    "id" TEXT NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "available_area_m2" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "reserved_area_m2" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_stocks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_stocks_product_id_key" UNIQUE ("product_id"),
    CONSTRAINT "product_stocks_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "product_stock_lots" (
    "id" TEXT NOT NULL,
    "product_stock_id" TEXT NOT NULL,
    "source_type" VARCHAR(40) NOT NULL,
    "source_reference" VARCHAR(255),
    "original_area_m2" DECIMAL(14,4) NOT NULL,
    "remaining_area_m2" DECIMAL(14,4) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_stock_lots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_stock_lots_product_stock_id_fkey" FOREIGN KEY ("product_stock_id") REFERENCES "product_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "product_stock_movements" (
    "id" TEXT NOT NULL,
    "product_stock_id" TEXT NOT NULL,
    "lot_id" TEXT,
    "product_id" VARCHAR(36) NOT NULL,
    "order_id" VARCHAR(36),
    "order_item_id" VARCHAR(36),
    "movement_type" VARCHAR(40) NOT NULL,
    "area_m2" DECIMAL(14,4) NOT NULL,
    "quantity" INTEGER,
    "width" DECIMAL(8,2),
    "height" DECIMAL(8,2),
    "reference_key" VARCHAR(255),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_stock_movements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_stock_movements_reference_key_key" UNIQUE ("reference_key"),
    CONSTRAINT "product_stock_movements_product_stock_id_fkey" FOREIGN KEY ("product_stock_id") REFERENCES "product_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_stock_movements_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "product_stock_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "product_stock_reservations" (
    "id" TEXT NOT NULL,
    "product_stock_id" TEXT NOT NULL,
    "cart_id" INTEGER,
    "order_id" VARCHAR(36),
    "area_m2" DECIMAL(14,4) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3),
    "reference_key" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_stock_reservations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_stock_reservations_reference_key_key" UNIQUE ("reference_key"),
    CONSTRAINT "product_stock_reservations_product_stock_id_fkey" FOREIGN KEY ("product_stock_id") REFERENCES "product_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_product_stock_lot_fifo" ON "product_stock_lots"("product_stock_id", "received_at");
CREATE INDEX "idx_product_stock_movement_product_created" ON "product_stock_movements"("product_id", "created_at");
CREATE INDEX "idx_product_stock_movement_order" ON "product_stock_movements"("order_id");
CREATE INDEX "idx_product_stock_movement_order_item" ON "product_stock_movements"("order_item_id");
CREATE INDEX "idx_product_stock_reservation_status" ON "product_stock_reservations"("product_stock_id", "status");
CREATE INDEX "idx_product_stock_reservation_cart" ON "product_stock_reservations"("cart_id");
CREATE INDEX "idx_product_stock_reservation_order" ON "product_stock_reservations"("order_id");

-- Existing products are intentionally not backfilled in this rollout. New
-- products opt into the common model when ProductService creates their stock
-- row. A later, audited migration can opt existing products in after validation.
