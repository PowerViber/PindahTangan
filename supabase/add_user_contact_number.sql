-- Run this once in the Supabase SQL Editor.
-- Adds a reusable contact number to user profiles and a safe updater RPC.

alter table public.users
add column if not exists contact_number text;

comment on column public.users.contact_number is
  'Reusable contact number for seller pickup and transaction communication.';

-- Backfill from the latest submission contact when an existing user has no profile contact yet.
with latest_submission_contact as (
  select distinct on (s.user_id)
    s.user_id,
    nullif(btrim(s.contact), '') as contact_number
  from public.submissions s
  where nullif(btrim(s.contact), '') is not null
  order by s.user_id, s.created_at desc
)
update public.users u
set contact_number = l.contact_number
from latest_submission_contact l
where u.id = l.user_id
  and nullif(btrim(coalesce(u.contact_number, '')), '') is null;

create or replace function public.update_contact_number(p_contact_number text)
returns public.users
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_profile public.users;
begin
  update public.users
  set contact_number = nullif(btrim(p_contact_number), '')
  where id = auth.uid()
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return v_profile;
end;
$$;

grant execute on function public.update_contact_number(text) to authenticated;
