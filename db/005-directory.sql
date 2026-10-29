CREATE TABLE directory_snapshot (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  snapshot jsonb NOT NULL,
  etag text,
  synced_at timestamptz NOT NULL DEFAULT now(),
  last_error text
);
