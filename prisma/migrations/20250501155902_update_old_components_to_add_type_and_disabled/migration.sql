UPDATE "Component" SET "type" = 'component' WHERE "type" IS NULL;
UPDATE "Component" SET "disabled" = false WHERE "disabled" IS NULL;
