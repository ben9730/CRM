-- Migration: create_crm_entity_tables
-- Phase 02-02: All CRM entity tables with indexes and tsvector search columns

-- =============================================
-- PIPELINE STAGES (normalized — not strings on deals)
-- =============================================
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name          text NOT NULL,
  display_order integer NOT NULL,
  probability   integer DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  is_won        boolean NOT NULL DEFAULT false,
  is_lost       boolean NOT NULL DEFAULT false,
  color         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pipeline_stages_account_idx ON public.pipeline_stages(account_id, display_order);

-- =============================================
-- ORGANIZATIONS (hospitals, clinics, labs — CRM entities)
-- =============================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name          text NOT NULL,
  type          text CHECK (type IN ('hospital', 'clinic', 'lab', 'other')),
  website       text,
  phone         text,
  address       text,
  city          text,
  state         text,
  tags          text[] DEFAULT '{}',
  notes         text,
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES auth.users(id),
  updated_by    uuid REFERENCES auth.users(id),
  -- Full-text search (GIN index — computed column)
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(city, '') || ' ' ||
      coalesce(notes, '')
    )
  ) STORED
);

CREATE INDEX IF NOT EXISTS organizations_account_idx ON public.organizations(account_id);
CREATE INDEX IF NOT EXISTS organizations_search_idx ON public.organizations USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS organizations_deleted_idx ON public.organizations(account_id) WHERE deleted_at IS NULL;

-- =============================================
-- CONTACTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  email         text,
  phone         text,
  title         text,
  tags          text[] DEFAULT '{}',
  notes         text,
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES auth.users(id),
  updated_by    uuid REFERENCES auth.users(id),
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(title, '') || ' ' ||
      coalesce(notes, '')
    )
  ) STORED
);

CREATE INDEX IF NOT EXISTS contacts_account_idx ON public.contacts(account_id);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON public.contacts(email);
CREATE INDEX IF NOT EXISTS contacts_name_idx ON public.contacts(last_name, first_name);
CREATE INDEX IF NOT EXISTS contacts_search_idx ON public.contacts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS contacts_deleted_idx ON public.contacts(account_id) WHERE deleted_at IS NULL;

-- =============================================
-- CONTACT-ORGANIZATION JUNCTION (many-to-many)
-- =============================================
CREATE TABLE IF NOT EXISTS public.contact_organizations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role            text,           -- job title at this org
  is_primary      boolean NOT NULL DEFAULT false,
  started_at      date,
  ended_at        date,           -- null = current relationship
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(contact_id, organization_id)
);

CREATE INDEX IF NOT EXISTS contact_orgs_contact_idx ON public.contact_organizations(contact_id);
CREATE INDEX IF NOT EXISTS contact_orgs_org_idx ON public.contact_organizations(organization_id);

-- =============================================
-- DEALS
-- =============================================
CREATE TABLE IF NOT EXISTS public.deals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  title           text NOT NULL,
  value           numeric(12,2),
  currency        text NOT NULL DEFAULT 'USD',
  stage_id        uuid NOT NULL REFERENCES public.pipeline_stages(id),
  position        text NOT NULL DEFAULT 'n',  -- lexicographic ordering within stage
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  owner_id        uuid REFERENCES auth.users(id),
  expected_close  date,
  closed_at       timestamptz,
  notes           text,
  tags            text[] DEFAULT '{}',
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id),
  updated_by      uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS deals_account_idx ON public.deals(account_id);
CREATE INDEX IF NOT EXISTS deals_stage_position_idx ON public.deals(stage_id, position);
CREATE INDEX IF NOT EXISTS deals_org_idx ON public.deals(organization_id);
CREATE INDEX IF NOT EXISTS deals_deleted_idx ON public.deals(account_id) WHERE deleted_at IS NULL;

-- =============================================
-- INTERACTIONS (calls, emails, meetings, notes)
-- Two-FK pattern — NOT polymorphic type column
-- =============================================
CREATE TABLE IF NOT EXISTS public.interactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  subject         text,
  body            text,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  duration_mins   integer,
  contact_id      uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id         uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id         uuid NOT NULL REFERENCES auth.users(id),
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interaction_linked CHECK (
    contact_id IS NOT NULL OR deal_id IS NOT NULL OR organization_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS interactions_contact_idx ON public.interactions(contact_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS interactions_deal_idx ON public.interactions(deal_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS interactions_account_idx ON public.interactions(account_id, occurred_at DESC);

-- =============================================
-- TASKS
-- =============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  due_date        timestamptz,
  is_complete     boolean NOT NULL DEFAULT false,
  completed_at    timestamptz,
  priority        text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  contact_id      uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id         uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  assignee_id     uuid REFERENCES auth.users(id),
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id),
  updated_by      uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS tasks_due_idx ON public.tasks(account_id, due_date) WHERE is_complete = false;
CREATE INDEX IF NOT EXISTS tasks_assignee_idx ON public.tasks(assignee_id, is_complete);
CREATE INDEX IF NOT EXISTS tasks_account_idx ON public.tasks(account_id);
