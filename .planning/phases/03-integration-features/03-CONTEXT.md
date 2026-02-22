# Phase 3: Integration & Features - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire every CRM entity (organizations, contacts, deals, interactions, tasks) to the live Supabase backend and build full CRUD operations. Replace all mock data from Phase 1 with real database queries. Dashboard becomes the authenticated landing page with live metrics. The application becomes fully functional for daily sales and account management work.

</domain>

<decisions>
## Implementation Decisions

### Form & editing patterns
- Claude's Discretion: form presentation pattern (modal, slide-over, or full page) — pick best fit per entity complexity
- Claude's Discretion: editing flow (detail page edit mode, inline editing, or reuse creation form) — pick per entity type
- Claude's Discretion: delete confirmation pattern (confirm dialog vs undo toast) — pick based on destructiveness
- Claude's Discretion: multi-org assignment UX for contacts (multi-select dropdown vs add-one-at-a-time)

### List, search & filtering
- Search on Enter/submit — NOT live type-to-filter; user presses Enter or clicks search button to execute
- Claude's Discretion: filter presentation (bar above list vs collapsible panel)
- Tags: managed tag list with predefined common tags PLUS free-form entry for new tags — best of both worlds, reduce duplicates
- Pagination: classic page numbers (1, 2, 3...) with prev/next — NOT infinite scroll or load-more

### Kanban interactions
- Drag-and-drop: instant optimistic update — card moves immediately, background API call, snap back with error toast on failure
- Claude's Discretion: deal creation from Kanban (quick-add at column top, global button, or both)
- Claude's Discretion: deal card content density (keep consistent with Phase 1 design system)
- Claude's Discretion: empty column behavior (always show vs collapse)

### Timeline & activity feed
- Claude's Discretion: interaction logging flow (quick-log, full form, or hybrid)
- Claude's Discretion: dashboard activity feed content (interactions only, all changes, or curated highlights)
- Claude's Discretion: overdue task surfacing (sidebar badge, dashboard banner, or both)
- Claude's Discretion: contact/deal detail timeline composition (interactions only, everything merged, or tabbed)

### Claude's Discretion
Claude has broad flexibility on this phase's UX patterns. The user trusts Claude to pick the best approach for each entity based on:
- Existing Phase 1 design system and component patterns
- CRM industry conventions (Salesforce, HubSpot, Linear as references)
- Consistency across the application
- The premium dark-mode SaaS aesthetic established in Phase 1

The two firm decisions are:
1. **Search: submit-based** (Enter/click to search, not live filtering)
2. **Pagination: classic page numbers** (not infinite scroll)
3. **Tags: managed list + free-form** (predefined suggestions plus user-created tags)
4. **Kanban drag: instant optimistic** (no confirmation dialog)

</decisions>

<specifics>
## Specific Ideas

- Kanban drag should feel instant and responsive — optimistic updates with snap-back on failure, matching modern tools like Linear
- Tags should reduce duplicates through a managed list but not restrict power users from creating custom tags
- Search should be deliberate (Enter to submit) to avoid excessive API calls on a CRM with potentially large datasets
- Phase 1 prototype established: DealCard with name + org + value, collapsible sidebar, OKLCH dark theme — maintain these patterns

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-integration-features*
*Context gathered: 2026-02-22*
