-- AlterTable
CREATE SEQUENCE component_position_seq;
ALTER TABLE "Component" ALTER COLUMN "position" SET DEFAULT nextval('component_position_seq');
ALTER SEQUENCE component_position_seq OWNED BY "Component"."position";
