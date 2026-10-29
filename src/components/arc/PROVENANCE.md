# Arc component provenance

These components are the actual free component source from Arc UI (https://uiarc.dev), retrieved 22 October 2026 through its public registry, using its documented manual-copy workflow.

| Item | Registry source |
| --- | --- |
| SiteHeader | https://uiarc.dev/r/site-header.json |
| Foundation | https://uiarc.dev/r/arc-foundation.json |
| Motion tokens | https://uiarc.dev/r/arc-motion-tokens.json |
| Button | https://uiarc.dev/r/button.json |
| SearchField | https://uiarc.dev/r/search-field.json |
| SegmentedControl | https://uiarc.dev/r/segmented-control.json |
| Input | https://uiarc.dev/r/input.json |
| Textarea | https://uiarc.dev/r/textarea.json |

Goa theme tokens are supplied in src/styles.css. Requested adaptations: search shell has no border, text-field focus uses a background change, clear button has a 44px target and returns focus without scrolling, segmented controls have an open track without border/shadow, and keyboard changes use immediate selection rather than animated movement. Names, native controls, ARIA, label relationships, reserved clear-button space, overflow behavior and reduced-motion handling come from Arc.

Emil Kowalski's actual design-engineering skill informed the interaction pass: https://github.com/emilkowalski/skill/tree/main/skills/emil-design-eng. Local Impeccable supplies the design workflow and rendered review. The project keeps its approved upright type and stronger topic weights, rather than Arc's default typography. Brand copy and source titles remain intact.

SiteHeader uses React Router Links for local destinations and ordinary images in Vite. Its original demo is removed. Desktop dropdowns open on click, switch on pointer movement while open, support arrow navigation and Escape, and return focus without scrolling. The narrow menu traps focus while open. Static active indicators avoid shared-layout artifacts during scroll restoration; Goan typography and 44px targets replace the sample theme.

## GO-GOA dev refinement, 29 October 2026

Official UIArc source added from https://uiarc.dev/r/select.json, https://uiarc.dev/r/checkbox.json and https://uiarc.dev/r/switch.json. SearchField is the attributed UIArc source inherited read-only from ActForGoa. Its optional hideLabel prop keeps the accessible label while allowing a compact search toolbar. Checkbox preserves externally supplied label and description semantics; Switch has a visible focus ring. Button exposes its label slot for vertical choice layouts. All controls share the GO-GOA Helvetica Neue, rounded-control and accent tokens. Underlying Radix dependencies are part of UIArc, not a second visual library. No reference repository was modified.

Shared Alert, Badge, Skeleton and EmptyState use the attributed UIArc implementations in the ActForGoa reference repository. ButtonLink is a semantic React Router anchor adapter that reuses the UIArc Button variant classes. Primary actions use green #177548 with white text; the map and navigation retain civic green.

## Meetup editor extension, 29 October 2026

Input, Textarea, Calendar, DatePicker, TimePicker, NumberField and InlineEdit were fetched from the official registry: [input](https://uiarc.dev/r/input.json), [textarea](https://uiarc.dev/r/textarea.json), [calendar](https://uiarc.dev/r/calendar.json), [date picker](https://uiarc.dev/r/date-picker.json), [time picker](https://uiarc.dev/r/time-picker.json), [number field](https://uiarc.dev/r/number-field.json) and [inline edit](https://uiarc.dev/r/inline-edit.json). Raw responses were retained locally as `/tmp/go-goa-arc-<name>.json`. Component source was copied from these responses, and Input/Textarea CSS was restored to the official source. Earlier component provenance above remains applicable.

The user approved Arc's original appearance for this form. `src/pages/event-create.css` scopes its foundation typography, neutral colors, heights and radii to the editor and its portal menus, retaining Inter/Geist and the rounded controls. The civic-green preview remains. Component CSS stays as supplied, except Calendar's `.day` uses `--focus-outline-offset: -3px` and selected days use `--focus-outline: var(--accent-foreground)` to keep keyboard focus visible inside the clipped month animation. InlineEdit adds an optional `onDraftChange` callback on typing and cancel so the live preview follows the draft and restores the saved text on cancellation. The final surface review cleared this focus correction; see `.impeccable/surfaces/meetup-create.md` for evidence and scope.
