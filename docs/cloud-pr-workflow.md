# Cloud Reporting review and release

Status: the cloud handoff was verified at automation/release-records/handoff.json and the local worker is paused. On 29 October 2026 the owner explicitly authorized public guest use without any sign-in screen, site password or Vercel login. This access decision supersedes the previous outer-gate requirement; all design, review, privacy and release gates remain.

## Review boundary

Only layalabs (numeric GitHub ID 261854875) is eligible for unattended Reporting FEATURE/UX releases. Zachary owns DESIGN throughout the app. Read current main, live release provenance and ZakKrevitt's relevant issues, PRs, comments and decisions before source review. Shared design, navigation, maps, typography, colors, spacing, icons and visual hierarchy are protected. A label, clean merge or green build never establishes design approval. Hold drafts, unresolved reviews, unrelated scope, schema/auth/security risks and design conflicts. Do not post GitHub comments or reviews.

## Cloud checks

`QA checks` runs its PR orchestration with `pull_request_target` from the trusted base, with explicitly read-only tokens, no shared caches and no application secrets. Candidate code runs only in fresh dependent jobs after source review; checkout never persists credentials. It uses GitHub-hosted Linux runners with Node 24, a disposable PostgreSQL service and no application/provider secrets. It tests the PR merge ref, not just the contributor branch. It runs unit/access tests, isolated database/API tests and the production build.

Before layalabs code executes, the cloud reviewer must inspect the entire diff, dependencies, test/workflow changes, auth, APIs and migrations. It then creates/updates `reviews/pr-N.json` on the separate `automation/source-review` branch with the exact `head`, `base`, `sourceReviewed: true`, `reviewedAt` ISO timestamp and a prose review record. The receipt expires after 24 hours and is invalidated by either SHA changing. Rerun the previously held CI job using the connector's rerun control. This receipt approves isolated test execution only, never merging or deployment.

The browser harness builds baseline and integrated candidate and captures 18 Reporting/shared states at 320, 390 and 1440 pixels using fictional data and identical deterministic map tiles. It exercises validation, electrical safety, photo preparation, manual coordinates, sign-in with a retained draft, offline submission, upload failure/retry, submitted detail, map, meetups, profile, Resources, a nested resource answer, Directory, meetup creation and detail. Draft navigation/reload and poster recovery are exercised when the candidate supports those controls. Integration tests separately cover private/public projections, moderation, auth/CSRF, idempotency and reminder deduplication across graphic edits. The map fixture tests layout, not geographic correctness. Physical camera/device and real provider tests are not covered.

The actual installed Impeccable 4.7.0 skill is vendored under `.github/impeccable`, including its original checksummed engine launcher. Every cloud run loads context and records detector evidence. The cloud reviewer must read the skill and applicable audit/critique playbooks, view all relevant baseline/candidate PNGs, inspect source for prohibited typography/sideflags and assess current design authority. Detector output and screenshot hashes are evidence, never automatic design approval. Existing baseline findings remain visible. New serious accessibility failures or overflow fail the comparison; prohibited rendered typography and detected sideflags fail capture. A changed/missing baseline or incomplete render is a hold.

Artifacts bind PR head, base, integrated commit, run ID and attempt. Download the matching private artifact and verify provenance before review. Keep the run active while pending CI finishes. If evidence cannot be obtained, hold the release; do not invent a pass or replace baselines.

## Planned publication boundary

The existing target is `go-goa-qa` (`prj_6Q7Eugjt0H5X2fpIvyohQdGBJd15`, team `team_HFlIoPSiBdah4eZZDkHUF4Z7`). Its stable URL is https://go-goa-qa.vercel.app. This is a publicly viewable fictional QA preview; real account/provider readiness remains separate.

Vercel will follow a separate `cloud-release` branch after its GitHub connection is authorized and commissioned. Disable preview deployments and PR/commit comments. Ordinary main and feature pushes must not publish. Do not copy a broad personal Vercel token into Actions. Deployment secrets stay at Vercel. Publication must use a fast-forward, expected-SHA update of `cloud-release`, after rechecking main, reviewed head/base, reviews, required checks and current live provenance. Never force-push or bypass repository protections.

The current private organization repository does not support branch protection on its present plan. These are reviewer/workflow controls, not an enforceable restriction on other collaborators' direct writes. GitHub Team is required if the owner wants repository-enforced branch protection. No plan upgrade or charge is authorized by this document.

`Verify public QA release` runs only on `cloud-release`. It waits for `/api/health` to identify the expected Git commit. It checks public pages without login redirects or password challenges. It verifies the phone sign-in form before it opens restricted test sessions. It rejects unauthenticated shared test-account creation with 403. It captures 30 live mobile and desktop views and runs the hosted fictional Reporting smoke test. It requires the shared QA access code as the encrypted `GO_GOA_QA_ACCESS_CODE` Actions secret. PR jobs never use this secret. Its separate status job publishes `cloud/live-verification` with the exact run URL for the cloud reviewer.

After publication, verify source/deployment identity, public access without a site password plus restricted test-account/private API access, authenticated health and Reporting behavior, and mobile/desktop rendering. Record immutable evidence. Stop subsequent releases after failure. Restore only a previous verified application deployment when safe, without reversing migrations blindly.

## Commissioning gates

- [x] Review and integrate the hosting prerequisite (PR #1).
- [x] Green GitHub-hosted tests/build and complete baseline/candidate artifacts.
- [x] Hosted monitor downloads the real private ZIP, unpacks it and visually reads PNGs.
- [x] Vercel GitHub app access limited to Go4Goa; release-branch-only publication verified.
- [x] Cloud post-deployment identity, access, Reporting and rendered checks verified.
- [x] Explicit verified release handoff recorded; pause the local worker to prevent duplicate releases.

The verified handoff and activation are recorded on automation/release-records. Keep the local worker paused while the cloud monitor owns releases.
