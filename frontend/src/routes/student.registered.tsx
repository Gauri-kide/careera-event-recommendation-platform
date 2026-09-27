import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard-shell";
import { EventCard, EmptyState } from "@/components/event-card";

export const Route = createFileRoute("/student/registered")({
  component: Registered,
});

function Registered() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["registered-events", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const hardcodedEvents = [
        {
          id: "hardcoded-1", title: "Mumbai Tech Week 2026", description: "Large-scale technology and AI innovation event featuring founders startups developers venture capital networking cloud computing machine learning artificial intelligence startup ecosystem keynote sessions workshops and innovation showcase",
          category: "AI Conference", venue: "Mumbai", start_at: "2026-06-12T00:00:00Z", end_at: "2026-06-14T23:59:59Z", is_online: false, source_url: "https://mumbaitechweek.com", banner_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
          fee: 5000, status: "approved"
        },
        {
          id: "hardcoded-2", title: "SummerSaaS AI Hackathon 2026", description: "AI-focused student hackathon with coding machine learning deep learning innovation startup building team collaboration prototype development and competitive programming rounds",
          category: "Hackathon", venue: "Online", start_at: "2026-07-02T00:00:00Z", end_at: "2026-07-04T23:59:59Z", is_online: true, source_url: "https://internshala.com/competitions/summersaas-ai-hackathon-2026", banner_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
          fee: 0, status: "approved"
        },
        {
          id: "hardcoded-3", title: "Goldman Sachs India Hackathon 2026", description: "Quantitative finance computer science software engineering and coding competition focused on algorithms fintech data structures machine learning and analytical problem solving",
          category: "Coding", venue: "Bengaluru", start_at: "2026-08-10T00:00:00Z", end_at: "2026-08-12T23:59:59Z", is_online: false, source_url: "https://www.goldmansachs.com/careers/students/programs-and-internships/india/hackathon", banner_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
          fee: 0, status: "approved"
        },
        {
          id: "hardcoded-4", title: "PRAKALP 2026", description: "National-level 24-hour hackathon innovation expo mentorship startup incubation coding challenges AI solutions product development and engineering innovation showcase",
          category: "Hackathon", venue: "Andhra Pradesh", start_at: "2026-09-15T00:00:00Z", end_at: "2026-09-16T23:59:59Z", is_online: false, source_url: "https://www.rcee.ac.in/prakalp", banner_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
          fee: 0, status: "approved"
        },
        {
          id: "hardcoded-5", title: "NMIT Hacks 2026", description: "MLH-sanctioned student hackathon focused on rapid prototyping AI development cloud applications teamwork coding APIs and startup innovation",
          category: "Hackathon", venue: "Bengaluru", start_at: "2026-10-03T00:00:00Z", end_at: "2026-10-05T23:59:59Z", is_online: false, source_url: "https://mlh.io", banner_url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
          fee: 0, status: "approved"
        },
        {
          id: "hardcoded-6", title: "ERP Expo 2026", description: "Enterprise resource planning AI solutions business automation SaaS digital transformation cloud ERP networking enterprise software and startup technology expo",
          category: "Business", venue: "Pune", start_at: "2026-11-08T00:00:00Z", end_at: "2026-11-10T23:59:59Z", is_online: false, source_url: "https://erpexpoindia.com", banner_url: "https://images.unsplash.com/photo-1552664730-d307ca884978",
          fee: 4000, status: "approved"
        },
        {
          id: "hardcoded-7", title: "IIT Madras Technology Summit", description: "Research and innovation summit showcasing AI robotics machine learning semiconductor technology startup ecosystem engineering research and advanced computing",
          category: "AI Conference", venue: "New Delhi", start_at: "2026-12-05T00:00:00Z", end_at: "2026-12-06T23:59:59Z", is_online: false, source_url: "https://www.iitm.ac.in", banner_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
          fee: 3500, status: "approved"
        },
        {
          id: "hardcoded-8", title: "India Tech Summit", description: "Technology startup networking venture capital innovation digital transformation AI entrepreneurship cloud computing and product development summit",
          category: "Startup", venue: "New Delhi", start_at: "2026-07-22T00:00:00Z", end_at: "2026-07-24T23:59:59Z", is_online: false, source_url: "https://eventbrite.com", banner_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
          fee: 4500, status: "approved"
        },
        {
          id: "hardcoded-9", title: "EFY Expo Pune 2026", description: "Electronics embedded systems IoT robotics semiconductor PCB design automation AI hardware and emerging technology exhibition",
          category: "Electronics", venue: "Pune", start_at: "2026-08-18T00:00:00Z", end_at: "2026-08-20T23:59:59Z", is_online: false, source_url: "https://www.efyexpo.com", banner_url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
          fee: 2500, status: "approved"
        },
        {
          id: "hardcoded-10", title: "AI for All Challenge", description: "AI-focused innovation challenge featuring machine learning NLP computer vision coding data science and real-world AI problem solving competitions",
          category: "AI Challenge", venue: "Online", start_at: "2026-09-28T00:00:00Z", end_at: "2026-09-30T23:59:59Z", is_online: true, source_url: "https://reskilll.com/allhacks", banner_url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
          fee: 0, status: "approved"
        }
      ] as any[];

      const localRegsIds = JSON.parse(localStorage.getItem(`regs_${user!.id}`) || "[]");
      const storedLocalEvents: any[] = JSON.parse(localStorage.getItem("local_events") || "[]");
      const localEvents = [
        ...localRegsIds.map((id: string) => hardcodedEvents.find(e => e.id === id)).filter(Boolean),
        ...localRegsIds.map((id: string) => storedLocalEvents.find(e => e.id === id)).filter(Boolean),
      ];

      try {
        const { data, error } = await supabase
          .from("registrations")
          .select("event_id, events(*)")
          .eq("user_id", user!.id);
        if (error) { console.warn("[dev] registered-events query:", error.message); return localEvents; }
        const supabaseEvents = (data ?? []).map((r) => r.events).filter(Boolean);
        return [...supabaseEvents, ...localEvents] as any[];
      } catch (e) { console.warn("[dev] registered-events crashed:", e); return localEvents; }
    },
  });

  const now = Date.now();
  const upcoming = (data ?? []).filter((e) => e && e.start_at && new Date(e.start_at).getTime() >= now);
  const past = (data ?? []).filter((e) => e && e.start_at && new Date(e.start_at).getTime() < now);

  return (
    <div>
      <PageHeader title="My events" subtitle="Everything you've registered for." />

      <h2 className="font-display text-lg font-semibold mb-3">Upcoming</h2>
      {isLoading ? <div className="text-muted-foreground">Loading...</div> : upcoming.length === 0 ? (
        <EmptyState title="Nothing scheduled" description="Browse events and register to see them here." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e) => e && <EventCard key={e.id} event={e} hrefBase="/student/discover" />)}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="font-display text-lg font-semibold mb-3 mt-10">Past</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => e && <EventCard key={e.id} event={e} hrefBase="/student/discover" />)}
          </div>
        </>
      )}
    </div>
  );
}
