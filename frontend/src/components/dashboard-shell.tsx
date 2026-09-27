import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, type AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function DashboardShell({
  navItems,
  requiredRole,
  brandSubtitle,
}: {
  navItems: NavItem[];
  requiredRole: AppRole;
  brandSubtitle: string;
}) {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <Link to="/" className="flex items-center gap-2 h-16 px-6 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary shadow-glow grid place-items-center text-primary-foreground font-bold">C</div>
          <div>
            <div className="font-display font-bold leading-tight">Careera</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{brandSubtitle}</div>
          </div>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.to || (item.to !== `/${requiredRole}` && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={async () => { await signOut(); navigate({ to: "/", replace: true }); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="lg:hidden h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground font-bold text-sm">C</div>
            <h2 className="font-display font-semibold text-lg capitalize">{requiredRole} dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <div className="text-sm">
                <div className="font-medium leading-tight">{user.email}</div>
                <div className="text-xs text-muted-foreground capitalize">{role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden border-b border-border bg-card overflow-x-auto">
          <nav className="flex gap-1 p-2 min-w-max">
            {navItems.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link key={item.to} to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                    active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`}>
                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                </Link>
              );
            })}
            <button onClick={async () => { await signOut(); navigate({ to: "/", replace: true }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </nav>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint?: string; icon: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-accent grid place-items-center"><Icon className="h-4 w-4 text-primary" /></div>
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
