import { notFound } from "next/navigation";

import { EventDetailView } from "@/features/event-detail/components/event-detail-view";
import { getPublishedEventBySlug } from "@/features/event-catalog/server/events";
import { getPublishedFormSlugForEvent } from "@/features/forms/server/forms";

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

  const registrationFormSlug = await getPublishedFormSlugForEvent(event.id);

  return (
    <EventDetailView
      event={event}
      registrationHref={registrationFormSlug ? `/forms/${registrationFormSlug}` : null}
    />
  );
}
