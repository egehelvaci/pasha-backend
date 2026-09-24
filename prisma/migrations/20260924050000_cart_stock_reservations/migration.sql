BEGIN;

-- The reservation follows the cart row in the same transaction. This covers
-- every API, bulk deletion, cart reset and checkout without an after-write gap.
CREATE FUNCTION sync_cart_stock_reservation(item jsonb, admin_cart boolean, removed boolean)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  product_key text := item->>'product_id';
  stock_key text;
  previous_stock text;
  previous_area numeric := 0;
  target_area numeric := 0;
  parent_active boolean := false;
  reservation_key text := CASE WHEN admin_cart THEN 'admin-cart-item:' ELSE 'cart-item:' END || (item->>'id');
  parent_id integer := (item->>CASE WHEN admin_cart THEN 'admin_cart_id' ELSE 'cart_id' END)::integer;
BEGIN
  -- Alias mappings are single-level, created by the audited merge tool.
  SELECT COALESCE(canonical_product_id, product_id) INTO product_key FROM "Product" WHERE product_id = product_key;
  SELECT id INTO stock_key FROM product_stocks WHERE product_id = product_key FOR UPDATE;
  IF stock_key IS NULL THEN RETURN; END IF;
  SELECT product_stock_id, CASE WHEN status = 'ACTIVE' THEN area_m2 ELSE 0 END
    INTO previous_stock, previous_area FROM product_stock_reservations WHERE reference_key = reservation_key FOR UPDATE;
  previous_area := COALESCE(previous_area, 0);
  IF NOT removed THEN
    IF admin_cart THEN
      SELECT is_active INTO parent_active FROM admin_carts WHERE id = parent_id;
    ELSE
      SELECT is_active INTO parent_active FROM carts WHERE id = parent_id;
    END IF;
    IF COALESCE(parent_active, false) THEN
      target_area := ROUND((item->>'width')::numeric * (item->>'height')::numeric * (item->>'quantity')::numeric / 10000, 4);
    END IF;
  END IF;
  IF previous_stock IS NOT NULL AND previous_stock <> stock_key THEN
    UPDATE product_stocks SET reserved_area_m2 = reserved_area_m2 - previous_area, updated_at = CURRENT_TIMESTAMP WHERE id = previous_stock;
    previous_area := 0;
  END IF;
  INSERT INTO product_stock_reservations(id, product_stock_id, cart_id, area_m2, status, reference_key, created_at, updated_at)
    VALUES(gen_random_uuid()::text, stock_key, CASE WHEN admin_cart THEN NULL ELSE parent_id END,
      target_area, CASE WHEN target_area > 0 THEN 'ACTIVE' ELSE 'RELEASED' END, reservation_key, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(reference_key) DO UPDATE SET product_stock_id = EXCLUDED.product_stock_id, area_m2 = EXCLUDED.area_m2,
      status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP;
  UPDATE product_stocks SET reserved_area_m2 = reserved_area_m2 + target_area - previous_area, updated_at = CURRENT_TIMESTAMP WHERE id = stock_key;
END;
$$;

CREATE FUNCTION cart_item_stock_reservation_trigger() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM sync_cart_stock_reservation(to_jsonb(OLD), TG_TABLE_NAME = 'admin_cart_items', true);
    RETURN OLD;
  END IF;
  PERFORM sync_cart_stock_reservation(to_jsonb(NEW), TG_TABLE_NAME = 'admin_cart_items', false);
  RETURN NEW;
END;
$$;
CREATE TRIGGER cart_item_stock_reservation AFTER INSERT OR UPDATE OR DELETE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION cart_item_stock_reservation_trigger();
CREATE TRIGGER admin_cart_item_stock_reservation AFTER INSERT OR UPDATE OR DELETE ON admin_cart_items
  FOR EACH ROW EXECUTE FUNCTION cart_item_stock_reservation_trigger();

CREATE FUNCTION cart_status_stock_reservation_trigger() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE item record;
BEGIN
  IF NEW.is_active IS NOT DISTINCT FROM OLD.is_active THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME = 'admin_carts' THEN
    FOR item IN SELECT * FROM admin_cart_items WHERE admin_cart_id = NEW.id ORDER BY product_id, id LOOP
      PERFORM sync_cart_stock_reservation(to_jsonb(item), true, false);
    END LOOP;
  ELSE
    FOR item IN SELECT * FROM cart_items WHERE cart_id = NEW.id ORDER BY product_id, id LOOP
      PERFORM sync_cart_stock_reservation(to_jsonb(item), false, false);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER cart_status_stock_reservation AFTER UPDATE OF is_active ON carts
  FOR EACH ROW EXECUTE FUNCTION cart_status_stock_reservation_trigger();
CREATE TRIGGER admin_cart_status_stock_reservation AFTER UPDATE OF is_active ON admin_carts
  FOR EACH ROW EXECUTE FUNCTION cart_status_stock_reservation_trigger();

DO $$ DECLARE item record; BEGIN
  FOR item IN SELECT i.* FROM cart_items i JOIN carts c ON c.id=i.cart_id WHERE c.is_active ORDER BY i.product_id, i.id LOOP
    PERFORM sync_cart_stock_reservation(to_jsonb(item), false, false);
  END LOOP;
  FOR item IN SELECT i.* FROM admin_cart_items i JOIN admin_carts c ON c.id=i.admin_cart_id WHERE c.is_active ORDER BY i.product_id, i.id LOOP
    PERFORM sync_cart_stock_reservation(to_jsonb(item), true, false);
  END LOOP;
END; $$;
COMMIT;
