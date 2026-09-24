-- Convert legacy variation stock into the canonical product-level m² stock.
-- This migration is additive: legacy variation rows remain available for
-- compatibility and no product, order, collection, rule, or store is deleted.

-- Snapshot only products that have not already opted into the common model.
-- Stock is deduplicated per physical width/height because cut/fringe are
-- order attributes, not independent inventory pools.
CREATE TEMP TABLE legacy_product_stock_migration ON COMMIT DROP AS
WITH variation_area AS (
    SELECT
        p."product_id",
        pv."width",
        pv."height",
        CASE
            WHEN EXISTS (
                SELECT 1
                FROM "productsizeoptions" so
                WHERE so."rule_id" = p."rule_id"
                  AND so."width" = pv."width"
                  AND so."is_optional_height" = TRUE
            ) THEN GREATEST(COALESCE(pv."stock_area_m2", 0), 0)
            ELSE GREATEST(
                COALESCE(pv."stock_area_m2", 0),
                (COALESCE(pv."stock_quantity", 0)::numeric * pv."width" * pv."height") / 10000
            )
        END AS "area_m2"
    FROM "Product" p
    LEFT JOIN "productvariations" pv ON pv."product_id" = p."product_id"
),
size_area AS (
    SELECT
        "product_id",
        "width",
        "height",
        MAX("area_m2") AS "area_m2"
    FROM variation_area
    GROUP BY "product_id", "width", "height"
),
product_area AS (
    SELECT
        "product_id",
        ROUND(COALESCE(SUM("area_m2"), 0), 4) AS "area_m2"
    FROM size_area
    GROUP BY "product_id"
)
SELECT
    p."product_id",
    COALESCE(pa."area_m2", 0)::numeric AS "area_m2"
FROM "Product" p
LEFT JOIN product_area pa ON pa."product_id" = p."product_id"
WHERE NOT EXISTS (
    SELECT 1
    FROM "product_stocks" ps
    WHERE ps."product_id" = p."product_id"
);

INSERT INTO "product_stocks" (
    "id",
    "product_id",
    "available_area_m2",
    "reserved_area_m2",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid()::text,
    "product_id",
    "area_m2",
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM legacy_product_stock_migration
ON CONFLICT ("product_id") DO NOTHING;

-- Keep the imported balance auditable as one initial FIFO lot per product.
INSERT INTO "product_stock_lots" (
    "id",
    "product_stock_id",
    "source_type",
    "source_reference",
    "original_area_m2",
    "remaining_area_m2",
    "received_at",
    "created_at"
)
SELECT
    gen_random_uuid()::text,
    ps."id",
    'LEGACY_MIGRATION',
    'legacy-migration:20260924030000',
    l."area_m2",
    l."area_m2",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM legacy_product_stock_migration l
JOIN "product_stocks" ps ON ps."product_id" = l."product_id"
WHERE l."area_m2" > 0
  AND NOT EXISTS (
      SELECT 1
      FROM "product_stock_lots" existing_lot
      WHERE existing_lot."product_stock_id" = ps."id"
        AND existing_lot."source_type" = 'LEGACY_MIGRATION'
        AND existing_lot."source_reference" = 'legacy-migration:20260924030000'
  );

INSERT INTO "product_stock_movements" (
    "id",
    "product_stock_id",
    "lot_id",
    "product_id",
    "movement_type",
    "area_m2",
    "reference_key",
    "metadata",
    "created_at"
)
SELECT
    gen_random_uuid()::text,
    ps."id",
    lot."id",
    l."product_id",
    'LEGACY_MIGRATION',
    l."area_m2",
    'legacy-migration:20260924030000:' || l."product_id",
    jsonb_build_object(
        'source', 'productvariations',
        'deduplicatedBy', 'width-height-max',
        'importedAreaM2', l."area_m2"
    ),
    CURRENT_TIMESTAMP
FROM legacy_product_stock_migration l
JOIN "product_stocks" ps ON ps."product_id" = l."product_id"
LEFT JOIN "product_stock_lots" lot
    ON lot."product_stock_id" = ps."id"
   AND lot."source_type" = 'LEGACY_MIGRATION'
   AND lot."source_reference" = 'legacy-migration:20260924030000'
WHERE NOT EXISTS (
    SELECT 1
    FROM "product_stock_movements" existing_movement
    WHERE existing_movement."reference_key" = 'legacy-migration:20260924030000:' || l."product_id"
);
