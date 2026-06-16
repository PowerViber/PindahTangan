-- Run this script in the Supabase SQL Editor (Project > SQL Editor > New Query)
-- to fix the read, update, and delete permissions for the 'submissions' table.

-- 1. Allow owners to read their own submissions and admins to read every submission.
DROP POLICY IF EXISTS "Allow select for owner or admin" ON public.submissions;
CREATE POLICY "Allow select for owner or admin"
ON public.submissions FOR SELECT
USING (
  auth.uid() = user_id
  OR public.is_admin() = TRUE
);

-- 2. Drop existing restrictive policies on submissions update
DROP POLICY IF EXISTS "Allow update for admin only" ON public.submissions;
DROP POLICY IF EXISTS "Allow update for owner or admin" ON public.submissions;

-- 3. Create policy to allow both owners and admins to update submissions
CREATE POLICY "Allow update for owner or admin"
ON public.submissions FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.is_admin() = TRUE
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() = TRUE
);

-- 4. Create policy to allow both owners and admins to delete submissions
DROP POLICY IF EXISTS "Allow delete for owner or admin" ON public.submissions;
CREATE POLICY "Allow delete for owner or admin"
ON public.submissions FOR DELETE
USING (
  auth.uid() = user_id 
  OR public.is_admin() = TRUE
);
