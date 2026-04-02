import { CheckCircle2, ScanSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EventCategory } from "@/types/supabase";

import type { ReviewEventRecord } from "../types/review";

const eventCategories: EventCategory[] = [
  "Membership Drive",
  "Seminar",
  "Workshop",
  "Hackathon",
  "Coding Challenge",
];

interface ReviewQueueProps {
  events: ReviewEventRecord[];
  action: (formData: FormData) => void | Promise<void>;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ReviewQueue({ events, action }: ReviewQueueProps) {
  if (!events.length) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          The review queue is empty. Upload a poster from `/admin/uploads` to create a review item.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle>{event.title ?? "Untitled extracted event"}</CardTitle>
                <Badge variant={event.status === "rejected" ? "outline" : "success"}>
                  {event.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Uploaded {formatDateTime(event.createdAt)} / source {event.sourceFileType}
              </p>
            </div>
            <div className="rounded-full bg-muted px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {((event.extractionConfidence ?? 0) * 100).toFixed(0)}% confidence
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <form action={action} className="space-y-4">
                <input name="eventId" type="hidden" value={event.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`title-${event.id}`}>Title</Label>
                    <Input defaultValue={event.title ?? ""} id={`title-${event.id}`} name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`event-date-${event.id}`}>Event date</Label>
                    <Input defaultValue={event.eventDate ?? ""} id={`event-date-${event.id}`} name="eventDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`venue-${event.id}`}>Venue</Label>
                    <Input defaultValue={event.venue ?? ""} id={`venue-${event.id}`} name="venue" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`start-time-${event.id}`}>Start time</Label>
                    <Input defaultValue={event.startTime ?? ""} id={`start-time-${event.id}`} name="startTime" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`end-time-${event.id}`}>End time</Label>
                    <Input defaultValue={event.endTime ?? ""} id={`end-time-${event.id}`} name="endTime" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`category-${event.id}`}>Category</Label>
                    <select
                      className="flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue={event.category ?? ""}
                      id={`category-${event.id}`}
                      name="category"
                    >
                      <option value="">Uncategorized</option>
                      {eventCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`confidence-${event.id}`}>Confidence</Label>
                    <Input
                      defaultValue={String(event.extractionConfidence ?? 0.5)}
                      id={`confidence-${event.id}`}
                      max="1"
                      min="0"
                      name="confidence"
                      step="0.01"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`description-${event.id}`}>Normalized description</Label>
                    <Textarea
                      defaultValue={event.descriptionRawText ?? event.ocrText ?? ""}
                      id={`description-${event.id}`}
                      name="descriptionRawText"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button name="status" type="submit" value="draft" variant="outline">
                    Save review draft
                  </Button>
                  <Button name="status" type="submit" value="published">
                    <CheckCircle2 className="h-4 w-4" />
                    Publish event
                  </Button>
                  <Button name="status" type="submit" value="rejected" variant="outline">
                    Reject
                  </Button>
                </div>
              </form>

              <div className="space-y-4">
                <div className="rounded-[24px] bg-muted/40 p-4">
                  <div className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">
                    <ScanSearch className="h-4 w-4 text-primary" />
                    OCR transcript
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {event.ocrText ?? "No OCR transcript was captured for this poster."}
                  </p>
                </div>

                {event.posterPublicUrl ? (
                  <div className="overflow-hidden rounded-[24px] border border-border/70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={event.title ?? "Poster preview"}
                      className="h-auto w-full object-cover"
                      src={event.posterPublicUrl}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
