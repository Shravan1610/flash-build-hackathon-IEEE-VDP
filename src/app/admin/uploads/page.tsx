import { SectionHeading } from "@/components/shared/section-heading";
import { UploadPanel } from "@/features/poster-ingestion/components/upload-panel";

export default function AdminUploadsPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Uploads"
        title="Start the poster extraction workflow."
        description="This surface is prepared for the upload, OCR, and metadata parsing flow. Authenticated admin mutations are intentionally left for the next slice instead of being faked without an auth decision."
      />
      <UploadPanel />
    </div>
  );
}
