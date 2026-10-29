# Deployment runbook

The established target is the protected `go-goa-qa` Vercel project at https://go-goa-qa.vercel.app. Its Vercel production alias serves shared QA, not the public resident launch. See `hosted-qa.md` and `cloud-pr-workflow.md` for the active release procedure. The requirements below govern a later public launch.

Before deployment, finish the release gates in `qa-status.md`. Name the privacy operator. Set an audited moderator onboarding process. Use dedicated GO-GOA credentials. Zachary authorized two temporary exceptions on 29 October 2026. They cover the Google Places server key and the Watchdoggs Twilio Verify service. The Twilio exception covers the 30 October hackathon QA and first live test. Replace both projects' Twilio credentials after the test. Test each replacement before you revoke the shared credentials.

Required: Node 24 runtime, Postgres/PostGIS, private object storage, an HTTPS origin, MapTiler, Twilio Verify. Resend and Twilio Messaging are optional until notification delivery is enabled and tested.

Use `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET` for a restricted Verify key. Give it only verification create and check permissions. The main account SID and auth token are a fallback.

Set the required values from `.env.example` through the host secret manager. Set `GO_GOA_PHONE_VERIFICATION=true` to enable phone sign-in. Keep `DATA_KEY` in a secure backup. A lost key makes encrypted records unreadable. Use a separate application database role after migrations. Give this role only the required permissions.

Build with `npm ci` and `npm run build`; apply `npm run db:setup` with the migration role. Do not seed a production database. Run `npm start` as the web process and `npm run worker` as a separate worker. Health is `/api/health`. Configure HTTPS termination, backup/restore, object-retention/deletion retries and monitoring. Current proxy-IP handling is conservative and must be reviewed for the chosen host; do not broadly trust arbitrary forwarded headers.

Configure signed Twilio delivery and Resend status callbacks under `/api/notifications/`. Test consent, cancellation, one-tap opt-out, provider failures and callback verification using designated test recipients before enabling messages. Never use real residents for deployment smoke testing.

Verify private media cannot be fetched by anonymous callers before moderation; blurred coordinates remain private; the demo endpoint is unavailable; production source maps/secrets are not public; and cached source data remains available during an upstream outage. Verify installation/offline/update behavior on target browsers.

Deploy a reviewed commit. Roll back the application to the prior known-good commit if checks fail. Do not reverse data migrations blindly; use additive migrations and a tested backup recovery plan.
