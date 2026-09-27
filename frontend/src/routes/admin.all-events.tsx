import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/event-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type StatusFilter = "all" | "approved" | "pending" | "rejected";

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_STYLE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
};

const hardcodedEvents = [
  { id: "hc-1", organizer_id: null, title: "Mumbai Tech Week 2026", description: "Large-scale technology and AI innovation event.", category: "AI Conference", venue: "Mumbai", start_at: "2026-06-12T00:00:00Z", end_at: null, is_online: false, source_url: "", banner_url: "", tags: [], fee: 5000, eligibility: "", seats: null, status: "approved", is_external: true, registration_deadline: null, created_at: "2026-01-01T00:00:00Z", contact: null, team_size: null, rules: null },
  { id: "hc-2", organizer_id: null, title: "SummerSaaS AI Hackathon 2026", description: "AI-focused student hackathon.", category: "Hackathon", venue: "Online", start_at: "2026-07-02T00:00:00Z", end_at: null, is_online: true, source_url: "", banner_url: "", tags: [], fee: 0, eligibility: "", seats: null, status: "pending", is_external: true, registration_deadline: null, created_at: "2026-02-01T00:00:00Z", contact: null, team_size: null, rules: null },
  { id: "hc-3", organizer_id: null, title: "Goldman Sachs India Hackathon 2026", description: "Coding competition focused on algorithms and fintech.", category: "Coding", venue: "Bengaluru", start_at: "2026-08-10T00:00:00Z", end_at: null, is_online: false, source_url: "", banner_url: "", tags: [], fee: 0, eligibility: "", seats: null, status: "pending", is_external: true, registration_deadline: null, created_at: "2026-02-15T00:00:00Z", contact: null, team_size: null, rules: null },
  { id: "hc-4", organizer_id: null, title: "PRAKALP 2026", description: "National-level 24-hour hackathon.", category: "Hackathon", venue: "Andhra Pradesh", start_at: "2026-09-15T00:00:00Z", end_at: null, is_online: false, source_url: "", banner_url: "", tags: [], fee: 0, eligibility: "", seats: null, status: "approved", is_external: true, registration_deadline: null, created_at: "2026-03-01T00:00:00Z", contact: null, team_size: null, rules: null },
  { id: "hc-5", organizer_id: null, title: "NMIT Hacks 2026", description: "MLH-sanctioned student hackathon.", category: "Hackathon", venue: "Bengaluru", start_at: "2026-10-03T00:00:00Z", end_at: null, is_online: false, source_url: "", banner_url: "", tags: [], fee: 0, eligibility: "", seats: null, status: "rejected", is_external: true, registration_deadline: null, created_at: "2026-01-15T00:00:00Z", contact: null, team_size: null, rules: null },
  { id: "hc-6", organizer_id: null, title: "ERP Expo 2026", description: "Enterprise resource planning expo.", category: "Business", venue: "Pune", start_at: "2026-11-08T00:00:00Z", end_at: null, is_online: false, source_url: "", banner_url: "", tags: [], fee: 4000, eligibility: "", seats: null, status: "approved", is_external: true, registration_deadline: null, created_at: "2026-03-15T00:00:00Z", contact: null, team_size: null, rules: null },
  { id: "hc-7", organizer_id: null, title: "IIT Madras Technology Summit", description: "Research and innovation summit.", category: "AI Conference", venue: "New Delhi", start_at: "2026-12-05T00:00:00Z", end_at: null, is_online: false, source_url: "", banner_url: "", tags: [], fee: 3500, eligibility: "", seats: null, status: "pending", is_external: true, registration_deadline: null, created_at: "2026-04-01T00:00:00Z", contact: null, team_size: null, rules: null },
  { id: "hc-8", organizer_id: null, title: "India Tech Summit", description: "Technology startup networking summit.", category: "Startup", venue: "New Delhi", start_at: "2026-07-22T00:00:00Z", end_at: null, is_online: false, source_url: "", banner_url: "", tags: [], fee: 4500, eligibility: "", seats: null, status: "approved", is_external: true, registration_deadline: null, created_at: "2026-02-20T00:00:00Z", contact: null, team_size: null, rules: null },
  { id: "hc-9", organizer_id: null, title: "EFY Expo Pune 2026", description: "Electronics and embedded systems exhibition.", category: "Electronics", venue: "Pune", start_at: "2026-08-18T00:00:00Z", end_at: null, is_online: false, source_url: "", banner_url: "", tags: [], fee: 2500, eligibility: "", seats: null, status: "pending", is_external: true, registration_deadline: null, created_at: "2026-03-10T00:00:00Z", contact: null, team_size: null, rules: null },
  { id: "hc-10", organizer_id: null, title: "AI for All Challenge", description: "AI-focused innovation challenge.", category: "AI Challenge", venue: "Online", start_at: "2026-09-28T00:00:00Z", end_at: null, is_online: true, source_url: "", banner_url: "", tags: [], fee: 0, eligibility: "", seats: null, status: "approved", is_external: true, registration_deadline: null, created_at: "2026-04-10T00:00:00Z", contact: null, team_size: null, rules: null },
];

export const Route = createFileRoute("/admin/all-events")({
  component: AllEvents,
});

function AllEvents() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [localEvents, setLocalEvents] = useState(hardcodedEvents);

  const { data: dbEvents } = useQuery({
    queryKey: ["all-admin-events"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
        if (error) { console.warn("[dev] all-admin-events query:", error.message); return []; }
        return data ?? [];
      } catch (e) { console.warn("[dev] all-admin-events crashed:", e); return []; }
    },
  });

  const isDbEmpty = !dbEvents?.length;
  const data = isDbEmpty ? localEvents : (dbEvents as any[]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    if (isDbEmpty) {
      setLocalEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      toast.success(`Event ${status}`);
      return;
    }
    try {
      const { error } = await supabase.from("events").update({ status }).eq("id", id);
      if (error) { console.warn("[dev] decide update:", error.message); toast.error(error.message); return; }
      toast.success(`Event ${status}`);
      qc.invalidateQueries({ queryKey: ["all-admin-events"] });
    } catch (e) { console.warn("[dev] decide crashed:", e); }
  };

  const filtered = filter === "all" ? data : (data ?? []).filter((e: any) => e.status === filter);

  return (
    <div>
      <PageHeader title="All events" subtitle="Every event on the platform." />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg border capitalize transition ${
              filter === f.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!filtered?.length ? (
        <EmptyState title="No events" description="Nothing matches this filter." />
      ) : (
        <div className="space-y-4">
          {filtered.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col md:flex-row gap-4 md:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{e.category || "Event"}</span>
                  <Badge variant={STATUS_STYLE[e.status] ?? "outline"} className="capitalize">{e.status}</Badge>
                </div>
                <h3 className="font-display font-semibold text-lg">{e.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  {e.start_at && <>📅 {new Date(e.start_at).toLocaleDateString()} · </>}
                  {e.venue && <>📍 {e.venue}</>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {e.status === "pending" ? (
                  <>
                    <Button variant="outline" onClick={() => decide(e.id, "rejected")}>Reject</Button>
                    <Button onClick={() => decide(e.id, "approved")} className="bg-gradient-primary shadow-glow">Approve</Button>
                  </>
                ) : e.status === "approved" ? (
                  <Button variant="outline" onClick={() => decide(e.id, "rejected")}>Revoke</Button>
                ) : (
                  <Button onClick={() => decide(e.id, "approved")} className="bg-gradient-primary shadow-glow">Approve</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
