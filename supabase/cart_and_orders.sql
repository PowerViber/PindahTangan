-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Adds shopping cart + order/payment tables and protects sellers from
-- purchasing their own listings.

-- Shared admin helper used by policies below.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
set row_security = off
stable
as $$
  select coalesce(
    (select u.is_admin from public.users u where u.id = auth.uid()),
    false
  );
$$;

-- Admin pages need to read every submission, while regular users only read their own.
alter table submissions enable row level security;

drop policy if exists "Allow select for owner or admin" on public.submissions;
create policy "Allow select for owner or admin"
on public.submissions for select
using (
  auth.uid() = user_id
  or public.is_admin() = true
);

-- 1. Product ownership and sale state.
alter table products add column if not exists sold boolean not null default false;
alter table products add column if not exists seller_id uuid references auth.users(id) on delete set null;
alter table products add column if not exists submission_id uuid references submissions(id) on delete set null;

-- Legacy backfill for products that were published before seller_id/submission_id
-- existed. Product names in the current data export map cleanly to submissions.
with matched_submissions as (
  select
    p.id as product_id,
    s.id as submission_id,
    s.user_id,
    row_number() over (
      partition by p.id
      order by s.created_at desc
    ) as match_rank
  from products p
  join submissions s
    on lower(trim(p.name)) = lower(trim(s.product_name))
  where p.seller_id is null
    or p.submission_id is null
)
update products p
set
  seller_id = coalesce(p.seller_id, m.user_id),
  submission_id = coalesce(p.submission_id, m.submission_id)
from matched_submissions m
where p.id = m.product_id
  and m.match_rank = 1;

update submissions s
set status = 'SOLD'
where exists (
  select 1
  from products p
  where p.submission_id = s.id
    and p.sold = true
);

alter table products enable row level security;

drop policy if exists "products_select_all" on products;
create policy "products_select_all" on products
  for select to authenticated using (true);

drop policy if exists "products_select_anon" on products;
create policy "products_select_anon" on products
  for select to anon using (true);

drop policy if exists "products_mark_sold" on products;
drop policy if exists "products_insert_admin" on products;
create policy "products_insert_admin" on products
  for insert to authenticated with check (public.is_admin() = true);

drop policy if exists "products_update_admin" on products;
create policy "products_update_admin" on products
  for update to authenticated using (public.is_admin() = true) with check (public.is_admin() = true);

-- 2. Cart items: one row per (user, product). A product can only be in a
--    given user's cart once, since each listing is a unique secondhand unit.
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table cart_items enable row level security;

drop policy if exists "cart_items_select_own" on cart_items;
create policy "cart_items_select_own" on cart_items
  for select using (auth.uid() = user_id);

drop policy if exists "cart_items_insert_own" on cart_items;
create policy "cart_items_insert_own" on cart_items
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1
      from products p
      where p.id = product_id
        and p.sold = false
        and (p.seller_id is null or p.seller_id <> auth.uid())
    )
  );

drop policy if exists "cart_items_delete_own" on cart_items;
create policy "cart_items_delete_own" on cart_items
  for delete using (auth.uid() = user_id);

-- 3. Orders + order items.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total bigint not null,
  payment_method text not null check (payment_method in ('QRIS', 'CASH', 'CARD')),
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'CANCELLED')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  price bigint not null
);

drop function if exists public.can_view_order(uuid) cascade;
drop function if exists public.can_view_buyer_profile(uuid) cascade;

create or replace function public.sold_product_details(p_product_ids uuid[])
returns table (
  product_id uuid,
  order_id uuid,
  buyer_id uuid,
  buyer_name text,
  buyer_email text,
  payment_method text,
  order_status text,
  sold_at timestamptz,
  paid_at timestamptz,
  price bigint,
  total bigint
)
language sql
security definer
set search_path = public
set row_security = off
stable
as $$
  select
    p.id as product_id,
    o.id as order_id,
    o.user_id as buyer_id,
    coalesce(u.full_name, u.email, concat('User ', left(o.user_id::text, 8))) as buyer_name,
    coalesce(u.email, '-') as buyer_email,
    o.payment_method,
    o.status as order_status,
    o.created_at as sold_at,
    o.paid_at,
    oi.price,
    o.total
  from order_items oi
  join orders o on o.id = oi.order_id
  join products p on p.id = oi.product_id
  left join users u on u.id = o.user_id
  where p.id = any(p_product_ids)
    and (
      p.seller_id = auth.uid()
      or o.user_id = auth.uid()
      or public.is_admin() = true
      or exists (
        select 1
        from submissions s
        where s.user_id = auth.uid()
          and (
            s.id = p.submission_id
            or lower(trim(s.product_name)) = lower(trim(p.name))
          )
      )
    );
