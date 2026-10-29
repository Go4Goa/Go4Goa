# Architecture decision record

Status: accepted for local implementation, 29 October 2026. Stack delegated by user after intake.

React/Vite and a same-origin Node/Express API keep public payloads explicit. Shared TypeScript schemas validate the boundary. PostgreSQL transactions serialize capacity, moderation and points awards. Tables separate account secrets and true incident locations from public profiles and public coordinates. True locations and phone/email destinations use AES-256-GCM with a server-only key. Identity lookups use keyed HMAC. Public queries cannot select private geometry.

PostGIS is required in production; a production migration adds generated geography and GiST indexes. The existing local PostgreSQL has no PostGIS, so development uses indexed latitude/longitude bounds plus a clamped SQL Haversine function. Database creation and all application data are isolated to GO-GOA.

The browser reads photo GPS before canvas compression; the server always re-encodes with Sharp, discards originals and creates bounded derivatives. Pending photos are private. Media is served only after an authorization check, never by publicly exposing the bucket. New reports remain private until moderation. Blurred public coordinates are a stable approximately 1km grid center, not repeatable noisy samples that reveal the original by averaging. Public text/location labels for blurred reports must not disclose precise addresses; moderator review and redaction are required before approval. Electrical hazards remain blurred even when exact was requested.

Opaque, hashed sessions use HttpOnly SameSite cookies; mutations require same-origin checks and a session CSRF token. PostgreSQL rate-limit buckets cover IP and destination OTP attempts, uploads, RSVP, creation and organizer broadcasts. Local demo identity is explicitly labelled, loopback-only and forbidden in production. Roles are granted by an operator, never through public signup.

The Act For Goa adapter validates fixed upstream feeds, normalizes a local read model, retains source IDs and dates, and atomically replaces complete snapshots. An hourly idempotent worker uses ETags. On-demand refresh uses the same bounded path with cooldown; the UI always has the last good snapshot. Source availability is reported separately from content verification. Recommendation links retain rationale and can be corrected by moderators.

Notifications use a transactional outbox. The creator of a published meetup can address only confirmed RSVPs with event-specific consent and a verified opted-in channel. The worker rechecks consent at send time. Resend uses idempotency keys; ambiguous Twilio outcomes are held for operator review, not automatically resent. One-click signed opt-out and signed provider callbacks update preferences/outcomes. No credentials or destinations appear in public event views.

The service worker precaches only the public shell. Auth, account, reports, photos, API results and tiles are never cached by it. In-flight drafts remain in memory; optional local persistence is not enabled, avoiding storing private GPS and photos on shared devices. Upload retries reuse the same idempotency key and display pending until accepted.

Production requires dedicated secrets, database role separation, PostGIS, private object storage, verified notification senders, map service configuration, moderator staffing, retention approval and deployment checks in the runbook. No deployment is part of this task.

## Automated report moderation

Status: accepted, 29 October 2026. Owner decision: no human moderator approves reports. An AI model judges each new issue report and fixed code rules decide. People handle only the held reports (the escalation queue). Meetups are not reviewed.

The check runs when `GO_GOA_AI_REVIEW=1` and `ANTHROPIC_API_KEY` are set. `AI_REVIEW_MODEL` overrides the default model `claude-sonnet-5`; `ANTHROPIC_WORKSPACE_ID` is sent as a header when set. When the check is off, reports stay `new` as before. Code: `server/ai-review.ts`. Rubric version: `gr-1`.

**Trigger.** After the report transaction commits, the API starts the review without delaying the response (`waitUntil` on Vercel). The worker calls `runPendingReviews` every loop for `new` reports with no `gr-1` row. Moderators can run the same function with `POST /api/admin/ai-review/run`. Vercel stops a function after 60 s and does not run the worker, so on Vercel a report whose run was cut off waits until the worker or the manual run picks it up. An `unavailable` attempt is retried after 60 minutes by the worker, at once by the manual run.

**Sent to Anthropic.** One request per report: the new photo (re-encoded WebP, EXIF removed), the category label and help text, the reporter's private description, and up to four thumbnails of earlier reports labelled "Candidate 1" to "Candidate 4". Candidates are reports of the same category, created in the last 30 days and before the new report, with status `new`, `verified` or `in_progress`, not merged, and with a true pin less than 250 m away (both pins are decrypted on the server; nearest first).

**Never sent.** Coordinates or pins, location labels, usernames, account, incident or media ids, phone numbers and email addresses.

**Decision table** (first matching row wins; thresholds are inclusive):

| # | Condition | Decision | Effect |
|---|---|---|---|
| a | Model unavailable, refusal, unparseable answer or error | hold | Status stays `new`; `unavailable` code recorded |
| b | `duplicate_of_candidate` set, `duplicate_confidence` >= 80 and `matches_category` is not `no` | merge | Status `duplicate`, `duplicate_of` = candidate (target must still be active and the same category, else hold). No points |
| c | `matches_category` = `no` and `confidence` >= 80 | reject | Status `rejected`; the reporter sees the model's reason in the status history |
| d | `matches_category` = `yes`, `confidence` >= 80, `public_civic_scene`, `looks_like_screen_or_generated` is not `yes`, no identifying details in the photo, no personal information in the description | publish | Status `verified`, photo `approved`, +10 `report_approved` points once |
| e | Anything else | hold | Status stays `new` with the hold reason |

The decision is applied under a row lock and only if the report is still `new` at the version that was judged. A moderator change made while the model runs wins. The `ai_reviews` table keeps one row per report and rubric (`UNIQUE(incident_id, rubric_version)`); a second runner can replace only an `unavailable` row, so two runners never both act. Audit rows have a null actor: `incident.status` or `incident.merged` for the change and `ai_review.recorded` with model, rubric and decision.

**Escalation.** Held reports are the `new` list in Moderation. The list and the report detail show the AI decision, reason and model. Typical hold reasons: faces, number plates or house numbers in the photo (the app cannot blur them automatically), personal information in the description, model unsure, possible screen or generated image, not a public scene, low confidence. AI data is never returned by public endpoints. The reporter sees only the reason attached to an automated status change.

**Known limits.** The location label and, for exact reports, the description become public on publish without a person reading them; the model checks the description for personal information but never sees the label. The reporter's description is untrusted text inside the prompt; the prompt marks it as data, and the fixed decision rules limit what a manipulated answer can do (it can publish or reject a single report).
