# Vite → Next.js Migration Summary

This project is a real Next.js App Router application. The previous Vite entry point, React Router configuration, `index.html`, `vite.config.ts`, and `VITE_*` runtime configuration are not part of this project.

## Main architecture decisions

- `app/` contains route definitions and layouts only.
- `features/` contains actual screens and feature-owned UI.
- `components/` contains reusable app-wide UI/layout/navigation.
- `services/` is the feature-based FastAPI service layer.
- `lib/` contains the shared API client, transport contracts/adapters, formatting, permissions, and navigation helpers.
- Role-specific report/dashboard UIs use `member/` and `admin/` folders.
- `admin/` is the management-side UI shared by Manager and Admin where behavior is the same.
- Services are not duplicated by role.

## Preserved functionality

- FastAPI JWT authentication
- Team Member / Manager / Admin RBAC behavior
- Weekly report create/edit/submit workflow
- Correction and resubmission flow
- Manager/Admin review and approval
- Version history
- Projects and member assignment
- User administration and direct account creation
- Team member screens
- Dashboards and analytics
- AI assistant and Markdown rendering
- Existing calm professional full-screen visual design

## Verification performed during migration

- 43/43 migrated unit/service tests passed.
- 98 TypeScript/TSX files passed syntax compilation checks.
- All mapped internal imports were checked for missing targets.
- No React Router or Vite runtime dependency remains.

Run `npm install`, then `npm run typecheck`, `npm test`, and `npm run build` on the target machine for dependency-aware final verification.
