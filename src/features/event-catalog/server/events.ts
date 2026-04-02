import { cache } from "react";

import type { EventRecord } from "@/features/event-catalog/types/event";
import type { EventSearchFilters } from "@/features/search-filter/types/search";
import type { Database } from "@/types/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/features/auth/server/auth";

import { formatEventTimeRange, summarizeEventText } from "../lib/format-event";
import { getEventBySlug, getPublishedEvents, getReviewQueueEvents } from "../lib/mock-events";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

const fallbackPosterUrl =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

function mapEventRecord(row: EventRow): EventRecord | null {
  if (!row.slug || !row.title || !row.event_date || !row.venue || !row.category) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: summarizeEventText(row.description_raw_text ?? row.ocr_text),
    eventDate: row.event_date,
    timeLabel: formatEventTimeRange(row.start_time, row.end_time),
    venue: row.venue,
    category: row.category,
    status: row.status,
    posterUrl: row.poster_public_url ?? fallbackPosterUrl,
    extractionConfidence: row.extraction_confidence ?? 0,
  };
}

export async function listPublishedEvents(filters?: EventSearchFilters) {
  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (filters?.query) {
      const pattern = `%${filters.query.trim()}%`;
      query = query.or(
        `title.ilike.${pattern},venue.ilike.${pattern},description_raw_text.ilike.${pattern}`,
      );
    }

    if (filters?.category && filters.category !== "All") {
      query = query.eq("category", filters.category);
    }

    if (filters?.from) {
      query = query.gte("event_date", filters.from);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? [])
      .map(mapEventRecord)
      .filter((event): event is EventRecord => event !== null);
  } catch (error) {
    console.error("Failed to load published events from Supabase.", error);
  }

  return getPublishedEvents();
}

export const getPublishedEventBySlug = cache(async (slug: string) => {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return mapEventRecord(data);
    }
  } catch (error) {
    console.error(`Failed to load event "${slug}" from Supabase.`, error);
  }

  return getEventBySlug(slug) ?? null;
});

export async function listReviewQueueEvents() {
  await requireAdminUser();

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .neq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? [])
      .map(mapEventRecord)
      .filter((event): event is EventRecord => event !== null);
  } catch (error) {
    console.error("Failed to load review queue events from Supabase.", error);
  }

  return getReviewQueueEvents();
}
