-- Run this once in the Supabase SQL Editor.
-- Prevents two pending QC submissions from using the same pickup date and time.

create unique index if not exists submissions_pending_qc_slot_unique
on public.submissions (pickup_date, pickup_time)
where status = 'PENDING'
  and pickup_date is not null
  and pickup_time is not null;

create or replace function public.qc_unavailable_slots(p_exclude_submission_id uuid default null)
returns table (
  pickup_date text,
  pickup_time text
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select s.pickup_date, s.pickup_time
  from public.submissions s
  where s.status = 'PENDING'
    and nullif(btrim(s.pickup_date), '') is not null
    and nullif(btrim(s.pickup_time), '') is not null
    and (
      p_exclude_submission_id is null
      or s.id <> p_exclude_submission_id
    );
$$;

grant execute on function public.qc_unavailable_slots(uuid) to authenticated;
