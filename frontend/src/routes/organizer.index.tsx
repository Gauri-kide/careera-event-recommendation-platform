import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatCard } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/organizer/")({
  component: OrganizerOverview,
});

function OrganizerOverview() {
  const { user } = useAuth();
  const { data: events } = useQuery({
    queryKey: ["org-events", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const localEvents: any[] = JSON.parse(localStorage.getItem("local_events") || "[]")
        .filter((e: any) => e.organizer_id === user!.id);
      try {
        const { data, error } = await supabase.from("events").select("*").eq("organizer_id", user!.id);
        if (error) { console.warn("[dev] org-events query:", error.message); return localEvents; }
        return [...(data ?? []), ...localEvents];
      } catch (e) { console.warn("[dev] org-events crashed:", e); return localEvents; }
    },
  });

  const approved = events?.filter((e) => e.status === "approved").length ?? 0;
  const pending = events?.filter((e) => e.status === "pending").length ?? 0;

  return (
    <div>
      <PageHeader
        title="Organizer overview"
        subtitle="Track your events and grow your audience."
        action={<Button asChild className="bg-gradient-primary shadow-glow"><Link to="/organizer/new">+ Create event</Link></Button>}
      />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard label="Total events" value={events?.length ?? 0} icon={Calendar} />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} />
        <StatCard label="Pending review" value={pending} icon={Clock} />
        <StatCard label="Participants" value="—" icon={Users} hint="Across all events" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <h3 className="font-display text-lg font-semibold">Ready to publish?</h3>
        <p className="text-muted-foreground text-sm mt-1">Submit your event — admins review within 24 hours.</p>
        <Button asChild className="mt-4 bg-gradient-primary shadow-glow"><Link to="/organizer/new">Create your first event</Link></Button>
      </div>
    </div>
  );
}
