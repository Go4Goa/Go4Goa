# PR #12 database migration and Vercel release

Use this procedure to release PR #12 to the shared `go-goa-qa` Vercel project.

This procedure is for fictional QA data. It does not approve a public resident launch.

## Fixed release state

| Item | Required value |
|---|---|
| Pull request | [#12](https://github.com/actforgoa2026/Go4Goa/pull/12) |
| Reviewed PR head | `c34e53e1f35c1be5a7427e8a400cc0803e087d5e` |
| PR base | `26515cdc5a2cdcd08137c2738d1fbf283a8bba60` |
| Merged release commit | `e2a1d622b3aac809ae687ecfb48fac7b7b008c1e` |
| Current verified deployment | `26515cdc5a2cdcd08137c2738d1fbf283a8bba60` |
| Release branch | `cloud-release` |
| Database migration | `db/009-ai-review.sql` |
| Vercel project | `go-goa-qa` (`prj_6Q7Eugjt0H5X2fpIvyohQdGBJd15`) |
| Stable URL | https://go-goa-qa.vercel.app |

Stop if `main` no longer points to the merged release commit. Make a new release plan for the new commit.

## Ownership

| Owner | Task |
|---|---|
| Zak | Approve the exact release commit and the release time. |
| Source-review agent | Review the complete PR diff and publish the exact source-review receipt. |
| Database agent | Back up the QA database, apply migration 009, and verify the schema. |
| Release agent | Verify Vercel settings and fast-forward `cloud-release`. |
| Verification agent | Verify the exact deployment, automated evidence, phone flow, and AI result. |

One agent can do multiple tasks. Each task must keep its separate evidence.

## Stop conditions

Stop the release if one of these conditions is true:

- Zak did not approve commit `e2a1d622b3aac809ae687ecfb48fac7b7b008c1e` for release.
- The source-review receipt is missing, expired, or for different SHAs.
- A required CI job did not pass.
- The database agent cannot make and verify a backup.
- The migration state is inconsistent.
- A required Vercel variable is missing from the Production target.
- `cloud-release` changed after the release agent read it.
- The deployed health response does not show the release commit.
- The live verification workflow or a manual check fails.

Do not bypass a stop condition. Record the failure and give it to Zak.

## 1. Complete the source-review gate

PR #12 merged after Zak reviewed its head. Its `source-review` job did not pass.

The job stopped with this expected hold:

```text
Awaiting cloud source review for this head and base. No candidate code executed.
```

The source-review agent must inspect this exact diff:

```bash
git fetch origin --prune
git diff --stat 26515cdc5a2cdcd08137c2738d1fbf283a8bba60..c34e53e1f35c1be5a7427e8a400cc0803e087d5e
git diff 26515cdc5a2cdcd08137c2738d1fbf283a8bba60..c34e53e1f35c1be5a7427e8a400cc0803e087d5e
```

Review dependencies, authentication, APIs, migration 009, AI review, phone verification, privacy, and all shared UI changes.

If the review passes, publish `reviews/pr-12.json` on `automation/source-review`.

Use this receipt shape:

```json
{
  "head": "c34e53e1f35c1be5a7427e8a400cc0803e087d5e",
  "base": "26515cdc5a2cdcd08137c2738d1fbf283a8bba60",
  "sourceReviewed": true,
  "reviewedAt": "CURRENT_UTC_ISO_TIME",
  "review": "PROSE REVIEW RECORD"
}
```

The receipt expires after 24 hours. Do not copy an old receipt or change its SHAs.

Run the held checks again:

```bash
gh workflow run "QA checks" --ref main -f pr_number=12
gh run list --workflow "QA checks" --limit 5
gh run view RUN_ID --json status,conclusion,jobs,url
```

Require successful `source-review`, `verify`, and `visual-evidence` jobs. Review the matching visual artifact before release.

The receipt authorizes isolated CI execution. It does not authorize the Vercel release.

## 2. Prepare a clean migration checkout

Create a separate clean worktree for the merged release commit:

```bash
git fetch origin --prune
test "$(git rev-parse origin/main)" = "e2a1d622b3aac809ae687ecfb48fac7b7b008c1e"
git worktree add --detach ../Go4Goa-pr12-release e2a1d622b3aac809ae687ecfb48fac7b7b008c1e
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

Confirm these PR #12 variables in the Vercel Production target:

| Variable | Required setting |
|---|---|
| `GO_GOA_AI_REVIEW` | `1` |
| `AI_REVIEW_MODEL` | `claude-sonnet-5` |
| `ANTHROPIC_API_KEY` | A valid server key |
| `ANTHROPIC_WORKSPACE_ID` | The approved workspace ID |
| `GO_GOA_PHONE_VERIFICATION` | `true` |
| `TWILIO_API_KEY_SID` | A restricted Verify key SID |
| `TWILIO_API_KEY_SECRET` | The matching key secret |
| `TWILIO_VERIFY_SERVICE_SID` | The approved Verify service SID |

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

Zak must approve this step after the migration passes.

```bash
git fetch origin --prune
CURRENT_RELEASE="$(git rev-parse origin/cloud-release)"
TARGET_RELEASE="e2a1d622b3aac809ae687ecfb48fac7b7b008c1e"
test "$CURRENT_RELEASE" = "26515cdc5a2cdcd08137c2738d1fbf283a8bba60"
test "$(git rev-parse origin/main)" = "$TARGET_RELEASE"
git merge-base --is-ancestor "$CURRENT_RELEASE" "$TARGET_RELEASE"
git push origin "$TARGET_RELEASE":refs/heads/cloud-release
git fetch origin cloud-release
test "$(git rev-parse origin/cloud-release)" = "$TARGET_RELEASE"
```

Do not use `--force`. Stop if the remote branch changed.

The push starts the Vercel Production deployment and the `Verify public QA release` workflow.

## 7. Verify the exact deployment

Check the stable health response:

```bash
curl --fail --silent --show-error https://go-goa-qa.vercel.app/api/health | \
  jq --exit-status '.ok == true and .mode == "hosted-qa" and .release.commit == "e2a1d622b3aac809ae687ecfb48fac7b7b008c1e"'
```

Check the public feature flags:

```bash
curl --fail --silent --show-error https://go-goa-qa.vercel.app/api/config | \
  jq --exit-status '.qa == true and .demo == true and .phoneVerification == true'
```

Inspect the release workflow once Vercel finishes:

```bash
gh run list --workflow "Verify public QA release" --branch cloud-release --limit 3
gh run view RUN_ID --json status,conclusion,jobs,url
```

Require a successful `cloud/live-verification` status for the release commit. Download the matching evidence artifact.

Verify these manual flows with fictional QA data:

1. Open a new private browser session.
2. Confirm that the app creates a separate guest resident.
3. Confirm that the app does not show a site password or Vercel sign-in.
4. Open the report form and keep the draft through the phone step.
5. Use one approved test phone number.
6. Confirm real SMS delivery and code acceptance separately.
7. Submit a safe trash report at a fictional test point.
8. Record the report ID.
9. Confirm the AI decision and `ai_reviews` record.
10. Confirm that a publish result appears through the public API.
11. Confirm that a reject, merge, or hold result stays within its designed visibility.
12. Close the synthetic report after verification.

Use a test photo without faces, plates, house numbers, or private interiors. Do not use a real resident report.

Provider acceptance does not prove SMS delivery. API success does not prove code acceptance or final report submission.

## 8. Failure and rollback

If migration 009 fails, stop before deployment. Keep the previous application deployment active.

If the Vercel build fails, keep the stable alias on the previous verified deployment. Do not retry without a new cause or change.

If a live check fails, promote the previous verified Vercel deployment. Do not force-push `cloud-release` backward.

Keep migration 009 in place during an application rollback. The old application does not use the additive `ai_reviews` table.

Set the AI or phone flag to false only through an approved incident action. A variable change needs a new deployment.

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
- The real SMS provider result, delivery result, and code result.
- The synthetic report ID and AI result.
- All failed or incomplete checks.

Do not describe a partial result as a complete release.
