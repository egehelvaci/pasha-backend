CREATE TABLE "order_fulfillment_actions" (
  "id" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "from_status" "OrderStatus" NOT NULL,
  "target_status" "OrderStatus" NOT NULL,
  "reason" VARCHAR(500),
  "result" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_fulfillment_actions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "order_fulfillment_actions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "idx_order_fulfillment_order_created" ON "order_fulfillment_actions"("order_id", "created_at");