$$;

alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "orders_select_own" on orders;
create policy "orders_select_own" on orders
  for select using (auth.uid() = user_id);

drop policy if exists "orders_select_seller_or_admin" on orders;
drop policy if exists "orders_select_admin" on orders;
create policy "orders_select_admin" on orders
  for select using (public.is_admin() = true);

drop policy if exists "orders_insert_own" on orders;
drop policy if exists "orders_update_own" on orders;

drop policy if exists "orders_update_admin" on orders;
create policy "orders_update_admin" on orders
  for update using (public.is_admin() = true) with check (public.is_admin() = true);

drop policy if exists "order_items_select_via_order" on order_items;
create policy "order_items_select_via_order" on order_items
  for select using (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_select_seller_or_admin" on order_items;
create policy "order_items_select_seller_or_admin" on order_items
  for select using (
    public.is_admin() = true
    or exists (
      select 1
      from products p
      where p.id = order_items.product_id
        and p.seller_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_via_order" on order_items;

-- Allow admins and sellers to see buyer profile snippets for sold products.
-- Detailed buyer lookups are handled by sold_product_details() to avoid RLS cycles.
drop policy if exists "users_select_self_admin_or_sale_counterparty" on public.users;
drop policy if exists "users_select_self" on public.users;
create policy "users_select_self" on public.users
  for select using (id = auth.uid());

-- 4. Atomic checkout. This is the only path the app should use to buy items.
-- It blocks sold products and products owned by the buyer.
create or replace function public.checkout_cart(p_payment_method text)
returns uuid
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_total bigint := 0;
  v_item_count integer := 0;
  v_invalid_count integer := 0;
  v_status text;
begin
  if v_user is null then
    raise exception 'User is not authenticated';
  end if;

  if p_payment_method not in ('QRIS', 'CASH', 'CARD') then
    raise exception 'Unsupported payment method';
  end if;

  perform 1
  from products p
  join cart_items ci on ci.product_id = p.id
  where ci.user_id = v_user
  for update of p;

  select count(*)
  into v_invalid_count
  from cart_items ci
  join products p on p.id = ci.product_id
  where ci.user_id = v_user
    and (
      p.sold = true
      or p.seller_id = v_user
    );

  if v_invalid_count > 0 then
    raise exception 'Cart contains unavailable products or your own listing';
  end if;

  select count(*), coalesce(sum(p.price), 0)::bigint
  into v_item_count, v_total
  from cart_items ci
  join products p on p.id = ci.product_id
  where ci.user_id = v_user
    and p.sold = false
    and (p.seller_id is null or p.seller_id <> v_user);

  if v_item_count = 0 or v_total <= 0 then
    raise exception 'Cart is empty';
  end if;

  v_status := case when p_payment_method = 'CASH' then 'PENDING' else 'PAID' end;

  insert into orders (user_id, total, payment_method, status, paid_at)
  values (
    v_user,
    v_total,
    p_payment_method,
    v_status,
    case when v_status = 'PAID' then now() else null end
  )
  returning id into v_order_id;

  insert into order_items (order_id, product_id, product_name, price)
  select v_order_id, p.id, p.name, p.price::bigint
  from cart_items ci
  join products p on p.id = ci.product_id
  where ci.user_id = v_user
    and p.sold = false
    and (p.seller_id is null or p.seller_id <> v_user);

  update submissions s
  set status = 'SOLD'
  where exists (
    select 1
    from cart_items ci
    join products p on p.id = ci.product_id
    where ci.user_id = v_user
      and p.submission_id = s.id
  );

  update products p
  set sold = true
  where exists (
    select 1
    from cart_items ci
    where ci.user_id = v_user
      and ci.product_id = p.id
  );

  delete from cart_items
  where user_id = v_user;

  return v_order_id;
end;
$$;

grant execute on function public.checkout_cart(text) to authenticated;
grant execute on function public.sold_product_details(uuid[]) to authenticated;
