CREATE TABLE event_checkin_sessions (
  event_id uuid PRIMARY KEY REFERENCES events(id),
  token_hash text NOT NULL,
  token_cipher text NOT NULL,
  opened_by uuid NOT NULL REFERENCES profiles(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
