-- Migration: create_rls_policies_for_crm_tables
-- Phase 02-02: RLS policies for all CRM entity tables
-- Pattern: soft-delete tables have separate SELECT/UPDATE policies
-- Pattern: contact_organizations derives account_id via contact

-- =============================================
-- PIPELINE STAGES (no soft delete)
-- =============================================
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stages_anon_deny" ON public.pipeline_stages
  FOR ALL TO anon USING (false);

CREATE POLICY "stages_access" ON public.pipeline_stages
  FOR ALL TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));

-- =============================================
-- ORGANIZATIONS (soft delete)
-- =============================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_anon_deny" ON public.organizations
  FOR ALL TO anon USING (false);

CREATE POLICY "organizations_select" ON public.organizations
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND private.is_account_member(account_id));

CREATE POLICY "organizations_insert" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (private.is_account_member(account_id));

-- UPDATE does NOT require deleted_at IS NULL — allows soft-delete update to succeed
CREATE POLICY "organizations_update" ON public.organizations
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "organizations_delete" ON public.organizations
  FOR DELETE TO authenticated
  USING (private.is_account_member(account_id));

-- =============================================
-- CONTACTS (soft delete)
-- =============================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_anon_deny" ON public.contacts
  FOR ALL TO anon USING (false);

CREATE POLICY "contacts_select" ON public.contacts
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND private.is_account_member(account_id));

CREATE POLICY "contacts_insert" ON public.contacts
  FOR INSERT TO authenticated
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "contacts_update" ON public.contacts
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "contacts_delete" ON public.contacts
  FOR DELETE TO authenticated
  USING (private.is_account_member(account_id));

-- =============================================
-- CONTACT_ORGANIZATIONS (no soft delete — ephemeral relationship record)
-- Derives account_id via the contact's account_id
-- =============================================
ALTER TABLE public.contact_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_orgs_anon_deny" ON public.contact_organizations
  FOR ALL TO anon USING (false);

CREATE POLICY "contact_orgs_select" ON public.contact_organizations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id
        AND private.is_account_member(c.account_id)
    )
  );

CREATE POLICY "contact_orgs_insert" ON public.contact_organizations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id
        AND private.is_account_member(c.account_id)
    )
  );

CREATE POLICY "contact_orgs_update" ON public.contact_organizations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id
        AND private.is_account_member(c.account_id)
    )
  );

CREATE POLICY "contact_orgs_delete" ON public.contact_organizations
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id
        AND private.is_account_member(c.account_id)
    )
  );

-- =============================================
-- DEALS (soft delete)
-- =============================================
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_anon_deny" ON public.deals
  FOR ALL TO anon USING (false);

CREATE POLICY "deals_select" ON public.deals
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND private.is_account_member(account_id));

CREATE POLICY "deals_insert" ON public.deals
  FOR INSERT TO authenticated
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "deals_update" ON public.deals
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "deals_delete" ON public.deals
  FOR DELETE TO authenticated
  USING (private.is_account_member(account_id));

-- =============================================
-- INTERACTIONS (soft delete)
-- =============================================
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interactions_anon_deny" ON public.interactions
  FOR ALL TO anon USING (false);

CREATE POLICY "interactions_select" ON public.interactions
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND private.is_account_member(account_id));

CREATE POLICY "interactions_insert" ON public.interactions
  FOR INSERT TO authenticated
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "interactions_update" ON public.interactions
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "interactions_delete" ON public.interactions
  FOR DELETE TO authenticated
  USING (private.is_account_member(account_id));

-- =============================================
-- TASKS (soft delete)
-- =============================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_anon_deny" ON public.tasks
  FOR ALL TO anon USING (false);

CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND private.is_account_member(account_id));

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE TO authenticated
  USING (private.is_account_member(account_id));
