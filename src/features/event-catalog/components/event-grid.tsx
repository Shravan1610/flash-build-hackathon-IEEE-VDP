import type { EventRecord } from "@/features/event-catalog/types/event";
import { EventCard } from "@/features/event-catalog/components/event-card";
import { Card, CardContent } from "@/components/ui/card";

interface EventGridProps {
  events: EventRecord[];
}

export function EventGrid({ events }: EventGridProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg font-semibold">No published events match these filters.</p>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Try a broader keyword, a different category, or an earlier start date.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </section>
  );
}
