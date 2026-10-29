CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS public_geo geography(Point,4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(public_lng,public_lat),4326)::geography) STORED;
ALTER TABLE events ADD COLUMN IF NOT EXISTS public_geo geography(Point,4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(public_lng,public_lat),4326)::geography) STORED;
CREATE INDEX IF NOT EXISTS incidents_geography ON incidents USING gist(public_geo) WHERE status IN ('verified','in_progress','resolved');
CREATE INDEX IF NOT EXISTS events_geography ON events USING gist(public_geo) WHERE status='published';
