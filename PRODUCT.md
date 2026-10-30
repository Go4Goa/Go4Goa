# GO-GOA
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Delegated by the user on 29 October 2026: React, TypeScript, Vite, Node API, PostgreSQL/PostGIS and S3-compatible object storage. Local-first implementation in `/Users/zakkrevitt/code/GO-GOA`. The user will coordinate deployment separately through the orchestrator.

## Users
Goa residents reporting civic problems and joining local action, community meetup organizers, and moderators. Mobile use outdoors and on weaker networks is the primary setting.

## Product Purpose
Make photo-based trash and infrastructure reports visible safely, connect them to practical source-backed resources, and organize public civic events.

## Operating Context
A map is the operational center, with an accessible list. Reports move through moderation before publication. Meetups publish immediately for their creators, with a dedicated page and share link; organizer approval is not required. The current shared QA site is public and automatically gives each browser a separate resident guest session. Do not add passwords, sign-in/out screens, phone/email onboarding or a manual team login. Private data, CSRF and role restrictions remain required. Public identity is pseudonymous. Phone verification remains disabled unless Zachary explicitly changes this decision. All event dates display in Asia/Kolkata.

## Capabilities and Constraints
The supplied brief governs reporting, exact/blurred location, moderation, events, capacity, calendar export, attendance, consent-based notifications, immutable points, resources, offline states and account controls. Never claim an upload succeeded before server acceptance. Separate private and public data. Never modify the reference repositories. Never use Device Hub without explicit approval for that occasion.

Resources and Directory cover trash and infrastructure only. A Directory button in Resources opens the authorized ActForGoa community search and CRM port, with source evidence and browser-local notes. The bottom navigation is Meetups, Map, Document and Profile; Document opens the existing report flow, and Resources remains outside the dock. Directory rows prioritize a name, short description and useful location. Both surfaces link header attribution to ActForGoa and place “Need more resources? Visit ActForGoa” below the content. The Resources footer contains only that bold onward link. Wider environmental or civic subject matter alone does not qualify a listing for these surfaces.

## Brand Commitments
Inherit Act For Goa's actual visual system and UIArc/shadcn controls. Calm, civic, local and minimal. Upright type only. No eyebrow text, em dashes, sideflag containers or fabricated impact metrics. Keep the four approved bottom navigation items: Meetups, Map, Document and Profile. On 30 October 2026 Zachary approved public contribution rankings and the shared header change, superseding the earlier no-gamified-rankings restriction. The header links to a public leaderboard that uses only verified point awards. The environment label sits below the wordmark. Profile includes points earned from approved reports, resolved reports and confirmed meetup attendance.

## Evidence on Hand
Source inspection is recorded in `docs/repository-intake.md`. Local seed reports and events are fictional. Act For Goa resource evidence is real but carries availability and verification caveats. No real user photos or production credentials are provided.

## Product Principles
Privacy is enforced by server projections. A report leads to useful next actions. Moderation decisions remain auditable. Notifications require verified channels and explicit consent. Failures remain visible and recoverable.

## Accessibility & Inclusion
Large touch targets, semantic labels, keyboard focus, reduced motion, readable contrast and list/coordinate alternatives to maps. No color-only status communication.
