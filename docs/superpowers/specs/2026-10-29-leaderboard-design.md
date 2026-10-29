# Public leaderboard design

## Intent

Give residents a public view of verified civic contributions. Show points, approved or resolved reports, and confirmed meetup attendance.

## Goals

- Use public pseudonymous usernames only.
- Rank residents by total points, report count, or meetup count.
- Explain each verified point award.
- Keep the five-item bottom navigation.
- Use the current GO-GOA design system on mobile and desktop.

## Limits

- Do not show account IDs, phone numbers, email addresses, or private report data.
- Do not count pending reports, RSVP records, or unverified attendance.
- Do not give points a cash value.
- Do not add rewards, prizes, levels, or new point rules.

## Approaches

1. Add a sixth bottom navigation item. This gives direct access but makes the mobile navigation too dense.
2. Add a header link. This keeps the main task navigation stable and gives the leaderboard a visible global position.
3. Add a Profile card. This fits personal progress but makes the public leaderboard harder to find.

The selected approach uses a header link. The Shared QA label moves below the GO-GOA wordmark.

## Behavior

The server reads only immutable point awards for active accounts. The API returns public usernames and aggregate contribution values.

The page opens with the overall ranking. A segmented control changes the ranking to reports or meetups without a new request.

Competition ranking gives equal primary values the same rank. Stable secondary values set the display order for equal ranks.

The page has loading, error, and empty states. The layout keeps clear labels and readable values at 320 pixels.

## Verification

Test the ranking rules and the public API projection. Run the full unit, integration, type, and production build checks.

Inspect the rendered header and leaderboard at desktop and phone sizes. Check keyboard focus, overflow, and accessible names.
