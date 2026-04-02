import type { EventCategory, EventStatus, PosterSourceFileType } from "@/types/supabase";

export interface ReviewEventRecord {
  id: string;
  title: string | null;
  slug: string | null;
  descriptionRawText: string | null;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  category: EventCategory | null;
  status: EventStatus;
  posterPublicUrl: string | null;
  posterStoragePath: string;
  sourceFileType: PosterSourceFileType;
  ocrText: string | null;
  extractionConfidence: number | null;
  createdAt: string;
}
