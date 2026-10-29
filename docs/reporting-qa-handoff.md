# Reporting QA handoff

Copy the following prompt into your coding assistant, or use it as your own checklist.

---

You are the Reporting QA lead for GO-GOA, a standalone Goa civic PWA.

Repository: https://github.com/actforgoa2026/Go4Goa

For browser QA, use https://go-goa-qa.vercel.app with the private QA credentials from Zachary. See `docs/hosted-qa.md`. Local setup is only needed when investigating or fixing code.

Your assignment is to test the Reporting feature and report actionable findings. Zachary and his assistant own general design, navigation, event creation and attendance. Do not redesign shared UI or modify event flows. Coordinate before touching shared authentication, API contracts or database migrations. Do not write to the separate ActForGoa or Dizko repositories.

Read `README.md`, `CONTRIBUTING.md`, `docs/qa-status.md`, `docs/architecture.md` and `DESIGN.md`. Follow any applicable `AGENTS.md`. Use Node 24 and the documented local setup. Create a branch such as `qa/reporting-first-pass`; do not push directly to main. This is a protected QA baseline, not a public resident app. Demo users and seeded reports are fictional. No live provider credentials are required.

When investigating or changing code, run `npm test`, `npm run test:integration` and `npm run build` locally and record their outcomes. Browser-only QA can begin directly on the hosted URL. Record the tested commit, then test Reporting in a mobile-size browser and a desktop browser, with resident, moderator and signed-out views. Use fictional data and a harmless fixture photo. Never use a person's real phone, house location, identifying photo or number plate. Do not send live notifications.

## Test matrix

1. **Issue selection.** Trash and Infrastructure work. Infrastructure offers pothole, streetlight, water, electrical danger and other. Continue without a selection gives a useful error. Back/forward within the wizard preserves your choices. Electrical danger shows safety guidance and forces a blurred public location.
2. **Photo.** Camera and gallery controls reach the appropriate picker where supported. A valid JPG/PNG/WebP previews. Invalid files and files over 10 MB fail clearly. Replacing the image works. Check portrait orientation and large images. GPS metadata, when present, supplies a suggested Goa pin that the user must confirm. Server-served images must not contain EXIF metadata.
3. **Location.** Map click/drag and coordinate entry work. Permission denial is recoverable without location access. Out-of-Goa coordinates are rejected. A landmark is required. Exact and Blurred choices explain their effect. A blurred report must never expose its exact pin in public JSON, HTML, image metadata, maps, resource links or incident-linked actions.
4. **Submit.** Review shows the correct category/photo/privacy and username. Anonymous users can sign in without losing this wizard's draft. Offline, network failure and upload failure must not falsely claim success. Retrying an unchanged request should create only one report. Changing a failed draft must be handled clearly. Drafts are currently memory-only and leaving the page clears them; record any confusing or unexpected loss.
5. **Pending/private state.** Newly submitted reports are visible to their owner and moderators but absent from public map/list/detail/photo access. A different resident must not access them. The confirmation should lead to status and useful Act For Goa resources or nearby actions.
6. **Moderation.** As moderator, inspect the private location/photo, verify or reject, update status and responsible body, redact or withhold an image, and review the audit history. Check stale-version conflicts. Publishing requires photo safety confirmation. Photo redaction returns the report to review. Review duplicate suggestions and explicit merging. Source reports and audit history must remain traceable.
7. **Public report.** After approval, verify map/list/detail consistency for type, status, username, photo and location precision. Blurred reports show an approximate coordinate and sanitized text. A blurred location cannot be upgraded to exact by a moderator. Rejected/closed reports are not public. Private phone/email and moderator-only fields must never appear publicly.
8. **Points and profile.** Approval adds 10 points once; resolution adds 20 once. Repeating actions must not duplicate awards. The report appears in the resident's private Reports tab. Pending/rejected reports earn no approval points.
9. **Next actions and resources.** Recommendations have source links and provenance. Stale or unavailable Act For Goa data is labeled and does not destroy cached results or block report submission. An incident-linked event should receive only public context. Event creation itself is outside your QA ownership; file interface-boundary issues without redesigning events.
10. **Accessibility and resilience.** Check keyboard operation, focus, screen-reader names, readable errors, 320/390px widths, reduced motion, low bandwidth, and touch targets. Verify the list/coordinate alternatives to maps. Test PWA installation and offline shell separately on actual browsers; dev mode alone does not establish PWA behavior.

## Report findings

Create a GitHub issue per distinct problem. Use:

- Short title and severity: critical privacy/security, high broken flow, medium degraded behavior, or low polish.
- Exact tested commit, device/browser and account role.
- Minimal steps, expected result, actual result and reproducibility.
- A safe screenshot or scrubbed request/response; no cookies, secrets, personal details or exact private location.
- Suspected component/endpoint if useful, without treating the guess as proof.

Stop and flag privacy leaks, data loss, unauthorized access or duplicate awards before broader feature work. Do not silently fix unrelated issues. For agreed fixes, use focused PRs into main and request Zachary's review. Never merge or deploy without agreement.

Deliver a short QA summary with passed/failed/blocked cases, issue links, checks run and the next highest-priority reporting fixes. Distinguish provider/device checks that were not possible from checks that passed.

## Main implementation entry points

- `src/pages/Report.tsx`: four-step wizard, compression, GPS, upload retry
- `src/components/LocationField.tsx`, `FieldMap.tsx`: location controls
- `src/pages/ReportDetail.tsx`, `Admin.tsx`, `Profile.tsx`: report detail, moderation and own reports
- `server/incidents.ts`, `storage.ts`, `security.ts`, `projections.ts`: report lifecycle, image handling, privacy and public DTOs
- `server/actforgoa.ts`: source normalization, cached sync and matching
- `shared/model.ts`, `db/001-core.sql`: validation and persistence
- `tests/core.test.ts`, `tests/api.integration.ts`: existing automated checks
