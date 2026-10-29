# Repository intake

Inspected 29 October 2026. All reference repositories are read-only. GO-GOA is an independent application, with its own data, users, credentials, storage and deployment.

## Act For Goa

Local checkout: `/Users/zakkrevitt/code/ActForGoa`. Its working copy is dirty and older than the deployed source. No files or Git refs were changed. Prefer the existing `origin/main` snapshot `1c4ac7c0a855f0ff8a44ef3063f09ab9e327014c`, confirmed against the remote, for contracts. The remote is now `actforgoa2026/ActForGoa-website`.

| Source | Decision |
| --- | --- |
| `src/styles.css`, `DESIGN.md` | Extract the real paper `#f7f6ee`, green `#193e32`, muted `#56675c`, rule `#d0d8ca`, pale `#e9eddf`, white `#fffef8`, focus `#dae3cf` and hover `#29523e` tokens. Manrope Variable, upright weights 550/650/700/750/800, 4px controls, 44/48/52px targets. Open resource rows, square photos, structural horizontal rules. |
| `src/components/arc/{button,input,textarea,segmented-control}`, `lib/motion-tokens.ts`, `foundation.css` | Focused extraction of actual UIArc registry source with its existing theme adaptations. No application shell copied. Registry provenance retained. |
| `src/components/ui/{checkbox,switch}.tsx`, `controls.css` | Reuse shadcn/Radix behavior and CSS adaptation. MIT upstream attribution. No second component system. |
| `shared/reporting.ts`, `server/reporting.ts`, `src/ReportIncident.tsx` | Reimplement bounded multipart validation, Sharp metadata stripping, idempotent acceptance and optimistic moderation revisions. Do not reuse the shared reviewer secret, SQLite BLOB storage or environmental-only taxonomy. |
| `api/mcp.ts`, `src/mcp-search.ts`, `src/crm-model.ts`, `src/public-record.ts`, `src/directory-quality.ts` | Build a typed anti-corruption adapter and retain publication caveats. The public client never calls MCP. |

### Verified integration contract

Base: `https://actforgoa-field-guide.vercel.app`. A read-only server-side fetch on intake returned HTTP 200 for `/data/catalog.json` (600 records) and `/data/crm.json` (3,267 records). Both return ETags. CRM version: `directory-2026-10-23`. Counts are inspection facts, never UI impact metrics.

Catalogue: array of `id`, `title`, `kind`, `summary`, `topics`, `source`, `sourceApi`, `publishedAt`, `updatedAt`, `retrievedAt`, `verification`, `editorialStatus`, `locations`, `documents`, `links`, and other body/media/contact fields. Directory: `{version, records, opportunities}`, with `record_id`, `record_type`, `name`, `collection`, `focus_areas`, `goa_location`, `jurisdiction`, `summary`, `source_urls`, `contact_source_urls`, `checked_on`, `verification_status`, `activity_status`, `activity_verification_notes` and public contact fields.

Hosted `/api/mcp` is a stateless Streamable HTTP MCP endpoint. Tools: `search_site`, `search_directory`, `search_research`; query 2–500 chars, limit 1–20 (default 8). Research delegates to `/api/search?q=…&limit=…`. It is a separate published corpus; local private research passages must not be republished. The old local `mcp/server.py` is not the current production contract.

No authentication requirement, contractual rate limit, SLA or stable versioning guarantee is declared for these public feeds. Server-to-server GET works. GO-GOA uses conditional GET, bounded responses, timeout, one in-flight sync, hourly refresh and stale fallback; it does not use the search service as a bulk export. Stable namespaced source IDs and ETag/content revisions drive idempotent upserts. A successful refresh retires removed records. Failed or malformed refreshes preserve the last complete snapshot.

GO-GOA stores concise descriptions and source metadata, not full articles or research passages. Volunteer phone numbers, individual contact details and conflicting unverified contact values are not republished. Users follow the upstream listing to consult contacts and current evidence. Do not treat `checked_on`, a reachable website, or a successful sync as proof a service is available. Corrections made by upstream presentation helpers remain a reason to link to the upstream record rather than reproduce raw contact values.

### Directory development port update, 29 October 2026

The user subsequently authorized a local port of ActForGoa community search and CRM, then narrowed both Directory and Resources to trash and infrastructure. This update governs that focused reuse and public projection. The copied modules and curated maps come from ActForGoa-website commit `a5355bcbd6abcc8d881d1104af3f5f8910f390fd`; their local adaptations are recorded in `shared/actforgoa/PROVENANCE.md`. The source checkout was never edited. This authorization does not imply public relicensing or deployment.

The Directory server fetches the public CRM feed and retains a complete source-membership snapshot after allowlisting fields, applying dated contact corrections and removing direct personal/volunteer phone and email values. The public API returns only records that match the trash/infrastructure scope. Public institutional contact routes may be projected with their source, historical-status and untested-delivery caveats; direct personal contacts remain on the upstream listing. Sync time records retrieval, not verification of current roles, availability or delivery. The broader Resources ingestion remains governed by its concise-description and source-metadata boundary above.

