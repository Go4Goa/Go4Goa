# ActForGoa Directory port

Source: ActForGoa-website, commit `a5355bcbd6abcc8d881d1104af3f5f8910f390fd`, extracted read-only on 29 October 2026.

Ported `crm-model.ts`, `crm-directory.ts`, `directory-quality.ts`, `polytechnic-directory.ts` and their three curated JSON maps. `types.ts` retains only the DirectoryDetails shape. Go4Goa changes the browser storage key and defaults collection to all; its interface and group/search adapter are local. Existing ActForGoa browser notes are never read. The original version-1 CRM backup format is retained for explicit import/export. Source code reuse is authorized for this development port; this does not relicense upstream content or photos. No photos are copied or displayed.

Local search adaptations include query synonyms in `crm-model.ts` for sanitation, garbage/trash, recycling, environmental terms, collection, officials, organisations and companies. `shared/directory.ts` strips common question filler, adds audience and sector filtering, sorts unqueried results and collapses known upstream identity groups. These are local changes, not a claim that the copied source remains unmodified.

`shared/civic-scope.ts` limits discovery to trash and infrastructure using explicit topical terms. Broad environmental or civic labels alone do not qualify. `directorySectors` also avoids qualifying a biodiversity committee solely through its parent organisation. The server applies the sector boundary to its public response, and the local search adapter applies it again before rendering results. Resources uses the same scope boundary for its content.

The server retains a complete membership snapshot using only allowlisted public listing fields, applies the dated Polytechnic corrections, and withholds individual/volunteer direct contact details before storage. Only the scoped projection is returned to the Directory client. Institutional public routes carry source and untested-delivery notices. A successful refresh is not fresh contact verification. The ActForGoa source checkout is read-only and was not edited for this port.
