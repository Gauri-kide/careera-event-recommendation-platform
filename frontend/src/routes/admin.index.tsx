import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, StatCard } from "@/components/dashboard-shell";
import { Calendar, CheckCircle2, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        const results = await Promise.allSettled([
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);
        const getCount = (r: PromiseSettledResult<any>, idx: number) => {
          if (r.status === "fulfilled" && !r.value.error) return r.value.count ?? 0;
          console.warn(`[dev] admin-stats query ${idx} failed`);
          return 0;
        };
        return {
          total: getCount(results[0], 0),
          pending: getCount(results[1], 1),
          approved: getCount(results[2], 2),
          users: getCount(results[3], 3),
        };
      } catch (e) { console.warn("[dev] admin-stats crashed:", e); return { total: 0, pending: 0, approved: 0, users: 0 }; }
    },
  });

  return (
    <div>
      <PageHeader title="Platform overview" subtitle="Monitor activity across Careera." />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total events" value={data?.total ?? 0} icon={Calendar} />
        <StatCard label="Pending review" value={data?.pending ?? 0} icon={Clock} hint="Action needed" />
        <StatCard label="Approved" value={data?.approved ?? 0} icon={CheckCircle2} />
        <StatCard label="Users" value={data?.users ?? 0} icon={Users} />
      </div>
    </div>
  );
}
