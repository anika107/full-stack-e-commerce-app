-- Add the required image column: fill existing rows with a temporary
-- default, then drop the default so new rows must supply a value.
ALTER TABLE "products" ADD COLUMN "image_url" VARCHAR(500) NOT NULL DEFAULT '';

ALTER TABLE "products" ALTER COLUMN "image_url" DROP DEFAULT;
