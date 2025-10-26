-- Fix existing data in PostgreSQL database
-- This script converts comma-separated imageCids strings to JSON arrays

-- Update posts table
UPDATE "Post" 
SET "imageCids" = CASE 
  WHEN "imageCids" IS NULL OR "imageCids" = '' THEN NULL
  WHEN "imageCids" = '[]' THEN '[]'::json
  ELSE ('["' || replace("imageCids", ',', '","') || '"]')::json
END
WHERE "imageCids" IS NOT NULL;

-- Update profiles table (if it has imageCids)
UPDATE "Profile" 
SET "imageCids" = CASE 
  WHEN "imageCids" IS NULL OR "imageCids" = '' THEN NULL
  WHEN "imageCids" = '[]' THEN '[]'::json
  ELSE ('["' || replace("imageCids", ',', '","') || '"]')::json
END
WHERE "imageCids" IS NOT NULL;
