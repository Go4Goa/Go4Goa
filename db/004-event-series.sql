ALTER TABLE events ADD COLUMN series_id uuid;
ALTER TABLE events ADD COLUMN series_index integer;
ALTER TABLE events ADD COLUMN recurrence jsonb;
CREATE UNIQUE INDEX event_series_occurrence ON events(series_id,series_index) WHERE series_id IS NOT NULL;
