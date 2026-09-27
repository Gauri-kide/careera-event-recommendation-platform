import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Users, IndianRupee, ArrowLeft, Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/events/$eventId")({
  component: PublicEventDetail,
});

type EventRow = Database["public"]["Tables"]["events"]["Row"];

function PublicEventDetail() {
  const { eventId } = Route.useParams();

  const { data: event, isLoading } = useQuery({
    queryKey: ["public-event", eventId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .maybeSingle();
        if (error) { console.warn("[dev] public-event query:", error.message); return null; }
        return data as EventRow | null;
      } catch (e) { console.warn("[dev] public-event crashed:", e); return null; }
    },
  });

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  if (!event) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
        <h3 className="font-display text-lg font-semibold">Event not found</h3>
        <p className="mt-1 text-sm text-muted-foreground">The event may not exist or is not approved.</p>
        <Button asChild className="mt-5">
          <Link to="/events">Back to events</Link>
        </Button>
      </div>
    );
  }

  const date = event.start_at ? new Date(event.start_at) : null;

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
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
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-gradient-card border border-border p-5 space-y-3">
              {date && <Row icon={Calendar} label={date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} />}
              {event.venue && <Row icon={MapPin} label={event.venue} />}
              <Row icon={IndianRupee} label={Number(event.fee) === 0 ? "Free" : `₹${event.fee}`} />
              <Row icon={Users} label={`${event.seats ?? 0} seats`} />
            </div>

            <Button variant="outline" onClick={share} className="w-full"><Share2 className="h-4 w-4 mr-2" />Share event</Button>
          </aside>
        </div>
      </div>
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