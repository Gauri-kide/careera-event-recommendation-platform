import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard-shell";
import { EventCard, EventCardSkeleton, EmptyState } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recommendEventsLocally, filterRecommendations } from "@/lib/recommend";
import type { Database } from "@/integrations/supabase/types";
type EventRow = Database["public"]["Tables"]["events"]["Row"];

const RECOMMENDER_API_URL = import.meta.env.VITE_RECOMMENDER_API_URL ?? "http://127.0.0.1:8000";

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

async function fetchEventsFromDb(): Promise<EventRow[]> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "approved")
      .order("start_at", { ascending: true });
    if (!error && data?.length) return data as EventRow[];
  } catch {}
  return [];
}

async function getRecommendations(interests: string[], allEvents: EventRow[]): Promise<(EventRow & { score: number })[]> {
  if (!interests.length || !allEvents.length) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${RECOMMENDER_API_URL}/recommend-from-db`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests, events: allEvents, top_n: 9 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (response.ok) {
      const result = await response.json();
      const apiRecs = result.recommendations as (EventRow & { score: number })[];
      if (apiRecs?.length) {
        const filtered = filterRecommendations(apiRecs, interests, 9);
        if (filtered.length) return filtered;
      }
    }
  } catch {}

  return recommendEventsLocally(interests, allEvents, 9);
}

export const Route = createFileRoute("/student/recommended")({
  component: Recommended,
});

function Recommended() {
  const { user } = useAuth();

  const { data: allEvents } = useQuery({
    queryKey: ["all-events"],
    queryFn: async () => {
      const dbEvents = await fetchEventsFromDb();
      const localEvents: EventRow[] = JSON.parse(localStorage.getItem("local_events") || "[]")
        .filter((e: any) => e.status === "approved");
      const seen = new Set<string>();
      return [...hardcodedEvents, ...localEvents, ...dbEvents].filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: userInterests } = useQuery({
    queryKey: ["profile-interests", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<string[]> => {
      try {
        const { data, error } = await supabase.from("profiles").select("interests").eq("id", user!.id).single();
        if (!error && data) return (data.interests ?? []) as string[];
      } catch {}
      return [];
    },
    staleTime: 30000,
  });

  const interestsKey = userInterests?.join(",") ?? "";
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ["recommended", user?.id, interestsKey],
    enabled: !!user && !!allEvents && !!userInterests,
    queryFn: async () => {
      return getRecommendations(userInterests!, allEvents!);
    },
  });

  const { data: modelTopics } = useQuery({
    queryKey: ["model-topics"],
    queryFn: async () => {
      try {
        const res = await fetch(`${RECOMMENDER_API_URL}/model/topics`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 10,
  });

  const hasInterests = !!userInterests?.length;

  return (
    <div>
      <PageHeader
        title="For you"
        subtitle="AI-powered event recommendations based on your interests."
      />

      {modelTopics?.topics && modelTopics.topics.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium">Model topics</h4>
          <div className="flex gap-2 mt-2 flex-wrap">
            {modelTopics.topics.map((t: any) => (
              <Badge key={t.id} variant="secondary" className="text-xs text-foreground border border-primary/20 bg-primary/10">
                {t.keywords.slice(0, 4).join(", ")}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <EmptyState
          title="Could not load recommendations"
          description="The recommendation service is unavailable. Please try again later."
        />
      ) : !hasInterests ? (
        <EmptyState
          title="Set your interests first"
          description="Add comma-separated interests to your profile so we can find the perfect events for you."
          action={
            <Button asChild>
              <Link to="/student/profile">Update profile</Link>
            </Button>
          }
        />
      ) : !recommendations?.length ? (
        <EmptyState
          title="No matching events"
          description="No events match your interests. Try adding different or broader interests."
          action={
            <Button asChild>
              <Link to="/student/profile">Update interests</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((e) => (
            <EventCard key={e.id} event={e} hrefBase="/student/discover" score={e.score} />
          ))}
        </div>
      )}
    </div>
  );
}
