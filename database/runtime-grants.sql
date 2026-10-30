-- Run as the owner after creating the SQL login gatree_runtime.
-- Do not use the Neon Console/API to create the role: it grants elevated membership.
DO $grant$ BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO gatree_runtime', current_database());
END $grant$;
GRANT USAGE ON SCHEMA gatree_v2 TO gatree_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gatree_v2 TO gatree_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA gatree_v2 TO gatree_runtime;
ALTER DEFAULT PRIVILEGES IN SCHEMA gatree_v2 GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gatree_runtime;
ALTER DEFAULT PRIVILEGES IN SCHEMA gatree_v2 GRANT USAGE, SELECT ON SEQUENCES TO gatree_runtime;
