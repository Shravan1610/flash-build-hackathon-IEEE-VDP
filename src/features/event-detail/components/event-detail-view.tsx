import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ImageIcon, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatEventDate } from "@/features/event-catalog/lib/format-event";
import type { EventRecord } from "@/features/event-catalog/types/event";

interface EventDetailViewProps {
  event: EventRecord;
  registrationHref?: string | null;
}

export function EventDetailView({ event, registrationHref }: EventDetailViewProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <Button asChild variant="ghost">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
        </Button>

        <div className="space-y-4">
          <Badge>{event.category}</Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {event.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">{event.summary}</p>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-[24px] bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Schedule
              </div>
              <p className="mt-3 text-lg font-medium">{formatEventDate(event.eventDate)}</p>
              <p className="text-sm text-muted-foreground">{event.timeLabel}</p>
            </div>
            <div className="rounded-[24px] bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Venue
              </div>
              <p className="mt-3 text-lg font-medium">{event.venue}</p>
              <p className="text-sm text-muted-foreground">Published after admin verification.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-lg font-semibold">Registration</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Registration can stay anonymous, or you can log in as a student or faculty member
                for a faster prefilled response.
              </p>
            </div>
            {registrationHref ? (
              <Button asChild>
                <Link href={registrationHref as Route}>Register now</Link>
              </Button>
            ) : (
              <Button disabled variant="outline">
                Registration not published yet
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-full min-h-96 items-center justify-center bg-muted/40 p-5">
          <div
            className="relative h-full min-h-80 w-full rounded-[28px] bg-cover bg-center"
            style={{ backgroundImage: `url(${event.posterUrl})` }}
          >
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/55 px-4 py-3 text-sm text-white backdrop-blur">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Original poster preview
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
