import { SectionHeading } from "@/components/shared/section-heading";
import { ReviewQueue } from "@/features/event-review/components/review-queue";
import { listReviewQueueEventsDetailed } from "@/features/event-review/server/review";
import { updateReviewEventAction } from "@/features/poster-ingestion/server/actions";

interface AdminEventsPageProps {
  searchParams: Promise<{
    uploaded?: string;
    updated?: string;
    error?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  const params = await searchParams;
  const reviewItems = await listReviewQueueEventsDetailed();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Review"
        title="Review extracted events before they go public."
        description="These event records are visible only to admins until you publish them."
      />
      {params.uploaded ? (
        <p className="text-sm text-primary">Poster uploaded and added to the review queue.</p>
      ) : null}
      {params.updated ? (
        <p className="text-sm text-primary">Event review changes saved.</p>
      ) : null}
      {params.error ? (
        <p className="text-sm text-accent">{decodeURIComponent(params.error)}</p>
      ) : null}
      <ReviewQueue action={updateReviewEventAction} events={reviewItems} />
    </div>
  );
}
