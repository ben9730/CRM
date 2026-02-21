# Phase 1: Frontend Design & UI - Research

**Researched:** 2026-02-21
**Domain:** React/Next.js component design, shadcn/ui, Tailwind CSS v4, dark mode design systems
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Visual identity
- Dark mode primary — dark backgrounds, light text, modern power-user aesthetic
- Balanced information density — moderate spacing, comfortable reading, professional but not cramped
- Accent color: Claude's discretion (pick what works best with dark mode)
- Typography: Claude's discretion (pick the best font for a dark-mode premium CRM)

#### Layout & navigation
- Collapsible left sidebar — can collapse to icons-only for more content space
- Standard CRM nav items: Dashboard, Contacts, Organizations, Deals, Tasks, Interactions — one item per entity
- Detail views: dual mode — list click opens slide-over panel for quick peek, dedicated link goes to full page for deep editing
- Search bar in header — always-visible search input in the top bar, not command palette

#### Dashboard
- Widget arrangement: Claude's discretion — arrange pipeline, tasks, activity, and metrics however makes most sense for a sales team

#### Deal pipeline Kanban
- Minimal cards — deal name + value only, clean and scannable, fits more cards per column
- Stage columns with counts and total values per column

#### Contacts list
- Table view as default with toggle to card grid — flexibility for user preference
- Table has sortable columns, card grid shows avatar + name + org + tags

#### Contact detail page
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-01 | Application uses the frontend-design skill to create a distinctive, premium UI comparable to HubSpot/Pipedrive | shadcn/ui + Tailwind v4 + custom OKLCH color tokens provide the foundation; Geist font adds premium feel |
| DSGN-02 | Interactive HTML prototypes created via playground skill for key screens (dashboard, contacts list, deal pipeline, contact detail) — approved by user before backend work | Next.js 15 App Router with static mock data (no API calls) produces browser-viewable prototypes; all four screens mapped to specific component combinations |
| DSGN-03 | Full component library designed and documented (buttons, forms, cards, tables, modals, navigation) | shadcn/ui provides all primitives; component documentation is built-in via component source ownership |
| DSGN-04 | Responsive design works on desktop (1280px+), tablet (768px), and mobile (375px) | Tailwind mobile-first breakpoints (sm:768px, lg:1024px, xl:1280px); Sheet component converts to bottom-drawer on mobile; sidebar uses offcanvas mode on mobile |
| DSGN-05 | Consistent design system with color palette, typography, spacing, and iconography | OKLCH CSS variables in globals.css + @theme directive; Geist Sans; Lucide icons (shadcn default); 4px spacing base |
| DSGN-06 | Frontend built and visually polished BEFORE backend integration begins | Phase 1 is self-contained; all data is static mock JSON — no backend, no API routes needed |
| PROC-01 | Frontend design phase completed and approved BEFORE any backend implementation | Phase structure enforces this; success criterion #5 explicitly gates Phase 2 |
| PROC-02 | Phase ordering strictly follows: Frontend Design → Backend & Data → Integration → Polish | Roadmap dependency chain enforces this |
| ARCH-06 | Available skills (frontend-design, playground, tdd, security-review, e2e) used throughout development | frontend-design skill for design system; playground skill for interactive prototypes |
</phase_requirements>

---

## Summary

Phase 1 is a pure frontend work: create a premium dark-mode design system and interactive browser prototypes for four key CRM screens before any backend exists. The standard stack is well-established: **Next.js 15 App Router** as the runtime, **shadcn/ui** (new-york style, Tailwind v4) as the component library, **Tailwind CSS v4** for styling with CSS-first configuration, and **Geist Sans** as the typeface. All data will be static mock JSON — no API calls, no database, no server actions.

