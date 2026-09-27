import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatCard } from "@/components/dashboard-shell";
import { EventCard, EventCardSkeleton, EmptyState } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Bell } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
type EventRow = Database["public"]["Tables"]["events"]["Row"];

const hardcodedEvents: EventRow[] = [
  { id: "hardcoded-1" as any, title: "Mumbai Tech Week 2026", description: "Large-scale technology and AI innovation event featuring founders startups developers venture capital networking cloud computing machine learning artificial intelligence startup ecosystem keynote sessions workshops and innovation showcase", category: "AI Conference", venue: "Mumbai", start_at: "2026-06-12T00:00:00Z", end_at: "2026-06-14T23:59:59Z", is_online: false, source_url: "https://mumbaitechweek.com", banner_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3", fee: 5000, status: "approved", tags: ["AI","Machine Learning","Startup","Innovation","Developers","Networking"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Developers,Students,Startups", seats: 5000, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
  { id: "hardcoded-2" as any, title: "SummerSaaS AI Hackathon 2026", description: "AI-focused student hackathon with coding machine learning deep learning innovation startup building team collaboration prototype development and competitive programming rounds", category: "Hackathon", venue: "Online", start_at: "2026-07-02T00:00:00Z", end_at: "2026-07-04T23:59:59Z", is_online: true, source_url: "https://internshala.com/competitions/summersaas-ai-hackathon-2026", banner_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c", fee: 0, status: "approved", tags: ["AI","Hackathon","Coding","Deep Learning","Innovation","Students"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Students,Developers", seats: 2000, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
  { id: "hardcoded-3" as any, title: "Goldman Sachs India Hackathon 2026", description: "Quantitative finance computer science software engineering and coding competition focused on algorithms fintech data structures machine learning and analytical problem solving", category: "Coding", venue: "Bengaluru", start_at: "2026-08-10T00:00:00Z", end_at: "2026-08-12T23:59:59Z", is_online: false, source_url: "https://www.goldmansachs.com/careers/students/programs-and-internships/india/hackathon", banner_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", fee: 0, status: "approved", tags: ["Coding","Fintech","Algorithms","Software Engineering","Machine Learning"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Developers,Engineering Students", seats: 1500, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
  { id: "hardcoded-4" as any, title: "PRAKALP 2026", description: "National-level 24-hour hackathon innovation expo mentorship startup incubation coding challenges AI solutions product development and engineering innovation showcase", category: "Hackathon", venue: "Andhra Pradesh", start_at: "2026-09-15T00:00:00Z", end_at: "2026-09-16T23:59:59Z", is_online: false, source_url: "https://www.rcee.ac.in/prakalp", banner_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d", fee: 0, status: "approved", tags: ["Hackathon","Innovation","AI","Startup","Coding","Engineering"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Students,Developers,Innovators", seats: 3000, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
  { id: "hardcoded-5" as any, title: "NMIT Hacks 2026", description: "MLH-sanctioned student hackathon focused on rapid prototyping AI development cloud applications teamwork coding APIs and startup innovation", category: "Hackathon", venue: "Bengaluru", start_at: "2026-10-03T00:00:00Z", end_at: "2026-10-05T23:59:59Z", is_online: false, source_url: "https://mlh.io", banner_url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f", fee: 0, status: "approved", tags: ["Hackathon","AI","Cloud","Coding","Innovation","APIs"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Students,Developers", seats: 1800, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
  { id: "hardcoded-6" as any, title: "ERP Expo 2026", description: "Enterprise resource planning AI solutions business automation SaaS digital transformation cloud ERP networking enterprise software and startup technology expo", category: "Business", venue: "Pune", start_at: "2026-11-08T00:00:00Z", end_at: "2026-11-10T23:59:59Z", is_online: false, source_url: "https://erpexpoindia.com", banner_url: "https://images.unsplash.com/photo-1552664730-d307ca884978", fee: 4000, status: "approved", tags: ["Business","ERP","AI","SaaS","Cloud","Enterprise"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Business Owners,Developers,Startups", seats: 4000, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
  { id: "hardcoded-7" as any, title: "IIT Madras Technology Summit", description: "Research and innovation summit showcasing AI robotics machine learning semiconductor technology startup ecosystem engineering research and advanced computing", category: "AI Conference", venue: "New Delhi", start_at: "2026-12-05T00:00:00Z", end_at: "2026-12-06T23:59:59Z", is_online: false, source_url: "https://www.iitm.ac.in", banner_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", fee: 3500, status: "approved", tags: ["AI","Robotics","Machine Learning","Research","Technology","Engineering"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Researchers,Students,Developers", seats: 3500, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
  { id: "hardcoded-8" as any, title: "India Tech Summit", description: "Technology startup networking venture capital innovation digital transformation AI entrepreneurship cloud computing and product development summit", category: "Startup", venue: "New Delhi", start_at: "2026-07-22T00:00:00Z", end_at: "2026-07-24T23:59:59Z", is_online: false, source_url: "https://eventbrite.com", banner_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4", fee: 4500, status: "approved", tags: ["Startup","AI","Networking","Cloud","Entrepreneurship","Innovation"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Startups,Developers,Entrepreneurs", seats: 4500, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
  { id: "hardcoded-9" as any, title: "EFY Expo Pune 2026", description: "Electronics embedded systems IoT robotics semiconductor PCB design automation AI hardware and emerging technology exhibition", category: "Electronics", venue: "Pune", start_at: "2026-08-18T00:00:00Z", end_at: "2026-08-20T23:59:59Z", is_online: false, source_url: "https://www.efyexpo.com", banner_url: "https://images.unsplash.com/photo-1518770660439-4636190af475", fee: 2500, status: "approved", tags: ["Electronics","IoT","Robotics","AI","Embedded Systems","Hardware"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Engineers,Students,Developers", seats: 2500, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
  { id: "hardcoded-10" as any, title: "AI for All Challenge", description: "AI-focused innovation challenge featuring machine learning NLP computer vision coding data science and real-world AI problem solving competitions", category: "AI Challenge", venue: "Online", start_at: "2026-09-28T00:00:00Z", end_at: "2026-09-30T23:59:59Z", is_online: true, source_url: "https://reskilll.com/allhacks", banner_url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a", fee: 0, status: "approved", tags: ["AI","Machine Learning","NLP","Computer Vision","Data Science","Coding"], organizer_id: null, created_at: "2026-01-01T00:00:00Z", eligibility: "Students,Developers,AI Enthusiasts", seats: 5000, is_external: true, team_size: null, registration_deadline: null, contact: null, college: null, rules: null },
];

export const Route = createFileRoute("/student/")({
  component: StudentOverview,
});

function StudentOverview() {
  const { user } = useAuth();

  const { data: upcoming, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const localEvents: any[] = JSON.parse(localStorage.getItem("local_events") || "[]").filter((e: any) => e.status === "approved");
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("status", "approved")
          .order("start_at", { ascending: true })
          .limit(6);
        if (!error) return [...(data || []), ...localEvents, ...hardcodedEvents].slice(0, 6);
      } catch {}
      return [...localEvents, ...hardcodedEvents].slice(0, 6);
    },
  });

  const { data: registrations } = useQuery({
    queryKey: ["my-regs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const localRegs = JSON.parse(localStorage.getItem(`regs_${user!.id}`) || "[]").map((id: string) => ({ event_id: id }));
      try {
        const { data, error } = await supabase.from("registrations").select("event_id").eq("user_id", user!.id);
        if (error) { console.warn("[dev] my-regs query:", error.message); return localRegs; }
        return [...(data ?? []), ...localRegs];
      } catch (e) { console.warn("[dev] my-regs crashed:", e); return localRegs; }
    },
  });

  return (
    <div>
      <PageHeader
        title="Welcome back 👋"
        subtitle="Here's what's happening on your campus."
        action={<Button asChild className="bg-gradient-primary shadow-glow"><Link to="/student/discover">Browse all events</Link></Button>}
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-10">
        <StatCard label="Upcoming" value={upcoming?.length ?? 0} icon={Calendar} hint="In your feed" />
        <StatCard label="Registered" value={registrations?.length ?? 0} icon={CheckCircle2} hint="Total events" />
        <StatCard label="Notifications" value={0} icon={Bell} hint="New today" />
      </div>

      <h2 className="font-display text-xl font-bold mb-4">Upcoming events</h2>
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : !upcoming?.length ? (
        <EmptyState
          title="No upcoming events yet"
          description="Check back soon — organizers across colleges are publishing new events every day."
          action={<Button asChild variant="outline"><Link to="/student/discover">Explore events</Link></Button>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e: EventRow) => <EventCard key={e.id} event={e} hrefBase="/student/discover" />)}
        </div>
      )}
    </div>
  );
}
