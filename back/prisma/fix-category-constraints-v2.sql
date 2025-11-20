-- Fix category table constraints and indexes
-- Drop any existing single-field unique constraints
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_key";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_key";

-- Drop any unique indexes on name or slug alone
DROP INDEX IF EXISTS "categories_name_key";
DROP INDEX IF EXISTS "categories_slug_key";

-- Drop existing composite constraints if they exist
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_parent_id_key";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_parent_id_key";

-- Add composite unique constraints
ALTER TABLE "categories" ADD CONSTRAINT "categories_name_parent_id_key" UNIQUE ("name", "parent_id");
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_parent_id_key" UNIQUE ("slug", "parent_id");

-- Verify the constraints
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'categories'::regclass
AND contype = 'u'
ORDER BY conname;
