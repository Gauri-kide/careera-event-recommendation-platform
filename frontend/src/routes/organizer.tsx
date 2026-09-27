import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, Plus, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";

export const Route = createFileRoute("/organizer")({
  component: () => (
    <DashboardShell
      requiredRole="organizer"
      brandSubtitle="Organizer"
      navItems={[
        { to: "/organizer", label: "Overview", icon: LayoutDashboard },
        { to: "/organizer/events", label: "My events", icon: Calendar },
        { to: "/organizer/new", label: "Create event", icon: Plus },
        { to: "/organizer/participants", label: "Participants", icon: Users },
      ]}
    />
  ),
});
