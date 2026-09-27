import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Compass, Sparkles, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Careera — Discover College Events" },
      { name: "description", content: "Discover, register and manage college events, hackathons and workshops in one place." },
    ],
  }),
});

function Landing() {
  const { user, role } = useAuth();
  const dashHref = role === "admin" ? "/admin" : role === "organizer" ? "/organizer" : "/student";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary shadow-glow grid place-items-center text-primary-foreground font-bold">C</div>
            <span className="font-display font-bold text-xl">Careera</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#audiences" className="hover:text-foreground transition">For You</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild><Link to={dashHref}>Dashboard</Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
                <Button asChild className="bg-gradient-primary shadow-glow"><Link to="/signup">Get started</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60" style={{
          background: "radial-gradient(800px circle at 20% 0%, oklch(0.94 0.06 160), transparent 60%), radial-gradient(700px circle at 80% 30%, oklch(0.92 0.08 178), transparent 60%)",
        }} />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered event recommendations
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            Every college event,
            <br />
            <span className="text-gradient">in one beautiful place.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover hackathons, workshops, fests and competitions across colleges.
            Register in one click. Built for students, organizers, and admins.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button size="lg" asChild className="bg-gradient-primary shadow-glow h-12 px-7 text-base">
              <Link to={user ? dashHref : "/signup"}>
                {user ? "Go to dashboard" : "Get started — it's free"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-7 text-base">
              <Link to="/events">Browse events</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Free for students", "Verified organizers", "Real-time approvals"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Compass, title: "Discover effortlessly", body: "Filter by category, college, date or fee. Find what fits you in seconds." },
            { icon: Sparkles, title: "Smart recommendations", body: "Personalized suggestions based on your interests, skills and past events." },
            { icon: Users, title: "Built for organizers", body: "Publish events, track participants and export attendee lists in one click." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
              <div className="h-10 w-10 rounded-lg bg-accent grid place-items-center">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section id="audiences" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { tag: "Students", title: "Never miss a great event", points: ["Personalized 'For You' feed", "Track registered events", "Earn referral rewards"] },
            { tag: "Organizers", title: "Run events like a pro", points: ["Publish in minutes", "Live participant analytics", "Announcements & notifications"] },
            { tag: "Admins", title: "Stay in control", points: ["Approve organizers & events", "Platform-wide analytics", "Activity logs & reports"] },
          ].map((a) => (
            <div key={a.tag} className="rounded-2xl border border-border bg-card p-7">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">{a.tag}</div>
              <h3 className="mt-2 font-display text-2xl font-bold">{a.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {a.points.map((p) => (
                  <li key={p} className="flex items-start gap-2"><Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="how" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-hero p-12 md:p-16 text-center text-primary-foreground shadow-glow">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Ready to find your next event?</h2>
          <p className="mt-3 opacity-90 max-w-xl mx-auto">Join Careera and turn your college calendar into your career launchpad.</p>
          <Button size="lg" variant="secondary" asChild className="mt-8 h-12 px-7 text-base">
            <Link to={user ? dashHref : "/signup"}>{user ? "Open dashboard" : "Create your account"}</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Careera. Crafted for campuses.
      </footer>
    </div>
  );
}
