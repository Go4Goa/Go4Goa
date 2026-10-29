# QA baseline status

Prepared 29 October 2026. This is source code for local collaborative QA. It has not been deployed publicly or certified production-ready.

## Implemented

- React/TypeScript PWA shell; Map, Report, Events and Profile routes; compact Apple HIG-inspired glass navigation; accessible map/list alternative.
- Four-step photo reporting with client compression, GPS extraction, manual location, exact/blurred public coordinates, server image sanitization, authenticated private media and idempotent retries.
- Pseudonymous accounts, local demo roles, Twilio Verify integration, optional email verification, session/CSRF controls and rate limits.
- Report moderation, image redaction/withholding, statuses, duplicate suggestions/merge, responsible body, resource matching and audit log.
- Events, organizer approval, capacity-safe RSVP/cancellation, calendar export, check-in, bookmarks, updates and notification outbox.
- Private profiles with reports, organized/attended/bookmarked events, immutable points, preferences, export and deletion.
- Typed Act For Goa adapter, cached sync, provenance, stale-data handling and resources search.

## Verified for this baseline

- TypeScript check and production client/PWA build pass.
- Six core tests: encryption/privacy cell, public DTO isolation, EXIF removal and image bounds, source adapter contract/provenance, ICS formatting, input validation.
- Four isolated Postgres/API scenarios: access/CSRF/roles; report upload, idempotency, privacy, moderation, redaction and immutable points; simultaneous RSVP capacity, check-in/bookmarks and approval; upstream schema failure retaining cached resources.
- Local live Act For Goa sync completed during development.
- Map/navigation rendered at 390×844 and 1440×1000. Independent Impeccable review accepted that scope. This is not a review of every screen.

## Remaining QA and production gates

- Partner: Reporting browser/device QA using `reporting-qa-handoff.md`. Automated tests do not cover every failure, duplicate-merge lifecycle, deletion or camera/browser combination.
- Our team: general design, event creation and attendance browser QA.
- Real Twilio Verify, Resend delivery, SMS delivery/opt-out and signed webhook validation need dedicated provider accounts, credentials and end-to-end testing. Local demo never sends notifications.
- Private S3-compatible storage, production map/geocoding/static previews, HTTPS hosting and PostGIS deployment need provisioning and validation. Current queries also support local Haversine fallback; production index/query performance needs load testing.
- Service worker and manifest build successfully; installation, offline lifecycle, updates and weak-network behavior need actual browser/device QA. Shell caching does not make private records or map tiles available offline.
- Drafts are memory-only and clear when leaving Reporting. Automatic durable offline submission is not implemented.
- Resource corrections currently support attaching matches; removal/exclusion and expanded matching rules remain follow-up work. Contact details are linked to authoritative source pages instead of republishing raw personal contact fields.
- Points need operational anti-abuse review and a reversal policy before public launch. There are no cash rewards or public leaderboards.
- Account deletion removes primary contact/location/photo data and anonymizes the profile, but moderation audit history may retain previously recorded text. Retention, backup expiry and reliable object-deletion retries need a defined policy and production hardening. Do not use real personal data for QA.
- Full security/accessibility review, production monitoring, provider limits, privacy operator details and escalation ownership remain release gates.

## Roles and notifications

Use separate browser profiles for resident, organizer and moderator tests. The local demo login is enabled only in non-production on loopback. Do not tunnel a demo server to the internet. Phone/email verification and notification consent are separate. Notification API acceptance is not proof of delivery; delivery is tracked through provider callbacks.
