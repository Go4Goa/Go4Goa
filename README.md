# GO-GOA

A mobile-first civic PWA for reporting issues and organizing community action in Goa.

**QA baseline, not a production release.** Reporting, maps, events, private profiles, moderation and a Node/Postgres API are implemented. Local demo accounts use fictional data. Real phone verification, message delivery, hosted storage and a shared deployment still need configuration and validation.

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
