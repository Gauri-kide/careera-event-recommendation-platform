import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jnbfxoldgygtavqozzdf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYmZ4b2xkZ3lndGF2cW96emRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDE3MDMsImV4cCI6MjA5NDA3NzcwM30.Y7PdppxVdM9eFZsTH8_0syS8kJuSLrTlBkKN9LLtYaQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const events = [
    {
        "title": "Mumbai Tech Week 2026",
        "desc": "Large-scale technology and AI innovation event featuring founders startups developers venture capital networking cloud computing machine learning artificial intelligence startup ecosystem keynote sessions workshops and innovation showcase",
        "venue": "Mumbai",
        "category": "AI Conference",
        "organizer": "Mumbai Tech Association",
        "start": "2026-06-12",
        "end": "2026-06-14",
        "is_online": false,
        "url": "https://mumbaitechweek.com",
        "banner": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
        "tags": ['AI','Machine Learning','Startup','Innovation','Developers','Networking'],
        "fee": 5000,
        "eligibility": "Developers,Students,Startups",
        "seats": 5000,
        "email": "mumbai_tech_organizer@careera.com"
    },
    {
        "title": "SummerSaaS AI Hackathon 2026",
        "desc": "AI-focused student hackathon with coding machine learning deep learning innovation startup building team collaboration prototype development and competitive programming rounds",
        "venue": "Online",
        "category": "Hackathon",
        "organizer": "SummerSaaS",
        "start": "2026-07-02",
        "end": "2026-07-04",
        "is_online": true,
        "url": "https://internshala.com/competitions/summersaas-ai-hackathon-2026",
        "banner": "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
        "tags": ['AI','Hackathon','Coding','Deep Learning','Innovation','Students'],
        "fee": 0,
        "eligibility": "Students,Developers",
        "seats": 2000,
        "email": "summersaas_organizer@careera.com"
    },
    {
        "title": "Goldman Sachs India Hackathon 2026",
        "desc": "Quantitative finance computer science software engineering and coding competition focused on algorithms fintech data structures machine learning and analytical problem solving",
        "venue": "Bengaluru",
        "category": "Coding",
        "organizer": "Goldman Sachs",
        "start": "2026-08-10",
        "end": "2026-08-12",
        "is_online": false,
        "url": "https://www.goldmansachs.com/careers/students/programs-and-internships/india/hackathon",
        "banner": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
        "tags": ['Coding','Fintech','Algorithms','Software Engineering','Machine Learning'],
        "fee": 0,
        "eligibility": "Developers,Engineering Students",
        "seats": 1500,
        "email": "goldman_sachs_organizer@careera.com"
    },
    {
        "title": "PRAKALP 2026",
        "desc": "National-level 24-hour hackathon innovation expo mentorship startup incubation coding challenges AI solutions product development and engineering innovation showcase",
        "venue": "Andhra Pradesh",
        "category": "Hackathon",
        "organizer": "RCEE Innovation Cell",
        "start": "2026-09-15",
        "end": "2026-09-16",
        "is_online": false,
        "url": "https://www.rcee.ac.in/prakalp",
        "banner": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
        "tags": ['Hackathon','Innovation','AI','Startup','Coding','Engineering'],
        "fee": 0,
        "eligibility": "Students,Developers,Innovators",
        "seats": 3000,
        "email": "rcee_innovation_organizer@careera.com"
    },
    {
        "title": "NMIT Hacks 2026",
        "desc": "MLH-sanctioned student hackathon focused on rapid prototyping AI development cloud applications teamwork coding APIs and startup innovation",
        "venue": "Bengaluru",
        "category": "Hackathon",
        "organizer": "NMIT Bangalore",
        "start": "2026-10-03",
        "end": "2026-10-05",
        "is_online": false,
        "url": "https://mlh.io",
        "banner": "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
        "tags": ['Hackathon','AI','Cloud','Coding','Innovation','APIs'],
        "fee": 0,
        "eligibility": "Students,Developers",
        "seats": 1800,
        "email": "nmit_hacks_organizer@careera.com"
    },
    {
        "title": "ERP Expo 2026",
        "desc": "Enterprise resource planning AI solutions business automation SaaS digital transformation cloud ERP networking enterprise software and startup technology expo",
        "venue": "Pune",
        "category": "Business",
        "organizer": "ERP Expo India",
        "start": "2026-11-08",
        "end": "2026-11-10",
        "is_online": false,
        "url": "https://erpexpoindia.com",
        "banner": "https://images.unsplash.com/photo-1552664730-d307ca884978",
        "tags": ['Business','ERP','AI','SaaS','Cloud','Enterprise'],
        "fee": 4000,
        "eligibility": "Business Owners,Developers,Startups",
        "seats": 4000,
        "email": "erp_expo_organizer@careera.com"
    },
    {
        "title": "IIT Madras Technology Summit",
        "desc": "Research and innovation summit showcasing AI robotics machine learning semiconductor technology startup ecosystem engineering research and advanced computing",
        "venue": "New Delhi",
        "category": "AI Conference",
        "organizer": "IIT Madras",
        "start": "2026-12-05",
        "end": "2026-12-06",
        "is_online": false,
        "url": "https://www.iitm.ac.in",
        "banner": "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        "tags": ['AI','Robotics','Machine Learning','Research','Technology','Engineering'],
        "fee": 3500,
        "eligibility": "Researchers,Students,Developers",
        "seats": 3500,
        "email": "iit_madras_organizer@careera.com"
    },
    {
        "title": "India Tech Summit",
        "desc": "Technology startup networking venture capital innovation digital transformation AI entrepreneurship cloud computing and product development summit",
        "venue": "New Delhi",
        "category": "Startup",
        "organizer": "India Tech Community",
        "start": "2026-07-22",
        "end": "2026-07-24",
        "is_online": false,
        "url": "https://eventbrite.com",
        "banner": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
        "tags": ['Startup','AI','Networking','Cloud','Entrepreneurship','Innovation'],
        "fee": 4500,
        "eligibility": "Startups,Developers,Entrepreneurs",
        "seats": 4500,
        "email": "india_tech_organizer@careera.com"
    },
    {
        "title": "EFY Expo Pune 2026",
        "desc": "Electronics embedded systems IoT robotics semiconductor PCB design automation AI hardware and emerging technology exhibition",
        "venue": "Pune",
        "category": "Electronics",
        "organizer": "EFY Group",
        "start": "2026-08-18",
        "end": "2026-08-20",
        "is_online": false,
        "url": "https://www.efyexpo.com",
        "banner": "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "tags": ['Electronics','IoT','Robotics','AI','Embedded Systems','Hardware'],
        "fee": 2500,
        "eligibility": "Engineers,Students,Developers",
        "seats": 2500,
        "email": "efy_expo_organizer@careera.com"
    },
    {
        "title": "AI for All Challenge",
        "desc": "AI-focused innovation challenge featuring machine learning NLP computer vision coding data science and real-world AI problem solving competitions",
        "venue": "Online",
        "category": "AI Challenge",
        "organizer": "AI Community India",
        "start": "2026-09-28",
        "end": "2026-09-30",
        "is_online": true,
        "url": "https://reskilll.com/allhacks",
        "banner": "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
        "tags": ['AI','Machine Learning','NLP','Computer Vision','Data Science','Coding'],
        "fee": 0,
        "eligibility": "Students,Developers,AI Enthusiasts",
        "seats": 5000,
        "email": "ai_community_organizer@careera.com"
    }
];

