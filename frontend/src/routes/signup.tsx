import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Megaphone, X } from "lucide-react";
import { AuthShell } from "./login";

const INTEREST_OPTIONS = [
  "AI & Machine Learning", "Web Development", "App Development",
  "Blockchain", "Cybersecurity", "Cloud Computing",
  "Data Science", "IoT & Robotics", "AR/VR",
  "Gaming", "Design & UI/UX", "Photography",
  "Music", "Sports", "Business & Startup",
  "Hackathons", "Coding Competitions", "Electronics",
];

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create account — Careera" }] }),
});

type Role = "student" | "organizer";

function SignupPage() {
  const [role, setRole] = useState<Role | null>(null);
  return (
    <AuthShell title="Create your account" subtitle="Choose how you'll use Careera">
      {!role ? <RolePick onPick={setRole} /> : <SignupForm role={role} onBack={() => setRole(null)} />}
    </AuthShell>
  );
}

function RolePick({ onPick }: { onPick: (r: Role) => void }) {
  const cards = [
    { role: "student" as const, icon: GraduationCap, title: "I'm a Student", body: "Discover and register for events." },
    { role: "organizer" as const, icon: Megaphone, title: "I'm an Organizer", body: "Publish events and manage participants." },
  ];
  return (
    <div className="space-y-3">
      {cards.map((c) => (
        <button
          key={c.role}
          onClick={() => onPick(c.role)}
          className="w-full text-left p-5 rounded-xl border border-border hover:border-primary hover:bg-accent/40 transition flex items-start gap-4 group"
        >
          <div className="h-11 w-11 rounded-lg bg-accent grid place-items-center group-hover:bg-gradient-primary group-hover:text-primary-foreground transition">
            <c.icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm text-muted-foreground">{c.body}</div>
          </div>
        </button>
      ))}
      <p className="text-center text-sm text-muted-foreground pt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

function SignupForm({ role, onBack }: { role: Role; onBack: () => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [interests, setInterests] = useState<string[]>([]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name) {
      toast.error("Please fill required fields");
      return;
    }
    setLoading(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: form.full_name,
          role,
          college: form.college,
          branch: form.branch,
          year: form.year,
          club_name: form.club_name,
          contact_number: form.contact_number,
          position: form.position,
        },
      },
    });
    if (error) { setLoading(false); toast.error(error.message); return; }
    if (!signUpData.session) {
      setLoading(false);
      toast.success("Account created! Check your email to confirm your address before signing in.");
      navigate({ to: "/login", replace: true });
      return;
    }
    if (signUpData.user) {
      try {
        await supabase.from("profiles").upsert({
          id: signUpData.user.id,
          email: signUpData.user.email,
          full_name: form.full_name,
          college: form.college,
          branch: form.branch,
          year: form.year,
          interests: role === "student" ? interests : [],
          club_name: form.club_name,
          contact_number: form.contact_number,
          position: form.position,
        }, { onConflict: "id" });
      } catch (e) { console.warn("[dev] signup profile upsert:", e); }
      try {
        await supabase.from("user_roles").upsert({
          user_id: signUpData.user.id,
          role,
        }, { onConflict: "user_id,role" });
      } catch (e) { console.warn("[dev] signup role upsert:", e); }
    }
    setLoading(false);
    toast.success("Account created! Signing you in...");
    navigate({ to: role === "organizer" ? "/organizer" : "/student", replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Change role</button>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name *" id="full_name" required onChange={set("full_name")} />
        <Field label="Email *" id="email" type="email" required onChange={set("email")} />
        <Field label="Password *" id="password" type="password" required onChange={set("password")} />
        <Field label="College" id="college" onChange={set("college")} />

        {role === "student" ? (
          <>
            <Field label="Branch" id="branch" onChange={set("branch")} />
            <Field label="Year" id="year" onChange={set("year")} />
            <div className="sm:col-span-2 space-y-2">
              <Label>What are you interested in?</Label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => setInterests(selected ? interests.filter((i) => i !== interest) : [...interests, interest])}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        selected ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40 text-muted-foreground"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {interests.map((i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {i}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setInterests(interests.filter((x) => x !== i))} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Field label="Club / Org name" id="club_name" onChange={set("club_name")} />
            <Field label="Contact number" id="contact_number" onChange={set("contact_number")} />
            <Field label="Position / Role" id="position" onChange={set("position")} />
          </>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
        {loading ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </form>
  );
}

function Field({ label, id, ...props }: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={props.type === "password" || id === "full_name" || id === "email" ? "sm:col-span-2" : ""}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}
