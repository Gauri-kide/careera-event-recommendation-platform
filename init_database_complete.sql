-- 1. Schema Migration (Tables, Roles, Profiles, Events)

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


-- 2. Security Migration

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;


-- 3. Data Seeding & Permission Fixes
-- Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Fix the permissions bug
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;

DO $$
DECLARE
  org_id uuid;
BEGIN
  -- Organizer: Mumbai Tech Association
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mumbai_tech_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"Mumbai Tech Association"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'Mumbai Tech Week 2026',
    'Large-scale technology and AI innovation event featuring founders startups developers venture capital networking cloud computing machine learning artificial intelligence startup ecosystem keynote sessions workshops and innovation showcase',
    'AI Conference',
    'Mumbai',
    '2026-06-12 00:00:00+00',
    '2026-06-14 23:59:59+00',
    false,
    'https://mumbaitechweek.com',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    ARRAY['AI','Machine Learning','Startup','Innovation','Developers','Networking'],
    5000,
    'Developers,Students,Startups',
    5000,
    'approved',
    true,
    'Mumbai Tech Association'
  );

  -- Organizer: SummerSaaS
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'summersaas_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"SummerSaaS"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'SummerSaaS AI Hackathon 2026',
    'AI-focused student hackathon with coding machine learning deep learning innovation startup building team collaboration prototype development and competitive programming rounds',
    'Hackathon',
    'Online',
    '2026-07-02 00:00:00+00',
    '2026-07-04 23:59:59+00',
    true,
    'https://internshala.com/competitions/summersaas-ai-hackathon-2026',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    ARRAY['AI','Hackathon','Coding','Deep Learning','Innovation','Students'],
    0,
    'Students,Developers',
    2000,
    'approved',
    true,
    'SummerSaaS'
  );

  -- Organizer: Goldman Sachs
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'goldman_sachs_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"Goldman Sachs"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'Goldman Sachs India Hackathon 2026',
    'Quantitative finance computer science software engineering and coding competition focused on algorithms fintech data structures machine learning and analytical problem solving',
    'Coding',
    'Bengaluru',
    '2026-08-10 00:00:00+00',
    '2026-08-12 23:59:59+00',
    false,
    'https://www.goldmansachs.com/careers/students/programs-and-internships/india/hackathon',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
    ARRAY['Coding','Fintech','Algorithms','Software Engineering','Machine Learning'],
    0,
    'Developers,Engineering Students',
    1500,
    'approved',
    true,
    'Goldman Sachs'
  );

  -- Organizer: RCEE Innovation Cell
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rcee_innovation_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"RCEE Innovation Cell"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'PRAKALP 2026',
    'National-level 24-hour hackathon innovation expo mentorship startup incubation coding challenges AI solutions product development and engineering innovation showcase',
    'Hackathon',
    'Andhra Pradesh',
    '2026-09-15 00:00:00+00',
    '2026-09-16 23:59:59+00',
    false,
    'https://www.rcee.ac.in/prakalp',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    ARRAY['Hackathon','Innovation','AI','Startup','Coding','Engineering'],
    0,
    'Students,Developers,Innovators',
    3000,
    'approved',
    true,
    'RCEE Innovation Cell'
  );

  -- Organizer: NMIT Bangalore
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'nmit_hacks_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"NMIT Bangalore"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'NMIT Hacks 2026',
    'MLH-sanctioned student hackathon focused on rapid prototyping AI development cloud applications teamwork coding APIs and startup innovation',
    'Hackathon',
    'Bengaluru',
    '2026-10-03 00:00:00+00',
    '2026-10-05 23:59:59+00',
    false,
    'https://mlh.io',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
    ARRAY['Hackathon','AI','Cloud','Coding','Innovation','APIs'],
    0,
    'Students,Developers',
    1800,
    'approved',
    true,
    'NMIT Bangalore'
  );

  -- Organizer: ERP Expo India
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'erp_expo_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"ERP Expo India"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'ERP Expo 2026',
    'Enterprise resource planning AI solutions business automation SaaS digital transformation cloud ERP networking enterprise software and startup technology expo',
    'Business',
    'Pune',
    '2026-11-08 00:00:00+00',
    '2026-11-10 23:59:59+00',
    false,
    'https://erpexpoindia.com',
    'https://images.unsplash.com/photo-1552664730-d307ca884978',
    ARRAY['Business','ERP','AI','SaaS','Cloud','Enterprise'],
    4000,
    'Business Owners,Developers,Startups',
    4000,
    'approved',
    true,
    'ERP Expo India'
  );

  -- Organizer: IIT Madras
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'iit_madras_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"IIT Madras"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'IIT Madras Technology Summit',
    'Research and innovation summit showcasing AI robotics machine learning semiconductor technology startup ecosystem engineering research and advanced computing',
    'AI Conference',
    'New Delhi',
    '2026-12-05 00:00:00+00',
    '2026-12-06 23:59:59+00',
    false,
    'https://www.iitm.ac.in',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    ARRAY['AI','Robotics','Machine Learning','Research','Technology','Engineering'],
    3500,
    'Researchers,Students,Developers',
    3500,
    'approved',
    true,
    'IIT Madras'
  );

  -- Organizer: India Tech Community
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'india_tech_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"India Tech Community"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'India Tech Summit',
    'Technology startup networking venture capital innovation digital transformation AI entrepreneurship cloud computing and product development summit',
    'Startup',
    'New Delhi',
    '2026-07-22 00:00:00+00',
    '2026-07-24 23:59:59+00',
    false,
    'https://eventbrite.com',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
    ARRAY['Startup','AI','Networking','Cloud','Entrepreneurship','Innovation'],
    4500,
    'Startups,Developers,Entrepreneurs',
    4500,
    'approved',
    true,
    'India Tech Community'
  );

  -- Organizer: EFY Group
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'efy_expo_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"EFY Group"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'EFY Expo Pune 2026',
    'Electronics embedded systems IoT robotics semiconductor PCB design automation AI hardware and emerging technology exhibition',
    'Electronics',
    'Pune',
    '2026-08-18 00:00:00+00',
    '2026-08-20 23:59:59+00',
    false,
    'https://www.efyexpo.com',
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    ARRAY['Electronics','IoT','Robotics','AI','Embedded Systems','Hardware'],
    2500,
    'Engineers,Students,Developers',
    2500,
    'approved',
    true,
    'EFY Group'
  );

  -- Organizer: AI Community India
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ai_community_v2@careera.com',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"organizer","full_name":"AI Community India"}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    'AI for All Challenge',
    'AI-focused innovation challenge featuring machine learning NLP computer vision coding data science and real-world AI problem solving competitions',
    'AI Challenge',
    'Online',
    '2026-09-28 00:00:00+00',
    '2026-09-30 23:59:59+00',
    true,
    'https://reskilll.com/allhacks',
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a',
    ARRAY['AI','Machine Learning','NLP','Computer Vision','Data Science','Coding'],
    0,
    'Students,Developers,AI Enthusiasts',
    5000,
    'approved',
    true,
    'AI Community India'
  );

END
$$;
