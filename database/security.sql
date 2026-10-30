-- Run with the migration/admin role, never the application's runtime role.
-- The gatree_runtime role is created separately with a generated password.
CREATE SCHEMA IF NOT EXISTS gatree_security;
REVOKE ALL ON SCHEMA gatree_security FROM PUBLIC;

CREATE TABLE IF NOT EXISTS gatree_security.rate_limits (
  bucket_key text PRIMARY KEY,
  hits bigint[] NOT NULL DEFAULT '{}',
  expires_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_expires_at_idx ON gatree_security.rate_limits(expires_at);
REVOKE ALL ON gatree_security.rate_limits FROM PUBLIC;

CREATE OR REPLACE FUNCTION gatree_security.check_rate_limit(p_key text, p_limit integer, p_window_ms integer)
RETURNS TABLE(success boolean, remaining integer, reset_at bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $function$
DECLARE
  timestamp_ms bigint := floor(extract(epoch FROM clock_timestamp()) * 1000);
  current_hits bigint[];
  hit_count integer;
BEGIN
  IF p_key IS NULL OR p_limit IS NULL OR p_window_ms IS NULL OR p_key !~ '^[a-f0-9]{64}$' OR p_limit < 1 OR p_limit > 10000 OR p_window_ms < 1 OR p_window_ms > 86400000 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters';
  END IF;

  -- Cleanup is bounded and skips rows another request currently holds.
  IF random() < 0.01 THEN
    DELETE FROM gatree_security.rate_limits WHERE bucket_key IN (
      SELECT bucket_key FROM gatree_security.rate_limits
      WHERE expires_at <= timestamp_ms ORDER BY expires_at LIMIT 500 FOR UPDATE SKIP LOCKED
    );
  END IF;

  INSERT INTO gatree_security.rate_limits(bucket_key, hits, expires_at)
  VALUES (p_key, '{}', timestamp_ms + p_window_ms) ON CONFLICT DO NOTHING;

  SELECT hits INTO current_hits FROM gatree_security.rate_limits WHERE bucket_key = p_key FOR UPDATE;
  current_hits := ARRAY(SELECT hit FROM unnest(current_hits) AS hit WHERE hit > timestamp_ms - p_window_ms);
  hit_count := cardinality(current_hits);
  success := hit_count < p_limit;
  IF success THEN current_hits := array_append(current_hits, timestamp_ms); hit_count := hit_count + 1; END IF;

  UPDATE gatree_security.rate_limits SET hits = current_hits, expires_at = timestamp_ms + p_window_ms WHERE bucket_key = p_key;
  remaining := greatest(0, p_limit - hit_count);
  SELECT coalesce(min(hit), timestamp_ms) + p_window_ms INTO reset_at FROM unnest(current_hits) AS hit;
  RETURN NEXT;
END;
$function$;

REVOKE ALL ON FUNCTION gatree_security.check_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT USAGE ON SCHEMA gatree_security TO gatree_runtime;
GRANT EXECUTE ON FUNCTION gatree_security.check_rate_limit(text, integer, integer) TO gatree_runtime;
