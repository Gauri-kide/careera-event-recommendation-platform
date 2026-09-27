import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard-shell";
import { EventCard, EmptyState } from "@/components/event-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/organizer/events")({
  component: MyEvents,
});

function MyEvents() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["org-events-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const localEvents: any[] = JSON.parse(localStorage.getItem("local_events") || "[]")
        .filter((e: any) => e.organizer_id === user!.id);
      try {
        const { data, error } = await supabase.from("events").select("*").eq("organizer_id", user!.id).order("created_at", { ascending: false });
        if (error) { console.warn("[dev] org-events-list query:", error.message); return localEvents; }
        return [...(data ?? []), ...localEvents];
      } catch (e) { console.warn("[dev] org-events-list crashed:", e); return localEvents; }
    },
  });

  return (
    <div>
      <PageHeader title="My events" subtitle="Everything you've published or submitted." action={
        <Button asChild className="bg-gradient-primary shadow-glow"><Link to="/organizer/new">+ New event</Link></Button>
      } />
      {isLoading ? <div className="text-muted-foreground">Loading...</div> : !data?.length ? (
        <EmptyState title="No events yet" description="Create your first event to start attracting students." action={
          <Button asChild><Link to="/organizer/new">Create event</Link></Button>
        } />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((e) => <EventCard key={e.id} event={e} hrefBase="/student/discover" />)}
        </div>
      )}
    </div>
  );
}
