# Feature Research

**Domain:** B2B CRM — Health Technology Sales (hospitals, clinics, labs)
**Researched:** 2026-02-21
**Confidence:** MEDIUM-HIGH (multi-source; some medtech specifics LOW — single source)

---

## Context

This is a CRM for a health technology company selling systems to hospitals, clinics, and labs.
Key sales context characteristics that drive feature priorities:

- **B2B with long deal cycles** (12+ months typical in healthtech/medtech)
- **Multiple stakeholders per account** (~9 decision-makers average in healthcare B2B purchases)
- **Small team** (1-5 users) — adoption and simplicity matter more than feature breadth
- **Account-based selling** — organizations (hospitals, clinics) are the primary unit, not individual contacts

Source: [Healthcare Sales in 2025: Win B2B Medical Deals with Smart Outreach](https://martal.ca/b2b-healthcare-sales-lb/)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or users leave.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Contact management (people + organizations) | Every CRM has this; B2B requires contacts linked to accounts/companies | LOW | Must support multiple contacts per organization (the buying committee); flat contact lists without org hierarchy feel broken for B2B |
| Organization/Account records | Hospitals and clinics are the deal unit; users track the org separately from individual contacts | MEDIUM | Account-contact hierarchy is standard B2B CRM pattern; HubSpot, Salesforce, Pipedrive all implement this |
| Deal/opportunity tracking | Core reason CRMs exist for sales teams | MEDIUM | Users expect stages, amounts, close dates, probability |
| Visual pipeline (Kanban board) | Pipedrive popularized drag-and-drop Kanban; now expected in all sales CRMs | MEDIUM | Drag-and-drop between stages; deals as cards; per-stage deal count and value totals |
| Interaction/activity history | "One place for everything" is the core CRM value prop | MEDIUM | Calls, emails, meetings, notes — all linked to contact and/or deal; timeline view expected |
| Task management with reminders | Missing = deals fall through the cracks; explicitly expected | MEDIUM | Tasks linked to contacts and deals; due dates; overdue flagging |
| Search and filtering | With 100+ contacts, unusable without search | LOW | Full-text search on contacts/deals; filter by tags, stage, owner, date |
| Tagging/categorization | Expected for segmentation; every modern CRM offers tags | LOW | Tags on contacts and deals; consistent tag management |
| Dashboard with activity feed | Users expect a home screen showing what needs attention | MEDIUM | Pipeline value, tasks due, recent activity; 5-7 metrics is the sweet spot |
| User authentication | Non-negotiable security baseline | LOW | Login, session management, password reset |
| Basic role management | Even 2-3 person teams need admin vs. rep distinction | MEDIUM | At minimum: Admin (full access) and Rep (own records + shared org data) |
| Notes on contacts and deals | Manual logging of conversations is universal behavior | LOW | Rich text; timestamps; author attribution |
| Custom fields | Every business has unique data needs | MEDIUM | Custom fields on contacts, companies, deals; not every CRM does this well at entry level |
| Mobile-responsive UI | Sales reps work outside office; mobile is now expected | MEDIUM | Not necessarily a native app, but the web app must work on phone |
| Data export | Users expect to own their data and export it | LOW | CSV export of contacts, deals, activity at minimum |

Sources:
- [CRM Software Features: What to Look For in 2025](https://www.webuters.com/crm-software-features)
- [Your CRM will fail in 2025: The evolution of SaaS expectations](https://www.nylas.com/blog/your-crm-will-fail-in-2025-the-evolution-of-saas-expectations/)
- [B2B CRM: A buyer's guide for 2025](https://capsulecrm.com/blog/b2b-crm/)
- [Pipedrive vs HubSpot: Complete CRM Comparison 2025](https://www.capitalsconsulting.com/resources/pipedrive-vs-hubspot)

---

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required for launch, but valued and build loyalty.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Healthtech-specific pipeline stages | Pre-configured stages for hospital procurement (Discovery, Demo, Evaluation, Procurement Review, Contract, Won/Lost) reduce setup friction | LOW | No configuration required; users start selling faster; generic CRMs require manual stage setup |
| Stakeholder role tracking per account | Map contacts to roles (Clinical Champion, Procurement, IT, C-Suite, Finance) within an account | MEDIUM | Healthtech deals involve ~9 decision-makers; knowing who plays what role is high value |
| Deal stall detection | Flag deals that haven't had activity in X days; surface them on dashboard | MEDIUM | Long cycles mean deals get forgotten; a simple "no activity in 30 days" alert prevents pipeline rot |
| Quick log interface | One-click activity logging (called, emailed, met); reduce friction to under 3 clicks | LOW | CRM adoption fails when logging is tedious; minimizing clicks is a differentiator for small teams |
| Activity-based reminders | "Next action" required per deal (Pipedrive's core model); no deal without a scheduled next step | MEDIUM | Forces sales discipline; prevents deals from sitting without follow-up |
| Pipeline forecast view | Show expected close value by month/quarter; weighted by probability | MEDIUM | Useful for small team planning; managers want to know what's coming in |
| Contact relationship mapping | Show which contacts at an org know each other; who introduced whom | HIGH | Very useful for complex org selling; but significant UX and data model complexity |
| Email open/link tracking | Know when a prospect opened your email or clicked a link | HIGH | Requires email integration depth; table stakes in HubSpot but complex to implement natively |
| Audit trail / change history | See who changed what and when on a record | MEDIUM | Medtech sales teams may need this for compliance and handoff clarity |

Sources:
- [The Role of CRM Systems in the Medical Device Industry](https://intuitionlabs.ai/articles/crm-medical-device-industry)
- [Why CRMs Fail for Small Teams (And How to Avoid It)](https://claritysoft.com/why-crms-fail-small-teams/)
- [7 best sales CRMs for pipeline tracking](https://www.superoffice.com/blog/best-sales-crm-pipeline-tracking/)

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create adoption problems, scope overrun, or build debt for a 1-5 user team.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Native email client (send/receive email from CRM) | "All in one place" sounds good | Building a reliable email client is a massive undertaking (threading, attachments, deliverability, spam); users still prefer their native email app | BCC-to-CRM address for logging; email activity sidebar; or Gmail/Outlook plugin — log the interaction, don't replace the tool |
| Marketing automation / email sequences | Reps want to automate follow-up | Marketing automation is a separate product category; conflates sales CRM with marketing platform; bloats the product; HubSpot takes years to get this right | Use Zapier/webhook integration to connect to Mailchimp or similar if automation is needed post-MVP |
| AI lead scoring | "AI" is trending; sounds powerful | Requires large historical dataset to be meaningful; with 1-5 users and limited deal history, AI scoring produces garbage results; users learn to ignore it | Manual priority flags (Hot/Warm/Cold) on deals; simple and honest |
| Two-way calendar sync | Nice to show meetings in CRM timeline | Complex OAuth flows, conflict handling, and timezone edge cases; calendar apps (Google Calendar, Outlook) are better at calendar; CRM should log meetings, not be a calendar | Manual meeting log entry + optional future integration hook |
| Customer support ticketing | Some teams want CRM + helpdesk | Completely different workflow and data model from sales CRM; conflates pre-sale and post-sale; confuses users | Keep CRM for sales pipeline only; integrate with Zendesk/Intercom via webhook if support tickets are needed |
| Social media monitoring | "Track mentions and engage from CRM" | Extremely low ROI for B2B healthtech sales; hospital procurement officers are not on Twitter; adds complexity for near-zero benefit | Skip entirely for this context |
| Custom report builder with drag-and-drop | Power users want full analytics | Massive scope; requires significant data modeling and UI work; most small teams need 5-7 fixed reports, not a report builder | Pre-built reports for the KPIs that matter (pipeline by stage, deals closed this month, overdue tasks); add custom filters, not a builder |
| Territory/quota management | Sales managers want territory rules | Overly complex for 1-5 users; territory management is an enterprise feature | Simple deal ownership (assigned rep) is sufficient at this scale |

Sources:
- [Top 7 CRM Mistakes Small Teams Make in 2025](https://rapitek.com/en/blog/2025/7/top-7-crm-mistakes-small-teams-make-2025-how-to-avoid/)
- [Small business CRM vs. enterprise CRM](https://nethunt.com/blog/small-business-crm-vs-enterprise-crm-whats-the-difference/)
- [The Most Effective Email Integrations for 2025](https://www.getmagical.com/blog/email-integrations)

---

## Feature Dependencies

```
[User Authentication]
    └──required by──> [Role Management]
                          └──required by──> [All Data Access Control]

[Organization Records]
    └──required by──> [Contact Management]   (contacts belong to orgs)
    └──required by──> [Deal Management]      (deals belong to orgs)
    └──required by──> [Stakeholder Role Tracking]

[Contact Management]
    └──required by──> [Interaction History]  (interactions attach to contacts)
    └──required by──> [Task Management]      (tasks link to contacts)

[Deal Management]
    └──required by──> [Pipeline Kanban View] (visual representation of deals)
    └──required by──> [Dashboard Metrics]    (pipeline value, stage counts)
    └──required by──> [Task Management]      (tasks link to deals)
    └──required by──> [Deal Stall Detection] (needs deal + activity data)
    └──required by──> [Pipeline Forecast]    (needs deal amounts + close dates)

[Interaction History]
    └──enables──> [Activity Feed on Dashboard]
    └──enables──> [Deal Stall Detection]

[Task Management]
    └──enables──> [Activity-Based Reminders]
    └──enables──> [Dashboard overdue task count]

[Tags on Contacts]
    └──enables──> [Search and Filter by Tag]

[Custom Fields]
    └──enables──> [Stakeholder Role Tracking]  (role = custom field or structured field)
```

### Dependency Notes

- **Organization records must come before contacts and deals:** The account-contact hierarchy is foundational to B2B CRM; building contacts-only first and adding orgs later requires a painful data migration.
- **Deal management must come before Kanban board:** The Kanban view is a rendering of deals; no deals = no Kanban.
- **Authentication must come before everything:** No data should be accessible without login; build auth in Phase 1.
- **Interaction history enables dashboard activity feed:** The feed is a view of the interaction history table; do not build the feed widget before the history model exists.
- **Task management is independent but high-value early:** Tasks can be linked to contacts and deals without requiring either to be complete; enables the most-used daily workflow.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed for users to replace a spreadsheet or generic task tool.

- [ ] **User authentication** — login, session, password reset; without this nothing ships
- [ ] **Organization (account) records** — create, read, update, delete; name, type, address, notes; foundational for B2B
- [ ] **Contact management** — full name, title, email, phone, linked org; create/edit/delete; list with search and filter
- [ ] **Tagging on contacts and orgs** — free-form tags; filter by tag; essential for segmentation
- [ ] **Deal management** — name, stage, value, close date, linked org, linked contacts, owner; create/edit/delete
- [ ] **Visual pipeline (Kanban)** — deals as cards, drag between stages; per-stage value totals
- [ ] **Interaction/activity history** — log calls, emails, meetings, notes linked to contact and/or deal; timeline view
- [ ] **Task management with reminders** — create task; due date; link to contact or deal; overdue flag; basic notification or in-app alert
- [ ] **Dashboard** — pipeline value by stage, tasks due today/overdue, recent activity feed; 5-7 focused metrics
- [ ] **Basic role management** — Admin role (full CRUD + user management) and Rep role (own + shared read)
- [ ] **Data export** — CSV export of contacts, orgs, deals

### Add After Validation (v1.x)

Features to add once core workflow is stable and users are active.

- [ ] **Deal stall detection** — surface deals with no activity in configurable period; dashboard alert or flag — *add when users report deals falling through cracks*
- [ ] **Stakeholder role tracking** — structured role field on contact-org relationship (Clinical Champion, Procurement, etc.) — *add when users complain about managing buying committees*
- [ ] **Pipeline forecast view** — weighted revenue by close month/quarter — *add when manager asks "what's coming in this quarter?"*
- [ ] **Custom fields** — user-defined fields on contacts, orgs, or deals — *add when users request data that doesn't fit existing schema*
- [ ] **Activity-based selling reminders** — require "next action" per deal; prompt when a deal has no scheduled task — *add when users adopt task management habit from v1*

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Audit trail / change history** — who changed what and when; compliance-relevant for medtech — *defer until users ask for it or compliance requirement surfaces*
- [ ] **Webhooks / integration API** — allow external tools to push/pull data — *defer until a specific integration need is confirmed*
- [ ] **Contact relationship mapping** — connections between contacts across orgs — *high complexity; defer until account management workflows outgrow simple tagging*
- [ ] **Mobile native app** — responsive web covers most needs at this scale — *defer; ship responsive web first*
- [ ] **Document/file attachments** — attach proposals, contracts, specs to deals — *useful but not day-one critical; defer to v1.x or v2*

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| User authentication | HIGH | LOW | P1 |
| Organization records | HIGH | LOW | P1 |
| Contact management | HIGH | LOW | P1 |
| Tags + search/filter | HIGH | LOW | P1 |
| Deal management | HIGH | MEDIUM | P1 |
| Visual pipeline Kanban | HIGH | MEDIUM | P1 |
| Interaction history | HIGH | MEDIUM | P1 |
| Task management + reminders | HIGH | MEDIUM | P1 |
| Dashboard with metrics | HIGH | MEDIUM | P1 |
| Basic role management | MEDIUM | MEDIUM | P1 |
| Data export (CSV) | MEDIUM | LOW | P1 |
| Deal stall detection | HIGH | LOW | P2 |
| Stakeholder role tracking | HIGH | MEDIUM | P2 |
| Pipeline forecast view | MEDIUM | MEDIUM | P2 |
| Custom fields | MEDIUM | MEDIUM | P2 |
| Activity-based reminders | HIGH | MEDIUM | P2 |
| Audit trail | MEDIUM | MEDIUM | P3 |
| Webhooks / API | LOW | HIGH | P3 |
| Contact relationship mapping | MEDIUM | HIGH | P3 |
| Document attachments | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch — without this the product cannot replace a spreadsheet
- P2: Should have — add in first iteration after launch validation
- P3: Nice to have — future roadmap

---

## Competitor Feature Analysis

| Feature | HubSpot CRM (Free/Starter) | Pipedrive (Essential) | Salesforce (Essentials) | Our Approach |
|---------|---------------------------|----------------------|------------------------|--------------|
| Contact + org management | Yes; contacts linked to companies | Yes; orgs called "Organizations" | Yes; "Accounts" and "Contacts" | Yes — orgs first, contacts linked; B2B native |
| Kanban pipeline | Yes; basic drag-and-drop | Yes; core feature; industry-leading UX | Yes; more complex | Yes — drag-and-drop; multiple pipeline stages |
| Activity/interaction history | Yes; email, calls, notes; timeline | Yes; activity feed per deal | Yes; activity timeline | Yes — calls, emails, meetings, notes; per contact and per deal |
| Task management | Yes; tasks with due dates and reminders | Yes; "Activities" are core (call, meeting, task) | Yes | Yes — tasks linked to contacts and deals |
| Dashboard | Yes; configurable widgets | Yes; visual reports | Yes; highly configurable | Yes — opinionated defaults; 5-7 key metrics |
| Email integration | Yes; native Gmail/Outlook sync; deep | Partial; email tracking add-on | Yes; deep; complex | Phase 2: BCC logging first; native sync deferred |
| Role management | Yes; 5 roles on free tier | Yes; basic roles | Yes; complex RBAC | Simple: Admin + Rep; expandable later |
| Custom fields | Limited on free tier | Yes; basic | Yes; extensive | Yes — available in v1 or v1.x |
| AI features | Yes; Breeze AI copilot | Yes; AI Sales Assistant | Yes; Einstein AI | No AI in v1 — insufficient data history to be useful |
| Mobile app | Yes; iOS + Android native | Yes; iOS + Android native | Yes | Responsive web only in v1; native app deferred |
| Medtech-specific workflows | No | No | Partial (Health Cloud add-on) | Yes — pre-configured stage names; stakeholder role field |
| Pricing | Free tier available | ~$14/user/month | ~$25-500/user/month | Internal tool; no per-seat model |

Sources:
- [Pipedrive vs HubSpot: Complete CRM Comparison 2025](https://www.capitalsconsulting.com/resources/pipedrive-vs-hubspot)
- [Salesforce vs Zoho vs HubSpot vs Pipedrive — The Best CRM for 2026](https://blog.salesflare.com/compare-salesforce-zoho-hubspot-pipedrive)
- [Think You Know Everything About CRM for Medtech? Think Again | Salesforce](https://www.salesforce.com/healthcare-life-sciences/resources/medtech-crm-connect-customer-lifecycle/)

---

## Healthtech-Specific Feature Notes

These features are relevant to the health technology context and should inform naming, defaults, and optional fields — even if the underlying data model is generic.

**Deal stages for healthtech B2B** (pre-configure these defaults):
1. Prospecting
2. Discovery / Needs Assessment
3. Demo / Evaluation
4. Proposal Sent
5. Procurement / Legal Review
6. Contract Negotiation
7. Closed Won / Closed Lost

**Contact roles to support** (structured field on contact, not freeform):
- Clinical Champion (the internal advocate; e.g., lab director, department head)
- Economic Buyer (budget authority; e.g., CFO, VP Finance)
- Procurement / Purchasing
- IT / Informatics
- End User (the person who will actually use the system)
- Legal / Compliance
- Executive Sponsor

**Compliance note** (LOW confidence — single source, verify before building):
Medtech CRMs sometimes need Sunshine Act tracking (transfers of value to HCPs). This is not required for a system-sales CRM in scope; flag for legal review before any feature that logs gifts, meals, or samples given to clinicians.

Source: [CRM Compliance for Regulated Industries - Best Practices 2025](https://syncmatters.com/blog/crm-compliance)

---

## Sources

- [CRM Software Features: What to Look For in 2025](https://www.webuters.com/crm-software-features)
- [Your CRM will fail in 2025: The evolution of SaaS expectations | Nylas](https://www.nylas.com/blog/your-crm-will-fail-in-2025-the-evolution-of-saas-expectations/)
- [B2B CRM: A buyer's guide for 2025 | Capsule CRM](https://capsulecrm.com/blog/b2b-crm/)
- [Healthcare Sales in 2025: Win B2B Medical Deals with Smart Outreach](https://martal.ca/b2b-healthcare-sales-lb/)
- [The Role of CRM Systems in the Medical Device Industry | IntuitionLabs](https://intuitionlabs.ai/articles/crm-medical-device-industry)
- [Pipedrive vs HubSpot: Complete CRM Comparison 2025](https://www.capitalsconsulting.com/resources/pipedrive-vs-hubspot)
- [Salesforce vs Zoho vs HubSpot vs Pipedrive](https://blog.salesflare.com/compare-salesforce-zoho-hubspot-pipedrive)
- [Top 7 CRM Mistakes Small Teams Make in 2025](https://rapitek.com/en/blog/2025/7/top-7-crm-mistakes-small-teams-make-2025-how-to-avoid/)
- [Small business CRM vs. enterprise CRM: What's different?](https://nethunt.com/blog/small-business-crm-vs-enterprise-crm-whats-the-difference/)
- [7 best sales CRMs for pipeline tracking](https://www.superoffice.com/blog/best-sales-crm-pipeline-tracking/)
- [CRM Compliance for Regulated Industries - Best Practices 2025](https://syncmatters.com/blog/crm-compliance)
- [Think You Know Everything About CRM for Medtech? | Salesforce](https://www.salesforce.com/healthcare-life-sciences/resources/medtech-crm-connect-customer-lifecycle/)
- [Best CRM Software Comparison Guide 2025 - Klipy](https://klipycrm.com/blog/best-crm-software-comparison-2025)
- [CRM dashboards in 2026: the essential KPIs and examples](https://monday.com/blog/crm-and-sales/crm-dashboards/)

---

*Feature research for: B2B CRM — Health Technology Company*
*Researched: 2026-02-21*
