BEGIN;

CREATE TABLE product_stock_widths (
  id text PRIMARY KEY,
  product_stock_id text NOT NULL REFERENCES product_stocks(id) ON DELETE CASCADE,
  width numeric(8,2) NOT NULL CHECK (width > 0),
  available_area_m2 numeric(14,4) NOT NULL DEFAULT 0,
  reserved_area_m2 numeric(14,4) NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_stock_widths_product_stock_id_width_key UNIQUE(product_stock_id, width)
);
CREATE INDEX idx_product_stock_width_product ON product_stock_widths(product_stock_id);
ALTER TABLE product_stock_lots ADD COLUMN width numeric(8,2);
ALTER TABLE product_stock_reservations ADD COLUMN width numeric(8,2);

-- Every non-zero post-import movement must have a known width. The only
-- historical exception is an admin adjustment on a single-width test product.
UPDATE product_stock_movements m SET width = only_width.width
FROM (
  SELECT ps.id stock_id, MIN(so.width)::numeric width
  FROM product_stocks ps JOIN "Product" p ON p.product_id=ps.product_id
  JOIN productsizeoptions so ON so.rule_id=p.rule_id
  GROUP BY ps.id HAVING COUNT(DISTINCT so.width)=1
) only_width
WHERE m.product_stock_id=only_width.stock_id AND m.width IS NULL
  AND m.area_m2<>0 AND m.movement_type NOT IN ('LEGACY_MIGRATION');

-- One test product received an adjustment while its rule was being edited.
-- The old API omitted width from the movement, so use the most recently added
-- rule width that existed when that adjustment was written.
WITH inferred AS (
  SELECT m.id,(SELECT so.width FROM product_stocks ps JOIN "Product" p ON p.product_id=ps.product_id
    JOIN productsizeoptions so ON so.rule_id=p.rule_id
    WHERE ps.id=m.product_stock_id AND so.created_at<=m.created_at
    ORDER BY so.created_at DESC,so.id DESC LIMIT 1) width
  FROM product_stock_movements m
  WHERE m.width IS NULL AND m.area_m2<>0 AND m.movement_type='ADMIN_ADJUSTMENT'
)
UPDATE product_stock_movements m SET width=inferred.width FROM inferred
WHERE m.id=inferred.id AND inferred.width IS NOT NULL;

DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM product_stock_movements WHERE width IS NULL AND area_m2<>0 AND movement_type NOT IN ('LEGACY_MIGRATION')) THEN
    RAISE EXCEPTION 'Width migration blocked: non-zero movement without an inferable width';
  END IF;
END $$;

CREATE TEMP TABLE width_stock_seed ON COMMIT DROP AS
WITH variation_area AS (
  SELECT COALESCE(p.canonical_product_id,p.product_id) canonical_id, p.product_id source_id,
    pv.width, pv.height,
    CASE WHEN EXISTS(SELECT 1 FROM productsizeoptions so WHERE so.rule_id=p.rule_id AND so.width=pv.width AND so.is_optional_height=TRUE)
      THEN GREATEST(COALESCE(pv.stock_area_m2,0),0)
      ELSE GREATEST(COALESCE(pv.stock_area_m2,0),(COALESCE(pv.stock_quantity,0)::numeric*pv.width*pv.height)/10000,0)
    END area_m2
  FROM "Product" p JOIN productvariations pv ON pv.product_id=p.product_id
), size_area AS (
  SELECT canonical_id,source_id,width,height,MAX(area_m2) area_m2 FROM variation_area GROUP BY canonical_id,source_id,width,height
), opening AS (
  SELECT canonical_id,width,ROUND(SUM(area_m2),4) area_m2 FROM size_area GROUP BY canonical_id,width
), configured_widths AS (
  SELECT DISTINCT p.product_id canonical_id,so.width
  FROM "Product" p JOIN productsizeoptions so ON so.rule_id=p.rule_id
  WHERE p.canonical_product_id IS NULL
), deltas AS (
  SELECT ps.product_id canonical_id,m.width::integer width,ROUND(SUM(m.area_m2),4) area_m2
  FROM product_stock_movements m JOIN product_stocks ps ON ps.id=m.product_stock_id
  WHERE m.width IS NOT NULL AND m.movement_type NOT IN ('LEGACY_MIGRATION','PRODUCT_MERGE')
  GROUP BY ps.product_id,m.width
), widths AS (
  SELECT canonical_id,width FROM configured_widths UNION SELECT canonical_id,width FROM deltas
)
SELECT ps.id product_stock_id,w.width::numeric(8,2) width,
  ROUND(COALESCE(o.area_m2,0)+COALESCE(d.area_m2,0),4)::numeric(14,4) available_area_m2
