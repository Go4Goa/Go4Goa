# Shared QA on Vercel

URL: https://go-goa-qa.vercel.app

This is an isolated testing environment. It uses its own Neon Postgres/PostGIS database and a private Vercel Blob store. It contains fictional personas and example records. Use sample photos and places only. Phone verification, SMS and email delivery are disabled in hosted QA.

## Give the Reporting QA partner access

Send the URL, username `qa`, and the shared QA password privately. The password is kept in the Vercel project's `QA_ACCESS_CODE` environment variable and is deliberately absent from GitHub. GitHub repository access does not automatically grant website access. No Vercel team membership is required for the stable URL.

After the browser's password prompt, open Profile and choose **Continue as a resident**. Expand **Organizer and moderator testing** to switch testing roles. These personas are shared, so coordinate before changing a report the other person is testing. Role switching is available only behind the QA access gate; live phone accounts are not enabled here.

Follow [Reporting QA handoff](reporting-qa-handoff.md). Report issues with the tested URL and commit, browser, steps and scrubbed screenshots. Do not put the QA password, cookies, personal information or provider keys into issues.

## PR and deployment workflow

1. The partner tests Reporting and submits focused fixes as pull requests into `main`.
2. Zachary reviews the behavior and relevant test evidence.
3. After an agreed merge, Zachary or his assistant deploys the reviewed commit to the shared QA site.
4. The partner retests the same feature on the updated site.

The GitHub app is linked only to `actforgoa2026/Go4Goa`. After the cloud handoff is verified, the reviewed `cloud-release` branch drives the protected stable site. Pull requests and ordinary main pushes do not publish it. Follow [the cloud workflow](cloud-pr-workflow.md) and its exact-head/base, design evidence and live verification gates. The deployed source commit is available through the authenticated health endpoint.

Manual release fallback: use a clean reviewed commit including current main, run the required checks, then advance `cloud-release` by an expected-old-SHA guarded fast-forward. Confirm Vercel deployment identity and the `cloud/live-verification` status and artifact before marking a release successful. Never deploy the shared dirty design checkout.

Vercel's `production` target here means the stable URL of the dedicated QA project. It is not the public resident launch. Leave the separate live-mode requirements enabled.

## Isolation and access

- Every route is guarded by a shared HTTP Basic credential in routing middleware. The API repeats the check so rewrites cannot bypass it.
- Gate failures return 401; responses are not indexed. The password is never bundled in client code.
- The app uses opaque HttpOnly sessions and CSRF controls after the outer QA gate.
- Photos are stored privately and served only through the report authorization checks.
- Test accounts do not send live messages. No background notification worker is deployed for QA.
- Act For Goa resources were synced into the QA database. The Resources refresh button can refresh them; hourly unattended sync is not configured here.
- The map uses the approved sparse OpenFreeMap vector treatment. Google Places runs server-side using the key explicitly approved for hosted Go4Goa. Its map-display licensing compatibility remains a public-launch blocker; see the owner release handoff.
- Browser photos are compressed before upload. Hosted uploads must fit Vercel's request limit; the client rejects prepared images above 3.5 MB.

To rotate access, replace `QA_ACCESS_CODE` for the QA project's production and preview environments, redeploy, and privately share the new password. Use at least 24 random characters. Do not publish the password or use it for another service.

## Verified on the hosted deployment

The smoke test checked the password gate, hosted sessions, image upload/storage, private pending report and photo, blurred public coordinates, unchanged retry returning the same report, moderator approval, one approval award, RSVP/cancellation, bookmark add/remove, ICS export and cached resource availability. The synthetic report was closed after verification. This is not a full device or accessibility certification.

Local checks: 7 core/access tests, 4 database/API scenarios, TypeScript and client/PWA build. Source changes to the database connector use transaction-scoped advisory locks and a bulk resource upsert for the pooled hosted database.
