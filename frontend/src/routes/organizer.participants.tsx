import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/event-card";

export const Route = createFileRoute("/organizer/participants")({
  component: Participants,
});

function Participants() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["org-participants", user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("registrations")
          .select("id, created_at, events!inner(id, title, organizer_id), profiles:user_id(full_name, email, college)")
          .eq("events.organizer_id", user!.id)
          .order("created_at", { ascending: false });
        if (error) { console.warn("[dev] participants query:", error.message); return []; }
        return data ?? [];
      } catch (e) { console.warn("[dev] participants crashed:", e); return []; }
    },
  });

  return (
    <div>
      <PageHeader title="Participants" subtitle="Everyone registered to your events." />
      {!data?.length ? (
        <EmptyState title="No registrations yet" description="When students register for your events, they'll show up here." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">College</th>
                <th className="text-left p-4">Event</th>
                <th className="text-left p-4">Registered</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const profile = r.profiles as { full_name?: string; email?: string; college?: string } | null;
                const event = r.events as { title?: string } | null;
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-4 font-medium">{profile?.full_name || "—"}</td>
                    <td className="p-4 text-muted-foreground">{profile?.email || "—"}</td>
                    <td className="p-4 text-muted-foreground">{profile?.college || "—"}</td>
                    <td className="p-4">{event?.title || "—"}</td>
                    <td className="p-4 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
