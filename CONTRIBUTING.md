# Working together

## Ownership

| Area | Lead |
| --- | --- |
| Reporting QA, report capture, location/privacy, submission, report status and reporting moderation | Partner |
| General design, navigation and shared visual system | Zachary and Codex |
| Event creation, discovery, RSVP, organizer tools and attendance | Zachary and Codex |
| Shared API, authentication and database changes | Coordinate in the issue before editing |

This ownership is a coordination convention, not an enforced GitHub permission rule. Repository access is already arranged by the owner. Branch protection is not yet configured.

## One feature, one branch, one pull request

1. Start with `git switch main` and `git pull --ff-only`.
2. Create an issue for the feature or reproducible bug. Include expected/actual behavior, steps, browser, commit and a safe screenshot. Never upload a real phone, personal photo, precise private location, `.env`, session cookie or API key.
3. Create a branch, for example `git switch -c qa/reporting-photo-retry`. Keep work focused on that issue.
4. Run the relevant checks. For code changes run `npm test`, `npm run test:integration` and `npm run build`. For reporting changes, repeat the corresponding manual test cases in the handoff.
5. Commit and push the branch. Open a pull request into `main`, link the issue and state the checks actually run.
6. Ask the other collaborator to review. Agree before merging; use squash merge. Pull updated `main` before the next branch.

Do not push daily work directly to `main`, force-push `main`, merge your own unreviewed changes, or commit generated data and local secrets. The initial baseline is a single bootstrap commit because the repository was empty.

The Reporting QA lead should file findings first. Small agreed reporting fixes may use a separate PR. Changes to shared design, navigation, events or schema need coordination before implementation. Never modify ActForGoa or Dizko as part of this project.

## Useful commands

```sh
git status
git switch main
git pull --ff-only
git switch -c qa/reporting-location-privacy
npm run dev
# After making a focused change:
npm test
npm run test:integration
npm run build
git add path/to/changed-file
git commit -m "Fix reporting location privacy behavior"
git push -u origin qa/reporting-location-privacy
```

If both branches need the same file, agree who owns the change before editing. Pull requests should explain the user-visible behavior, test evidence and remaining limits. A green CI run does not replace the partner's browser QA.
