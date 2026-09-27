import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/student/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: "", college: "", branch: "", year: "", interests: "", skills: "" });
  const [saving, setSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
        if (error) { console.warn("[dev] profile query:", error.message); return null; }
        return data;
      } catch (e) { console.warn("[dev] profile crashed:", e); return null; }
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        college: profile.college ?? "",
        branch: profile.branch ?? "",
        year: profile.year ?? "",
        interests: (profile.interests ?? []).join(", "),
        skills: (profile.skills ?? []).join(", "),
      });
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name,
        college: form.college,
        branch: form.branch,
        year: form.year,
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      }).eq("id", user!.id);
      setSaving(false);
      if (error) { console.warn("[dev] profile save:", error.message); toast.error(error.message); return; }
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["for-you", user!.id] });
    } catch (e) { setSaving(false); console.warn("[dev] profile save crashed:", e); }
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Keep your info up to date for better recommendations." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-gradient-card p-6 text-center">
          <div className="h-20 w-20 rounded-full bg-gradient-primary mx-auto grid place-items-center text-primary-foreground font-display font-bold text-2xl shadow-glow">
            {(form.full_name || user?.email || "?")[0]?.toUpperCase()}
          </div>
          <div className="mt-4 font-semibold">{form.full_name || "Your name"}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
          {profile?.referral_code && (
            <div className="mt-5 p-3 rounded-lg bg-accent">
              <div className="text-xs text-muted-foreground">Your referral code</div>
              <div className="font-mono font-bold text-lg text-primary">{profile.referral_code}</div>
            </div>
          )}
        </div>

        <form onSubmit={save} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>College</Label><Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} /></div>
            <div><Label>Branch</Label><Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
            <div><Label>Year</Label><Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
          </div>
          <div><Label>Interests (comma separated)</Label><Textarea rows={2} value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="hackathon, design, AI" /></div>
          <div><Label>Skills (comma separated)</Label><Textarea rows={2} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Python, Public speaking" /></div>
          <Button type="submit" disabled={saving} className="bg-gradient-primary shadow-glow">{saving ? "Saving..." : "Save changes"}</Button>
        </form>
      </div>
    </div>
  );
}
