import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, Users, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";

export const Route = createFileRoute("/admin")({
  component: () => (
    <DashboardShell
      requiredRole="admin"
      brandSubtitle="Admin"
      navItems={[
        { to: "/admin", label: "Overview", icon: LayoutDashboard },
        { to: "/admin/events", label: "Approve events", icon: ShieldCheck },
        { to: "/admin/all-events", label: "All events", icon: Calendar },
        { to: "/admin/users", label: "Users", icon: Users },
      ]}
    />
  ),
});
