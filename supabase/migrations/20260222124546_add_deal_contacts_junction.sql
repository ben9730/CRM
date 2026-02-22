-- Migration: add_deal_contacts_junction
-- Creates a junction table linking deals to contacts with an optional role field.
-- RLS uses EXISTS through the deals table to check account membership.

create table if not exists public.deal_contacts (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deals(id) on delete cascade,
  contact_id  uuid not null references public.contacts(id) on delete cascade,
  role        text,              -- e.g. 'primary', 'influencer', 'champion'
  created_at  timestamptz not null default now(),
  unique (deal_id, contact_id)
);

comment on table public.deal_contacts is 'Junction table linking deals to one or more contacts.';

-- Enable Row-Level Security
alter table public.deal_contacts enable row level security;

-- RLS policy: account members can do everything, derived via deals.account_id
create policy "account members can manage deal_contacts"
  on public.deal_contacts
  for all
  using (
    exists (
      select 1
      from public.deals d
      where d.id = deal_contacts.deal_id
        and private.is_account_member(d.account_id)
    )
  );
