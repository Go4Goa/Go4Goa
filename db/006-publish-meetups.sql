-- New meetups are public immediately. Legacy pending meetups stay private
-- until their creator publishes them, preserving their earlier visibility.
ALTER TABLE events ALTER COLUMN status SET DEFAULT 'published';
