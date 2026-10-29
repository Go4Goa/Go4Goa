# Deployment runbook

The established target is the protected `go-goa-qa` Vercel project at https://go-goa-qa.vercel.app. Its Vercel production alias serves shared QA, not the public resident launch. See `hosted-qa.md` and `cloud-pr-workflow.md` for the active release procedure. The requirements below govern a later public launch.

Before deployment, finish the release gates in `qa-status.md`, name the privacy operator and set an audited moderator onboarding process. Use dedicated GO-GOA credentials. The sole approved reuse is the existing Google Places server key for hosted Go4Goa, explicitly authorized by Zachary on 29 October 2026; do not reuse other service credentials.

Required: Node 24 runtime, Postgres/PostGIS, private object storage, an HTTPS origin, MapTiler, Twilio Verify. Resend and Twilio Messaging are optional until notification delivery is enabled and tested.

Set `NODE_ENV=production`, `GO_GOA_DEMO=false`, `DATABASE_URL`, `DATA_KEY` (32-byte hex), `PUBLIC_ORIGIN`, the S3 settings, `MAPTILER_KEY`, and Twilio Verify settings from `.env.example` through the host's secret manager. Keep DATA_KEY backed up securely; losing it makes encrypted records unreadable. Use a separate least-privilege application database role after migrations.

Build with `npm ci` and `npm run build`; apply `npm run db:setup` with the migration role. Do not seed a production database. Run `npm start` as the web process and `npm run worker` as a separate worker. Health is `/api/health`. Configure HTTPS termination, backup/restore, object-retention/deletion retries and monitoring. Current proxy-IP handling is conservative and must be reviewed for the chosen host; do not broadly trust arbitrary forwarded headers.

Configure signed Twilio delivery and Resend status callbacks under `/api/notifications/`. Test consent, cancellation, one-tap opt-out, provider failures and callback verification using designated test recipients before enabling messages. Never use real residents for deployment smoke testing.

Verify private media cannot be fetched by anonymous callers before moderation; blurred coordinates remain private; the demo endpoint is unavailable; production source maps/secrets are not public; and cached source data remains available during an upstream outage. Verify installation/offline/update behavior on target browsers.

Deploy a reviewed commit. Roll back the application to the prior known-good commit if checks fail. Do not reverse data migrations blindly; use additive migrations and a tested backup recovery plan.
