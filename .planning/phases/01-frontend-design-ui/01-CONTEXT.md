# Phase 1: Frontend Design & UI - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual design system, component library, and interactive prototypes for all key CRM screens. User approves the visual direction and prototype fidelity before any backend work begins. No backend code, no API calls, no database work.

</domain>

<decisions>
## Implementation Decisions

### Visual identity
- Dark mode primary — dark backgrounds, light text, modern power-user aesthetic
- Balanced information density — moderate spacing, comfortable reading, professional but not cramped
- Accent color: Claude's discretion (pick what works best with dark mode)
- Typography: Claude's discretion (pick the best font for a dark-mode premium CRM)

### Layout & navigation
- Collapsible left sidebar — can collapse to icons-only for more content space
- Standard CRM nav items: Dashboard, Contacts, Organizations, Deals, Tasks, Interactions — one item per entity
- Detail views: dual mode — list click opens slide-over panel for quick peek, dedicated link goes to full page for deep editing
- Search bar in header — always-visible search input in the top bar, not command palette

### Dashboard
- Widget arrangement: Claude's discretion — arrange pipeline, tasks, activity, and metrics however makes most sense for a sales team

### Deal pipeline Kanban
- Minimal cards — deal name + value only, clean and scannable, fits more cards per column
- Stage columns with counts and total values per column

### Contacts list
- Table view as default with toggle to card grid — flexibility for user preference
- Table has sortable columns, card grid shows avatar + name + org + tags

### Contact detail page
- Overview-centered — contact info and linked deals/tasks at top, interaction timeline below
- Quick context before diving into relationship history

### Claude's Discretion
- Accent color selection
- Typography and font choice
- Dashboard widget arrangement and priority
- Loading states and skeleton designs
- Empty state illustrations and messaging
- Icon set selection
- Exact spacing and sizing values
- Error state visual treatment
- Modal and slide-over panel animations

</decisions>

<specifics>
## Specific Ideas

- Dark mode should feel like Linear or Vercel — modern, premium, not just "inverted colors"
- Slide-over panel approach inspired by Linear's issue detail from list view
- CRM should look like a premium SaaS product, not a generic template

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-frontend-design-ui*
*Context gathered: 2026-02-21*
