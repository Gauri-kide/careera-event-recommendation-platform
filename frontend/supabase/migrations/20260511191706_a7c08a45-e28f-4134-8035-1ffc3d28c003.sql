
-- Roles
CREATE TYPE public.app_role AS ENUM ('student', 'organizer', 'admin');
CREATE TYPE public.event_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Trigger: create profile + assign role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, college, branch, year, club_name, contact_number, position, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'club_name',
    NEW.raw_user_meta_data->>'contact_number',
    NEW.raw_user_meta_data->>'position',
    upper(substr(md5(NEW.id::text),1,8))
  );
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student'::public.app_role);
  -- Never let public signups assign admin
  IF _role = 'admin' THEN _role := 'student'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view approved or own or admin" ON public.events FOR SELECT TO authenticated
  USING (status='approved' OR organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "organizers insert events" ON public.events FOR INSERT TO authenticated
  WITH CHECK (organizer_id = auth.uid() AND (public.has_role(auth.uid(),'organizer') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "organizers update own events" ON public.events FOR UPDATE TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "organizers delete own events" ON public.events FOR DELETE TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Registrations
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  attended boolean DEFAULT false,
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own or organizer or admin" ON public.registrations FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = registrations.event_id AND e.organizer_id = auth.uid())
  );
CREATE POLICY "students register" ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "users delete own registration" ON public.registrations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "admins write notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "users mark own read" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
