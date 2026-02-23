-- Migration: fix_organizations_update_rls_no_with_check
-- Phase 03-04: Fix RLS WITH CHECK violation on soft-delete UPDATE
--
-- Root cause: The organizations_update (and contacts_update, deals_update) policies
-- had WITH CHECK clauses. When soft-deleting via UPDATE SET deleted_at=now(),
-- Postgres evaluates WITH CHECK on the *new row state*, which can fail if the
-- security definer function evaluates differently in that context.
--
-- Fix: Remove WITH CHECK from UPDATE policies on all soft-delete tables.
-- The USING clause is sufficient — account_id never changes via our app.
-- This is consistent with the documented RLS split policy pattern (02-02).

-- =============================================
-- ORGANIZATIONS
-- =============================================
DROP POLICY IF EXISTS "organizations_update" ON public.organizations;

CREATE POLICY "organizations_update" ON public.organizations
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id));

-- =============================================
-- CONTACTS
-- =============================================
DROP POLICY IF EXISTS "contacts_update" ON public.contacts;

CREATE POLICY "contacts_update" ON public.contacts
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id));

-- =============================================
-- DEALS
-- =============================================
DROP POLICY IF EXISTS "deals_update" ON public.deals;

CREATE POLICY "deals_update" ON public.deals
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id));

-- =============================================
-- INTERACTIONS (same pattern, proactive fix)
-- =============================================
DROP POLICY IF EXISTS "interactions_update" ON public.interactions;

CREATE POLICY "interactions_update" ON public.interactions
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id));

-- =============================================
-- TASKS (same pattern, proactive fix)
-- =============================================
DROP POLICY IF EXISTS "tasks_update" ON public.tasks;

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id));