The design should evoke Linear and Vercel: near-black backgrounds using shadcn's OKLCH dark tokens, electric violet-indigo as the primary accent (works beautifully against dark surfaces and reads as "premium developer tool"), and Geist Sans for its modern geometric proportions. The four prototype screens — Dashboard, Contacts List, Deal Pipeline Kanban, and Contact Detail — each have a clear shadcn/ui component mapping. The collapsible sidebar uses shadcn's `Sidebar` component with `collapsible="icon"`. The slide-over detail panel uses `Sheet` with `side="right"`. The Kanban drag-and-drop uses `@dnd-kit/core` + `@dnd-kit/sortable`. The contacts table uses TanStack Table through shadcn's `DataTable` pattern.

The biggest planning risk is scope creep into interactivity that belongs in later phases — animations, real filtering with state, API-wired search. Keep prototypes visually complete but data-static. The second risk is Tailwind v4 vs v3 confusion: shadcn now ships with full Tailwind v4 support, and the `tailwind.config.js` file is gone. Configuration lives in `globals.css` via the `@theme` directive. Planners must ensure setup tasks explicitly target v4 patterns.

**Primary recommendation:** Bootstrap the project with `npx shadcn@latest create` targeting Next.js + Tailwind v4, set `defaultTheme="dark"` with `forcedTheme="dark"` on ThemeProvider, define the complete OKLCH color palette in `globals.css` first, then build screens in order: sidebar/layout shell → Dashboard → Contacts → Kanban → Contact Detail.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | App framework, file-based routing, dev server | Industry standard for React; App Router enables clean page structure without backend needed |
| shadcn/ui | Latest (2026-02 release) | Component library — all primitives | Source-owned components, full Tailwind v4 support, React 19 compatible, designed for dark mode via CSS variables |
| Tailwind CSS | v4.x | Utility-first styling, CSS-first config | CSS `@theme` directive replaces config file; first-class dark mode; no build step for theme changes |
| next-themes | Latest | Theme provider, forced dark mode | Official shadcn recommendation; `forcedTheme="dark"` eliminates flash, no toggle needed |
| @dnd-kit/core + @dnd-kit/sortable | Latest | Kanban drag-and-drop | Standard for accessible drag-and-drop with shadcn; well-documented Kanban patterns exist |
| @tanstack/react-table | v8.x | Contacts table with sort/filter | Powers shadcn DataTable; headless, fully typed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Geist (font) | Latest | Primary typeface | `npm install geist` — Vercel's own font, available on Google Fonts, perfect for premium dark SaaS |
| lucide-react | Latest | Icon set | Default for shadcn new-york style; 1000+ consistent icons; `className` prop works with Tailwind |
| tw-animate-css | Latest | CSS animations | Replaces deprecated `tailwindcss-animate` in Tailwind v4; slide-over and modal transitions |
| class-variance-authority | Latest | Component variant typing | Used internally by shadcn; use for any custom variants |
| clsx + tailwind-merge | Latest | Conditional class merging | Provided by shadcn `cn()` utility out of the box |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit | @hello-pangea/dnd | @hello-pangea/dnd is a react-beautiful-dnd fork with active maintenance, but @dnd-kit has better accessibility and is the primary recommendation in the shadcn ecosystem as of 2026 |
| Geist Sans | Inter | Inter is excellent and widely used; Geist is more distinctive and exactly what Vercel uses — matches the "Linear/Vercel aesthetic" brief |
| shadcn DataTable (TanStack) | AG Grid | AG Grid is overkill for a prototype; TanStack is headless and ships with shadcn patterns |
| Next.js | Vite + React | Vite is valid but Next.js App Router gives free routing for the 4 prototype screens without extra config |

**Installation:**

