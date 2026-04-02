import { SectionHeading } from "@/components/shared/section-heading";
import { UploadPanel } from "@/features/poster-ingestion/components/upload-panel";

export default function AdminUploadsPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Uploads"
        title="Start the poster extraction workflow."
        description="Poster ingestion remains protected and admin-only while the public portal stays open."
      />
      <UploadPanel />
    </div>
  );
}