FROM widths w JOIN product_stocks ps ON ps.product_id=w.canonical_id
LEFT JOIN opening o ON o.canonical_id=w.canonical_id AND o.width=w.width
LEFT JOIN deltas d ON d.canonical_id=w.canonical_id AND d.width=w.width;

INSERT INTO product_stock_widths(id,product_stock_id,width,available_area_m2,reserved_area_m2)
SELECT gen_random_uuid()::text,product_stock_id,width,available_area_m2,0 FROM width_stock_seed;

-- Recover the width of active cart reservations from their owning cart item.
UPDATE product_stock_reservations r SET width=i.width
FROM cart_items i WHERE r.reference_key='cart-item:'||i.id;
UPDATE product_stock_reservations r SET width=i.width
FROM admin_cart_items i WHERE r.reference_key='admin-cart-item:'||i.id;

UPDATE product_stock_widths w SET reserved_area_m2=x.area,updated_at=CURRENT_TIMESTAMP
FROM (SELECT product_stock_id,width,ROUND(SUM(area_m2),4) area FROM product_stock_reservations
      WHERE status='ACTIVE' GROUP BY product_stock_id,width) x
WHERE w.product_stock_id=x.product_stock_id AND w.width=x.width;

DO $$ BEGIN
  IF EXISTS(
    SELECT 1 FROM product_stocks ps LEFT JOIN (
      SELECT product_stock_id,ROUND(SUM(available_area_m2),4) available,ROUND(SUM(reserved_area_m2),4) reserved
      FROM product_stock_widths GROUP BY product_stock_id
    ) w ON w.product_stock_id=ps.id
    WHERE ABS(ps.available_area_m2-COALESCE(w.available,0))>0.0001 OR ABS(ps.reserved_area_m2-COALESCE(w.reserved,0))>0.0001
  ) THEN RAISE EXCEPTION 'Width migration totals do not match product stock totals'; END IF;
  IF EXISTS(SELECT 1 FROM product_stock_reservations WHERE status='ACTIVE' AND width IS NULL) THEN
    RAISE EXCEPTION 'Width migration blocked: active reservation without width';
  END IF;
END $$;

-- Preserve historical lots, but replace their remaining balance with FIFO lots
-- scoped to each width. Historical movement/lot links remain intact.
UPDATE product_stock_lots SET remaining_area_m2=0 WHERE remaining_area_m2<>0;
INSERT INTO product_stock_lots(id,product_stock_id,source_type,source_reference,original_area_m2,remaining_area_m2,width,received_at,created_at)
SELECT gen_random_uuid()::text,product_stock_id,'WIDTH_MIGRATION',
  'width-migration:20260924080000:'||width,available_area_m2,available_area_m2,width,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM product_stock_widths WHERE available_area_m2>0;

CREATE OR REPLACE FUNCTION sync_cart_stock_reservation(item jsonb, admin_cart boolean, removed boolean)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  product_key text := item->>'product_id'; stock_key text; previous_stock text;
  item_width numeric := (item->>'width')::numeric; previous_width numeric;
  previous_area numeric := 0; target_area numeric := 0; parent_active boolean := false;
  reservation_key text := CASE WHEN admin_cart THEN 'admin-cart-item:' ELSE 'cart-item:' END || (item->>'id');
  parent_id integer := (item->>CASE WHEN admin_cart THEN 'admin_cart_id' ELSE 'cart_id' END)::integer;
