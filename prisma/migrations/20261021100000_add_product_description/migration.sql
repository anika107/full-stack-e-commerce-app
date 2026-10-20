-- Add the required description column: fill existing rows with a temporary
-- default, then drop the default so new rows must supply a value.
ALTER TABLE "products" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';

ALTER TABLE "products" ALTER COLUMN "description" DROP DEFAULT;
