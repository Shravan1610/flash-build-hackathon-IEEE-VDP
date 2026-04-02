import type { EventRecord } from "@/features/event-catalog/types/event";
import type { EventSearchFilters } from "@/features/search-filter/types/search";

export function filterEvents(events: EventRecord[], filters: EventSearchFilters) {
  return events.filter((event) => {
    const query = filters.query?.trim().toLowerCase();

    if (query) {
      const haystack = `${event.title} ${event.summary} ${event.venue}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (filters.category && filters.category !== "All" && event.category !== filters.category) {
      return false;
    }

    if (filters.from && event.eventDate < filters.from) {
      return false;
    }

    return true;
  });
}

