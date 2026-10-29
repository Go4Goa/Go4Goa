# PR #12 database migration and Vercel release

Use this procedure to release PR #12 to the shared `go-goa-qa` Vercel project.

This procedure is for fictional QA data. It does not approve a public resident launch.

## Historical PR #12 reference

| Item | Required value |
|---|---|
| Pull request | [#12](https://github.com/actforgoa2026/Go4Goa/pull/12) |
| Reviewed PR head | `c34e53e1f35c1be5a7427e8a400cc0803e087d5e` |
| PR base | `26515cdc5a2cdcd08137c2738d1fbf283a8bba60` |
| PR #12 merge commit | `e2a1d622b3aac809ae687ecfb48fac7b7b008c1e` |
| Deployment verified when this runbook was drafted | `26515cdc5a2cdcd08137c2738d1fbf283a8bba60` |
| Release branch | `cloud-release` |
| Database migration | `db/009-ai-review.sql` |
| Vercel project | `go-goa-qa` (`prj_6Q7Eugjt0H5X2fpIvyohQdGBJd15`) |
| Stable URL | https://go-goa-qa.vercel.app |

These SHAs describe PR #12, not a permanently pinned deployment target. Before every release, inspect current `main`, the live health response, the latest release record and Zachary's current design decisions. Select and record the exact reviewed current-main commit as `TARGET_RELEASE` and the current release branch as `CURRENT_RELEASE`. Include all approved live design. If either ref changes after review, stop and re-evaluate the new commits. Merging this runbook does not itself authorize a deployment.

The owner's current instruction is no sign-ins anywhere in this public QA site. Keep automatic guest access, no site password and no Vercel login. Keep `GO_GOA_PHONE_VERIFICATION=false`; the presence of provider credentials does not authorize enabling it.

## Ownership

| Owner | Task |
|---|---|
| Zak | Approve the exact release commit and the release time. |
| Source-review agent | Review the complete PR diff and publish the exact source-review receipt. |
| Database agent | Back up the QA database, apply migration 009, and verify the schema. |
| Release agent | Verify Vercel settings and fast-forward `cloud-release`. |
| Verification agent | Verify the exact deployment, automated evidence, anonymous guest flow and approved report-review behavior. |

One agent can do multiple tasks. Each task must keep its separate evidence.

## Stop conditions

Stop the release if one of these conditions is true:

- The exact `TARGET_RELEASE` is not covered by current owner release authorization.
- The source-review receipt is missing, expired, or for different SHAs.
- A required CI job did not pass.
- The database agent cannot make and verify a backup.
- The migration state is inconsistent.
- A required Vercel variable is missing from the Production target, or phone sign-in is enabled.
- The candidate changes approved design, introduces a sign-in step, or omits newer approved live design.
- `cloud-release` changed after the release agent read it.
- The deployed health response does not show the release commit.
- The live verification workflow or a manual check fails.

Do not bypass a stop condition. Record the failure and give it to Zak.

## 1. Complete the source-review gate

Inspect the current checks and source-review records instead of assuming a historical run is still current. A missing receipt produces this expected hold:

```text
Awaiting cloud source review for this head and base. No candidate code executed.
```

The historical PR #12 diff is:

```bash
git fetch origin --prune
git diff --stat 26515cdc5a2cdcd08137c2738d1fbf283a8bba60..c34e53e1f35c1be5a7427e8a400cc0803e087d5e
git diff 26515cdc5a2cdcd08137c2738d1fbf283a8bba60..c34e53e1f35c1be5a7427e8a400cc0803e087d5e
```

Review dependencies, authentication, APIs, migration 009, AI review, phone verification, privacy, and all shared UI changes.

For an open PR, fetch its current head, base and integrated merge candidate, then review the complete diff before authorizing execution. A receipt must use those current SHAs. For PR #12, the receipt path is `reviews/pr-12.json` on `automation/source-review`; other PRs use their own number.

Use this receipt shape, replacing the placeholders only with the SHAs actually reviewed:

```json
{
  "head": "REVIEWED_CURRENT_PR_HEAD",
  "base": "REVIEWED_CURRENT_PR_BASE",
  "sourceReviewed": true,
  "reviewedAt": "CURRENT_UTC_ISO_TIME",
  "review": "PROSE REVIEW RECORD"
}
```

The receipt expires after 24 hours. Do not copy an old receipt or change its SHAs.

For a still-open reviewed PR, dispatch its integrated candidate checks with its PR number:

```bash
gh workflow run "QA checks" --ref main -f pr_number=PR_NUMBER
gh run list --workflow "QA checks" --limit 5
gh run view RUN_ID --json status,conclusion,jobs,url
```

Require successful `source-review`, `verify`, and `visual-evidence` jobs for the actual reviewed candidate. Review the artifact provenance and rendered comparisons at 320px, 390px and desktop widths.

For an already merged PR, verify the exact current-main commit separately. An ordinary main CI run compares that commit with itself; it does not establish preservation of the previous approved live design. Compare the selected release against the actual live baseline as well. Inspect Reporting and any affected shared navigation, map and event surfaces. Missing rendered evidence is a hold.

The receipt authorizes isolated CI execution. It does not authorize the Vercel release.

## 2. Prepare a clean migration checkout

Set `TARGET_RELEASE` to the exact current-main commit already reviewed and covered by release authorization. Create a separate clean worktree for that commit:

```bash
git fetch origin --prune
: "${TARGET_RELEASE:?Set the reviewed release SHA first}"
test "$(git rev-parse origin/main)" = "$TARGET_RELEASE"
git worktree add --detach ../Go4Goa-pr12-release "$TARGET_RELEASE"
cd ../Go4Goa-pr12-release
test -z "$(git status --short)"
```

Use Node 24 for project checks:

```bash
test "$(node --version | cut -d. -f1)" = "v24"
npm ci
npm test
npm run test:integration
npm run build
```

The integration command needs the isolated test database from the repository workflow. Do not point tests at the hosted QA database.

## 3. Check the Production variables

Keep all existing project variables. Do not replace the database, Blob, encryption, origin, access, or map values.

Confirm these settings in the Vercel Production target:

| Variable | Required setting |
|---|---|
| `GO_GOA_QA` | `true`, retaining the existing isolated QA environment |
| `GO_GOA_PHONE_VERIFICATION` | `false`, preserving the owner's no-sign-in instruction |
| `GO_GOA_AI_REVIEW` | Preserve the separately approved state; do not enable a provider as part of this runbook merge |

Twilio credentials are not required for the guest workflow. Do not add an SMS test, phone verification step or login requirement. Do not remove private-session, CSRF or moderator authorization controls.

If AI review has separate current authorization, verify its model, workspace, credentials and privacy behavior before activating it. Otherwise leave it disabled and test the manual moderation path. Never send resident data to an unapproved provider.

Confirm these existing hosted-QA variables remain present:

```text
NODE_ENV
GO_GOA_QA
DATABASE_URL
DATA_KEY
PUBLIC_ORIGIN
QA_ACCESS_CODE
BLOB_READ_WRITE_TOKEN
GOOGLE_PLACES_API_KEY
```

Check names, targets, and storage types. Do not print secret values in logs, terminals, issues, pull requests, or chat.

Environment changes affect only new deployments. Do not start the deployment before migration 009 passes.

## 4. Back up the hosted QA database

The Vercel project token cannot decrypt the existing `DATABASE_URL`. Use Neon access or a separate migration connection string.

Read the connection string without terminal output:

```bash
read -r -s -p "Migration DATABASE_URL: " MIGRATION_DATABASE_URL
printf '\n'
export MIGRATION_DATABASE_URL
```

Confirm the target database:

```bash
psql "$MIGRATION_DATABASE_URL" --set=ON_ERROR_STOP=1 \
  --command="SELECT current_database(), current_user, inet_server_addr();"
```

Stop if this is not the isolated `go-goa-qa` database.

Create a private backup:

```bash
umask 077
BACKUP_FILE="go-goa-qa-before-009-$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --format=custom --file="$BACKUP_FILE" "$MIGRATION_DATABASE_URL"
chmod 600 "$BACKUP_FILE"
pg_restore --list "$BACKUP_FILE" >/dev/null
openssl dgst -sha256 "$BACKUP_FILE"
```

Record the backup name and SHA-256 hash in the private release record. Do not add the backup to Git.

## 5. Check and apply migration 009

Check both migration markers:

```bash
psql "$MIGRATION_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
  --command="SELECT name FROM schema_migrations WHERE name='009-ai-review.sql';"

psql "$MIGRATION_DATABASE_URL" --set=ON_ERROR_STOP=1 --tuples-only --no-align \
  --command="SELECT to_regclass('public.ai_reviews');"
```

Use this decision table:

| Migration row | `ai_reviews` table | Action |
|---|---|---|
| Missing | Missing | Apply migration 009. |
| Present | Present | Do not apply it again. Continue to schema verification. |
| Present | Missing | Stop. Restore or repair with Zak. |
| Missing | Present | Stop. Inspect the table before any change. |

Apply the migration and marker in one transaction:

```bash
psql "$MIGRATION_DATABASE_URL" --set=ON_ERROR_STOP=1 --single-transaction \
  --file=db/009-ai-review.sql \
  --command="INSERT INTO schema_migrations(name) VALUES ('009-ai-review.sql');"
```

Verify the result:

```bash
psql "$MIGRATION_DATABASE_URL" --set=ON_ERROR_STOP=1 --command="\d+ ai_reviews"
psql "$MIGRATION_DATABASE_URL" --set=ON_ERROR_STOP=1 \
  --command="SELECT name, applied_at FROM schema_migrations WHERE name='009-ai-review.sql';"
```

Clear the shell variable:

```bash
unset MIGRATION_DATABASE_URL
```

Migration 009 is additive. Do not delete the table during an application rollback.

## 6. Fast-forward the release branch

Proceed only under current owner release authorization after the migration and all review gates pass. Read both refs again immediately before publication:

```bash
git fetch origin --prune
: "${CURRENT_RELEASE:?Set the release branch SHA recorded during review}"
: "${TARGET_RELEASE:?Set the reviewed current-main SHA}"
test "$(git rev-parse origin/cloud-release)" = "$CURRENT_RELEASE"
test "$(git rev-parse origin/main)" = "$TARGET_RELEASE"
git merge-base --is-ancestor "$CURRENT_RELEASE" "$TARGET_RELEASE"
```

Advance `cloud-release` through the established GitHub ref-update tool with `branch_name=cloud-release`, `expected_sha=CURRENT_RELEASE`, `sha=TARGET_RELEASE` and `force=false`. The expected-old-SHA check is required; a plain push does not enforce that guard. If this guarded operation is unavailable, hold publication. Never force-push or silently substitute a different SHA.

Fetch the branch afterward and confirm it equals `TARGET_RELEASE`. Stop if main or the release branch changed before the guarded update.

The guarded branch update starts the Vercel Production deployment and the `Verify public QA release` workflow.

## 7. Verify the exact deployment

Check the stable health response:

```bash
curl --fail --silent --show-error https://go-goa-qa.vercel.app/api/health | \
  jq --exit-status --arg target "$TARGET_RELEASE" '.ok == true and .mode == "hosted-qa" and .release.commit == $target'
```

Check the public feature flags:

```bash
curl --fail --silent --show-error https://go-goa-qa.vercel.app/api/config | \
  jq --exit-status '.qa == true and .demo == true and .phoneVerification == false'
```

Inspect the release workflow once Vercel finishes:

```bash
gh run list --workflow "Verify public QA release" --branch cloud-release --limit 3
gh run view RUN_ID --json status,conclusion,jobs,url
```

Require a successful `cloud/live-verification` status for the release commit. Download the matching evidence artifact.

Verify these manual flows with fictional QA data:

1. Open two fresh private browser contexts and confirm they receive separate guest residents without any sign-in form, phone step, password or Vercel login.
2. Check Reporting, events, RSVP, bookmarks and profile without asking the visitor to sign in.
3. Confirm a report draft survives navigation, upload failure and retry without a phone gate.
4. Submit an approved synthetic test report with a fictional location and safe test photo. Record its ID and verify that retries do not duplicate it.
5. Confirm pending/private reports and photos stay private to the creating session and authorized moderation, including across the two guest contexts. Preserve location precision and CSRF controls.
6. Confirm moderation and public projections, and the approved AI behavior only if that provider has separate release authorization.
7. Compare mobile and desktop design to the approved baseline. Check upright type, existing tokens/components and absence of decorative sideflags.
8. Close the synthetic report after verification through the supported moderation action.

Use fictional QA data only. Never send real SMS or email, use real residents, seed a production database, or copy production secrets into test environments. API success alone does not establish the complete rendered guest workflow.

## 8. Failure and rollback

If migration 009 fails, stop before deployment. Keep the previous application deployment active.

If the Vercel build fails, keep the stable alias on the previous verified deployment. Do not retry without a new cause or change.

If a live check fails, promote the previous verified Vercel deployment. Do not force-push `cloud-release` backward.

Keep migration 009 in place during an application rollback. The old application does not use the additive `ai_reviews` table.

Keep phone verification disabled throughout release and rollback. If separately authorized AI review fails, disable it through the approved incident procedure. Variable changes need a new deployment; verify guest access again afterward.

## 9. Release record

Record these items before the release closes:

- Zak's exact release approval.
- The migration backup name and hash.
- The migration row and application time.
- The source-review receipt commit.
- The successful CI run URL.
- The Vercel deployment ID and immutable URL.
- The deployed Git commit from `/api/health`.
- The `cloud/live-verification` run and artifact.
- Evidence that phone verification is disabled and guest sessions require no sign-in.
- The synthetic report ID, moderation result and any separately approved AI result.
- The approved live baseline, mobile/desktop visual evidence and design review outcome.
- All failed or incomplete checks.

Do not describe a partial result as a complete release.
