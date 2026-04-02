import { eventCategories } from "@/features/event-catalog/types/event";
import type { EventSearchFilters } from "@/features/search-filter/types/search";

interface SearchParamsInput {
  query?: string;
  category?: string;
  from?: string;
}

export function parseEventSearchFilters(searchParams: SearchParamsInput): EventSearchFilters {
  const query = searchParams.query?.trim();
  const from = searchParams.from?.trim();
  const category = searchParams.category?.trim();

  return {
    query: query || undefined,
    from: from || undefined,
    category:
      category && (eventCategories as readonly string[]).includes(category) ? (category as EventSearchFilters["category"]) : "All",
  };
}
