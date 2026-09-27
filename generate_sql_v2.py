import json

events = [
    {
        "title": "Mumbai Tech Week 2026",
        "desc": "Large-scale technology and AI innovation event featuring founders startups developers venture capital networking cloud computing machine learning artificial intelligence startup ecosystem keynote sessions workshops and innovation showcase",
        "venue": "Mumbai",
        "category": "AI Conference",
        "organizer": "Mumbai Tech Association",
        "start": "2026-06-12",
        "end": "2026-06-14",
        "is_online": "false",
        "url": "https://mumbaitechweek.com",
        "banner": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
        "tags": "['AI','Machine Learning','Startup','Innovation','Developers','Networking']",
        "fee": "5000",
        "eligibility": "Developers,Students,Startups",
        "seats": "5000",
        "email": "mumbai_tech_v2@careera.com"
    },
    {
        "title": "SummerSaaS AI Hackathon 2026",
        "desc": "AI-focused student hackathon with coding machine learning deep learning innovation startup building team collaboration prototype development and competitive programming rounds",
        "venue": "Online",
        "category": "Hackathon",
        "organizer": "SummerSaaS",
        "start": "2026-07-02",
        "end": "2026-07-04",
        "is_online": "true",
        "url": "https://internshala.com/competitions/summersaas-ai-hackathon-2026",
        "banner": "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
        "tags": "['AI','Hackathon','Coding','Deep Learning','Innovation','Students']",
        "fee": "0",
        "eligibility": "Students,Developers",
        "seats": "2000",
        "email": "summersaas_v2@careera.com"
    },
    {
        "title": "Goldman Sachs India Hackathon 2026",
        "desc": "Quantitative finance computer science software engineering and coding competition focused on algorithms fintech data structures machine learning and analytical problem solving",
        "venue": "Bengaluru",
        "category": "Coding",
        "organizer": "Goldman Sachs",
        "start": "2026-08-10",
        "end": "2026-08-12",
        "is_online": "false",
        "url": "https://www.goldmansachs.com/careers/students/programs-and-internships/india/hackathon",
        "banner": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
        "tags": "['Coding','Fintech','Algorithms','Software Engineering','Machine Learning']",
        "fee": "0",
        "eligibility": "Developers,Engineering Students",
        "seats": "1500",
        "email": "goldman_sachs_v2@careera.com"
    },
    {
        "title": "PRAKALP 2026",
        "desc": "National-level 24-hour hackathon innovation expo mentorship startup incubation coding challenges AI solutions product development and engineering innovation showcase",
        "venue": "Andhra Pradesh",
        "category": "Hackathon",
        "organizer": "RCEE Innovation Cell",
        "start": "2026-09-15",
        "end": "2026-09-16",
        "is_online": "false",
        "url": "https://www.rcee.ac.in/prakalp",
        "banner": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
        "tags": "['Hackathon','Innovation','AI','Startup','Coding','Engineering']",
        "fee": "0",
        "eligibility": "Students,Developers,Innovators",
        "seats": "3000",
        "email": "rcee_innovation_v2@careera.com"
    },
    {
        "title": "NMIT Hacks 2026",
        "desc": "MLH-sanctioned student hackathon focused on rapid prototyping AI development cloud applications teamwork coding APIs and startup innovation",
        "venue": "Bengaluru",
        "category": "Hackathon",
        "organizer": "NMIT Bangalore",
        "start": "2026-10-03",
        "end": "2026-10-05",
        "is_online": "false",
        "url": "https://mlh.io",
        "banner": "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
        "tags": "['Hackathon','AI','Cloud','Coding','Innovation','APIs']",
        "fee": "0",
        "eligibility": "Students,Developers",
        "seats": "1800",
        "email": "nmit_hacks_v2@careera.com"
    },
    {
        "title": "ERP Expo 2026",
        "desc": "Enterprise resource planning AI solutions business automation SaaS digital transformation cloud ERP networking enterprise software and startup technology expo",
        "venue": "Pune",
        "category": "Business",
        "organizer": "ERP Expo India",
        "start": "2026-11-08",
        "end": "2026-11-10",
        "is_online": "false",
        "url": "https://erpexpoindia.com",
        "banner": "https://images.unsplash.com/photo-1552664730-d307ca884978",
        "tags": "['Business','ERP','AI','SaaS','Cloud','Enterprise']",
        "fee": "4000",
        "eligibility": "Business Owners,Developers,Startups",
        "seats": "4000",
        "email": "erp_expo_v2@careera.com"
    },
    {
        "title": "IIT Madras Technology Summit",
        "desc": "Research and innovation summit showcasing AI robotics machine learning semiconductor technology startup ecosystem engineering research and advanced computing",
        "venue": "New Delhi",
        "category": "AI Conference",
        "organizer": "IIT Madras",
        "start": "2026-12-05",
        "end": "2026-12-06",
        "is_online": "false",
        "url": "https://www.iitm.ac.in",
        "banner": "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        "tags": "['AI','Robotics','Machine Learning','Research','Technology','Engineering']",
        "fee": "3500",
        "eligibility": "Researchers,Students,Developers",
        "seats": "3500",
        "email": "iit_madras_v2@careera.com"
    },
    {
        "title": "India Tech Summit",
        "desc": "Technology startup networking venture capital innovation digital transformation AI entrepreneurship cloud computing and product development summit",
        "venue": "New Delhi",
        "category": "Startup",
        "organizer": "India Tech Community",
        "start": "2026-07-22",
        "end": "2026-07-24",
        "is_online": "false",
        "url": "https://eventbrite.com",
        "banner": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
        "tags": "['Startup','AI','Networking','Cloud','Entrepreneurship','Innovation']",
        "fee": "4500",
        "eligibility": "Startups,Developers,Entrepreneurs",
        "seats": "4500",
        "email": "india_tech_v2@careera.com"
    },
    {
        "title": "EFY Expo Pune 2026",
        "desc": "Electronics embedded systems IoT robotics semiconductor PCB design automation AI hardware and emerging technology exhibition",
        "venue": "Pune",
        "category": "Electronics",
        "organizer": "EFY Group",
        "start": "2026-08-18",
        "end": "2026-08-20",
        "is_online": "false",
        "url": "https://www.efyexpo.com",
        "banner": "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "tags": "['Electronics','IoT','Robotics','AI','Embedded Systems','Hardware']",
        "fee": "2500",
        "eligibility": "Engineers,Students,Developers",
        "seats": "2500",
        "email": "efy_expo_v2@careera.com"
    },
    {
        "title": "AI for All Challenge",
        "desc": "AI-focused innovation challenge featuring machine learning NLP computer vision coding data science and real-world AI problem solving competitions",
        "venue": "Online",
        "category": "AI Challenge",
        "organizer": "AI Community India",
        "start": "2026-09-28",
        "end": "2026-09-30",
        "is_online": "true",
        "url": "https://reskilll.com/allhacks",
        "banner": "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
        "tags": "['AI','Machine Learning','NLP','Computer Vision','Data Science','Coding']",
        "fee": "0",
        "eligibility": "Students,Developers,AI Enthusiasts",
        "seats": "5000",
        "email": "ai_community_v2@careera.com"
    }
]