```bash
# Bootstrap project
npx shadcn@latest create crm-prototype --template next

# Core dependencies added by shadcn init
# Next.js 15, Tailwind v4, React 19, next-themes are included

# Additional dependencies
npm install geist @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @tanstack/react-table
npm install tw-animate-css

# shadcn components
npx shadcn@latest add sidebar sheet card table avatar badge button input
npx shadcn@latest add skeleton dialog command separator scroll-area
npx shadcn@latest add dropdown-menu select tabs progress
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ThemeProvider (dark forced)
│   ├── globals.css             # @theme directive, OKLCH color tokens, .dark overrides
│   ├── page.tsx                # Dashboard (redirect or dashboard itself)
│   ├── contacts/
│   │   ├── page.tsx            # Contacts list (table + card grid toggle)
│   │   └── [id]/page.tsx       # Contact detail page
│   ├── organizations/page.tsx
│   ├── deals/page.tsx          # Kanban pipeline
│   ├── tasks/page.tsx
│   └── interactions/page.tsx
├── components/
│   ├── ui/                     # All shadcn-generated components (auto-populated)
│   ├── layout/
│   │   ├── app-sidebar.tsx     # CRM sidebar with nav items
│   │   ├── app-header.tsx      # Top bar with search input
│   │   └── app-shell.tsx       # SidebarProvider + layout wrapper
│   ├── dashboard/
│   │   ├── pipeline-summary.tsx
│   │   ├── tasks-widget.tsx
│   │   ├── activity-feed.tsx
│   │   └── metrics-cards.tsx
│   ├── contacts/
│   │   ├── contacts-table.tsx  # TanStack Table implementation
│   │   ├── contacts-grid.tsx   # Card grid view
│   │   ├── view-toggle.tsx     # Table/grid toggle button
│   │   └── contact-sheet.tsx   # Slide-over quick-peek panel
│   ├── deals/
│   │   ├── kanban-board.tsx    # DndContext wrapper
│   │   ├── kanban-column.tsx   # SortableContext per column
│   │   └── deal-card.tsx       # Draggable minimal card
│   └── contact-detail/
│       ├── contact-overview.tsx
│       ├── linked-deals.tsx
│       ├── linked-tasks.tsx
│       └── interaction-timeline.tsx
├── data/
│   ├── mock-contacts.ts        # Static JSON — no API needed
│   ├── mock-deals.ts
│   ├── mock-organizations.ts
│   └── mock-interactions.ts
└── lib/
    └── utils.ts                # cn() utility (auto-generated by shadcn)
```

---

### Pattern 1: Forced Dark Mode with next-themes

**What:** Apply dark theme globally with no toggle, using `forcedTheme="dark"` to prevent flash and disable switching.

**When to use:** Phase 1 locks to dark mode primary — no light mode toggle needed yet.

```tsx
// Source: https://ui.shadcn.com/docs/dark-mode/next
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

### Pattern 2: OKLCH Color System in globals.css (Tailwind v4)

**What:** Define the full design token palette using OKLCH in the `.dark` selector, referenced via `@theme inline`.

**When to use:** Tailwind v4 removed `tailwind.config.js` — all theme customization lives in globals.css.

```css
/* Source: https://ui.shadcn.com/docs/tailwind-v4 */
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-card: var(--card);
  --color-border: var(--border);
  --color-sidebar: var(--sidebar);
  --radius-sm: var(--radius);
}

/* Base dark palette (forced — no light mode in Phase 1) */
:root {
  --background: oklch(0.10 0 0);           /* Near-black — #191919 equiv */
  --foreground: oklch(0.97 0 0);           /* Near-white text */
  --card: oklch(0.14 0 0);                 /* Slightly elevated surface */
  --card-foreground: oklch(0.97 0 0);
  --border: oklch(1 0 0 / 8%);            /* Subtle border */
  --muted: oklch(0.20 0 0);               /* Muted surface */
  --muted-foreground: oklch(0.60 0 0);    /* Secondary text */
  --primary: oklch(0.65 0.24 280);        /* Violet-indigo accent */
  --primary-foreground: oklch(0.98 0 0);
  --accent: oklch(0.22 0.04 280);         /* Subtle accent surface */
  --accent-foreground: oklch(0.97 0 0);
  --sidebar: oklch(0.08 0 0);             /* Sidebar darker than main */
  --radius: 0.5rem;
}

