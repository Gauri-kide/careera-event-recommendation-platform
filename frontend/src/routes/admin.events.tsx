import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/event-card";

export const Route = createFileRoute("/admin/events")({
  component: ApproveEvents,
});

function ApproveEvents() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["pending-events"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("events").select("*").eq("status", "pending").order("created_at", { ascending: false });
        if (error) { console.warn("[dev] pending-events query:", error.message); return []; }
        return data ?? [];
      } catch (e) { console.warn("[dev] pending-events crashed:", e); return []; }
    },
  });

  const decide = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("events").update({ status }).eq("id", id);
      if (error) { console.warn("[dev] decide update:", error.message); toast.error(error.message); return; }
      toast.success(`Event ${status}`);
      qc.invalidateQueries({ queryKey: ["pending-events"] });
    } catch (e) { console.warn("[dev] decide crashed:", e); }
  };

  return (
    <div>
      <PageHeader title="Approve events" subtitle="Review and approve new event submissions." />
      {!data?.length ? (
        <EmptyState title="All clear ✨" description="No events waiting for review." />
      ) : (
        <div className="space-y-4">
          {data.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col md:flex-row gap-4 md:items-center">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{e.category || "Event"}</div>
                <h3 className="font-display font-semibold text-lg">{e.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  {e.start_at && <>📅 {new Date(e.start_at).toLocaleDateString()} · </>}
                  {e.venue && <>📍 {e.venue}</>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={() => decide(e.id, "rejected")}>Reject</Button>
                <Button onClick={() => decide(e.id, "approved")} className="bg-gradient-primary shadow-glow">Approve</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
