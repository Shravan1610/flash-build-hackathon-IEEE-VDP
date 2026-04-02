import { SectionHeading } from "@/components/shared/section-heading";
import { getReviewQueueEvents } from "@/features/event-catalog/lib/mock-events";
import { ReviewQueue } from "@/features/event-review/components/review-queue";

export default function AdminEventsPage() {
  const reviewItems = getReviewQueueEvents();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Review"
        title="Review extracted events before they go public."
        description="The queue currently demonstrates the review-first workflow with seeded records while admin authentication and privileged write actions are still being wired."
      />
      <ReviewQueue events={reviewItems} />
    </div>
  );
}
