-- ============================================================
-- LOCAL DEV BYPASS: create tables, disable RLS, seed roles
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create types if they don't exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('student', 'organizer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.event_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text,
  college text,
  branch text,
  year text,
  interests text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  past_events text,
  avatar_url text,
  club_name text,
  contact_number text,
  position text,
  verification_doc_url text,
  referral_code text UNIQUE,
  referred_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid,
  title text NOT NULL,
  description text,
  category text,
  tags text[] DEFAULT '{}',
  banner_url text,
  start_at timestamptz,
  end_at timestamptz,
  venue text,
  is_online boolean DEFAULT false,
  fee numeric DEFAULT 0,
  eligibility text,
  rules text,
  team_size int DEFAULT 1,
  registration_deadline timestamptz,
  contact text,
  college text,
  status public.event_status NOT NULL DEFAULT 'pending',
  is_external boolean DEFAULT false,
  source_url text,
  seats int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  attended boolean DEFAULT false,
  UNIQUE (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  body text,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. DISABLE ROW LEVEL SECURITY on ALL tables
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- 4. Drop all RLS policies (they're useless with RLS disabled, but clean up)
DROP POLICY IF EXISTS "view own role" ON public.user_roles;
DROP POLICY IF EXISTS "admin manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "anon view own role" ON public.user_roles;
DROP POLICY IF EXISTS "users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "view events" ON public.events;
DROP POLICY IF EXISTS "insert events" ON public.events;
DROP POLICY IF EXISTS "update events" ON public.events;
DROP POLICY IF EXISTS "delete events" ON public.events;
DROP POLICY IF EXISTS "anon view approved events" ON public.events;
DROP POLICY IF EXISTS "view approved or own or admin" ON public.events;
DROP POLICY IF EXISTS "organizers insert events" ON public.events;
DROP POLICY IF EXISTS "organizers update own events" ON public.events;
DROP POLICY IF EXISTS "organizers delete own events" ON public.events;
DROP POLICY IF EXISTS "view registrations" ON public.registrations;
DROP POLICY IF EXISTS "register" ON public.registrations;
DROP POLICY IF EXISTS "delete registration" ON public.registrations;
DROP POLICY IF EXISTS "view own or organizer or admin" ON public.registrations;
DROP POLICY IF EXISTS "students register" ON public.registrations;
DROP POLICY IF EXISTS "users delete own registration" ON public.registrations;
DROP POLICY IF EXISTS "view notifications" ON public.notifications;
DROP POLICY IF EXISTS "write notifications" ON public.notifications;
DROP POLICY IF EXISTS "mark read" ON public.notifications;
DROP POLICY IF EXISTS "view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "admins write notifications" ON public.notifications;
DROP POLICY IF EXISTS "users mark own read" ON public.notifications;
DROP POLICY IF EXISTS "view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "anon view profiles" ON public.profiles;

-- 5. Restore EXECUTE on functions (in case still broken)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO public;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
