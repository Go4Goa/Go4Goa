# Act For Goa guided resources

Imported on 29 October 2026 from `actforgoa2026/ActForGoa-website`, revision `a5355bcbd6abcc8d881d1104af3f5f8910f390fd`. The existing `origin/main` was checked against `git ls-remote`; no reference repository files or refs were changed.

- `topic-flows.ts` is the upstream `src/topic-flows.ts` snapshot, with a provenance comment. All eight topic labels, questions, branches, practical steps and action links are retained.
- `template-path.ts` retains the upstream template route helper.
- `TopicIcon.tsx` adapts the upstream Lucide icon mapping to GO-GOA sizes.
- `records.json` contains only the 57 explicitly referenced catalogue titles, IDs, kinds and source URLs from that revision's public catalogue. It contains no phone numbers, email lists, article bodies, private CRM data or images. The UI links to the upstream presentation for full evidence and contact details.
- `guide.ts` maps cross-topic routes into GO-GOA and leaves articles, forms and official services with their original owner. The existing server-synced resource directory remains at `/resources/directory`, including compatibility with `/resources?category=...` report links.
- Emergency service labels and numbers follow upstream `src/EmergencyServices.tsx`. North Goa and Goa Tourism listings were checked on 29 October 2026. 112 coverage was corroborated by official 112 search results, the Goa Police control-room page and the Ministry of Home Affairs ERSS page; direct 112 website reads timed out. No phone calls were made.

This is a pinned content snapshot, not an automatic flow sync or a new verification of each service. Retain the visible source and availability caveats. Future flow updates should use a reviewed upstream revision and rerun route/anchor tests. This user-authorized reuse is for local development; no deployment or change to upstream ownership is implied.

Sources: https://northgoa.gov.in/helpline/ , https://goa-tourism.com/important-numbers/ , https://citizen.goapolice.gov.in/web/guest/state-police-control-room , https://www.mha.gov.in/en/commoncontent/nirbhayaerss-section

## Subsequent scope correction

The user's later instruction in “Add Directory to bottom nav” restricts Go4Goa to trash and infrastructure. `guide.ts` now exposes Trash & recycling plus Infrastructure (roads, construction concerns, water supply and pollution). Other snapshot topics are retained solely as attributed source material, with no local menu, search result or answer route. The source link for each infrastructure answer still points to the original planning or water route. Linked attribution and “Need more resources? Visit ActForGoa” lead to the wider field guide. Emergency actions are limited to 112 and electricity. This supersedes the initial eight-topic presentation described in the build's original request.
