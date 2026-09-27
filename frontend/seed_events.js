import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase URL or Key in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node seed_events.js <your_email> <your_password>');
  process.exit(1);
}

const events = [
  {
    title: 'Mumbai Tech Week 2026', 
    description: 'Large-scale technology and AI innovation event featuring founders startups developers venture capital networking cloud computing machine learning artificial intelligence startup ecosystem keynote sessions workshops and innovation showcase',
    category: 'AI Conference',
    venue: 'Mumbai',
    start_at: '2026-06-12T00:00:00Z',
    end_at: '2026-06-14T23:59:59Z',
    is_online: false,
    source_url: 'https://mumbaitechweek.com',
    banner_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    tags: ['AI','Machine Learning','Startup','Innovation','Developers','Networking'],
    fee: 5000,
    eligibility: 'Developers,Students,Startups',
    seats: 5000,
    status: 'approved',
    is_external: true
  },
  {
    title: 'SummerSaaS AI Hackathon 2026', 
    description: 'AI-focused student hackathon with coding machine learning deep learning innovation startup building team collaboration prototype development and competitive programming rounds',
    category: 'Hackathon',
    venue: 'Online',
    start_at: '2026-07-02T00:00:00Z',
    end_at: '2026-07-04T23:59:59Z',
    is_online: true,
    source_url: 'https://internshala.com/competitions/summersaas-ai-hackathon-2026',
    banner_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    tags: ['AI','Hackathon','Coding','Deep Learning','Innovation','Students'],
    fee: 0,
    eligibility: 'Students,Developers',
    seats: 2000,
    status: 'approved',
    is_external: true
  },
  {
    title: 'Goldman Sachs India Hackathon 2026', 
    description: 'Quantitative finance computer science software engineering and coding competition focused on algorithms fintech data structures machine learning and analytical problem solving',
    category: 'Coding',
    venue: 'Bengaluru',
    start_at: '2026-08-10T00:00:00Z',
    end_at: '2026-08-12T23:59:59Z',
    is_online: false,
    source_url: 'https://www.goldmansachs.com/careers/students/programs-and-internships/india/hackathon',
    banner_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
    tags: ['Coding','Fintech','Algorithms','Software Engineering','Machine Learning'],
    fee: 0,
    eligibility: 'Developers,Engineering Students',
    seats: 1500,
    status: 'approved',
    is_external: true
  },
  {
    title: 'PRAKALP 2026', 
    description: 'National-level 24-hour hackathon innovation expo mentorship startup incubation coding challenges AI solutions product development and engineering innovation showcase',
    category: 'Hackathon',
    venue: 'Andhra Pradesh',
    start_at: '2026-09-15T00:00:00Z',
    end_at: '2026-09-16T23:59:59Z',
    is_online: false,
    source_url: 'https://www.rcee.ac.in/prakalp',
    banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    tags: ['Hackathon','Innovation','AI','Startup','Coding','Engineering'],
    fee: 0,
    eligibility: 'Students,Developers,Innovators',
    seats: 3000,
    status: 'approved',
    is_external: true
  },
  {
    title: 'NMIT Hacks 2026', 
    description: 'MLH-sanctioned student hackathon focused on rapid prototyping AI development cloud applications teamwork coding APIs and startup innovation',
    category: 'Hackathon',
    venue: 'Bengaluru',
    start_at: '2026-10-03T00:00:00Z',
    end_at: '2026-10-05T23:59:59Z',
    is_online: false,
    source_url: 'https://mlh.io',
    banner_url: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
    tags: ['Hackathon','AI','Cloud','Coding','Innovation','APIs'],
    fee: 0,
    eligibility: 'Students,Developers',
    seats: 1800,
    status: 'approved',
    is_external: true
  },
  {
    title: 'ERP Expo 2026', 
    description: 'Enterprise resource planning AI solutions business automation SaaS digital transformation cloud ERP networking enterprise software and startup technology expo',
    category: 'Business',
    venue: 'Pune',
    start_at: '2026-11-08T00:00:00Z',
    end_at: '2026-11-10T23:59:59Z',
    is_online: false,
    source_url: 'https://erpexpoindia.com',
    banner_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    tags: ['Business','ERP','AI','SaaS','Cloud','Enterprise'],
    fee: 4000,
    eligibility: 'Business Owners,Developers,Startups',
    seats: 4000,
    status: 'approved',
    is_external: true
  },
  {
    title: 'IIT Madras Technology Summit', 
    description: 'Research and innovation summit showcasing AI robotics machine learning semiconductor technology startup ecosystem engineering research and advanced computing',
    category: 'AI Conference',
    venue: 'New Delhi',
    start_at: '2026-12-05T00:00:00Z',
    end_at: '2026-12-06T23:59:59Z',
    is_online: false,
    source_url: 'https://www.iitm.ac.in',
    banner_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    tags: ['AI','Robotics','Machine Learning','Research','Technology','Engineering'],
    fee: 3500,
    eligibility: 'Researchers,Students,Developers',
    seats: 3500,
    status: 'approved',
    is_external: true
  },
  {
    title: 'India Tech Summit', 
    description: 'Technology startup networking venture capital innovation digital transformation AI entrepreneurship cloud computing and product development summit',
    category: 'Startup',
    venue: 'New Delhi',
    start_at: '2026-07-22T00:00:00Z',
    end_at: '2026-07-24T23:59:59Z',
    is_online: false,
    source_url: 'https://eventbrite.com',
    banner_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
    tags: ['Startup','AI','Networking','Cloud','Entrepreneurship','Innovation'],
    fee: 4500,
    eligibility: 'Startups,Developers,Entrepreneurs',
    seats: 4500,
    status: 'approved',
    is_external: true
  },
  {
    title: 'EFY Expo Pune 2026', 
    description: 'Electronics embedded systems IoT robotics semiconductor PCB design automation AI hardware and emerging technology exhibition',
    category: 'Electronics',
    venue: 'Pune',
    start_at: '2026-08-18T00:00:00Z',
    end_at: '2026-08-20T23:59:59Z',
    is_online: false,
    source_url: 'https://www.efyexpo.com',
    banner_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    tags: ['Electronics','IoT','Robotics','AI','Embedded Systems','Hardware'],
    fee: 2500,
    eligibility: 'Engineers,Students,Developers',
    seats: 2500,
    status: 'approved',
    is_external: true
  },
  {
    title: 'AI for All Challenge', 
    description: 'AI-focused innovation challenge featuring machine learning NLP computer vision coding data science and real-world AI problem solving competitions',
    category: 'AI Challenge',
    venue: 'Online',
    start_at: '2026-09-28T00:00:00Z',
    end_at: '2026-09-30T23:59:59Z',
    is_online: true,
    source_url: 'https://reskilll.com/allhacks',
    banner_url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a',
    tags: ['AI','Machine Learning','NLP','Computer Vision','Data Science','Coding'],
    fee: 0,
    eligibility: 'Students,Developers,AI Enthusiasts',
    seats: 5000,
    status: 'approved',
    is_external: true
  }
];

async function seed() {
  console.log('Logging in as', email, '...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error('Login failed:', authError?.message || 'User not found');
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log('Logged in! User ID:', userId);

  // Check role
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
    
  if (roleError) {
    console.error('Could not fetch user role:', roleError.message);
  } else if (roleData.role !== 'organizer' && roleData.role !== 'admin') {
    console.error(`Warning: Your role is '${roleData.role}'. You may get an error inserting events if you are not an 'organizer' or 'admin'.`);
  }

  console.log('Inserting 10 events as organizer...');
  
  const eventsToInsert = events.map(e => ({
    ...e,
    organizer_id: userId
  }));

  const { data, error } = await supabase
    .from('events')
    .insert(eventsToInsert)
    .select();

  if (error) {
    console.error('Error inserting events:', error.message);
    process.exit(1);
  }

  console.log('Successfully inserted', data.length, 'events!');
}

seed();
