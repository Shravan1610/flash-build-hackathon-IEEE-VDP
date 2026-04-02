import type { EventRecord } from "@/features/event-catalog/types/event";

export const mockEvents: EventRecord[] = [
  {
    id: "evt-1",
    slug: "ai-bootcamp-2026",
    title: "AI Bootcamp 2026",
    summary: "An intensive primer on practical AI automation workflows for student builders.",
    eventDate: "2026-04-14",
    timeLabel: "10:00 AM - 1:00 PM",
    venue: "Tech Park Seminar Hall",
    category: "Workshop",
    status: "published",
    posterUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    extractionConfidence: 0.94,
  },
  {
    id: "evt-2",
    slug: "chapter-membership-open-house",
    title: "Chapter Membership Open House",
    summary: "A recruitment and orientation session for new IEEE CS chapter members.",
    eventDate: "2026-04-19",
    timeLabel: "2:00 PM - 4:30 PM",
    venue: "Innovation Lab",
    category: "Membership Drive",
    status: "published",
    posterUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    extractionConfidence: 0.9,
  },
  {
    id: "evt-3",
    slug: "ieee-code-rush",
    title: "IEEE Code Rush",
    summary: "A timed coding challenge with campus-wide participation and judging rounds.",
    eventDate: "2026-04-28",
    timeLabel: "9:30 AM - 5:00 PM",
    venue: "Block C Computing Center",
    category: "Coding Challenge",
    status: "review_required",
    posterUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    extractionConfidence: 0.72,
  },
];

export function getPublishedEvents() {
  return mockEvents.filter((event) => event.status === "published");
}

export function getReviewQueueEvents() {
  return mockEvents.filter((event) => event.status !== "published");
}

export function getEventBySlug(slug: string) {
  return mockEvents.find((event) => event.slug === slug);
}

