-- Rewrite ALL RLS policies to NOT depend on has_role() function.
-- This eliminates "function has_role has no EXECUTE permission" errors permanently.

-- ===================== user_roles =====================
DROP POLICY IF EXISTS "users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;

-- Users see only their own role. No function call needed.
CREATE POLICY "view own role" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin management: subquery reads user_roles, SELECT RLS limits to own row,
-- WHERE role='admin' confirms. No recursion because the SELECT policy doesn't
-- read user_roles recursively.
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Allow anon to check their role during signup flow
CREATE POLICY "anon view own role" ON public.user_roles FOR SELECT TO anon
  USING (user_id = auth.uid());

-- ===================== events =====================
DROP POLICY IF EXISTS "view approved or own or admin" ON public.events;
DROP POLICY IF EXISTS "organizers insert events" ON public.events;
DROP POLICY IF EXISTS "organizers update own events" ON public.events;
DROP POLICY IF EXISTS "organizers delete own events" ON public.events;
DROP POLICY IF EXISTS "anon view approved events" ON public.events;

CREATE POLICY "view events" ON public.events FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR organizer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "insert events" ON public.events FOR INSERT TO authenticated
  WITH CHECK (
    organizer_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('organizer', 'admin'))
  );

CREATE POLICY "update events" ON public.events FOR UPDATE TO authenticated
  USING (organizer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "delete events" ON public.events FOR DELETE TO authenticated
  USING (organizer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Anon users can browse approved events (public discovery)
CREATE POLICY "anon view approved events" ON public.events FOR SELECT TO anon
  USING (status = 'approved');

-- ===================== registrations =====================
DROP POLICY IF EXISTS "view own or organizer or admin" ON public.registrations;
DROP POLICY IF EXISTS "students register" ON public.registrations;
DROP POLICY IF EXISTS "users delete own registration" ON public.registrations;

CREATE POLICY "view registrations" ON public.registrations FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = registrations.event_id AND e.organizer_id = auth.uid())
  );

CREATE POLICY "register" ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete registration" ON public.registrations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ===================== notifications =====================
DROP POLICY IF EXISTS "view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "admins write notifications" ON public.notifications;
DROP POLICY IF EXISTS "users mark own read" ON public.notifications;

CREATE POLICY "view notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "write notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "mark read" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ===================== profiles =====================
DROP POLICY IF EXISTS "anon view profiles" ON public.profiles;

-- Anon users can view profiles (needed for event organizer info)
CREATE POLICY "anon view profiles" ON public.profiles FOR SELECT TO anon
  USING (true);

-- ===================== reload schema =====================
NOTIFY pgrst, 'reload schema';
