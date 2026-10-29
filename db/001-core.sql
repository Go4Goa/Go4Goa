CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE users_private (
 id uuid PRIMARY KEY, phone_hash text UNIQUE, phone_cipher text, phone_verified boolean NOT NULL DEFAULT false,
 email_hash text UNIQUE, email_cipher text, email_verified boolean NOT NULL DEFAULT false,
 sms_opt_in boolean NOT NULL DEFAULT false, email_opt_in boolean NOT NULL DEFAULT false,
 role text NOT NULL DEFAULT 'resident' CHECK(role IN ('resident','organizer','moderator','admin')),
 demo boolean NOT NULL DEFAULT false, deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE profiles (id uuid PRIMARY KEY REFERENCES users_private(id), username text UNIQUE NOT NULL CHECK(username ~ '^[a-z][a-z0-9_]{2,23}$'));
CREATE TABLE sessions (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users_private(id), csrf text NOT NULL, expires_at timestamptz NOT NULL DEFAULT now()+interval '14 days');
CREATE TABLE verification_challenges (id uuid PRIMARY KEY, kind text NOT NULL, destination_hash text NOT NULL, destination_cipher text NOT NULL, code_hash text, user_id uuid REFERENCES users_private(id), expires_at timestamptz NOT NULL DEFAULT now()+interval '10 minutes', consumed_at timestamptz);
CREATE INDEX challenge_destination ON verification_challenges(destination_hash);
CREATE TABLE rate_limits(key text PRIMARY KEY,hits int NOT NULL,expires_at timestamptz NOT NULL);
CREATE TABLE taxonomy (id text PRIMARY KEY, label text NOT NULL, group_name text NOT NULL, enabled boolean NOT NULL DEFAULT true);
INSERT INTO taxonomy VALUES ('trash','Trash','trash'),('pothole','Pothole','infrastructure'),('streetlight','Streetlight','infrastructure'),('water','Water issue','infrastructure'),('electrical','Electrical danger','infrastructure'),('other','Other infrastructure','infrastructure');
CREATE TABLE incidents (
 id uuid PRIMARY KEY, reporter_id uuid NOT NULL REFERENCES profiles(id), category text NOT NULL REFERENCES taxonomy(id),
 description text NOT NULL DEFAULT '', location_label text NOT NULL, public_lat double precision NOT NULL, public_lng double precision NOT NULL,
 privacy text NOT NULL CHECK(privacy IN ('exact','blurred')), status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','verified','in_progress','resolved','rejected','duplicate','closed')),
 responsible_body text, duplicate_of uuid REFERENCES incidents(id), example boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), version int NOT NULL DEFAULT 1
);
CREATE INDEX incident_public_bounds ON incidents(public_lat,public_lng) WHERE status IN ('verified','in_progress','resolved');
CREATE TABLE incident_private (incident_id uuid PRIMARY KEY REFERENCES incidents(id), location_cipher text NOT NULL, private_description text NOT NULL, private_location_label text NOT NULL);
CREATE TABLE media (id uuid PRIMARY KEY, incident_id uuid NOT NULL REFERENCES incidents(id), asset_key text NOT NULL, thumb_key text NOT NULL, sha256 text NOT NULL, dhash text NOT NULL, alt text NOT NULL, width int NOT NULL, height int NOT NULL, state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','approved','redacted','withheld')), retention text NOT NULL DEFAULT 'derivatives_only', created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX media_incident ON media(incident_id);
CREATE TABLE idempotency_keys(user_id uuid NOT NULL REFERENCES users_private(id), key text NOT NULL, fingerprint text NOT NULL, incident_id uuid NOT NULL REFERENCES incidents(id), PRIMARY KEY(user_id,key));
CREATE TABLE events (
 id uuid PRIMARY KEY, organizer_id uuid NOT NULL REFERENCES profiles(id), title text NOT NULL, description text NOT NULL, activity text NOT NULL,
 public_lat double precision NOT NULL, public_lng double precision NOT NULL, location_label text NOT NULL, meetup text NOT NULL,
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, capacity int NOT NULL CHECK(capacity BETWEEN 1 AND 500),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','cancelled','completed')), linked_incident uuid REFERENCES incidents(id), materials text NOT NULL DEFAULT '',
 version int NOT NULL DEFAULT 1, example boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK(ends_at>starts_at)
);
CREATE INDEX event_public_bounds ON events(public_lat,public_lng,starts_at) WHERE status='published';
CREATE TABLE rsvps(event_id uuid NOT NULL REFERENCES events(id),user_id uuid NOT NULL REFERENCES profiles(id),status text NOT NULL CHECK(status IN ('confirmed','cancelled')),checked_in_at timestamptz, checked_in_by uuid REFERENCES profiles(id), email_consent boolean NOT NULL DEFAULT false,sms_consent boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(event_id,user_id));
CREATE TABLE points_ledger(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,user_id uuid NOT NULL REFERENCES users_private(id),reason text NOT NULL,source_id uuid NOT NULL,points int NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,reason,source_id));
CREATE TABLE audit_log(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,actor_id uuid REFERENCES users_private(id),action text NOT NULL,target_id text NOT NULL,before_state jsonb,after_state jsonb,reason text NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT now());
CREATE FUNCTION immutable_row() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Append-only record'; END $$;
CREATE TRIGGER points_immutable BEFORE UPDATE OR DELETE ON points_ledger FOR EACH ROW EXECUTE FUNCTION immutable_row();
CREATE TRIGGER audit_immutable BEFORE UPDATE OR DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION immutable_row();
CREATE TABLE resources(id text PRIMARY KEY,source_id text NOT NULL,kind text NOT NULL,title text NOT NULL,summary text NOT NULL,topics text[] NOT NULL,location text NOT NULL,source_url text NOT NULL,listing_url text NOT NULL,source_label text NOT NULL,verified_at text,verification text NOT NULL,revision text NOT NULL,synced_at timestamptz NOT NULL DEFAULT now(),active boolean NOT NULL DEFAULT true);
CREATE TABLE sync_state(source text PRIMARY KEY,etag text,revision text,last_success timestamptz,last_attempt timestamptz,last_error text,record_count int NOT NULL DEFAULT 0);
CREATE TABLE sync_runs(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,source text NOT NULL,status text NOT NULL,revision text,records int,error text,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE resource_matches(incident_id uuid NOT NULL REFERENCES incidents(id),resource_id text NOT NULL REFERENCES resources(id),rationale text NOT NULL,source_url text NOT NULL,source_label text NOT NULL,verified_at text,manual boolean NOT NULL DEFAULT false,PRIMARY KEY(incident_id,resource_id));
CREATE TABLE notifications(id uuid PRIMARY KEY,event_id uuid NOT NULL REFERENCES events(id),user_id uuid NOT NULL REFERENCES users_private(id),channel text NOT NULL CHECK(channel IN ('email','sms')),subject text NOT NULL,body text NOT NULL,status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','accepted','delivered','failed','suppressed','unknown')),provider_id text,attempts int NOT NULL DEFAULT 0,error text,dedupe_key text UNIQUE NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE FUNCTION goa_distance_m(a double precision,b double precision,c double precision,d double precision) RETURNS double precision IMMUTABLE STRICT LANGUAGE sql AS $$ SELECT 12742000*asin(sqrt(least(1.0,power(sin(radians(c-a)/2),2)+cos(radians(a))*cos(radians(c))*power(sin(radians(d-b)/2),2)))) $$;