BEGIN
  IF admin_cart THEN SELECT is_active INTO parent_active FROM admin_carts WHERE id=parent_id FOR UPDATE;
  ELSE SELECT is_active INTO parent_active FROM carts WHERE id=parent_id FOR UPDATE; END IF;
  SELECT COALESCE(canonical_product_id,product_id) INTO product_key FROM "Product" WHERE product_id=product_key FOR SHARE;
  SELECT id INTO stock_key FROM product_stocks WHERE product_id=product_key FOR UPDATE;
  IF stock_key IS NULL THEN RETURN; END IF;
  IF NOT EXISTS(
    SELECT 1 FROM "Product" p JOIN productsizeoptions so ON so.rule_id=p.rule_id
    WHERE p.product_id=product_key AND so.width=item_width
  ) THEN RAISE EXCEPTION '% cm width is not configured for product %',item_width,product_key; END IF;
  INSERT INTO product_stock_widths(id,product_stock_id,width) VALUES(gen_random_uuid()::text,stock_key,item_width) ON CONFLICT DO NOTHING;
  PERFORM id FROM product_stock_widths WHERE product_stock_id=stock_key AND width=item_width FOR UPDATE;
  SELECT product_stock_id,width,CASE WHEN status='ACTIVE' THEN area_m2 ELSE 0 END
    INTO previous_stock,previous_width,previous_area FROM product_stock_reservations WHERE reference_key=reservation_key FOR UPDATE;
  previous_area:=COALESCE(previous_area,0);
  IF NOT removed AND COALESCE(parent_active,false) THEN
    target_area:=ROUND(item_width*(item->>'height')::numeric*(item->>'quantity')::numeric/10000,4);
  END IF;
  IF previous_stock IS NOT NULL AND (previous_stock<>stock_key OR previous_width IS DISTINCT FROM item_width) THEN
    UPDATE product_stock_widths SET reserved_area_m2=reserved_area_m2-previous_area,updated_at=CURRENT_TIMESTAMP
      WHERE product_stock_id=previous_stock AND width=previous_width;
  END IF;
  IF previous_stock IS NOT NULL AND previous_stock<>stock_key THEN
    UPDATE product_stocks SET reserved_area_m2=reserved_area_m2-previous_area,updated_at=CURRENT_TIMESTAMP WHERE id=previous_stock;
    previous_area:=0;
  END IF;
  INSERT INTO product_stock_reservations(id,product_stock_id,cart_id,area_m2,width,status,reference_key,created_at,updated_at)
    VALUES(gen_random_uuid()::text,stock_key,CASE WHEN admin_cart THEN NULL ELSE parent_id END,target_area,item_width,
      CASE WHEN target_area>0 THEN 'ACTIVE' ELSE 'RELEASED' END,reservation_key,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    ON CONFLICT(reference_key) DO UPDATE SET product_stock_id=EXCLUDED.product_stock_id,area_m2=EXCLUDED.area_m2,width=EXCLUDED.width,
      status=EXCLUDED.status,updated_at=CURRENT_TIMESTAMP;
  UPDATE product_stock_widths SET reserved_area_m2=reserved_area_m2+target_area-
      CASE WHEN previous_stock=stock_key AND previous_width=item_width THEN previous_area ELSE 0 END,updated_at=CURRENT_TIMESTAMP
    WHERE product_stock_id=stock_key AND width=item_width;
  UPDATE product_stocks SET reserved_area_m2=reserved_area_m2+target_area-previous_area,updated_at=CURRENT_TIMESTAMP WHERE id=stock_key;
END; $$;

COMMIT;
