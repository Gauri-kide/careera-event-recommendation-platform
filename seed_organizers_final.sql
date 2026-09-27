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
