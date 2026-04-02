import { SectionHeading } from "@/components/shared/section-heading";
import { EventGrid } from "@/features/event-catalog/components/event-grid";
import { listPublishedEvents } from "@/features/event-catalog/server/events";
import { SearchFilters } from "@/features/search-filter/components/search-filters";
import { parseEventSearchFilters } from "@/features/search-filter/lib/parse-search-filters";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    from?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = parseEventSearchFilters(await searchParams);
  const events = await listPublishedEvents(filters);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Search"
        title="Find the next IEEE CS event in seconds."
        description="Filter published IEEE CS events by keyword, category, and event date from the live Supabase catalog."
      />
      <SearchFilters filters={filters} />
      <EventGrid events={events} />
    </div>
  );
}
