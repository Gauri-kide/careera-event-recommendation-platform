import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, Sparkles, Bell, User } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";

export const Route = createFileRoute("/student")({
  component: () => (
    <DashboardShell
      requiredRole="student"
      brandSubtitle="Student"
      navItems={[
        { to: "/student", label: "Overview", icon: LayoutDashboard },
        { to: "/student/discover", label: "Discover events", icon: Calendar },
        { to: "/student/recommended", label: "For you", icon: Sparkles },
        { to: "/student/registered", label: "My events", icon: Bell },
        { to: "/student/profile", label: "Profile", icon: User },
      ]}
    />
  ),
});
