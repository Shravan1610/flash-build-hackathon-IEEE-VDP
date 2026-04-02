import { redirect } from "next/navigation";

import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  listAdminEventsForForms,
  listAdminForms,
  parseAdminFormPayload,
  upsertEventForm,
} from "@/features/forms/server/forms";
import { slugify } from "@/features/forms/lib/slugify";

import { AdminFormBuilder } from "./form-builder";

async function createFormPageAction(formData: FormData) {
  "use server";

  const payload = parseAdminFormPayload(formData);
  await upsertEventForm(payload);
  redirect(`/admin/forms?created=${encodeURIComponent(slugify(payload.slug || payload.title))}`);
}

interface AdminFormsPageProps {
  searchParams: Promise<{
    created?: string;
    error?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminFormsPage({ searchParams }: AdminFormsPageProps) {
  const params = await searchParams;
  const [events, forms] = await Promise.all([
    listAdminEventsForForms(),
    listAdminForms(),
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dynamic Forms"
        title="Create and publish in-app registration forms."
        description="Each published form gets its own public URL and can optionally require authenticated student or faculty submissions."
      />

      {params.created ? (
        <Card>
          <CardContent className="p-6 text-sm text-primary">
            Form published at <code>/forms/{params.created}</code>.
          </CardContent>
        </Card>
      ) : null}

      {params.error ? (
        <Card>
          <CardContent className="p-6 text-sm text-accent">{decodeURIComponent(params.error)}</CardContent>
        </Card>
      ) : null}

      <AdminFormBuilder
        action={createFormPageAction}
        events={(events ?? []).map((event) => ({
          id: event.id,
          label: event.title,
        }))}
      />

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold">Published and draft forms</h3>
        <div className="grid gap-4">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xl font-semibold">{form.title}</p>
                    <Badge variant={form.status === "published" ? "success" : "outline"}>
                      {form.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(form.event?.title ?? "Standalone form")} / {form.fieldCount} fields / {form.submissionCount} submissions
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Public route: <code>{form.publicUrl}</code>
                  </p>
                </div>
                <div className="rounded-[22px] bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                  {form.requiresAuthentication ? "Authenticated submissions only" : "Anonymous submissions allowed"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
