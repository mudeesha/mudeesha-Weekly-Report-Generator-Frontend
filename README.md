# Weekly Report Generator — Next.js Frontend

A real **Next.js App Router + TypeScript** frontend for the Weekly Report Generator and Team Dashboard. It connects to the existing FastAPI backend and keeps the calm professional UI, role-based workflows, dashboards, report version history, and Gemini-backed AI assistant.

## Stack

- Next.js App Router

- React + TypeScript

- Tailwind CSS

- Recharts

- Sonner

- React Markdown + remark-gfm

- FastAPI REST backend

## Local setup

Requirements: Node.js 20.9+ and the FastAPI backend running locally.

```bash

cp .env.example .env.local

npm install

npm run dev

```

Open **http://127.0.0.1:3000**.

By default the browser calls `/api/v1`. Next.js rewrites those requests to `http://127.0.0.1:8000/api/v1`, so local development stays same-origin and does not need a separate browser-side API host.

```env

BACKEND_API_URL=http://127.0.0.1:8000

NEXT_PUBLIC_API_BASE_URL=/api/v1

```

`BACKEND_API_URL` is server-side configuration. Never put backend secrets, Gemini keys, JWT signing secrets, or database credentials in `NEXT_PUBLIC_*` variables.

## Commands

```bash

npm run dev

npm run typecheck

npm test

npm run build

npm start

npm run lint

npm run test:browser

```

## Folder structure

```text

app/                    Next.js routes and route layouts only

components/             App-wide reusable UI/layout/navigation

features/               Feature screens and feature-specific components

reports/

components/member/  Team-member report UI

components/admin/   Manager/Admin report-review UI

components/shared/  Report UI reused by both sides

services/               FastAPI communication grouped by feature

lib/                    Shared infrastructure, adapters, formatting, permissions

hooks/                   Cross-feature hooks

providers/               App-wide React data provider

public/                  Static assets

tests/                   Unit and browser tests

types/                   Shared application models

```

### Layer flow

```text

Next.js route

↓

Feature page

↓

Role-specific / shared feature components

↓

Service

↓

Shared API client

↓

FastAPI

```

The service layer is **feature-based, not role-based**. For example, both Team Member and Manager/Admin report UIs use `services/report.service.ts`, but they expose different actions through their role-specific UI.

## Role UI separation

Large UI differences are separated; small differences use permission-aware rendering.

- `features/reports/components/member/` — editing, correction, submission

- `features/reports/components/admin/` — review, approve, request changes

- `features/reports/components/shared/` — report content, tables, history, task display

The `admin` folder represents the management-side UI shared by both `MANAGER` and `ADMIN` where their workflow is the same.

## Route access

| Feature | Team Member | Manager | Admin |

|---|---:|---:|---:|

| Dashboard | Yes | Yes | Yes |

| My reports/create/edit | Yes | No | No |

| Team reports/review | No | Yes | Yes |

| Projects | Read-only | Manage | Manage |

| Team members | No | Yes | Yes |

| User administration | No | No | Yes |

| Analytics | No | Yes | Yes |

| AI assistant | No | Yes | Yes |

FastAPI remains the final authorization boundary. Frontend route guards and hidden actions improve UX but do not replace backend RBAC.

## Authentication

The existing FastAPI JWT flow is preserved. The token is stored in `sessionStorage` and sent as a Bearer token by `lib/api-client.ts`. Because the token is browser-side, route protection is implemented with a client `AuthGuard`/`RoleGuard` rather than pretending server middleware can read it.

## AI assistant

The frontend calls only:

```text

POST /api/v1/ai/chat

```

The Gemini key remains in the FastAPI backend. Assistant replies are rendered as Markdown. Conversation history is bounded before it is sent to the backend, and the UI displays only the report count used for the answer.

## Verification

The migrated service/utility test suite contains **43 tests** and passes against the migrated modules. The project also has a Playwright browser suite configured for the Next.js development server on port 3000.

After installing dependencies on your machine, run:

```bash

npm run typecheck

npm test

npm run build

```