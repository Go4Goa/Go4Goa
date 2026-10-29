# QA baseline status

Updated 29 October 2026. Publicly viewable QA is live at https://go-goa-qa.vercel.app. The owner authorized removal of the site password and Vercel login. Shared test identities and private APIs remain restricted. See [hosted access and workflow](hosted-qa.md); current source and release evidence are on automation/release-records. This is a fictional preview, not a certified resident-account launch.

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
- One hosted-access test verifies that the shared password gate fails closed.
- Four isolated Postgres/API scenarios: access/CSRF/roles; report upload, idempotency, privacy, moderation, redaction and immutable points; simultaneous RSVP capacity, check-in/bookmarks and approval; upstream schema failure retaining cached resources.
- Local live Act For Goa sync completed during development.
- Hosted smoke checks passed for the access gate, sessions, private photo storage, pending-report privacy, blurred public coordinates, submission retry, moderation, points, RSVP, bookmarks, calendar export and cached resources. The dedicated Neon database uses PostGIS; private photos use Vercel Blob. Runtime dependency audit reports zero vulnerabilities.
- Map/navigation rendered at 390×844 and 1440×1000. Independent Impeccable review accepted that scope. This is not a review of every screen.

## Remaining QA and production gates

- Partner: Reporting browser/device QA using `reporting-qa-handoff.md`. Automated tests do not cover every failure, duplicate-merge lifecycle, deletion or camera/browser combination.
- Our team: general design, event creation and attendance browser QA.
- Real Twilio Verify, Resend delivery, SMS delivery/opt-out and signed webhook validation need dedicated provider accounts, credentials and end-to-end testing. Local demo never sends notifications.
- QA HTTPS hosting, private photo storage and PostGIS are provisioned and verified. A separate public-launch environment, production map/geocoding/static previews and index/query load testing remain necessary.
- Service worker and manifest build successfully; installation, offline lifecycle, updates and weak-network behavior need actual browser/device QA. Shell caching does not make private records or map tiles available offline.
- Drafts are memory-only and clear when leaving Reporting. Automatic durable offline submission is not implemented.
- Resource corrections currently support attaching matches; removal/exclusion and expanded matching rules remain follow-up work. Contact details are linked to authoritative source pages instead of republishing raw personal contact fields.
- Points need operational anti-abuse review and a reversal policy before public launch. There are no cash rewards or public leaderboards.
- Account deletion removes primary contact/location/photo data and anonymizes the profile, but moderation audit history may retain previously recorded text. Retention, backup expiry and reliable object-deletion retries need a defined policy and production hardening. Do not use real personal data for QA.
- Full security/accessibility review, production monitoring, provider limits, privacy operator details and escalation ownership remain release gates.

## Roles and notifications

Use separate browser profiles for resident, organizer and moderator tests. Local demo login remains restricted to non-production loopback. Hosted QA explicitly enables fictional test personas through a credential-restricted test-account endpoint; public browsing has no password; phone verification and live SMS/email delivery are disabled there. Do not tunnel a local demo server to the internet. Phone/email verification and notification consent are separate. Notification API acceptance is not proof of delivery; delivery is tracked through provider callbacks.