/* .dark forces the same — next-themes adds this class */
.dark {
  /* Mirror :root — all values identical for forced dark */
  --background: oklch(0.10 0 0);
  --foreground: oklch(0.97 0 0);
  /* ... same as above ... */
}
```

**Accent color recommendation:** Violet-indigo (`oklch(0.65 0.24 280)`) — this is the Linear/Vercel accent family. It reads as premium, technical, and trustworthy. Avoid blue (too generic), red (alerts), or green (success). Purple-violet in the 270-290 hue range is the premium SaaS sweet spot for dark interfaces.

---

### Pattern 3: Collapsible Icon Sidebar

**What:** shadcn Sidebar component with `collapsible="icon"` — collapses to 48px icon rail, expands to 240px.

**When to use:** Locked decision — collapsible left sidebar with icon-only collapsed state.

```tsx
// Source: https://ui.shadcn.com/docs/components/sidebar
// components/layout/app-sidebar.tsx
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger
} from "@/components/ui/sidebar"
import { LayoutDashboard, Users, Building2, Briefcase, CheckSquare, MessageSquare } from "lucide-react"

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Organizations", url: "/organizations", icon: Building2 },
  { title: "Deals", url: "/deals", icon: Briefcase },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Interactions", url: "/interactions", icon: MessageSquare },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* Logo / app name — collapses to just icon */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

// components/layout/app-shell.tsx
export function AppShell({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <AppHeader />
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}
```

---

### Pattern 4: Slide-Over Detail Panel (Sheet)

**What:** shadcn Sheet component sliding from the right, triggered by clicking a list row.

**When to use:** Locked decision — list click opens slide-over quick peek; dedicated link goes to full page.

```tsx
// Source: https://ui.shadcn.com/docs/components/sheet
// components/contacts/contact-sheet.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export function ContactSheet({ contact, open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[480px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{contact.name}</SheetTitle>
        </SheetHeader>
        {/* Quick overview: title, org, email, phone */}
        {/* Linked deals summary */}
        {/* Recent interaction snippet */}
        {/* "Open full page" link */}
      </SheetContent>
    </Sheet>
  )
}

// In contacts table — clicking a row opens the sheet, not navigates
<TableRow
  className="cursor-pointer"
  onClick={() => { setSelectedContact(row.original); setSheetOpen(true) }}
>
```

---

### Pattern 5: Kanban Board with dnd-kit

**What:** Multi-column drag-and-drop Kanban for the deal pipeline. Each column is a `SortableContext`; items drag between columns via `DndContext.onDragOver`.

**When to use:** Locked decision — deal pipeline as Kanban with minimal cards (name + value).

```tsx
// Source: https://docs.dndkit.com/presets/sortable
// components/deals/kanban-board.tsx
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

const PIPELINE_STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"]

export function KanbanBoard({ deals }) {
  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor))

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragOver={handleDragOver}  // Move between columns
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={deals.filter(d => d.stage === stage)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId ? <DealCard deal={deals.find(d => d.id === activeId)} /> : null}
      </DragOverlay>
    </DndContext>
  )
}

