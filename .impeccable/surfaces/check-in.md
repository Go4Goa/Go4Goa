# Profile points and meetup check-in

Mode: Operate. Local extension of the established GO-GOA profile and meetup detail.
Primary target: src/pages/CheckIn.tsx. Related: src/components/MeetupCheckIn.tsx, src/pages/Profile.tsx, src/pages/Events.tsx.

## Direction contract

THESIS: Showing up becomes a clear, deliberate attendance receipt linked to a profile. Keep the host's QR and attendee's confirmation simple enough to use outdoors.

OWN-WORLD: Inherit white, civic green, upright Helvetica Neue, open sections and official UIArc actions. The machine-readable QR is black on white with its required quiet zone.

STORY: A host opens check-in, displays the QR and sees the count. A resident scans with their phone camera, confirms the named meetup, and sees +15 points once. Closed, expired, full and already-confirmed states explain the next action.

FIRST VIEWPORT: Host controls live at the beginning of Organizer tools; the open code is large and centered, followed by expiry and close controls. The attendee sees the meetup name, location, time, +15 and a single confirmation action. Profile keeps activity first and follows with legible point rules and linked award history.

RESPONSIVE: The enlarged QR shrinks within the available dialog height, preserving its square image and quiet zone while keeping the title, close action, instructions and expiry visible in short windows.

FORM: Code-led narrow extension, no seed required. Use the accepted +10 approved report, +20 resolved report, +15 confirmed attendance values. Preserve guest access and current navigation. No new identity flow.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
