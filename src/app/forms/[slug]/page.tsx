import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUserContext } from "@/features/auth/server/auth";
import { getPublishedFormBySlug, submitPublishedFormResponse } from "@/features/forms/server/forms";
import type { FormFieldRecord } from "@/features/forms/types/forms";
import type { Json } from "@/types/supabase";

interface PublicFormPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    submitted?: string;
    error?: string;
  }>;
}

function RenderField({
  field,
}: {
  field: FormFieldRecord;
}) {
  const label = (
    <Label htmlFor={field.fieldKey}>
      {field.label}
      {field.isRequired ? " *" : ""}
    </Label>
  );

  if (field.fieldType === "textarea") {
    return (
      <div className="space-y-2">
        {label}
        <Textarea id={field.fieldKey} name={field.fieldKey} placeholder={field.placeholder ?? undefined} required={field.isRequired} />
        {field.helpText ? <p className="text-sm text-muted-foreground">{field.helpText}</p> : null}
      </div>
    );
  }

  if (field.fieldType === "select") {
    return (
      <div className="space-y-2">
        {label}
        <select
          className="flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue=""
          id={field.fieldKey}
          name={field.fieldKey}
          required={field.isRequired}
        >
          <option value="">Select an option</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {field.helpText ? <p className="text-sm text-muted-foreground">{field.helpText}</p> : null}
      </div>
    );
  }

  if (field.fieldType === "radio") {
    return (
      <div className="space-y-2">
        {label}
        <div className="grid gap-2">
          {field.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm"
            >
              <input
                name={field.fieldKey}
                required={field.isRequired}
                type="radio"
                value={option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
        {field.helpText ? <p className="text-sm text-muted-foreground">{field.helpText}</p> : null}
      </div>
    );
  }

  if (field.fieldType === "checkbox") {
    return (
      <div className="space-y-2">
        {label}
        <div className="grid gap-2">
          {field.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm"
            >
              <input name={field.fieldKey} type="checkbox" value={option.value} />
              {option.label}
            </label>
          ))}
        </div>
        {field.helpText ? <p className="text-sm text-muted-foreground">{field.helpText}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label}
      <Input
        id={field.fieldKey}
        name={field.fieldKey}
        placeholder={field.placeholder ?? undefined}
        required={field.isRequired}
        type={field.fieldType === "phone" ? "tel" : field.fieldType}
      />
      {field.helpText ? <p className="text-sm text-muted-foreground">{field.helpText}</p> : null}
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function PublicFormPage({ params, searchParams }: PublicFormPageProps) {
  const [{ slug }, paramsState] = await Promise.all([params, searchParams]);
  const [form, userContext] = await Promise.all([
    getPublishedFormBySlug(slug),
    getCurrentUserContext(),
  ]);

  if (!form) {
    notFound();
  }

  const currentForm = form;

  if (currentForm.requiresAuthentication && !userContext.isAuthenticated) {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Login Required"
          title={currentForm.title}
          description="This registration form is restricted to authenticated users."
        />
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in as a student or faculty member to submit this form.
            </p>
            <Button asChild>
              <Link href={`/auth?next=/forms/${currentForm.slug}`}>Sign in to continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function action(formData: FormData) {
    "use server";

    const supabaseUser = await getCurrentUserContext();
    const answers: Record<string, Json> = {};

    for (const field of currentForm.fields) {
      if (field.fieldType === "checkbox") {
        answers[field.fieldKey] = formData
          .getAll(field.fieldKey)
          .map((value) => (typeof value === "string" ? value : ""))
          .filter(Boolean);
      } else {
        const rawValue = formData.get(field.fieldKey);
        answers[field.fieldKey] = typeof rawValue === "string" ? rawValue.trim() : "";
      }
    }

    const submitterRoleValue = String(formData.get("submitterRole") ?? "").trim();

    await submitPublishedFormResponse({
      formId: currentForm.id,
      eventId: currentForm.event?.id ?? null,
      tenantId: currentForm.tenantId,
      authUserId: supabaseUser.user?.id ?? null,
      submitterName:
        supabaseUser.profile?.full_name ??
        (String(formData.get("submitterName") ?? "").trim() || null),
      submitterEmail: String(formData.get("submitterEmail") ?? "").trim() || null,
      submitterPhone: String(formData.get("submitterPhone") ?? "").trim() || null,
      submitterRole:
        supabaseUser.role ??
        (submitterRoleValue === "student" ||
        submitterRoleValue === "faculty" ||
        submitterRoleValue === "student_coordinator"
          ? submitterRoleValue
          : null),
      answers,
      metadata: {
        submittedFrom: "public-form",
      },
    });

    redirect(`/forms/${currentForm.slug}?submitted=1`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <SectionHeading
        eyebrow="Public Form"
        title={currentForm.title}
        description={
          currentForm.description ??
          "Submit this form publicly. Accounts are optional unless the form requires authentication."
        }
      />

      {paramsState.submitted ? (
        <Card>
          <CardContent className="p-6 text-sm text-primary">{currentForm.successMessage}</CardContent>
        </Card>
      ) : null}

      {paramsState.error ? (
        <Card>
          <CardContent className="p-6 text-sm text-accent">{decodeURIComponent(paramsState.error)}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Registration details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6">
            {!userContext.isAuthenticated ? (
              <div className="grid gap-4 rounded-[24px] bg-muted/35 p-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="submitterName">Your name</Label>
                  <Input id="submitterName" name="submitterName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterEmail">Email</Label>
                  <Input id="submitterEmail" name="submitterEmail" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterPhone">Phone</Label>
                  <Input id="submitterPhone" name="submitterPhone" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterRole">Role</Label>
                  <select
                    className="flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue=""
                    id="submitterRole"
                    name="submitterRole"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="student">Student</option>
                    <option value="student_coordinator">Student coordinator</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
              </div>
            ) : null}

            <div className="grid gap-5">
              {currentForm.fields.map((field) => (
                <RenderField key={field.id} field={field} />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {userContext.isAuthenticated
                  ? "Signed in submissions use your saved role automatically."
                  : "Anonymous submissions are allowed for this form."}
              </p>
              <Button type="submit">Submit form</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