sql = '''-- Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Fix the permissions bug
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;

DO $$
DECLARE
  org_id uuid;
BEGIN
'''

for i, e in enumerate(events):
    sql += f'''  -- Organizer: {e['organizer']}
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    '{e["email"]}',
    extensions.crypt('Careera$StrongPass!2026', extensions.gen_salt('bf')),
    now(),
    '{{"provider":"email","providers":["email"]}}',
    '{{"role":"organizer","full_name":"{e["organizer"]}"}}',
    now(),
    now()
  )
  RETURNING id INTO org_id;

  INSERT INTO public.events (organizer_id, title, description, category, venue, start_at, end_at, is_online, source_url, banner_url, tags, fee, eligibility, seats, status, is_external, contact)
  VALUES (
    org_id,
    '{e["title"]}',
    '{e["desc"]}',
    '{e["category"]}',
    '{e["venue"]}',
    '{e["start"]} 00:00:00+00',
    '{e["end"]} 23:59:59+00',
    {e["is_online"]},
    '{e["url"]}',
    '{e["banner"]}',
    ARRAY{e["tags"]},
    {e["fee"]},
    '{e["eligibility"]}',
    {e["seats"]},
    'approved',
    true,
    '{e["organizer"]}'
  );

'''

sql += 'END\n$$;\n'

with open('seed_organizers_final.sql', 'w') as f:
    f.write(sql)
