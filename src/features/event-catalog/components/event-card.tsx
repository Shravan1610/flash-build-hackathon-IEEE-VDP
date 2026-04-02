import type { Route } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatEventDate } from "@/features/event-catalog/lib/format-event";
import type { EventRecord } from "@/features/event-catalog/types/event";

interface EventCardProps {
  event: EventRecord;
}

export function EventCard({ event }: EventCardProps) {
  const eventHref = `/events/${event.slug}` as Route;

  return (
    <Link href={eventHref}>
      <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_32px_100px_-52px_rgba(15,95,85,0.5)]">
        <div
          className="h-52 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
          style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(23,23,23,0.4)), url(${event.posterUrl})` }}
        />
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <Badge variant="outline">{event.category}</Badge>
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {(event.extractionConfidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-balance">{event.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{event.summary}</p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>
                {formatEventDate(event.eventDate)} / {event.timeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{event.venue}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
