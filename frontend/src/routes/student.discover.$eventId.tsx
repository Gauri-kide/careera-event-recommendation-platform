import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, MapPin, Users, IndianRupee, ArrowLeft, Share2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/student/discover/$eventId")({
  component: EventDetail,
});

type EventRow = Database["public"]["Tables"]["events"]["Row"];

const hardcodedEventMap: Record<string, { title: string; sourceUrl: string }> = {
  "hardcoded-1": { title: "Mumbai Tech Week 2026", sourceUrl: "https://mumbaitechweek.com" },
  "hardcoded-2": { title: "SummerSaaS AI Hackathon 2026", sourceUrl: "https://internshala.com/competitions/summersaas-ai-hackathon-2026" },
  "hardcoded-3": { title: "Goldman Sachs India Hackathon 2026", sourceUrl: "https://www.goldmansachs.com/careers/students/programs-and-internships/india/hackathon" },
  "hardcoded-4": { title: "PRAKALP 2026", sourceUrl: "https://www.rcee.ac.in/prakalp" },
  "hardcoded-5": { title: "NMIT Hacks 2026", sourceUrl: "https://mlh.io" },
  "hardcoded-6": { title: "ERP Expo 2026", sourceUrl: "https://erpexpoindia.com" },
  "hardcoded-7": { title: "IIT Madras Technology Summit", sourceUrl: "https://www.iitm.ac.in" },
  "hardcoded-8": { title: "India Tech Summit", sourceUrl: "https://eventbrite.com" },
  "hardcoded-9": { title: "EFY Expo Pune 2026", sourceUrl: "https://www.efyexpo.com" },
  "hardcoded-10": { title: "AI for All Challenge", sourceUrl: "https://reskilll.com/allhacks" },
};

