-- Additive only: existing business tables and data are not changed.
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "hide_balance" BOOLEAN NOT NULL DEFAULT false,
    "hide_stock" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "site_settings_singleton" CHECK ("id" = 1)
);

CREATE TABLE "site_banners" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "image_url" TEXT NOT NULL,
    "mobile_image_url" TEXT,
    "link_url" TEXT,
    "alt_text" VARCHAR(300) NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_banners_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_site_banner_active_sort" ON "site_banners"("is_active", "sort_order");
