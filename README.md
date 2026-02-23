# HealthCRM

A modern, cloud-hosted **B2B Sales CRM** built for a health technology company that sells and maintains systems across hospitals, clinics, and labs.

[![Live App](https://img.shields.io/badge/Live%20App-HealthCRM-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://healthcrm-tawny.vercel.app/login)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-YouTube-red?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=5K4JmXej5jU)

---

## Overview

HealthCRM enables sales and account management teams to track every customer relationship, deal, and interaction in one place. Designed for small teams (1-5 users) with a premium dark-mode interface comparable to HubSpot and Pipedrive.

> **Note:** This is a business CRM only — no patient health data is stored.

---

## Demo

[![Watch the demo](https://img.youtube.com/vi/5K4JmXej5jU/maxresdefault.jpg)](https://www.youtube.com/watch?v=5K4JmXej5jU)

**Try it live:** [https://healthcrm-tawny.vercel.app/login](https://healthcrm-tawny.vercel.app/login)

---

## Features

### Dashboard
- Pipeline value, active deals, tasks due today, overdue tasks
- Horizontal bar chart showing deal count and value per pipeline stage
- Upcoming tasks widget with overdue badge
- Recent activity feed (calls, emails, meetings, notes)

### Contact Management
- Table and grid toggle views with search, tag filters, and organization filters
- Quick preview side panel + full detail page
- Linked deals, tasks, and interaction timeline per contact
- Free-form tags (decision-maker, champion, c-suite, clinical, technical, finance)
- Multi-organization support with primary designation

### Organization Management
- List view with type filter (Hospital / Clinic / Lab / Other)
- Detail page with contacts tab and deals tab
- Full address, phone, website, and notes

### Deal Pipeline (Kanban Board)
- 6-column Kanban: Prospecting → Qualification → Proposal → Negotiation → Closed Won → Closed Lost
- Drag & drop cards between stages with optimistic updates
- Stage metrics (deal count + total value per column)
- Deal detail page with linked contacts, tasks, and interaction timeline

### Task Management
- Filter tabs: All / Pending / Completed / Overdue
- Click-to-toggle completion with visual feedback
- Priority levels: High (red) / Medium (orange) / Low (green)
- Overdue badge in sidebar navigation
- Link tasks to contacts and/or deals

### Interaction Logging
- Types: Call / Email / Meeting / Note (color-coded)
- Subject, notes, date/time, duration
- Chronological timeline on contact and deal detail pages

### Global Search
- Full-text search across contacts, organizations, and deals
- Categorized results with direct navigation

### Data Export
- CSV export for contacts, organizations, and deals
- UTF-8 BOM support for Excel and Hebrew characters

### Authentication
- Email/password sign up and login
- Session persistence across browser refresh
- Password reset via email
- Secure logout with session cleanup

### Responsive Design
- Desktop (1280px+): Full sidebar, 4-column dashboard, full Kanban
- Tablet (768px): Icon rail sidebar, 2-column dashboard, horizontal scroll Kanban
- Mobile (375px): Icon rail, single-column layouts, touch-friendly

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) + TypeScript 5 |
| **UI** | React 19, Tailwind CSS v4, shadcn/ui (Radix UI) |
| **Drag & Drop** | @dnd-kit |
| **Tables** | TanStack React Table |
| **Forms** | React Hook Form + Zod validation |
| **Database** | Supabase (PostgreSQL) with Row-Level Security |
| **Auth** | Supabase Auth (email/password) |
| **Search** | PostgreSQL tsvector + GIN indexes |
| **Deployment** | Vercel (frontend) + Supabase (backend) |
| **Testing** | Playwright E2E tests |
| **Font** | Geist Sans |

---

## Database Schema

```
accounts              # Team/workspace container
account_members       # User-to-account membership + role
contacts              # People (name, email, phone, tags, search_vector)
organizations         # Healthcare facilities (hospital, clinic, lab)
contact_organizations # Many-to-many junction (contact <-> org)
deals                 # Sales opportunities (title, value, stage, close date)
deal_contacts         # Many-to-many junction (deal <-> contact)
pipeline_stages       # Normalized stages with colors
interactions          # Activity log (call, email, meeting, note)
tasks                 # To-do items (title, due_date, priority, linked entities)
```

Key design patterns:
- **Row-Level Security** on all tables via `account_id`
- **Soft deletes** (`deleted_at` timestamps) — records are never hard-deleted
- **Full-text search** via `search_vector` tsvector with GIN indexes
- **Normalized pipeline stages** (not hardcoded strings)

---

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected routes (dashboard, contacts, deals, etc.)
│   ├── (auth)/             # Public routes (login, signup, password reset)
│   └── api/export/         # CSV export endpoints
├── components/
│   ├── auth/               # Auth forms
│   ├── contacts/           # Contact list + table/grid views
│   ├── contact-detail/     # Contact profile components
│   ├── dashboard/          # Dashboard widgets
│   ├── deals/              # Kanban board + deal detail
│   ├── interactions/       # Interaction log + form
│   ├── organizations/      # Organization list + detail
│   ├── tasks/              # Task list + form
│   ├── layout/             # App shell (sidebar, header)
│   ├── shared/             # Dialogs, sheets, pagination
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── actions/            # Server Actions (CRUD mutations)
│   ├── queries/            # Server queries (read-only)
│   ├── supabase/           # Supabase client config
│   └── types/              # TypeScript types
└── hooks/                  # Custom React hooks

e2e/                        # Playwright E2E test specs
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Installation

```bash
git clone <repository-url>
cd CRM
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

### E2E Tests

```bash
npx playwright test
```

---

## License

This project is proprietary software. All rights reserved.
