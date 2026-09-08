# WorkReport Calm Professional UI Redesign

This frontend has been fully restyled around the supplied CRM reference while preserving the existing Next.js App Router structure and the real FastAPI integration.

## Design direction

The final UI deliberately avoids a decorative or "template dashboard" appearance.

- Deep purple sidebar: `#272163`
- Pale lavender workspace: `#f6f2fe`
- White content surfaces
- Primary purple accent: `#594dba`
- Calm green, orange and red reserved for status meaning
- Arial / Helvetica system sans-serif stack; no bundled or remote font files
- Compact 11–13px body/control typography and 22–24px page titles
- Subtle 10–12px card radii and restrained shadows
- Compact 32–36px controls instead of oversized inputs and buttons
- Compact status badges with plain text and a small color indicator where useful
- Outline icons with consistent visual weight
- Icon-only row actions for view, edit, delete/deactivate and member management
- No notification bell
- No light/dark theme switcher
- One fixed light workspace matching the supplied reference

## Tables and filters

Tables are designed as clear enterprise data tables rather than card lists:

- Distinct but subtle header band
- Consistent column alignment
- Thin row separators
- Compact row height
- Quiet hover treatment
- 32px icon-only action controls
- Compact pagination

Filter areas are shallow and functional:

- 32–36px controls
- No oversized filter card title/header
- Responsive wrapping on narrow screens
- Server-side report filtering behavior is unchanged

## Role coverage

The same design system is applied to Team Member, Manager and Admin views, including:

- Dashboard
- My Reports / Team Reports / Report History
- Report create/edit/detail/version history
- Projects and member assignment
- Team member directory and detail
- User administration and direct account creation
- Analytics
- Profile
- Login, registration and account access
- Loading, empty and error states

## Backend boundary

No backend code, database schema, migration or API contract was changed.

Profile name/email/password editing remains read-only because the current backend does not provide those update endpoints. The Manager/Admin AI Assistant is connected to the real `/api/v1/ai/chat` endpoint and follows the same calm compact design system without oversized chat bubbles or decorative AI UI.

## Full-screen layout update
The application now uses the full browser viewport on desktop and mobile. The previous centered presentation frame, outer dark background, large desktop margin, shell max-width, outer rounded corners, and shell drop shadow were removed. Authentication screens use the same full-screen behavior.
