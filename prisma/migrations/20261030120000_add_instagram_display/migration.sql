-- Existing Instagram links retain the simple button display (NULL).
ALTER TABLE "Link" ADD COLUMN IF NOT EXISTS "instagramConfig" JSONB;
