Weekly Report Generator - Frontend

Frontend application for the Weekly Report Generator & Team Dashboard.

Technology Stack

Next.js 16

React

TypeScript

Tailwind CSS

Recharts

Sonner

TanStack Table

Main Features

Team Member

Login

View own weekly reports

Create reports

Save drafts

Edit own drafts/correction versions

Submit and resubmit reports

View manager correction comments

View report version history

View assigned projects

Manager

View team reports

Review submitted reports

Request corrections

Approve reports

View dashboard and analytics

View team members

Manage projects and project membership

Use the AI Chat Assistant

Admin

Manager capabilities

User management

Create users

Change user roles

Deactivate users

Project management

Prerequisites

Node.js 20 or later recommended

npm

Git

Check versions:

node --version
npm --version
git --version

Installation

git clone <FRONTEND_REPOSITORY_URL>
cd <FRONTEND_REPOSITORY_FOLDER>
npm install

Environment Configuration

Create .env.local in the project root.

NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

Do not commit .env.local.

Run the Frontend

npm run dev

Open:

http://localhost:3000

The FastAPI backend must also be running.

Testing

npm test
npm run typecheck
npm run build

Backend Connection

Default backend:

http://localhost:8000

Swagger:

http://localhost:8000/docs

Important Routes

Team Member

/dashboard

/reports

/reports/new

/reports/[id]

/reports/[id]/edit

/projects

/profile

Manager / Admin

/dashboard

/team-reports

/reports/[id]

/projects

/team-members

/analytics

/ai-assistant

Admin

/users

Notes

Standalone Report History was removed. Report history is shown as Version History inside each report detail page.

Draft report content is private from managers until submission.

Project-scoped Manager access is a future improvement.