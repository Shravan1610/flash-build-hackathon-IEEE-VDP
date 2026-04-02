import { notFound } from "next/navigation";

import { EventDetailView } from "@/features/event-detail/components/event-detail-view";
import { getPublishedEventBySlug } from "@/features/event-catalog/server/events";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return <EventDetailView event={event} />;
}
