export const eventCategories = [
  "Membership Drive",
  "Seminar",
  "Workshop",
  "Hackathon",
  "Coding Challenge",
] as const;

export const eventStatuses = ["draft", "review_required", "published", "rejected"] as const;

export type EventCategory = (typeof eventCategories)[number];
export type EventStatus = (typeof eventStatuses)[number];

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  eventDate: string;
  timeLabel: string;
  venue: string;
  category: EventCategory;
  status: EventStatus;
  posterUrl: string;
  extractionConfidence: number;
}

