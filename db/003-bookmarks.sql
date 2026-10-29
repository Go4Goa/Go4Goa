CREATE TABLE bookmarks(event_id uuid NOT NULL REFERENCES events(id),user_id uuid NOT NULL REFERENCES profiles(id),created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(event_id,user_id));
