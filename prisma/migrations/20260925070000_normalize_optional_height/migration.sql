BEGIN;

-- Optional height rules define only a width. Historical sentinel/max-height
-- values such as 1000 or 10000 are not business data and must not be exposed
-- as a limit or an order height.
UPDATE productsizeoptions
SET height = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE is_optional_height = TRUE
  AND height <> 0;

COMMIT;