// components/deals/kanban-column.tsx
export function KanbanColumn({ stage, deals }) {
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  return (
    <div className="flex-shrink-0 w-64">
      {/* Column header: stage name + count + total value */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="font-medium text-sm">{stage}</span>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{deals.length}</span>
          <span>${totalValue.toLocaleString()}</span>
        </div>
      </div>
      <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
        </div>
      </SortableContext>
    </div>
  )
}
```

---

### Pattern 6: Contacts Table with Sort (TanStack)

**What:** shadcn DataTable pattern using TanStack Table with `getSortedRowModel`.

**When to use:** Locked decision — contacts list defaults to sortable table view.

```tsx
// Source: https://ui.shadcn.com/docs/components/data-table
const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { accessorKey: "organization" },
  { accessorKey: "email" },
  { accessorKey: "lastContact" },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/contacts/${row.original.id}`}>View</Link>
      </Button>
    ),
  },
]
```

---

### Pattern 7: Dashboard Widget Layout

**What:** Grid of four widget areas arranged for sales team priority.

**When to use:** Dashboard page — Claude's discretion on arrangement.

**Recommended layout (evidence-based from CRM dashboard research):**

```
Row 1: [Metrics Bar — 4 equal cards: Total Deals, Pipeline Value, Won This Month, Tasks Due Today]
Row 2: [Pipeline Summary (large, 2/3 width) | Tasks Widget (1/3 width)]
Row 3: [Activity Feed (full width — recent interactions, deal updates)]
```

Rationale: Metrics first (scannable at a glance), pipeline second (primary job-to-be-done for sales), tasks second (daily action list), activity third (context and history).

---

### Pattern 8: Skeleton Loading States

**What:** shadcn Skeleton component placed where content will load, matching exact content dimensions.

**When to use:** Any component that would fetch real data in production — prototypes show skeleton briefly then reveal mock data.

```tsx
// Source: https://ui.shadcn.com/docs/components/skeleton
import { Skeleton } from "@/components/ui/skeleton"

// Contact card skeleton
function ContactCardSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  )
}
```

---

### Pattern 9: Empty States

**What:** shadcn Empty component (new in October 2025) for zero-data screens.

```tsx
// Source: https://ui.shadcn.com/docs/changelog/2025-10-new-components
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

function EmptyContacts() {
  return (
    <Empty>
      <EmptyMedia><Users className="h-8 w-8 text-muted-foreground" /></EmptyMedia>
      <EmptyTitle>No contacts yet</EmptyTitle>
      <EmptyDescription>Add your first contact to start building relationships.</EmptyDescription>
      <EmptyContent>
        <Button>Add Contact</Button>
      </EmptyContent>
    </Empty>
  )
}
```

---

### Anti-Patterns to Avoid

- **Building a light mode toggle in Phase 1:** Locked to dark primary; adding toggle adds complexity and risks color system inconsistency. Implement only in Polish phase if needed.
- **Using `tailwind.config.js` with Tailwind v4:** The config file is deprecated in v4. All customization goes in `globals.css` via `@theme`. Creating a config file will cause conflicts.
- **Wiring up real form submissions or API routes:** Prototypes use static data and `onSubmit={() => {}}` stubs. No backend code whatsoever in Phase 1.
- **Individual `@radix-ui/react-*` imports:** As of January 2026, shadcn new-york style uses the unified `radix-ui` package. Don't install individual Radix packages.
- **Using `tailwindcss-animate`:** Deprecated in Tailwind v4. Use `tw-animate-css` instead.
- **Using `npx shadcn-ui@latest`:** The package was renamed. Use `npx shadcn@latest`.
- **Putting mock data inline in components:** Centralize in `/data/*.ts` files so swapping in real API data in Phase 3 is a single-file change per entity.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slide-over panels | Custom drawer with CSS transitions | shadcn Sheet | Radix Dialog base handles focus trap, escape key, ARIA, backdrop click — ~30 edge cases handled |
| Drag-and-drop | mousedown/mousemove handlers | @dnd-kit | Accessibility (keyboard nav, screen readers), touch support, pointer capture, collision algorithms |
| Sortable tables | onClick sort handlers with manual array sort | TanStack Table via shadcn DataTable | Multi-column sort, type-safe, SSR-ready, accessible |
| Color theming | Hardcoded hex values in components | CSS custom properties + @theme | Runtime theme switching (future), no rebuilds needed |
| Icon system | SVG files in /public | lucide-react | Tree-shaking, consistent sizing, className/style props, accessible |
| Toast/notifications | Custom positioned div | shadcn Sonner | Z-index stacking, portal rendering, timeout management |
| Loading states | CSS spinners from scratch | shadcn Skeleton + Spinner | Consistent pulse animation, prevents layout shift |
| Empty states | Custom empty divs | shadcn Empty (Oct 2025) | Structured layout, consistent messaging pattern |

**Key insight:** Every item on this list has subtle edge cases that break production UIs — focus management, accessibility attributes, z-index conflicts, animation timing. The shadcn ecosystem has solved all of these.

---

## Common Pitfalls

### Pitfall 1: Tailwind v4 Config Migration Confusion

**What goes wrong:** Developer creates `tailwind.config.js` for custom colors (as in v3), finds that custom colors don't apply.
**Why it happens:** Tailwind v4 moved to CSS-first configuration. The `tailwind.config.js` is no longer the source of truth for theme tokens.
**How to avoid:** All custom tokens go in `globals.css` inside `@theme {}`. Verify with the official docs at https://ui.shadcn.com/docs/tailwind-v4 before touching config.
**Warning signs:** Custom `bg-brand-500` classes not rendering; Tailwind IntelliSense not showing custom colors.

---

### Pitfall 2: Hydration Flash in Forced Dark Mode

**What goes wrong:** Page flickers white/light for ~200ms before dark mode activates.
**Why it happens:** Next.js renders HTML on server without knowing client theme preference; class is applied after hydration.
**How to avoid:** Use `suppressHydrationWarning` on `<html>` tag; use `forcedTheme="dark"` on ThemeProvider (not just `defaultTheme`); `disableTransitionOnChange` prevents CSS transition flicker.
**Warning signs:** Brief white flash on hard refresh in dev or production.

---

### Pitfall 3: Kanban State Not Persisting Across Drag

**What goes wrong:** Dragging a deal card to another column appears to work visually but snaps back on release.
**Why it happens:** `DragOverlay` renders a ghost; the actual state mutation happens in `onDragEnd`, not `onDragOver`. Missing state update in `onDragEnd` causes revert.
**How to avoid:** Implement both `onDragOver` (for visual column highlight) and `onDragEnd` (for actual data mutation in mock state). Use `useState` on the deals array.
**Warning signs:** Card snaps back to original column after drop.

---

### Pitfall 4: Sheet Width on Mobile Breaks Layout

**What goes wrong:** `SheetContent` with `w-[480px]` overflows on 375px screens, causing horizontal scroll.
**Why it happens:** Fixed pixel width exceeds viewport width.
**How to avoid:** Use responsive width: `className="w-full sm:w-[480px]"`. On mobile, consider switching to `side="bottom"` instead of `side="right"` using a `useMediaQuery` hook.
**Warning signs:** Horizontal scrollbar appears when Sheet opens on mobile.

---

### Pitfall 5: Missing `data-slot` Attributes on Custom Components

**What goes wrong:** Custom components styled with `[&_[data-slot=...]]:` selectors don't apply styles.
**Why it happens:** shadcn v4 components use `data-slot` for internal styling. Custom wrapper components that don't pass through `data-slot` break the selector chain.
**How to avoid:** When wrapping shadcn components, spread props: `<Button {...props} data-slot="button">`. Or style with className directly.
**Warning signs:** Hover/focus/active states missing on wrapped components.

---

### Pitfall 6: Prototype Scope Creep into Real Interactivity

**What goes wrong:** Developer adds API routes, database calls, or complex client state "while they're in the file" — violating PROC-01 and DSGN-06.
**Why it happens:** It feels natural to wire things up while building the UI.
**How to avoid:** All data imports from `/data/*.ts` only. No `fetch()` calls. No `use server` directives. No `prisma.*` calls. The planner should put this as a definition-of-done gate.
**Warning signs:** `api/` folder appearing in the prototype project.

---

## Code Examples

Verified patterns from official sources:

### Contacts Table (TanStack + shadcn)

```typescript
// Source: https://ui.shadcn.com/docs/components/data-table
"use client"
import { useState } from "react"
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table"
import type { SortingState } from "@tanstack/react-table"

export function ContactsTable({ data, columns }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null :
                  flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Sidebar with Collapsed Icon State

```typescript
// Source: https://ui.shadcn.com/docs/components/sidebar
// Tooltip shows on collapsed icon-only mode automatically when using SidebarMenuButton tooltip prop
<SidebarMenuButton asChild tooltip={item.title}>
  <a href={item.url}>
    <item.icon />           {/* Shows in both states */}
    <span>{item.title}</span> {/* Hidden when collapsed (icon mode) */}
  </a>
</SidebarMenuButton>
```

### Mock Data Structure Pattern

```typescript
// data/mock-contacts.ts
export type Contact = {
  id: string
  name: string
  email: string
  phone: string
  organization: string
  organizationId: string
  title: string
  tags: string[]
  lastContact: string  // ISO date string
  dealCount: number
}

export const mockContacts: Contact[] = [
  {
    id: "c-001",
    name: "Sarah Chen",
    email: "sarah.chen@meridianhealth.com",
    phone: "+1 (415) 555-0123",
    organization: "Meridian Health",
    organizationId: "org-001",
    title: "VP of Clinical Operations",
    tags: ["decision-maker", "healthcare", "active"],
    lastContact: "2026-02-15",
    dealCount: 2
  },
  // ... more entries
]
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` for custom colors | `@theme {}` directive in globals.css | Tailwind v4 (Jan 2025) | Must write theme tokens in CSS, not JS |
| `tailwindcss-animate` | `tw-animate-css` | shadcn Tailwind v4 update (2025) | Different import, same functionality |
| `npx shadcn-ui@latest` | `npx shadcn@latest` | August 2024 | Old package name still works but deprecated |
| Individual `@radix-ui/react-dialog` etc | Unified `radix-ui` package | January 2026 | Simpler installs, one package for all Radix primitives |
| `forwardRef` in shadcn components | Direct function components (React 19) | 2025 | No breaking change but new components won't use forwardRef |
| Spinner/Empty/Field/Item as custom code | Built-in shadcn components | October 2025 | Use `npx shadcn@latest add spinner empty field item` |
| HSL color values in CSS variables | OKLCH color values | shadcn Tailwind v4 update | More accurate colors, same usage pattern |

**Deprecated/outdated:**
- `npx shadcn-ui@latest`: Renamed — use `npx shadcn@latest`
- `tailwindcss-animate`: Use `tw-animate-css`
- `tailwind.config.js`: No longer used in Tailwind v4 projects
- Individual `@radix-ui/react-*` packages: Use unified `radix-ui` (Jan 2026)

---

## Design Recommendations (Claude's Discretion Items)

### Accent Color: Violet-Indigo

Use `oklch(0.65 0.24 280)` — hue 280 is the violet-indigo range used by Linear. It:
- Reads as "premium developer tool" (same family as Linear, Vercel, Raycast)
- Provides excellent contrast against near-black backgrounds (OKLCH perceptual uniformity)
- Avoids the generic "corporate blue" trap
- Works for both interactive elements (buttons, links) and status indicators

For interactive states: hover at `oklch(0.70 0.26 280)`, active/pressed at `oklch(0.58 0.22 280)`.

### Typography: Geist Sans

**Primary:** Geist Sans — `npm install geist`, import via `import { GeistSans } from 'geist/font/sans'`
- Created by Vercel for developer interfaces
- Geometric proportions with high legibility at small sizes
- Slightly softer than Inter — friendlier without being playful
- Available as npm package (no Google Fonts GDPR concerns if self-hosted)

**Monospace:** Geist Mono for any code snippets, IDs, or technical values in the CRM
**Scale:** 12px (xs), 14px (sm, default body), 16px (base), 18px (lg), 24px (xl), 32px (2xl), 48px (3xl)

### Icon Set: Lucide

Default for shadcn new-york style. 1000+ icons, all consistent stroke weight, `className` compatible. Use `size={16}` for inline, `size={20}` for nav items, `size={24}` for feature icons.

### Spacing Base: 4px

Tailwind default is already 4px. Use multiples: 4px (1), 8px (2), 12px (3), 16px (4), 24px (6), 32px (8), 48px (12). For information density goal (moderate, not cramped), target 16-24px for component padding.

### Dashboard Widget Priority Order

1. **Metrics bar (top):** Pipeline Value, Active Deals, Won This Month, Tasks Due Today — 4 equal cards across full width
2. **Pipeline by stage (left, 2/3):** Horizontal bar or mini-Kanban summary showing deals per stage and value
3. **Tasks widget (right, 1/3):** Upcoming tasks sorted by due date
4. **Recent activity (bottom, full width):** Latest interactions, deal updates, contact changes

---

## Open Questions

1. **Tailwind v4 exact OKLCH values for brand palette**
   - What we know: shadcn ships default OKLCH tokens; we need custom violet-indigo accent values
   - What's unclear: Whether tweakcn.com exports Tailwind v4 `@theme` syntax or v3 HSL syntax
   - Recommendation: Use tweakcn.com to visually pick and export — verify the output format matches v4 `@theme inline` syntax before using

2. **dnd-kit between-column drag with static mock state**
   - What we know: `onDragEnd` must mutate local state; `arrayMove` utility from `@dnd-kit/sortable` handles reordering within a column
   - What's unclear: Cross-column state mutation pattern with pure mock data (no reducer/Zustand in prototype)
   - Recommendation: Use `useState` with a deal array where `stage` is a field; `onDragEnd` calls `setDeals(prev => prev.map(d => d.id === activeId ? {...d, stage: targetStage} : d))`

3. **Sidebar mobile behavior at 375px**
   - What we know: shadcn Sidebar switches to `offcanvas` on mobile by default via `SidebarProvider`'s built-in breakpoint detection
   - What's unclear: Exact breakpoint where it switches (likely `md:` = 768px)
   - Recommendation: Test at 375px in browser devtools during responsive verification; if offcanvas isn't automatic, add `variant="floating"` on mobile via `useIsMobile()` from shadcn's sidebar utilities

---

## Sources

### Primary (HIGH confidence)
- `https://ui.shadcn.com/docs/tailwind-v4` — Tailwind v4 setup, @theme directive, OKLCH colors
- `https://ui.shadcn.com/docs/components/sidebar` — Sidebar collapsible modes (offcanvas/icon/none)
- `https://ui.shadcn.com/docs/components/sheet` — Sheet side prop, composable structure
- `https://ui.shadcn.com/docs/components/skeleton` — Skeleton loading state patterns
- `https://ui.shadcn.com/docs/components/data-table` — TanStack Table integration, sorting implementation
- `https://ui.shadcn.com/docs/theming` — OKLCH CSS variable values for dark theme
- `https://ui.shadcn.com/docs/changelog/2025-10-new-components` — Spinner, Empty, Field, Item components
- `https://docs.dndkit.com/presets/sortable` — SortableContext, multiple containers pattern

### Secondary (MEDIUM confidence)
- `https://ui.shadcn.com/docs/changelog/2025-12-shadcn-create` — `npx shadcn create` command and new styles (Vega, Nova)
- `https://ui.shadcn.com/docs/changelog` — January 2026 Radix unified package migration
- `https://vercel.com/font` — Geist font characteristics confirmed
- `https://github.com/vercel/geist-font` — npm install method confirmed
- Marmelab blog (Jan 2026): Kanban with shadcn build guide — cross-verified with dnd-kit docs

### Tertiary (LOW confidence — validate before acting)
- WebSearch results on premium dark SaaS color palette recommendations — confirm palette by testing actual renders
- Dashboard widget arrangement priority — based on CRM best practice research, not shadcn-specific docs; validate with user preference

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via official shadcn/ui docs and changelog
- Architecture patterns: HIGH — code examples from official docs; project structure is conventional Next.js App Router
- Design recommendations (accent color, font): MEDIUM — well-reasoned from evidence, but ultimately aesthetic choices; user should visually approve
- Pitfalls: HIGH — most come from official docs and established Tailwind v4 migration notes
- dnd-kit cross-column pattern: MEDIUM — pattern is documented; exact implementation for mock-only state needs validation during build

**Research date:** 2026-02-21
**Valid until:** 2026-03-21 (shadcn releases frequently; re-check changelog before major additions)