Browser CRM notes use the separate key `go4goa.directory.workspace.v1`, remain local to the browser profile, and are not synced to GO-GOA accounts or ActForGoa. Existing ActForGoa browser notes are never read automatically. Explicit import/export retains the original version-1 backup format, preserves existing local notes on import, and retains out-of-scope imported notes in backups while hiding their listings from this Directory.

The 29 October inspection found 459 scoped records before known-identity grouping and 458 displayed listings after grouping. These are snapshot inspection facts, not service-verification, contact-delivery or impact claims. The wider source snapshot remains server-side. Both Directory and Resources expose linked ActForGoa attribution and “Need more resources? Visit ActForGoa” below their content.

## Dizko

Reference paths: `Dizko-Labs/EventChat` (`00c9d7cb927d53e04f513a6bfdc102e8fc7c156a`) and `Dizko-Labs/Backend`, reached through the supplied `Dizko Labs` symlinks. No files changed. No application code imported.

| Source | Useful pattern and GO-GOA decision |
| --- | --- |
| `web/src/components/map/RadarMap.tsx`, `mapSafeArea.ts` | Leaflet 1.9.4, React Leaflet 5, standard OpenStreetMap raster tiles, resize invalidation, bounded map/list panes and location accuracy. Reimplement a small map with clustering and a list that exposes every item. Do not carry flyer/heatmap/nightlife state. |
| `web/src/services/rsvp.ts` | Account-scoped state and rollback on failed changes. Use server-confirmed RSVP state, a transaction locking the event row, idempotent participation and strict capacity. Do not import contact graphs, silent organizer follows or analytics signals. |
| `web/src/lib/calendar.ts` | UTC calendar URLs and ICS download. Clean reimplementation with Asia/Kolkata input, explicit end time, RFC 5545 escaping/folding, stable UID and sequence on reschedule. |
| `web/src/products/organizer/OrganizerEventPage.tsx`, `authoringFields.ts`, `OrganizerBroadcastPage.tsx` | Clear event fields, separate attendee operations and organizer updates. Reimplement civic categories and approval gates. No ticketing, nightlife or bulk audience system. |
| `backend/api/phone_auth.py`, `services/sms.py`, `config.py` | Twilio Verify uses account SID, auth token and Verify service SID. OTP limits include destination and IP. Phone verification is separate from messaging consent. Reimplement with opaque HttpOnly sessions and private encrypted destinations. Never copy accounts, keys, test bypasses or credential values. |
| `backend/services/email_otp.py`, `sms/providers/twilio.py`, `pipeline/notification_scheduler.py` | Resend requires a verified sender; Twilio has signed callbacks, explicit consent and ambiguous-send handling. Reimplement an outbox with idempotency, consent rechecks, callback authentication and failure visibility. Provider acceptance does not mean delivered. |

OSM public tiles have no SLA and prohibit bulk/offline tile downloads. Local preview may use them with visible attribution and ordinary browser caching. Production requires a configured tile service, geocoding and static-map provider; GO-GOA proxies authenticated provider requests without exposing secret keys. See https://operations.osmfoundation.org/policies/tiles/ .

## Earlier civic tracker

Inspected through GitHub, without cloning: `layalabs/decentralized-civic-tracker`, HEAD `888a1fea7cddb3f80e9165bb8533747b8ffdc24a`. User explicitly requested a fresh, more intuitive rebuild.

`api/src/reports.ts` uses category/distance duplicate detection (30m), SHA-256 and dHash, `photos.ts` rotates/re-encodes to 1600px JPEG, and `report_visibility.ts` maintains private/public projections. README documents held submissions, source-labelled examples, append-only signed logs, reversible merges, and private reporter reads. Dependencies are Hono, Node 24 SQLite and Sharp; client is React/Vite. Code license is MIT; image/data licenses are separate. Reuse no code. Adapt metadata stripping, explicit moderation, provenance and duplicate suggestions. Do not carry device public-key identity, automatic merges, AI approval, political-boundary features or original app UI.

## Ownership and licensing

GO-GOA owns its clean implementation. Act For Goa/Dizko repositories do not grant a blanket public redistribution license for all content; this task authorizes focused reuse locally, not public relicensing. Retain UIArc provenance and verify distribution terms before publication. shadcn MIT, Leaflet BSD-2-Clause, Manrope OFL and OpenStreetMap ODbL attribution apply. Do not copy source photos, private CRM notes, personal identities or real incident media. Development seed reports and events are fictional and visibly labelled.

## Local infrastructure

Node 24 and PostgreSQL 16 are available. PostgreSQL responds locally; PostGIS is not installed in this instance. Use a new GO-GOA database only, with indexed bounding boxes and SQL distance queries for local work. Supply a PostGIS production migration and require it for production. Object storage has a private local development adapter and an S3-compatible production adapter. Live Twilio, Resend, storage and map credentials are deliberately not taken from reference projects.

### Map reuse update, 29 October 2026

The user subsequently requested actual Dizko map code reuse. This supersedes the original map row's clean reimplementation decision. The copied and adapted source, upstream revision, provider boundaries and attribution are recorded in `src/components/map/PROVENANCE.md`. The reference checkouts remain unmodified. GO-GOA still uses its own public reports/events and independently configured services.
