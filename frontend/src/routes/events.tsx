import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventCard, EventCardSkeleton, EmptyState } from "@/components/event-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/events")({
  component: PublicEvents,
  head: () => ({ meta: [{ title: "Events — Careera" }] }),
});

function PublicEvents() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("events").select("*").order("start_at", { ascending: true });
        if (error) { console.warn("[dev] public-events query:", error.message); return []; }
        return data ?? [];
      } catch (e) { console.warn("[dev] public-events crashed:", e); return []; }
    },
  });
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground font-bold">C</div>
            <span className="font-display font-bold text-xl">Careera</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
            <Button asChild className="bg-gradient-primary shadow-glow"><Link to="/signup">Get started</Link></Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold">All events</h1>
        <p className="text-muted-foreground mt-2">Sign up to register and get personalized recommendations.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />) :
            !data?.length ? <div className="md:col-span-3"><EmptyState title="No events yet" description="Check back soon for upcoming events!" /></div> :
            data.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </div>
    </div>
  );
}
