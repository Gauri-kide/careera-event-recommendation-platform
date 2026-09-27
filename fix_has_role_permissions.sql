-- ============================================================
-- FIX: has_role function permission issue
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- The migration 20260511191743 revoked EXECUTE on has_role
-- from authenticated users, breaking all RLS policies that use it.
-- ============================================================

-- Fix has_role permissions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;

-- Fix handle_new_user permissions (for signup trigger)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO public;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Reload schema cache so PostgREST picks up the changes
NOTIFY pgrst, 'reload schema';
