import { AlertTriangle, CheckCircle2, ScanSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventDate } from "@/features/event-catalog/lib/format-event";
import type { EventRecord } from "@/features/event-catalog/types/event";

interface ReviewQueueProps {
  events: EventRecord[];
}

export function ReviewQueue({ events }: ReviewQueueProps) {
  return (
    <div className="grid gap-5">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle>{event.title}</CardTitle>
                <Badge variant={event.extractionConfidence >= 0.8 ? "success" : "outline"}>
                  {event.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatEventDate(event.eventDate)} / {event.timeLabel} / {event.venue}
              </p>
            </div>
            <div className="rounded-full bg-muted px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {(event.extractionConfidence * 100).toFixed(0)}% confidence
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
              <div className="rounded-[22px] bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <ScanSearch className="h-4 w-4 text-primary" />
                  OCR transcript queued
                </div>
                <p className="mt-2">
                  Raw text parsing and normalization remain editable before publication.
                </p>
              </div>
              <div className="rounded-[22px] bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-4 w-4 text-accent" />
                  Duplicate warning
                </div>
                <p className="mt-2">Compare title, venue, and date overlap before publishing.</p>
              </div>
              <div className="rounded-[22px] bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Publication gate
                </div>
                <p className="mt-2">Required fields must be complete to move the event public.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Review Metadata</Button>
              <Button>Publish Event</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
