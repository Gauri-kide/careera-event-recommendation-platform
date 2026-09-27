import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jnbfxoldgygtavqozzdf.supabase.co";

const key = process.env.SERVICE_KEY;
if (!key) {
  console.error("\n❌ SERVICE_KEY not set.\n");
  console.log("1. Go to: https://supabase.com/dashboard/project/jnbfxoldgygtavqozzdf/settings/api");
  console.log("2. Copy the `service_role` key (NOT the anon/public key)");
  console.log("3. Run: SERVICE_KEY='<paste your key here>' node setup_db.mjs\n");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, key, {
  auth: { persistSession: false },
});

async function run() {
  console.log("Setting up database...\n");

  // 1. Create user_roles + profiles for all existing auth users
  console.log("Syncing user_roles for existing users...");
  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    for (const u of authUsers.users) {
      const role = u.user_metadata?.role || "student";
      await supabase.from("profiles").upsert(
        { id: u.id, email: u.email, full_name: u.user_metadata?.full_name || "" },
        { onConflict: "id" }
      );
      await supabase.from("user_roles").upsert(
        { user_id: u.id, role },
        { onConflict: "user_id,role" }
      );
      console.log(`  ✓ ${u.email} → ${role}`);
    }
  } catch (e) {
    console.log("  Could not list users:", e.message);
    console.log("  (This is fine for new signups — the signup code now creates roles automatically)");
  }

  // 2. Seed the 10 hardcoded events as approved
  console.log("\nSeeding approved events...");
  const events = [
    { title: "Mumbai Tech Week 2026", description: "Large-scale technology and AI innovation event.", category: "AI Conference", venue: "Mumbai", start_at: "2026-06-12T00:00:00Z", fee: 5000, is_online: false, source_url: "https://mumbaitechweek.com", banner_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3", tags: ["AI","Machine Learning","Startup","Innovation","Developers","Networking"], eligibility: "Developers,Students,Startups", seats: 5000, status: "approved", is_external: true },
    { title: "SummerSaaS AI Hackathon 2026", description: "AI-focused student hackathon.", category: "Hackathon", venue: "Online", start_at: "2026-07-02T00:00:00Z", fee: 0, is_online: true, source_url: "https://internshala.com/competitions/summersaas-ai-hackathon-2026", banner_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c", tags: ["AI","Hackathon","Coding","Deep Learning","Innovation","Students"], eligibility: "Students,Developers", seats: 2000, status: "approved", is_external: true },
    { title: "Goldman Sachs India Hackathon 2026", description: "Coding competition focused on algorithms and fintech.", category: "Coding", venue: "Bengaluru", start_at: "2026-08-10T00:00:00Z", fee: 0, is_online: false, source_url: "https://www.goldmansachs.com/careers/students/programs-and-internships/india/hackathon", banner_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", tags: ["Coding","Fintech","Algorithms","Software Engineering","Machine Learning"], eligibility: "Developers,Engineering Students", seats: 1500, status: "approved", is_external: true },
    { title: "PRAKALP 2026", description: "National-level 24-hour hackathon.", category: "Hackathon", venue: "Andhra Pradesh", start_at: "2026-09-15T00:00:00Z", fee: 0, is_online: false, source_url: "https://www.rcee.ac.in/prakalp", banner_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d", tags: ["Hackathon","Innovation","AI","Startup","Coding","Engineering"], eligibility: "Students,Developers,Innovators", seats: 3000, status: "approved", is_external: true },
    { title: "NMIT Hacks 2026", description: "MLH-sanctioned student hackathon.", category: "Hackathon", venue: "Bengaluru", start_at: "2026-10-03T00:00:00Z", fee: 0, is_online: false, source_url: "https://mlh.io", banner_url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f", tags: ["Hackathon","AI","Cloud","Coding","Innovation","APIs"], eligibility: "Students,Developers", seats: 1800, status: "approved", is_external: true },
    { title: "ERP Expo 2026", description: "Enterprise resource planning expo.", category: "Business", venue: "Pune", start_at: "2026-11-08T00:00:00Z", fee: 4000, is_online: false, source_url: "https://erpexpoindia.com", banner_url: "https://images.unsplash.com/photo-1552664730-d307ca884978", tags: ["Business","ERP","AI","SaaS","Cloud","Enterprise"], eligibility: "Business Owners,Developers,Startups", seats: 4000, status: "approved", is_external: true },
    { title: "IIT Madras Technology Summit", description: "Research and innovation summit.", category: "AI Conference", venue: "New Delhi", start_at: "2026-12-05T00:00:00Z", fee: 3500, is_online: false, source_url: "https://www.iitm.ac.in", banner_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", tags: ["AI","Robotics","Machine Learning","Research","Technology","Engineering"], eligibility: "Researchers,Students,Developers", seats: 3500, status: "approved", is_external: true },
    { title: "India Tech Summit", description: "Technology startup networking summit.", category: "Startup", venue: "New Delhi", start_at: "2026-07-22T00:00:00Z", fee: 4500, is_online: false, source_url: "https://eventbrite.com", banner_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4", tags: ["Startup","AI","Networking","Cloud","Entrepreneurship","Innovation"], eligibility: "Startups,Developers,Entrepreneurs", seats: 4500, status: "approved", is_external: true },
    { title: "EFY Expo Pune 2026", description: "Electronics and embedded systems exhibition.", category: "Electronics", venue: "Pune", start_at: "2026-08-18T00:00:00Z", fee: 2500, is_online: false, source_url: "https://www.efyexpo.com", banner_url: "https://images.unsplash.com/photo-1518770660439-4636190af475", tags: ["Electronics","IoT","Robotics","AI","Embedded Systems","Hardware"], eligibility: "Engineers,Students,Developers", seats: 2500, status: "approved", is_external: true },
    { title: "AI for All Challenge", description: "AI-focused innovation challenge.", category: "AI Challenge", venue: "Online", start_at: "2026-09-28T00:00:00Z", fee: 0, is_online: true, source_url: "https://reskilll.com/allhacks", banner_url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a", tags: ["AI","Machine Learning","NLP","Computer Vision","Data Science","Coding"], eligibility: "Students,Developers,AI Enthusiasts", seats: 5000, status: "approved", is_external: true },
  ];
  for (const ev of events) {
    const { error } = await supabase.from("events").upsert(
      { ...ev, organizer_id: null },
      { onConflict: "title", ignoreDuplicates: true }
    );
    if (error) console.error(`  ✗ ${ev.title}: ${error.message}`);
    else console.log(`  ✓ ${ev.title}`);
  }

  console.log("\n✅ Setup complete!");
  console.log("→ Clear localStorage events: Open DevTools → Application → Local Storage");
  console.log("  → Delete 'local_events' key → Refresh the page");
  console.log("→ New events created as organizer will now go directly to the DB");
  console.log("→ Admins can approve them at /admin/all-events");
}

run().catch(console.error);
