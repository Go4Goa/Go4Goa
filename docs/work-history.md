# Go4Goa work history and evidence

Recorded on 30 October 2026. Scope: the 22 pull requests numbered through #24, checked against GitHub metadata and the repository history at [`0de2490e5054526a6b213ea60505159c34ddf4b2`](https://github.com/Go4Goa/Go4Goa/commit/0de2490e5054526a6b213ea60505159c34ddf4b2).

## Repository continuity

Go4Goa moved from `actforgoa2026/Go4Goa` to [`Go4Goa/Go4Goa`](https://github.com/Go4Goa/Go4Goa). Both addresses resolve to the same GitHub repository, ID **1438302011**. The original PR numbers, discussions, authors and merge commits remain available at the new address. This note makes that work easy to inspect after the move.

The verified snapshot contains **19 merged PRs and three closed, unmerged PRs**. Every merge commit listed below is an ancestor of the snapshot commit. GitHub shares issue/PR numbering, so gaps in the sequence do not represent missing PRs. The initial civic PWA and Reporting QA handoff also precede these PRs in the repository's bootstrap commit, [`3867861`](https://github.com/Go4Goa/Go4Goa/commit/3867861921255d664bd58937ec954c1067d89c88).

The author column identifies the GitHub PR opener. The linked discussions, diffs and commit histories preserve collaborator contributions and later review fixes; a merge-commit author alone is not a complete attribution record.

## What the work delivered

**Hosting and review infrastructure.** PRs #1 and #2 established a hosted application and cloud tests with a dedicated test database, source-review gates and mobile/desktop design evidence. PR #4 improved the reliability of live verification. PR #18 then exercised the hosted review, merge, deployment and live-verification path, including the Vercel identity and workflow-discovery corrections.

**Civic workflows and design.** PR #3 brought the approved map, Resources, Directory and meetup work together. PRs #10 and #11 applied the shared visual system and Profile organization. PRs #15–#17 preserved draft recovery, established the four-item navigation and improved mobile scrolling. PR #19 was cancelled and did not restore Resources to navigation.

**Layalabs' Reporting and contribution work.** Layalabs opened the AI-review and verification proposals in #6 and #8, consolidated them in merged PR #12, documented the release procedure in #13, and contributed the public leaderboard in #14. Review and follow-up fixes retained privacy and guest access and corrected the leaderboard's category ranking. Optional phone-verification code is historical implementation evidence, not permission to enable sign-ins.

**Homepage and meetup participation.** PRs #20, #21 and #24 introduced the homepage and refined its responsive layout and motion. PRs #22 and #23 added QR attendance/points receipts and simplified the meetup RSVP flow. These changes retained the existing guest identity and permission boundaries.

## Merged pull requests

These PRs merged on 29–30 October 2026. “Merged” records Git integration; it is not, by itself, proof that a specific deployment was verified.

| PR | PR author | Work included | Merge commit |
| --- | --- | --- | --- |
| [#1: Add protected shared QA deployment on Vercel](https://github.com/Go4Goa/Go4Goa/pull/1) | [ZakKrevitt](https://github.com/ZakKrevitt) | Established the Vercel shared QA application, serverless API, separate database, private photo storage, access checks and hosted Reporting smoke tests. The original password gate was later removed by #9. | [`5720810`](https://github.com/Go4Goa/Go4Goa/commit/5720810672f78e9aa96e0de7aa287c5236ac158e) |
| [#2: Add cloud Reporting tests, design evidence and release verification](https://github.com/Go4Goa/Go4Goa/pull/2) | [ZakKrevitt](https://github.com/ZakKrevitt) | Added GitHub-hosted tests, an isolated test database, production builds, Impeccable evidence, baseline/candidate screenshots and exact-head source-review gates. | [`ce16b40`](https://github.com/Go4Goa/Go4Goa/commit/ce16b40b0e42f29ba304ea20beb22153c412a2bf) |
| [#3: Release approved map, meetup, Resources and Directory work](https://github.com/Go4Goa/Go4Goa/pull/3) | [ZakKrevitt](https://github.com/ZakKrevitt) | Integrated the approved sparse map, compact navigation, Resources and Directory, meetup creation/recurrence/publishing/sharing, poster customization and draft recovery. | [`6d68f9c`](https://github.com/Go4Goa/Go4Goa/commit/6d68f9cf1e005613edc7c4563c8c824e7d2b3101) |
| [#4: Fix live verification selectors and wait for loaded surfaces](https://github.com/Go4Goa/Go4Goa/pull/4) | [ZakKrevitt](https://github.com/ZakKrevitt) | Fixed live-check selectors and waited for loaded maps, lists and fonts before taking release screenshots. | [`912d741`](https://github.com/Go4Goa/Go4Goa/commit/912d7416335687fa806f26042fc0f8dcdf5940eb) |
| [#9: Open the preview to guests without passwords or sign-in](https://github.com/Go4Goa/Go4Goa/pull/9) | [ZakKrevitt](https://github.com/ZakKrevitt) | Opened the shared preview without passwords or sign-in screens, using separate automatic guest sessions while retaining private-data, CSRF and moderator boundaries. | [`26515cd`](https://github.com/Go4Goa/Go4Goa/commit/26515cdc5a2cdcd08137c2738d1fbf283a8bba60) |
| [#10: Apply the clean Resources layout across the app](https://github.com/Go4Goa/Go4Goa/pull/10) | [ZakKrevitt](https://github.com/ZakKrevitt) | Extended the approved Resources spacing and layout across the app and separated Profile activity from Preferences. Later guest-access policy supersedes its historical sign-out UI. | [`ef55966`](https://github.com/Go4Goa/Go4Goa/commit/ef559668cd208703a9e865f46925583fa6a79d80) |
| [#11: Keep Profile active while viewing Preferences](https://github.com/Go4Goa/Go4Goa/pull/11) | [ZakKrevitt](https://github.com/ZakKrevitt) | Kept Profile selected in the dock on nested Preferences routes. | [`1f81579`](https://github.com/Go4Goa/Go4Goa/commit/1f815793e54550266e2f724421b2255b179d6c89) |
| [#12: Add AI report review and guarded phone sign-in](https://github.com/Go4Goa/Go4Goa/pull/12) | [layalabs](https://github.com/layalabs) | Combined the earlier AI-review and guarded phone-verification proposals, including moderation decisions, duplicate handling, privacy tests and migration 009. Merging optional verification code does not authorize enabling sign-ins. | [`e2a1d62`](https://github.com/Go4Goa/Go4Goa/commit/e2a1d622b3aac809ae687ecfb48fac7b7b008c1e) |
| [#13: Document PR #12 migration and Vercel release](https://github.com/Go4Goa/Go4Goa/pull/13) | [layalabs](https://github.com/layalabs) | Documented migration and Vercel release checks, backups, source identity and the requirement to keep phone verification disabled. | [`c8982c1`](https://github.com/Go4Goa/Go4Goa/commit/c8982c195edfabf97be6c7f8a6ab38a75499185f) |
| [#14: Add public contribution leaderboard](https://github.com/Go4Goa/Go4Goa/pull/14) | [layalabs](https://github.com/layalabs) | Added the approved public contribution leaderboard and header link; fixed category-specific top-100 ranking so Reports and Meetups leaders are not omitted by the overall limit. | [`55eec8c`](https://github.com/Go4Goa/Go4Goa/commit/55eec8cca653806efb46276cc7b2cd9bd1de836b) |
| [#15: Keep meetup draft recovery check compatible with four-item navigation](https://github.com/Go4Goa/Go4Goa/pull/15) | [ZakKrevitt](https://github.com/ZakKrevitt) | Kept meetup draft-recovery QA compatible with the four-item dock by navigating through Map instead of Resources. | [`932e2df`](https://github.com/Go4Goa/Go4Goa/commit/932e2dff597d6358819f40ad1b000a651d00554e) |
| [#16: Set approved navigation to Meetups, Map, Document, Profile](https://github.com/Go4Goa/Go4Goa/pull/16) | [ZakKrevitt](https://github.com/ZakKrevitt) | Set Meetups, Map, Document and Profile as the primary dock destinations, removing Resources from the dock while retaining its pages and Directory routes. | [`bda37e2`](https://github.com/Go4Goa/Go4Goa/commit/bda37e206b87886699a70f1cbbb604437d6c0951) |
| [#17: Keep the mobile page steady during sideways swipes](https://github.com/Go4Goa/Go4Goa/pull/17) | [ZakKrevitt](https://github.com/ZakKrevitt) | Stopped horizontal document movement on mobile while retaining vertical scrolling, map dragging and pinch zoom. | [`d6de86c`](https://github.com/Go4Goa/Go4Goa/commit/d6de86cf5df74e5261836db7d5028bb16d42dc54) |
| [#18: Fix cloud release identity, workflow discovery and owner approval sync](https://github.com/Go4Goa/Go4Goa/pull/18) | [ZakKrevitt](https://github.com/ZakKrevitt) | Fixed genuine owner merge identity for Vercel, trusted QA run discovery, owner-approval synchronization and loaded-map visual fixtures; commissioned the complete hosted release path. | [`7d30c50`](https://github.com/Go4Goa/Go4Goa/commit/7d30c50463c965072a46d920f030d4bb1d974648) |
| [#20: Add Go4Goa homepage and move the map to /map](https://github.com/Go4Goa/Go4Goa/pull/20) | [ZakKrevitt](https://github.com/ZakKrevitt) | Added the Go4Goa homepage at /, moved the operational map to /map, and integrated separate homepage/app builds and offline routing. | [`e37a98c`](https://github.com/Go4Goa/Go4Goa/commit/e37a98c134f7b0a2da11c70ff1a63ed3be68d231) |
| [#21: Keep homepage artwork clear of tablet headlines](https://github.com/Go4Goa/Go4Goa/pull/21) | [ZakKrevitt](https://github.com/ZakKrevitt) | Adjusted the homepage artwork at tablet widths so it stays clear of the headline. | [`c29783a`](https://github.com/Go4Goa/Go4Goa/commit/c29783a1e95a7ace86c80062a4c4076455380054) |
| [#22: Add meetup QR check-in and profile points receipts](https://github.com/Go4Goa/Go4Goa/pull/22) | [ZakKrevitt](https://github.com/ZakKrevitt) | Added host-controlled QR check-in, atomic attendance/capacity handling, one-time attendance points, profile receipts and additive migration 010. | [`044e26b`](https://github.com/Go4Goa/Go4Goa/commit/044e26b8489b8a872d1f53b520ed9ee8d34d8eb2) |
| [#23: Simplify meetup RSVP layout and optional settings](https://github.com/Go4Goa/Go4Goa/pull/23) | [ZakKrevitt](https://github.com/ZakKrevitt) | Simplified meetup RSVP hierarchy and optional reminder/calendar disclosures while preserving consent, accessibility and recovery states. | [`da47a4c`](https://github.com/Go4Goa/Go4Goa/commit/da47a4c3a3b79eb5d01cdca9a74e6e7728ac6741) |
| [#24: Keep homepage motion responsive and remove Shared QA header copy](https://github.com/Go4Goa/Go4Goa/pull/24) | [ZakKrevitt](https://github.com/ZakKrevitt) | Improved homepage scroll and nested-preview behavior while preserving animation, and removed visible Shared QA header copy without changing access controls. | [`0de2490`](https://github.com/Go4Goa/Go4Goa/commit/0de2490e5054526a6b213ea60505159c34ddf4b2) |

## Closed without merging

These proposals are included for an honest account of the work and its review history. They are not counted as merged deliveries.

| PR | PR author | Outcome |
| --- | --- | --- |
| [#6: Add automated AI moderation for new issue reports](https://github.com/Go4Goa/Go4Goa/pull/6) | layalabs | Superseded by the consolidated #12. |
| [#8: Enable guarded Twilio sign-in for hosted QA](https://github.com/Go4Goa/Go4Goa/pull/8) | layalabs | Superseded by #12. Current owner policy keeps sign-ins off. |
| [#19: Restore the Resources tab](https://github.com/Go4Goa/Go4Goa/pull/19) | ZakKrevitt | Cancelled at the owner's request before merge or deployment. Its branch documents are not approved design authority. |

## Verification and release evidence

The original PRs contain their validation notes. The following records give more specific evidence for selected milestones:

- **Public guest access:** the [verified public-guest release record](https://github.com/Go4Goa/Go4Goa/blob/6fdfd44e5880afd5642726654a8f9bed0b4db806/releases/2026-10-29-public-guest.json) records the transition away from password/sign-in access. Early PR descriptions referring to a protected site describe the earlier state.
- **Leaderboard:** the [PR #14 release record](https://github.com/Go4Goa/Go4Goa/blob/6fdfd44e5880afd5642726654a8f9bed0b4db806/releases/2026-10-30-pr14-leaderboard.json) records 48 unit tests, 18 isolated database scenarios, 11 harness tests, 54 design comparison pairs and 33 live captures. It distinguishes the PR #14 merge from the owner-authored release commit and records the category-ranking regression fix.
- **Cloud release commissioning:** the [PR #18 release record](https://github.com/Go4Goa/Go4Goa/blob/6fdfd44e5880afd5642726654a8f9bed0b4db806/releases/2026-10-30-pr18-cloud-commissioning.json) binds reviewed head/base/integrated/merged commits to [candidate QA](https://github.com/Go4Goa/Go4Goa/actions/runs/41010217318), [merged-main QA](https://github.com/Go4Goa/Go4Goa/actions/runs/41010781531) and [live verification](https://github.com/Go4Goa/Go4Goa/actions/runs/41011272232). It records 54 complete baseline/candidate pairs and 33 live views at 320, 390 and 1440 pixels, plus deployed source identity and public guest/privacy checks.
- **QR attendance:** [PR #22](https://github.com/Go4Goa/Go4Goa/pull/22) records 50 unit tests, 22 isolated database scenarios, screenshot-decoded QR codes and hosted checks for duplicate scans, attendance points and closed-code rejection, with its [cloud run](https://github.com/Go4Goa/Go4Goa/actions/runs/41019467860). Physical phone-camera scanning was explicitly not verified.

These are dated records of the named commits, not a claim that every historical screenshot artifact remains downloadable or that all external providers and physical devices are certified. GitHub artifact retention is finite; committed JSON receipts preserve the run IDs, source identities and recorded outcomes.

## Current owner decisions

The [recorded owner decision](https://github.com/Go4Goa/Go4Goa/blob/342d49b867a7b7a48727a6ed33bbbf860c307b7b/decisions/2026-10-30-primary-navigation-no-resources.json) and [monitor synchronization receipt](https://github.com/Go4Goa/Go4Goa/blob/979335f3f7381be334bbe855c3b0661c08dfaa69/review-checkpoints/2026-10-30-primary-navigation-monitor-sync.json) make the current constraints explicit:

- Zachary owns design. Reporting feature/UX work must preserve the approved visual system and newer owner decisions.
- Primary app navigation remains Meetups, Map, Document and Profile. Resources stays out of the dock and header; existing Resources and Directory pages may remain available through contextual links.
- Public visitors use separate automatic guest sessions. Keep sign-in/out UI, passwords, phone/email onboarding and manual team login off, with `phoneVerification=false`.
- Preserve private-data separation, CSRF, moderator restrictions and protected automated-QA credentials.

This historical note does not change application behavior, authorize deployment, or establish that an event subscription has been tested after the repository transfer. Repository access, saved monitor scope and actual event delivery are separate checks.

## How this note was checked

GitHub's repository metadata, all PR pages through #24, their authors/merge status/merge SHAs, the linked committed release records and Git ancestry were checked on 30 October 2026. The PR inventory was not reconstructed from titles alone. Application tests were not rerun for this documentation-only note.
