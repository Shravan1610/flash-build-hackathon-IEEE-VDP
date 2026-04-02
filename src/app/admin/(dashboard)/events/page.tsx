import { SectionHeading } from "@/components/shared/section-heading";
import { ReviewQueue } from "@/features/event-review/components/review-queue";
import { listReviewQueueEvents } from "@/features/event-catalog/server/events";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const reviewItems = await listReviewQueueEvents();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Review"
        title="Review extracted events before they go public."
        description="These event records are visible only to admins until you publish them."
      />
      <ReviewQueue events={reviewItems} />
    </div>
  );
}

