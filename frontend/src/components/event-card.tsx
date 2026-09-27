import type { Database } from "@/integrations/supabase/types";
import { Calendar, MapPin, Users, IndianRupee } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];

export function EventCard({ event, hrefBase = "/events", score }: { event: EventRow & { topic?: number; topic_keywords?: string[] }; hrefBase?: string; score?: number }) {
  const date = event.start_at ? new Date(event.start_at) : null;
  const isDiscoverLink = hrefBase === "/student/discover";
  const isPublicEventsLink = hrefBase === "/events";
  const navigate = useNavigate();

  const detailHref = isDiscoverLink ? `/student/discover/${event.id}` : isPublicEventsLink ? `/events/${event.id}` : `${hrefBase}/${event.id}`;

  const cardClassName = "group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-soft transition flex flex-col cursor-pointer block";

  const content = (
    <>
      <div className="aspect-[16/9] bg-gradient-hero relative overflow-hidden">
        {event.banner_url ? (
          <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-primary-foreground font-display text-2xl font-bold p-4 text-center">
            {event.title}
          </div>
        )}
        {score !== undefined && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
            <span>★</span>{(score * 100).toFixed(0)}%
          </div>
        )}
        {typeof (event as any).topic !== "undefined" && Array.isArray((event as any).topic_keywords) && (
          <div className="absolute top-10 left-3">
            <Badge variant="secondary" className="capitalize text-xs text-foreground border border-primary/20 bg-primary/10">
              {(event as any).topic_keywords.slice(0, 3).join(", ")}
            </Badge>
          </div>
        )}
        {event.status !== "approved" && (
          <Badge className="absolute top-3 right-3 capitalize" variant={event.status === "pending" ? "secondary" : "destructive"}>
            {event.status}
          </Badge>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {event.category && <Badge variant="outline" className="capitalize">{event.category}</Badge>}
          {Number(event.fee) === 0 ? <Badge variant="secondary">Free</Badge> : null}
        </div>
        <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition line-clamp-2">{event.title}</h3>
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {date && (
            <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</div>
          )}
          {event.venue && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{event.venue}</div>}
          <div className="flex items-center gap-4 pt-1">
            {event.team_size && event.team_size > 1 && (
              <span className="flex items-center gap-1 text-xs"><Users className="h-3 w-3" />Team of {event.team_size}</span>
            )}
            {Number(event.fee) > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-foreground"><IndianRupee className="h-3 w-3" />{event.fee}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    isDiscoverLink ? (
      <Link
        to="/student/discover/$eventId"
        params={{ eventId: String(event.id) }}
        preload="intent"
        className={cardClassName}
      >
        {content}
      </Link>
    ) : isPublicEventsLink ? (
      <Link
        to="/events/$eventId"
        params={{ eventId: String(event.id) }}
        preload="intent"
        className={cardClassName}
      >
        {content}
      </Link>
    ) : (
      <Link
        to={detailHref}
        preload="intent"
        className={cardClassName}
      >
        {content}
      </Link>
    )
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-muted" />
      <div className="p-5 space-y-2">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-5 w-2/3 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
