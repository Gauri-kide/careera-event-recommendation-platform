-- Fix the has_role permission bug completely for all users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- Ensure the handle_new_user trigger function is also executable
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO public;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
