import { SectionHeading } from "@/components/shared/section-heading";
import { UploadPanel } from "@/features/poster-ingestion/components/upload-panel";
import { Card, CardContent } from "@/components/ui/card";
import { uploadPosterAction } from "@/features/poster-ingestion/server/actions";

interface AdminUploadsPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminUploadsPage({ searchParams }: AdminUploadsPageProps) {
  const params = await searchParams;

  async function handleUploadPosterAction(formData: FormData) {
    "use server";

    await uploadPosterAction(formData);
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Uploads"
        title="Start the poster extraction workflow."
        description="Poster ingestion remains protected and admin-only while the public portal stays open."
      />
      {params.error ? (
        <Card>
          <CardContent className="p-6 text-sm text-accent">{decodeURIComponent(params.error)}</CardContent>
        </Card>
      ) : null}
      <UploadPanel action={handleUploadPosterAction} />
    </div>
  );
}
