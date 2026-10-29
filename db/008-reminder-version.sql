-- Graphic edits change the optimistic lock without re-queuing reminders.
ALTER TABLE events ADD COLUMN reminder_version integer NOT NULL DEFAULT 1;
UPDATE events SET reminder_version=version;
