import { requireAdminUser } from "@/features/auth/server/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { ReviewEventRecord } from "../types/review";

export async function listReviewQueueEventsDetailed(): Promise<ReviewEventRecord[]> {
  await requireAdminUser();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .neq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load detailed review queue.", error);
    return [];
  }

  return (data ?? []).map((event) => ({
    id: event.id,
    title: event.title,
    slug: event.slug,
    descriptionRawText: event.description_raw_text,
    eventDate: event.event_date,
    startTime: event.start_time,
    endTime: event.end_time,
    venue: event.venue,
    category: event.category,
    status: event.status,
    posterPublicUrl: event.poster_public_url,
    posterStoragePath: event.poster_storage_path,
    sourceFileType: event.source_file_type,
    ocrText: event.ocr_text,
    extractionConfidence: event.extraction_confidence,
    createdAt: event.created_at,
  }));
}
