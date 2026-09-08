# FastAPI Integration

The Next.js frontend uses the existing FastAPI API without introducing a second application backend.

## Request path

```text
Browser
  ↓ /api/v1/...
Next.js rewrite
  ↓
FastAPI
```

`next.config.ts` reads `BACKEND_API_URL` and proxies `/api/v1/:path*` to the FastAPI server. `NEXT_PUBLIC_API_BASE_URL` defaults to `/api/v1`.

## Service layer

API endpoint groups are isolated in `services/`:

- `auth.service.ts`
- `report.service.ts`
- `project.service.ts`
- `user.service.ts`
- `dashboard.service.ts`
- `analytics.service.ts`
- `ai.service.ts`

Shared HTTP/token/error behavior lives in `lib/api-client.ts`. API response contracts and adapters live in `lib/api-contracts.ts` and `lib/api-adapters.ts`.

## Authentication

Login uses the FastAPI OAuth-style form endpoint. The access token remains browser-side in `sessionStorage` and is added to protected requests as `Authorization: Bearer <token>`.

A `401`, or the backend's inactive-account `403`, clears the current session. Ordinary permission `403` responses do not silently log the user out.

## Reports

The frontend preserves the backend workflow:

```text
DRAFT → SUBMITTED → NEEDS_CORRECTION → SUBMITTED → APPROVED
```

Team members edit their own draft/correction content. Manager/Admin users review submitted content and cannot rewrite the member's report. Version-specific history is preserved.

## AI

The browser never talks to Gemini directly. It sends the manager question and bounded conversation history to `/ai/chat`. Gemini credentials and grounded report retrieval remain entirely in FastAPI.
