# Architecture decision record

Status: accepted for local implementation, 29 October 2026. Stack delegated by user after intake.

React/Vite and a same-origin Node/Express API keep public payloads explicit. Shared TypeScript schemas validate the boundary. PostgreSQL transactions serialize capacity, moderation and points awards. Tables separate account secrets and true incident locations from public profiles and public coordinates. True locations and phone/email destinations use AES-256-GCM with a server-only key. Identity lookups use keyed HMAC. Public queries cannot select private geometry.

PostGIS is required in production; a production migration adds generated geography and GiST indexes. The existing local PostgreSQL has no PostGIS, so development uses indexed latitude/longitude bounds plus a clamped SQL Haversine function. Database creation and all application data are isolated to GO-GOA.

The browser reads photo GPS before canvas compression; the server always re-encodes with Sharp, discards originals and creates bounded derivatives. Pending photos are private. Media is served only after an authorization check, never by publicly exposing the bucket. New reports remain private until moderation. Blurred public coordinates are a stable approximately 1km grid center, not repeatable noisy samples that reveal the original by averaging. Public text/location labels for blurred reports must not disclose precise addresses; moderator review and redaction are required before approval. Electrical hazards remain blurred even when exact was requested.

Opaque, hashed sessions use HttpOnly SameSite cookies; mutations require same-origin checks and a session CSRF token. PostgreSQL rate-limit buckets cover IP and destination OTP attempts, uploads, RSVP, creation and organizer broadcasts. Local demo identity is explicitly labelled, loopback-only and forbidden in production. Roles are granted by an operator, never through public signup.

The Act For Goa adapter validates fixed upstream feeds, normalizes a local read model, retains source IDs and dates, and atomically replaces complete snapshots. An hourly idempotent worker uses ETags. On-demand refresh uses the same bounded path with cooldown; the UI always has the last good snapshot. Source availability is reported separately from content verification. Recommendation links retain rationale and can be corrected by moderators.

Notifications use a transactional outbox. An approved organizer can address only confirmed RSVPs with event-specific consent and a verified opted-in channel. The worker rechecks consent at send time. Resend uses idempotency keys; ambiguous Twilio outcomes are held for operator review, not automatically resent. One-click signed opt-out and signed provider callbacks update preferences/outcomes. No credentials or destinations appear in public event views.

The service worker precaches only the public shell. Auth, account, reports, photos, API results and tiles are never cached by it. In-flight drafts remain in memory; optional local persistence is not enabled, avoiding storing private GPS and photos on shared devices. Upload retries reuse the same idempotency key and display pending until accepted.

Production requires dedicated secrets, database role separation, PostGIS, private object storage, verified notification senders, map service configuration, moderator staffing, retention approval and deployment checks in the runbook. No deployment is part of this task.
