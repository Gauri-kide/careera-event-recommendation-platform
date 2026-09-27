-- Fix all permission issues causing 403/422 errors
-- 1. Restore EXECUTE on has_role (was revoked by migration 20260511191743)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO public;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 2. Add policies for anon users to browse approved events (public discovery)
CREATE POLICY "anon view approved events" ON public.events FOR SELECT TO anon
  USING (status = 'approved');

-- 3. Allow anon users to view profiles (needed for event organizers info)
CREATE POLICY "anon view profiles" ON public.profiles FOR SELECT TO anon
  USING (true);

-- 4. Reload schema cache so PostgREST picks up the changes
NOTIFY pgrst, 'reload schema';
