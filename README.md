# GO-GOA

A mobile-first civic PWA for reporting issues and organizing community action in Goa.

**QA baseline, not a production release.**

Shared testing is available at https://go-goa-qa.vercel.app. Get the QA password from Zachary; see [hosted QA access and PR workflow](docs/hosted-qa.md).

The homepage introduces Go4Goa at `/`; the application map is at `/map`. The homepage's report and meetup previews are fictional examples. See [homepage development and build notes](homepage/README.md) for its separate local preview.

 Reporting, maps, events, private profiles, moderation and a Node/Postgres API are implemented. Local demo accounts use fictional data. Real phone verification, message delivery, live provider services still need configuration and validation.

## Start here

- [Partner handoff: Reporting QA](docs/reporting-qa-handoff.md)
- [Collaboration workflow and ownership](CONTRIBUTING.md)
- [QA status and known limitations](docs/qa-status.md)
- [Architecture](docs/architecture.md)
- [Source repository intake](docs/repository-intake.md)
- [Design system](DESIGN.md)

## Run locally

Prerequisites: Node.js 24+, npm and Docker with Compose, or an existing PostgreSQL 16+ server. Clone this repository into your own checkout.

```sh
git clone https://github.com/actforgoa2026/Go4Goa.git
cd Go4Goa
npm ci
cp .env.example .env
docker compose up -d db
npm run db:setup
npm run db:seed
npm run sync
npm run dev
```

Open http://127.0.0.1:4310. Allow the database to finish starting before running setup; retry setup if it reports a connection failure. `npm run sync` imports public Act For Goa resources; its failure does not block the other features. No Twilio, Resend or AWS keys are needed for local QA.

Using an existing local Postgres instead? Set `DATABASE_URL` in `.env` to a database named `go_goa`, for example `postgresql:///go_goa?host=/tmp` on this project's original Mac. Set `TEST_DATABASE_URL` to the separate `go_goa_test` database. Leave `USE_POSTGIS` unset if your local server does not have the extension; production requires PostGIS.

On Profile, choose the local resident account. Expand the local test account controls for organizer or moderator access. These controls are local-only and forbidden in production. They do not verify a real phone or send messages. Use separate browser profiles to compare public, resident and moderator views.

## Verify

```sh
npm test
npm run test:integration
npm run build
```

Integration tests create/use only `go_goa_test`. They create fictional records and never run against `go_goa`. The build generates the PWA manifest and offline shell. Browser/device QA is tracked separately; automated API checks are not proof of complete UI or production readiness.

## Project map

- `src/`: React screens, shared components and styles
- `server/`: Express API, roles, encrypted locations, private media, moderation and notifications
- `shared/`: schemas and public DTOs
- `db/`: versioned migrations
- `scripts/`: setup, seeds, synchronization and test runner
- `tests/`: core tests and isolated database/API tests
- `docs/`: design provenance, architecture, QA and operations

The API runs on port 4311 and Vite proxies `/api` from 4310. Restart `npm run dev` after server changes. Client edits reload automatically. `npm run worker` separately runs resource synchronization and notification processing. Do not expose a demo development server on the public internet.

Only this repository is writable. ActForGoa and Dizko supplied read-only references and focused attributed component extractions. No credentials or private user data from either project are included.


## Meetup check-in and profile points

Point amounts are defined in `shared/points.ts`: approved report +10, resolved report +20, confirmed meetup attendance +15. The append-only ledger allows one award per person, reason and source. Report submission itself waits for moderation before earning points.

A host opens their meetup and chooses **Check in attendees → Open QR check-in**. The code can be enlarged for a group or copied for someone whose camera cannot scan. Attendees scan with their phone camera, review the meetup and confirm attendance. No camera permission is requested by the website. Walk-ins get an RSVP if there is space; check-in does not subscribe them to reminders. The profile's Attended tab and linked points history show the receipt.

QR check-in opens one hour before the start and closes one hour after the end. Codes last at most two hours. Hosts and moderators can replace or close the code; rescheduling and cancellation revoke it. The attendee must have an active private session and a valid CSRF token. In shared QA, the existing automatic guest session supplies this identity. Points remain tied to that browser, and multiple guest identities cannot be treated as verified unique people. Possession of a QR link is evidence of access to the host's code, not proof of physical presence. Share it only onsite.

The host's existing attendee list supports manual check-in until 24 hours after the meetup ends. Hosts cannot confirm themselves; another moderator can confirm them after they RSVP. Confirmed attendance cannot be cancelled to free a place. Concurrent check-ins lock the event row, enforce capacity and save attendance plus points in one transaction. Repeat scans and retries do not add points.

Release prerequisite: back up the existing database and apply additive migration `db/010-qr-check-in.sql` before deploying the app. The session token is encrypted at rest, validated by its hash and carried in the URL fragment to keep it out of normal request URLs. Private responses are not cached. No token is returned by public meetup or profile projections. The migration is safe to leave in place during an application rollback.

Verification covers permission/CSRF failures, cross-meetup and tampered tokens, preview without mutation, concurrent duplicate requests, capacity races, reserved attendees, moderator-confirmed hosts, expired/closed/replaced codes, rescheduling/cancellation and profile receipts. The rendered QR must also be decoded from a screenshot and the mobile/desktop host and attendee states inspected before release.
