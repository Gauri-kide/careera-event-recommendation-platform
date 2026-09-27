import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/event-card";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        const [profilesRes, rolesRes] = await Promise.allSettled([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("user_roles").select("user_id, role"),
        ]);
        const profiles = profilesRes.status === "fulfilled" && !profilesRes.value.error ? (profilesRes.value.data ?? []) : [];
        const roles = rolesRes.status === "fulfilled" && !rolesRes.value.error ? (rolesRes.value.data ?? []) : [];
        if (profilesRes.status === "rejected") console.warn("[dev] admin-users profiles query failed");
        if (rolesRes.status === "rejected") console.warn("[dev] admin-users roles query failed");
        const byUser = new Map<string, string[]>();
        (roles ?? []).forEach((r) => {
          const arr = byUser.get(r.user_id) ?? [];
          arr.push(r.role);
          byUser.set(r.user_id, arr);
        });
        return (profiles ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
      } catch (e) { console.warn("[dev] admin-users crashed:", e); return []; }
    },
  });

  if (!data?.length) return <div><PageHeader title="Users" /><EmptyState title="No users" description="No accounts yet." /></div>;

  return (
    <div>
      <PageHeader title="Users" subtitle="All registered users on Careera." />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">College</th>
              <th className="text-left p-4">Roles</th>
              <th className="text-left p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-4 font-medium">{u.full_name || "—"}</td>
                <td className="p-4 text-muted-foreground">{u.email || "—"}</td>
                <td className="p-4 text-muted-foreground">{u.college || "—"}</td>
                <td className="p-4 capitalize">{u.roles.join(", ") || "—"}</td>
                <td className="p-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
