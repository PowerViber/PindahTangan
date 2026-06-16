-- Add product ownership fields so we can track who listed each product.
-- The full cart/order policy and atomic checkout migration lives in
-- supabase/cart_and_orders.sql.

alter table products add column if not exists seller_id uuid references auth.users(id) on delete set null;
alter table products add column if not exists submission_id uuid references submissions(id) on delete set null;

-- Optional: backfill existing products with seller_id from the related submission
-- (Only works if the product name matches a submission product_name for that user)
-- This is a one-time migration, run manually if needed.

-- Allow anyone authenticated to read products (marketplace browsing)
-- Already should exist, but ensure it's there.
drop policy if exists "products_select_all" on products;
create policy "products_select_all" on products
  for select to authenticated using (true);

-- Allow public/anon to also read products for unauthenticated browsing
drop policy if exists "products_select_anon" on products;
create policy "products_select_anon" on products
  for select to anon using (true);