const hardcodedEventFallbacks: Record<string, any> = {
  "hardcoded-1": {
    id: "hardcoded-1",
    title: "Mumbai Tech Week 2026",
    description:
      "Large-scale technology and AI innovation event featuring founders startups developers venture capital networking cloud computing machine learning artificial intelligence startup ecosystem keynote sessions workshops and innovation showcase",
    category: "AI Conference",
    venue: "Mumbai",
    start_at: "2026-06-12T00:00:00Z",
    end_at: "2026-06-14T23:59:59Z",
    is_online: false,
    source_url: "https://mumbaitechweek.com",
    banner_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    tags: ["AI", "Machine Learning", "Startup", "Innovation", "Developers", "Networking"],
    fee: 5000,
    eligibility: "Developers,Students,Startups",
    seats: 5000,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
  "hardcoded-2": {
    id: "hardcoded-2",
    title: "SummerSaaS AI Hackathon 2026",
    description:
      "AI-focused student hackathon with coding machine learning deep learning innovation startup building team collaboration prototype development and competitive programming rounds",
    category: "Hackathon",
    venue: "Online",
    start_at: "2026-07-02T00:00:00Z",
    end_at: "2026-07-04T23:59:59Z",
    is_online: true,
    source_url: "https://internshala.com/competitions/summersaas-ai-hackathon-2026",
    banner_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    tags: ["AI", "Hackathon", "Coding", "Deep Learning", "Innovation", "Students"],
    fee: 0,
    eligibility: "Students,Developers",
    seats: 2000,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
  "hardcoded-3": {
    id: "hardcoded-3",
    title: "Goldman Sachs India Hackathon 2026",
    description:
      "Quantitative finance computer science software engineering and coding competition focused on algorithms fintech data structures machine learning and analytical problem solving",
    category: "Coding",
    venue: "Bengaluru",
    start_at: "2026-08-10T00:00:00Z",
    end_at: "2026-08-12T23:59:59Z",
    is_online: false,
    source_url: "https://www.goldmansachs.com/careers/students/programs-and-internships/india/hackathon",
    banner_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    tags: ["Coding", "Fintech", "Algorithms", "Software Engineering", "Machine Learning"],
    fee: 0,
    eligibility: "Developers,Engineering Students",
    seats: 1500,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
  "hardcoded-4": {
    id: "hardcoded-4",
    title: "PRAKALP 2026",
    description:
      "National-level 24-hour hackathon innovation expo mentorship startup incubation coding challenges AI solutions product development and engineering innovation showcase",
    category: "Hackathon",
    venue: "Andhra Pradesh",
    start_at: "2026-09-15T00:00:00Z",
    end_at: "2026-09-16T23:59:59Z",
    is_online: false,
    source_url: "https://www.rcee.ac.in/prakalp",
    banner_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    tags: ["Hackathon", "Innovation", "AI", "Startup", "Coding", "Engineering"],
    fee: 0,
    eligibility: "Students,Developers,Innovators",
    seats: 3000,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
  "hardcoded-5": {
    id: "hardcoded-5",
    title: "NMIT Hacks 2026",
    description:
      "MLH-sanctioned student hackathon focused on rapid prototyping AI development cloud applications teamwork coding APIs and startup innovation",
    category: "Hackathon",
    venue: "Bengaluru",
    start_at: "2026-10-03T00:00:00Z",
    end_at: "2026-10-05T23:59:59Z",
    is_online: false,
    source_url: "https://mlh.io",
    banner_url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
    tags: ["Hackathon", "AI", "Cloud", "Coding", "Innovation", "APIs"],
    fee: 0,
    eligibility: "Students,Developers",
    seats: 1800,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
  "hardcoded-6": {
    id: "hardcoded-6",
    title: "ERP Expo 2026",
    description:
      "Enterprise resource planning AI solutions business automation SaaS digital transformation cloud ERP networking enterprise software and startup technology expo",
    category: "Business",
    venue: "Pune",
    start_at: "2026-11-08T00:00:00Z",
    end_at: "2026-11-10T23:59:59Z",
    is_online: false,
    source_url: "https://erpexpoindia.com",
    banner_url: "https://images.unsplash.com/photo-1552664730-d307ca884978",
    tags: ["Business", "ERP", "AI", "SaaS", "Cloud", "Enterprise"],
    fee: 4000,
    eligibility: "Business Owners,Developers,Startups",
    seats: 4000,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
  "hardcoded-7": {
    id: "hardcoded-7",
    title: "IIT Madras Technology Summit",
    description:
      "Research and innovation summit showcasing AI robotics machine learning semiconductor technology startup ecosystem engineering research and advanced computing",
    category: "AI Conference",
    venue: "New Delhi",
    start_at: "2026-12-05T00:00:00Z",
    end_at: "2026-12-06T23:59:59Z",
    is_online: false,
    source_url: "https://www.iitm.ac.in",
    banner_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    tags: ["AI", "Robotics", "Machine Learning", "Research", "Technology", "Engineering"],
    fee: 3500,
    eligibility: "Researchers,Students,Developers",
    seats: 3500,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
  "hardcoded-8": {
    id: "hardcoded-8",
    title: "India Tech Summit",
    description:
      "Technology startup networking venture capital innovation digital transformation AI entrepreneurship cloud computing and product development summit",
    category: "Startup",
    venue: "New Delhi",
    start_at: "2026-07-22T00:00:00Z",
    end_at: "2026-07-24T23:59:59Z",
    is_online: false,
    source_url: "https://eventbrite.com",
    banner_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    tags: ["Startup", "AI", "Networking", "Cloud", "Entrepreneurship", "Innovation"],
    fee: 4500,
    eligibility: "Startups,Developers,Entrepreneurs",
    seats: 4500,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
  "hardcoded-9": {
    id: "hardcoded-9",
    title: "EFY Expo Pune 2026",
    description:
      "Electronics embedded systems IoT robotics semiconductor PCB design automation AI hardware and emerging technology exhibition",
    category: "Electronics",
    venue: "Pune",
    start_at: "2026-08-18T00:00:00Z",
    end_at: "2026-08-20T23:59:59Z",
    is_online: false,
    source_url: "https://www.efyexpo.com",
    banner_url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    tags: ["Electronics", "IoT", "Robotics", "AI", "Embedded Systems", "Hardware"],
    fee: 2500,
    eligibility: "Engineers,Students,Developers",
    seats: 2500,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
  "hardcoded-10": {
    id: "hardcoded-10",
    title: "AI for All Challenge",
    description:
      "AI-focused innovation challenge featuring machine learning NLP computer vision coding data science and real-world AI problem solving competitions",
    category: "AI Challenge",
    venue: "Online",
    start_at: "2026-09-28T00:00:00Z",
    end_at: "2026-09-30T23:59:59Z",
    is_online: true,
    source_url: "https://reskilll.com/allhacks",
    banner_url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
    tags: ["AI", "Machine Learning", "NLP", "Computer Vision", "Data Science", "Coding"],
    fee: 0,
    eligibility: "Students,Developers,AI Enthusiasts",
    seats: 5000,
    status: "approved",
    is_external: true,
    organizer_id: null,
    registration_deadline: null,
    created_at: "",
  },
};

function EventDetail() {
  const { eventId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showRegDialog, setShowRegDialog] = useState(false);
  const [regForm, setRegForm] = useState({ full_name: "", email: "", college: "", branch: "", year: "", phone: "" });
  const [regSaving, setRegSaving] = useState(false);
  const localFallback = hardcodedEventFallbacks[eventId];
  const localEvent = !localFallback ? JSON.parse(localStorage.getItem("local_events") || "[]").find((e: any) => e.id === eventId) : null;

  const { data: profile } = useQuery({
    queryKey: ["reg-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("full_name, email, college, branch, year").eq("id", user!.id).single();
        if (!error && data) return data;
      } catch {}
      return null;
    },
  });

  const openRegDialog = () => {
    setRegForm({
      full_name: profile?.full_name || user?.user_metadata?.full_name || "",
      email: user?.email || "",
      college: profile?.college || "",
      branch: profile?.branch || "",
      year: profile?.year || "",
      phone: "",
    });
    setShowRegDialog(true);
  };

  const { data: eventFromSupabase, isLoading } = useQuery({
    queryKey: ["event", eventId],
    enabled: !localEvent,
    queryFn: async () => {
      const mapped = hardcodedEventMap[eventId];

      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("status", "approved")
          .order("start_at", { ascending: true });
        if (error) { console.warn("[dev] event detail query:", error.message); return null; }

        const rows = (data ?? []) as EventRow[];
        const normalize = (value?: string | null) => (value ?? "").trim().toLowerCase();

        const directMatch = rows.find((row) => row.id === eventId);
        if (directMatch) return directMatch;

        if (mapped) {
          const byTitle = rows.find((row) => normalize(row.title) === normalize(mapped.title));
          if (byTitle) return byTitle;

          const bySource = rows.find((row) => normalize(row.source_url) === normalize(mapped.sourceUrl));
          if (bySource) return bySource;
        }

        return rows.find((row) => normalize(row.id) === normalize(eventId)) ?? null;
      } catch (e) { console.warn("[dev] event detail crashed:", e); return null; }
    },
  });

  const event = eventFromSupabase ?? localFallback ?? localEvent ?? null;
  const registrationEventId = eventFromSupabase?.id ?? null;
  const isLocalFallbackEvent = (!!localFallback || !!localEvent) && !eventFromSupabase;

  const { data: registration } = useQuery({
    queryKey: ["registration", registrationEventId, user?.id],
    enabled: !!user && (!!registrationEventId || isLocalFallbackEvent),
    queryFn: async () => {
      if (isLocalFallbackEvent) {
        const localRegs = JSON.parse(localStorage.getItem(`regs_${user!.id}`) || "[]");
        return localRegs.includes(event.id) ? { id: "local" } : null;
      }

      if (!registrationEventId) return null;

      try {
        const { data, error } = await supabase
          .from("registrations")
          .select("id")
          .eq("event_id", registrationEventId)
          .eq("user_id", user!.id)
          .maybeSingle();
        if (error) { console.warn("[dev] registration query:", error.message); return null; }
        return data;
      } catch (e) { console.warn("[dev] registration crashed:", e); return null; }
    },
  });

  const { data: count } = useQuery({
    queryKey: ["reg-count", registrationEventId],
    enabled: !!registrationEventId || isLocalFallbackEvent,
    queryFn: async () => {
      if (isLocalFallbackEvent) {
        const localRegs = JSON.parse(localStorage.getItem(`regs_${user!.id}`) || "[]");
        return localRegs.includes(eventId) ? 1 : 0;
      }

      if (!registrationEventId) return 0;
      try {
        const { count, error } = await supabase
          .from("registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", registrationEventId);
        if (error) { console.warn("[dev] reg-count query:", error.message); return 0; }
        return count ?? 0;
      } catch (e) { console.warn("[dev] reg-count crashed:", e); return 0; }
    },
  });

  const register = () => {
    if (!user || !event?.id) return;
    openRegDialog();
  };

  const handleRegisterSubmit = async () => {
    if (!user || !event?.id) return;
    if (!regForm.full_name) { toast.error("Full name is required"); return; }
    if (!regForm.email) { toast.error("Email is required"); return; }
    setRegSaving(true);

    const details = {
      event_id: event.id,
      event_title: event.title,
      full_name: regForm.full_name,
      email: regForm.email,
      college: regForm.college,
      branch: regForm.branch,
      year: regForm.year,
      phone: regForm.phone,
      registered_at: new Date().toISOString(),
    };

    const allRegDetails = JSON.parse(localStorage.getItem(`reg_details_${user.id}`) || "[]");
    allRegDetails.push(details);
    localStorage.setItem(`reg_details_${user.id}`, JSON.stringify(allRegDetails));

    if (isLocalFallbackEvent) {
      const localRegs = JSON.parse(localStorage.getItem(`regs_${user.id}`) || "[]");
      if (!localRegs.includes(event.id)) {
        localRegs.push(event.id);
        localStorage.setItem(`regs_${user.id}`, JSON.stringify(localRegs));
      }
    } else if (registrationEventId) {
      try {
        await supabase.from("registrations").insert({
          event_id: registrationEventId,
          user_id: user.id,
        });
      } catch (e) { console.warn("[dev] register insert:", e); }
    }

    setShowRegDialog(false);
    setRegSaving(false);
    toast.success("You're registered for " + event.title);
    qc.invalidateQueries({ queryKey: ["registration", registrationEventId, user.id] });
    qc.invalidateQueries({ queryKey: ["reg-count", registrationEventId] });
    navigate({ to: "/student/registered" });
  };

  const unregister = async () => {
    if (!user || !event?.id) return;

    if (isLocalFallbackEvent) {
      const localRegs = JSON.parse(localStorage.getItem(`regs_${user.id}`) || "[]");
      localStorage.setItem(`regs_${user.id}`, JSON.stringify(localRegs.filter((id: string) => id !== eventId)));
      toast.success("Registration cancelled");
      qc.invalidateQueries({ queryKey: ["registration", registrationEventId, user.id] });
      qc.invalidateQueries({ queryKey: ["reg-count", registrationEventId] });
      return;
    }

    if (!registrationEventId) return;

    try {
      const { error } = await supabase.from("registrations").delete().eq("event_id", registrationEventId).eq("user_id", user.id);
      if (error) console.warn("[dev] unregister delete:", error.message);
    } catch (e) { console.warn("[dev] unregister crashed:", e); }

    toast.success("Registration cancelled");
    qc.invalidateQueries({ queryKey: ["registration", registrationEventId] });
    qc.invalidateQueries({ queryKey: ["reg-count", registrationEventId] });
  };

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  if (!event) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
        <h3 className="font-display text-lg font-semibold">Event not found</h3>
        <p className="mt-1 text-sm text-muted-foreground">The event link may be invalid or the event was removed.</p>
        <Button asChild className="mt-5">
          <Link to="/student/discover">Back to events</Link>
        </Button>
      </div>
    );
  }

  const date = event.start_at ? new Date(event.start_at) : null;
  const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null;

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/student/discover" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <div className="rounded-3xl overflow-hidden border border-border bg-card shadow-soft">
        <div className="aspect-[21/9] bg-gradient-hero relative">
          {event.banner_url ? (
            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-primary-foreground p-8">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-center">{event.title}</h1>
            </div>
          )}
        </div>

        <div className="p-6 md:p-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {event.category && <Badge variant="outline" className="capitalize">{event.category}</Badge>}
                {(event.tags ?? []).map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{event.title}</h1>
            </div>

            {event.description && (
              <section>
                <h2 className="font-semibold text-lg mb-2">About</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{event.description}</p>
              </section>
            )}

            {event.eligibility && (
              <section>
                <h2 className="font-semibold text-lg mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Eligibility</h2>
                <p className="text-muted-foreground whitespace-pre-line">{event.eligibility}</p>
              </section>
            )}

            {event.rules && (
              <section>
                <h2 className="font-semibold text-lg mb-2">Rules & guidelines</h2>
                <p className="text-muted-foreground whitespace-pre-line">{event.rules}</p>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-gradient-card border border-border p-5 space-y-3">
              {date && <Row icon={Calendar} label={date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} />}
              {event.venue && <Row icon={MapPin} label={event.venue} />}
              <Row icon={IndianRupee} label={Number(event.fee) === 0 ? "Free" : `₹${event.fee}`} />
              <Row icon={Users} label={`${count ?? 0} registered`} />
              {deadline && <div className="text-xs text-muted-foreground pt-2 border-t border-border">Registration closes {deadline.toLocaleDateString()}</div>}
            </div>

            {registration ? (
              <Button onClick={unregister} variant="outline" className="w-full">You're registered — Cancel</Button>
            ) : (
              <Button onClick={register} className="w-full bg-gradient-primary shadow-glow h-11">Register now</Button>
            )}
            <Button variant="outline" onClick={share} className="w-full"><Share2 className="h-4 w-4 mr-2" />Share event</Button>
          </aside>
        </div>
      </div>

      <Dialog open={showRegDialog} onOpenChange={setShowRegDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>Fill in your details to complete registration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Full name *</Label>
                <Input value={regForm.full_name} onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <Label>Email *</Label>
                <Input type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required />
              </div>
              <div>
                <Label>College</Label>
                <Input value={regForm.college} onChange={(e) => setRegForm({ ...regForm, college: e.target.value })} />
              </div>
              <div>
                <Label>Branch</Label>
                <Input value={regForm.branch} onChange={(e) => setRegForm({ ...regForm, branch: e.target.value })} />
              </div>
              <div>
                <Label>Year</Label>
                <Input value={regForm.year} onChange={(e) => setRegForm({ ...regForm, year: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="tel" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRegDialog(false)} disabled={regSaving}>Cancel</Button>
              <Button onClick={handleRegisterSubmit} disabled={regSaving} className="bg-gradient-primary shadow-glow">
                {regSaving ? "Submitting..." : "Confirm registration"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ icon: Icon, label }: { icon: typeof Calendar; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="h-8 w-8 rounded-lg bg-accent grid place-items-center"><Icon className="h-4 w-4 text-primary" /></div>
      <span>{label}</span>
    </div>
  );
}