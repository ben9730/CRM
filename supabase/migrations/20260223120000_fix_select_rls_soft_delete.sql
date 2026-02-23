-- Migration: fix_select_rls_soft_delete
-- Remove deleted_at IS NULL from SELECT policies on soft-delete tables.
-- Supabase's implicit RETURNING * on UPDATE re-evaluates SELECT policy against
-- the new row state — soft-delete sets deleted_at, which then fails the IS NULL
-- check. App queries already filter deleted_at IS NULL themselves.

-- ORGANIZATIONS
DROP POLICY "organizations_select" ON public.organizations;
CREATE POLICY "organizations_select" ON public.organizations
  FOR SELECT TO authenticated
  USING (private.is_account_member(account_id));

-- CONTACTS
DROP POLICY "contacts_select" ON public.contacts;
CREATE POLICY "contacts_select" ON public.contacts
  FOR SELECT TO authenticated
  USING (private.is_account_member(account_id));

-- DEALS
DROP POLICY "deals_select" ON public.deals;
CREATE POLICY "deals_select" ON public.deals
  FOR SELECT TO authenticated
  USING (private.is_account_member(account_id));

-- INTERACTIONS
DROP POLICY "interactions_select" ON public.interactions;
CREATE POLICY "interactions_select" ON public.interactions
  FOR SELECT TO authenticated
  USING (private.is_account_member(account_id));

-- TASKS
DROP POLICY "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT TO authenticated
  USING (private.is_account_member(account_id));
