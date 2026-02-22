-- Migration: create_private_schema_and_foundation
-- Phase 02-02: Foundation tables, private schema, security definer function, profiles trigger

-- 1. Create private schema (for security definer functions, not exposed via PostgREST)
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Create accounts table (team orgs that own CRM data)
CREATE TABLE IF NOT EXISTS public.accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Create account_members table (users belong to accounts)
CREATE TABLE IF NOT EXISTS public.account_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, user_id)
);

CREATE INDEX IF NOT EXISTS account_members_user_idx ON public.account_members(user_id);
CREATE INDEX IF NOT EXISTS account_members_account_idx ON public.account_members(account_id);

-- 4. Create profiles table (extends auth.users with CRM-specific data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Create security definer function private.is_account_member
-- This function bypasses RLS on account_members for the membership check
-- Critical for performance: 7ms vs 11,000ms inline subquery
CREATE OR REPLACE FUNCTION private.is_account_member(p_account_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = p_account_id
      AND user_id = (SELECT auth.uid())
  );
$$;

-- 6. Create handle_new_user() trigger function
-- On new user signup: creates profile + auto-joins demo account
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_demo_account_id uuid;
BEGIN
  INSERT INTO public.profiles(id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  -- Auto-join the single demo account (Phase 2 simplification)
  SELECT id INTO v_demo_account_id FROM public.accounts LIMIT 1;
  IF v_demo_account_id IS NOT NULL THEN
    INSERT INTO public.account_members(account_id, user_id, role)
    VALUES (v_demo_account_id, NEW.id, 'member')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 7. Create trigger on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8a. Enable RLS on accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_anon_deny" ON public.accounts
  FOR ALL TO anon USING (false);

CREATE POLICY "accounts_select" ON public.accounts
  FOR SELECT TO authenticated
  USING (private.is_account_member(id));

-- 8b. Enable RLS on account_members
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "account_members_anon_deny" ON public.account_members
  FOR ALL TO anon USING (false);

CREATE POLICY "account_members_select" ON public.account_members
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR private.is_account_member(account_id));

-- 8c. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_anon_deny" ON public.profiles
  FOR ALL TO anon USING (false);

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
