import type { EventCategory } from "@/features/event-catalog/types/event";

export interface EventSearchFilters {
  query?: string;
  category?: EventCategory | "All";
  from?: string;
}

