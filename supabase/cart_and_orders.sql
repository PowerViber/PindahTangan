-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Adds shopping cart + order/payment tables on top of the existing
-- products / submissions / users schema.

-- 1. Mark products as sold once purchased, so they drop out of the marketplace.
alter table products add column if not exists sold boolean not null default false;

-- Products has no seller/owner column today, so allow any authenticated buyer
-- to flip `sold` to true at checkout time. Skip this if you already have a
-- products UPDATE policy in place.
drop policy if exists "products_mark_sold" on products;
create policy "products_mark_sold" on products
  for update to authenticated using (true) with check (true);

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

create policy "cart_items_select_own" on cart_items
  for select using (auth.uid() = user_id);
create policy "cart_items_insert_own" on cart_items
  for insert with check (auth.uid() = user_id);
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

alter table orders enable row level security;
alter table order_items enable row level security;

create policy "orders_select_own" on orders
  for select using (auth.uid() = user_id);
create policy "orders_insert_own" on orders
  for insert with check (auth.uid() = user_id);
create policy "orders_update_own" on orders
  for update using (auth.uid() = user_id);

create policy "order_items_select_via_order" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );
create policy "order_items_insert_via_order" on order_items
  for insert with check (
    exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );
