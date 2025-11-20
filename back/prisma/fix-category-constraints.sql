-- Fix category table constraints
-- Drop any existing single-field unique constraints if they exist
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_key";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_key";

-- Drop existing composite constraints if they exist
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_parent_id_key";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_parent_id_key";

-- Add composite unique constraints
ALTER TABLE "categories" ADD CONSTRAINT "categories_name_parent_id_key" UNIQUE ("name", "parent_id");
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_parent_id_key" UNIQUE ("slug", "parent_id");