async function run() {
    for (const e of events) {
        console.log(`Processing ${e.title}...`);
        
        // 1. Sign up the organizer
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: e.email,
            password: 'Careera$StrongPass!2026',
            options: {
                data: {
                    role: 'organizer',
                    full_name: e.organizer
                }
            }
        });

        if (authError) {
            console.error(`  -> Auth error for ${e.email}:`, authError.message);
            // Even if already registered, we should try to log in and insert
            if (authError.message.includes("already registered")) {
                await supabase.auth.signInWithPassword({
                    email: e.email,
                    password: 'Careera$StrongPass!2026'
                });
            } else {
                continue;
            }
        }

        // Auto sign in if session is missing (due to config)
        if (!authData.session) {
            await supabase.auth.signInWithPassword({ email: e.email, password: 'Careera$StrongPass!2026' });
        }

        const userId = (await supabase.auth.getUser()).data.user.id;

        // 2. Insert the event
        const { error: insertError } = await supabase.from('events').insert({
            organizer_id: userId,
            title: e.title,
            description: e.desc,
            category: e.category,
            venue: e.venue,
            start_at: `${e.start}T00:00:00Z`,
            end_at: `${e.end}T23:59:59Z`,
            is_online: e.is_online,
            source_url: e.url,
            banner_url: e.banner,
            tags: e.tags,
            fee: e.fee,
            eligibility: e.eligibility,
            seats: e.seats,
            status: 'approved',
            is_external: true,
            contact: e.organizer
        });

        if (insertError) {
            console.error(`  -> Insert error for ${e.title}:`, insertError.message);
        } else {
            console.log(`  -> Successfully inserted ${e.title} under ${e.email}`);
        }

        // Sign out to prepare for next user
        await supabase.auth.signOut();
    }
    console.log("Done!");
}

run();
