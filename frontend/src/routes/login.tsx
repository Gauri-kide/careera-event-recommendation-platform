import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Careera" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      try {
        const { data: roles, error } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
        if (!error && roles?.length) {
          const r = roles.map((x) => x.role);
          const dest = r.includes("admin") ? "/admin" : r.includes("organizer") ? "/organizer" : "/student";
          navigate({ to: dest, replace: true });
          return;
        }
        if (error) console.warn("[dev] role query error:", error.message);
      } catch (e) {
        console.warn("[dev] role query failed:", e);
      }
      const metaRole = u.user.user_metadata?.role;
      if (metaRole === "admin") { navigate({ to: "/admin", replace: true }); return; }
      if (metaRole === "organizer") { navigate({ to: "/organizer", replace: true }); return; }
    }

    navigate({ to: "/student", replace: true });
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to Careera">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New to Careera?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-hero relative overflow-hidden p-12 text-primary-foreground">
        <div className="relative z-10 flex flex-col justify-between w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur grid place-items-center font-bold">C</div>
            <span className="font-display font-bold text-xl">Careera</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">Your campus, supercharged.</h2>
            <p className="mt-3 opacity-90 max-w-md">Discover events, build your profile, and connect with the best of your campus community.</p>
          </div>
        </div>
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground font-bold">C</div>
            <span className="font-display font-bold text-xl">Careera</span>
          </Link>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
