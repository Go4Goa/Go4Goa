# Public QA preview on Vercel

URL: https://go-goa-qa.vercel.app

This is an isolated testing environment. It uses its own Neon Postgres/PostGIS database and a private Vercel Blob store. It contains fictional personas and example records. Use sample photos and places only. SMS notifications and email delivery are disabled in hosted QA.

The owner’s current instruction is no sign-ins anywhere in this public QA site. Keep `GO_GOA_PHONE_VERIFICATION=false` and automatic guest sessions. Existing Verify credentials or earlier test setup do not authorize enabling phone sign-in; any future change needs a new owner decision.

## Give the Reporting QA partner access

Share the URL directly. On 29 October 2026 Zachary explicitly authorized public browsing without a site password or Vercel login. No GitHub access or Vercel membership is needed to view the site.

The preview starts a separate guest resident session automatically in each browser. The private session cookie keeps each visitor's activity separate. Clearing cookies removes access to that guest activity.

Guests can browse, submit reports, create meetups, RSVP and use bookmarks without signing in. Phone verification remains disabled for this public QA workflow. Guest creation cannot select a role or obtain moderator permissions. Shared seeded personas remain available only to authorized automated QA through the encrypted test-account API.

Follow [Reporting QA handoff](reporting-qa-handoff.md). Report issues with the tested URL and commit, browser, steps and scrubbed screenshots. Do not put the QA password, cookies, personal information or provider keys into issues.

## PR and deployment workflow

1. The partner tests Reporting and submits focused fixes as pull requests into `main`.
2. Zachary reviews the behavior and relevant test evidence.
3. After an agreed merge, Zachary or his assistant deploys the reviewed commit to the shared QA site.
4. The partner retests the same feature on the updated site.

The GitHub app is linked only to `actforgoa2026/Go4Goa`. After the cloud handoff is verified, the reviewed `cloud-release` branch drives the public stable preview. Pull requests and ordinary main pushes do not publish it. Follow [the cloud workflow](cloud-pr-workflow.md) and its exact-head/base, design evidence and live verification gates. The deployed source commit is available through the public health endpoint.

For PR #12, follow the [database migration and Vercel release procedure](pr12-migration-vercel-release.md). It includes the exact SHAs, migration gate, release commands, rollback limits and verification evidence.

Manual release fallback: use a clean reviewed commit including current main, run the required checks, then advance `cloud-release` by an expected-old-SHA guarded fast-forward. Confirm Vercel deployment identity and the `cloud/live-verification` status and artifact before marking a release successful. Never deploy the shared dirty design checkout.

Vercel's `production` target here means the stable URL of the dedicated QA project. It is not the public resident launch. Leave the separate live-mode requirements enabled.

## Isolation and access

- Public routes and public API projections return 200 without credentials, login redirects or WWW-Authenticate challenges. Vercel login protection is disabled for this project.
- Automatic guest creation creates only separate resident identities. Shared seeded test-account creation requires the encrypted QA credential and returns 403 without it. Private APIs still require an authorized session. The credential is never bundled in client code.
- Preview responses remain unindexed. Opaque HttpOnly sessions, CSRF controls and private/public projections remain enforced.
- Photos are stored privately and served only through the report authorization checks.
- Test accounts do not send live messages. No background notification worker is deployed for QA.
- Act For Goa resources were synced into the QA database. The Resources refresh button can refresh them; hourly unattended sync is not configured here.
- The map uses the approved sparse OpenFreeMap vector treatment. Google Places runs server-side using the key explicitly approved for hosted Go4Goa. Provider policy compatibility remains a resident-launch readiness task; the owner has explicitly authorized public preview browsing.
- Browser photos are compressed before upload. Hosted uploads must fit Vercel's request limit; the client rejects prepared images above 3.5 MB.

To rotate internal test-account access, replace `QA_ACCESS_CODE` for the QA project's production and preview environments, redeploy, and privately share the new password. Use at least 24 random characters. Do not publish the password or use it for another service.

## Verified on the hosted deployment

The smoke test checks public browsing without a password, restricted shared test accounts, hosted sessions, image upload/storage, private pending report and photo, blurred public coordinates, unchanged retry returning the same report, moderator approval, one approval award, RSVP/cancellation, bookmark add/remove, ICS export and cached resource availability. The synthetic report was closed after verification. This is not a full device or accessibility certification.

Local checks: 7 core/access tests, 4 database/API scenarios, TypeScript and client/PWA build. Source changes to the database connector use transaction-scoped advisory locks and a bulk resource upsert for the pooled hosted database.
