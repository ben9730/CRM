# HealthCRM

## What This Is

A modern, cloud-hosted CRM web application built for a health technology company that sells and maintains systems across hospitals, clinics, and labs nationwide. The CRM manages organizational customers (healthcare facilities), contacts within those organizations, deal pipelines, interaction history, and tasks. Designed to be flexible for 1-5 users, with a clean premium feel comparable to HubSpot or Pipedrive — but scoped for a small team.

## Core Value

Sales and account management teams can track every customer relationship, deal, and interaction in one place — so nothing falls through the cracks.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Contact management (customers, leads, companies) with search, filter, and tags
- [ ] Deal/opportunity pipeline with drag-and-drop Kanban board
- [ ] Interaction history (calls, emails, meetings, notes) linked to contacts
- [ ] Task management and reminders tied to contacts/deals
- [ ] Dashboard with key metrics and activity feed
- [ ] User authentication and basic role management
- [ ] Responsive design (desktop + mobile)
- [ ] Cloud deployment (accessible from anywhere)

### Out of Scope

- Patient/health record storage — CRM tracks business relationships, not clinical data
- HIPAA compliance — no protected health information (PHI) stored; only business-level facility data (e.g., bed count, departments, volume references)
- Mobile native app — web-responsive is sufficient for v1
- Email integration (send/receive from CRM) — log manually for v1
- Billing/invoicing — separate system
- Marketing automation — not needed at this scale

## Context

- Built for a health tech company that deploys systems to hospitals and healthcare facilities across the country
- Customers are organizations (hospitals, clinics, labs), each with multiple contacts (IT directors, department heads, procurement, administrators)
- Deal cycles are B2B — typically longer, involve multiple stakeholders per organization
- May reference facility-level data (bed count, patient volumes, departments) but no individual patient data
- Boss requested the build with no specific conditions beyond "build a CRM" — keeping it generic and standard
- Must impress visually (professional presentation matters) AND be genuinely useful day-to-day
- Cloud hosted for accessibility across locations

## Constraints

- **Users**: 1-5 concurrent users (micro-team, not enterprise scale)
- **Deployment**: Cloud-hosted, accessible from any location
- **Data sensitivity**: No PHI/patient data, but business data about healthcare facilities should be handled securely
- **Design**: Must look and feel like a premium modern SaaS product
- **Performance**: Fast and responsive — no sluggish interactions
- **Accessibility**: Basic WCAG compliance for professional standards

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Generic CRM, not healthcare-specialized | Boss gave no specific conditions; over-specializing adds complexity without clear value | — Pending |
| Cloud hosted (Vercel + Supabase likely) | Accessibility from any location, minimal ops overhead | — Pending |
| Frontend-first development | Visual approval before backend investment; design drives architecture | — Pending |
| No PHI storage | Avoids HIPAA compliance burden; CRM tracks business relationships only | — Pending |

## Resource Map

### Skills Available
| Skill | Usage |
|-------|-------|
| `frontend-design` | Create distinctive, production-grade UI with high design quality |
| `playground` | Interactive HTML prototypes for key screens (dashboard, pipeline, contacts) |
| `gsd:*` | Full project orchestration (planning, execution, verification) |
| `everything-claude-code:tdd` | Test-driven development for reliable code |
| `everything-claude-code:security-review` | Security audit for auth and data handling |
| `everything-claude-code:e2e` | End-to-end testing with Playwright |
| `everything-claude-code:frontend-patterns` | React/Next.js best practices |
| `everything-claude-code:backend-patterns` | API design and server-side patterns |
| `everything-claude-code:postgres-patterns` | Database schema and query optimization |
| `vercel:deploy` | Production deployment to Vercel |

### Agents Available
| Agent | Usage |
|-------|-------|
| `code-reviewer` | Review all code changes for quality and security |
| `build-error-resolver` | Fix build/type errors quickly |
| `security-reviewer` | Audit auth, API endpoints, data handling |
| `e2e-runner` | Generate and run end-to-end tests |
| `database-reviewer` | Schema design, query optimization, RLS policies |
| `Plan` / `Explore` | Architecture design and codebase exploration |

### MCP Services
| Service | Usage |
|---------|-------|
| Supabase MCP | Database setup, migrations, RLS policies, auth, API keys, TypeScript types |
| Playwright MCP | Browser automation for E2E testing and visual verification |

### Tools
| Tool | Usage |
|------|-------|
| Bash | Git, npm, build commands |
| Read/Write/Edit | File operations |
| Glob/Grep | Code search and navigation |
| WebSearch/WebFetch | Research and documentation lookup |
| Task (subagents) | Parallel research, code review, testing |

---
*Last updated: 2026-02-21 after initialization*
