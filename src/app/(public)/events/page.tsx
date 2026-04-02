import { CatalogHero } from "@/features/event-catalog/components/catalog-hero";
import { EventGrid } from "@/features/event-catalog/components/event-grid";
import { listPublishedEvents } from "@/features/event-catalog/server/events";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await listPublishedEvents();

  return (
    <div className="space-y-10">
      <CatalogHero />
      <EventGrid events={events} />
    </div>
  );
}
