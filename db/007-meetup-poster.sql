ALTER TABLE events ADD COLUMN poster jsonb NOT NULL DEFAULT '{"color":"forest","pattern":"solid"}'::jsonb CHECK (jsonb_typeof(poster)='object');
