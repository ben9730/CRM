export type InteractionType = "call" | "email" | "meeting" | "note";

export interface Interaction {
  id: string;
  type: InteractionType;
  contactId: string;
  contactName: string;
  dealId?: string;
  dealName?: string;
  summary: string;
  date: string; // ISO date
  duration?: number; // minutes, for calls and meetings
}

export const mockInteractions: Interaction[] = [
  {
    id: "i-001",
    type: "meeting",
    contactId: "c-001",
    contactName: "Sarah Chen",
    dealId: "d-001",
    dealName: "Meridian EHR Integration Suite",
    summary: "Executive alignment call — reviewed contract terms and SLA requirements. Sarah flagged need for 99.9% uptime guarantee. Legal review scheduled for next week.",
    date: "2026-02-18T14:30:00Z",
    duration: 60,
  },
  {
    id: "i-002",
    type: "email",
    contactId: "c-002",
    contactName: "Marcus Johnson",
    dealId: "d-003",
    dealName: "Pacific Coast Clinical Analytics Platform",
    summary: "Sent technical architecture overview and security whitepaper. Marcus requested SOC 2 Type II audit report and HIPAA Business Associate Agreement template.",
    date: "2026-02-15T10:00:00Z",
  },
  {
    id: "i-003",
    type: "call",
    contactId: "c-006",
    contactName: "David Kim",
    dealId: "d-007",
    dealName: "Alpha Oncology Treatment Protocol Engine",
    summary: "Pricing discussion. David pushing for 15% discount on multi-year commitment. Escalated to internal deal desk for approval. Will follow up Thursday.",
    date: "2026-02-14T15:00:00Z",
    duration: 30,
  },
  {
    id: "i-004",
    type: "meeting",
    contactId: "c-003",
    contactName: "Dr. Priya Nair",
    dealId: "d-004",
    dealName: "BioVault LIMS Connector",
    summary: "Implementation kickoff meeting. Onboarding timeline confirmed: 6-week rollout starting March 1. Integration team introductions completed.",
    date: "2026-02-10T09:15:00Z",
    duration: 90,
  },
  {
    id: "i-005",
    type: "note",
    contactId: "c-008",
    contactName: "Michael Okonkwo",
    dealId: "d-009",
    dealName: "Valley Regional Revenue Cycle Management",
    summary: "LinkedIn research: Michael recently posted about RCM challenges and prior auth delays. Good opening for our automation angle in next outreach.",
    date: "2026-02-17T15:20:00Z",
  },
  {
    id: "i-006",
    type: "email",
    contactId: "c-005",
    contactName: "Amanda Torres",
    dealId: "d-002",
    dealName: "Meridian Patient Portal Expansion",
    summary: "Sent proposal deck for patient portal expansion. Included case study from Riverview Hospital showing 34% reduction in call center volume.",
    date: "2026-02-20T11:45:00Z",
  },
  {
    id: "i-007",
    type: "call",
    contactId: "c-004",
    contactName: "Robert Vasquez",
    dealId: "d-006",
    dealName: "Sunrise Clinic EMR Starter Pack",
    summary: "Discovery call. Robert confirmed they are on a legacy EMR with end-of-life in Q3. Budget is ~$20K. Interested in a phased implementation.",
    date: "2026-02-05T16:00:00Z",
    duration: 45,
  },
  {
    id: "i-008",
    type: "meeting",
    contactId: "c-002",
    contactName: "Marcus Johnson",
    dealId: "d-003",
    dealName: "Pacific Coast Clinical Analytics Platform",
    summary: "Product demo with Marcus and two IT team members. Positive feedback on the reporting dashboards. Concerns raised about EHR compatibility with their Cerner install.",
    date: "2026-02-12T09:30:00Z",
    duration: 75,
  },
  {
    id: "i-009",
    type: "note",
    contactId: "c-001",
    contactName: "Sarah Chen",
    dealId: "d-001",
    dealName: "Meridian EHR Integration Suite",
    summary: "Internal note: Competitor (MedFlow) is in late-stage evaluation at Meridian. Sarah hinted at urgency — decision expected by end of March. Prioritize legal turnaround.",
    date: "2026-02-19T08:00:00Z",
  },
  {
    id: "i-010",
    type: "call",
    contactId: "c-006",
    contactName: "David Kim",
    dealId: "d-012",
    dealName: "Alpha Oncology Patient Scheduling",
    summary: "Confirmed final pricing for scheduling module. David accepted 10% discount in exchange for 24-month contract. Will issue revised SOW by EOD tomorrow.",
    date: "2026-02-16T11:00:00Z",
    duration: 20,
  },
  {
    id: "i-011",
    type: "email",
    contactId: "c-009",
    contactName: "Lisa Brennan",
    dealId: "d-005",
    dealName: "BioVault QC Automation Module",
    summary: "Initial outreach email after Lisa mentioned QC bottlenecks at the HIMSS conference. Attached product one-pager and requested 20-minute discovery call.",
    date: "2026-02-03T09:00:00Z",
  },
  {
    id: "i-012",
    type: "meeting",
    contactId: "c-010",
    contactName: "Thomas Nguyen",
    dealId: "d-008",
    dealName: "Alpha Oncology Data Warehousing",
    summary: "Technical scoping session. Thomas shared current data stack: Snowflake + Tableau. Our connector supports native Snowflake writes — strong fit. Requested sandbox access.",
    date: "2026-01-28T14:00:00Z",
    duration: 60,
  },
];
