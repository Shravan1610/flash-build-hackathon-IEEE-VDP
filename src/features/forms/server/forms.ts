import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { Json } from "@/types/supabase";
import type { Database, FormFieldType } from "@/types/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/features/auth/server/admin-session";

import { slugify } from "../lib/slugify";
import type {
  EventFormRecord,
  EventFormSummary,
  EventFormUpsertInput,
  EventOption,
  FormFieldOption,
  FormSubmissionInput,
} from "../types/forms";

type EventFormRow = Database["public"]["Tables"]["event_forms"]["Row"];
type FormFieldRow = Database["public"]["Tables"]["form_fields"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];

function mapEvent(event: EventRow | null | undefined) {
  if (!event) {
    return null;
  }

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    eventDate: event.event_date,
    venue: event.venue,
    category: event.category,
    status: event.status,
  };
}

function normalizeFieldOptions(value: Json): FormFieldOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }

    const label = typeof item.label === "string" ? item.label : "";
    const rawValue = typeof item.value === "string" ? item.value : label;

    if (!label || !rawValue) {
      return [];
    }

    return [{ label, value: rawValue }];
  });
}

function mapField(field: FormFieldRow) {
  return {
    id: field.id,
    fieldKey: field.field_key,
    label: field.label,
    fieldType: field.field_type,
    placeholder: field.placeholder,
    helpText: field.help_text,
    isRequired: field.is_required,
    options: normalizeFieldOptions(field.options),
    settings: field.settings,
    sortOrder: field.sort_order,
  };
}

function sortFields(fields: FormFieldRow[]) {
  return [...fields].sort((left, right) => {
    if (left.sort_order === right.sort_order) {
      return left.created_at.localeCompare(right.created_at);
    }

    return left.sort_order - right.sort_order;
  });
}

function buildEventFormRecord(
  row: EventFormRow,
  event: EventRow | null | undefined,
  fields: FormFieldRow[],
): EventFormRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    status: row.status,
    requiresAuthentication: row.requires_authentication,
    successMessage: row.success_message,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    event: mapEvent(event),
    fields: sortFields(fields).map(mapField),
  };
}

function normalizeFieldType(value: FormDataEntryValue | null): FormFieldType {
  const allowedTypes: FormFieldType[] = [
    "text",
    "email",
    "phone",
    "textarea",
    "select",
    "radio",
    "checkbox",
    "date",
    "number",
  ];

  if (typeof value === "string" && allowedTypes.includes(value as FormFieldType)) {
    return value as FormFieldType;
  }

  return "text";
}

export async function getPublishedFormBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data: form, error } = await supabase
    .from("event_forms")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !form) {
    return null;
  }

  const [{ data: event }, { data: fields }] = await Promise.all([
    form.event_id
      ? supabase.from("events").select("*").eq("id", form.event_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("form_fields").select("*").eq("form_id", form.id),
  ]);

  return buildEventFormRecord(form, event ?? null, fields ?? []);
}

export async function getPublishedFormSlugForEvent(eventId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("event_forms")
    .select("slug")
    .eq("event_id", eventId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.slug ?? null;
}

export async function listAdminEventsForForms(): Promise<EventOption[]> {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, event_date, status")
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Failed to load events for form selection.", error);
    return [];
  }

  return (data ?? []).flatMap((event) => {
    if (!event.title) {
      return [];
    }

    return [
      {
        id: event.id,
        title: event.title,
        slug: event.slug,
        eventDate: event.event_date,
        status: event.status,
      },
    ];
  });
}

export async function listAdminForms(): Promise<EventFormSummary[]> {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const [{ data: forms, error: formsError }, { data: events }, { data: submissions }, { data: fields }] =
    await Promise.all([
      supabase.from("event_forms").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*"),
      supabase.from("form_submissions").select("form_id"),
      supabase.from("form_fields").select("form_id"),
    ]);

  if (formsError) {
    console.error("Failed to load admin forms.", formsError);
    return [];
  }

  const eventMap = new Map((events ?? []).map((event) => [event.id, event]));
  const submissionCounts = new Map<string, number>();
  const fieldCounts = new Map<string, number>();

  for (const submission of submissions ?? []) {
    submissionCounts.set(submission.form_id, (submissionCounts.get(submission.form_id) ?? 0) + 1);
  }

  for (const field of fields ?? []) {
    fieldCounts.set(field.form_id, (fieldCounts.get(field.form_id) ?? 0) + 1);
  }

  return (forms ?? []).map((form) => ({
    id: form.id,
    tenantId: form.tenant_id,
    title: form.title,
    slug: form.slug,
    status: form.status,
    publishedAt: form.published_at,
    requiresAuthentication: form.requires_authentication,
    event: mapEvent(form.event_id ? eventMap.get(form.event_id) ?? null : null),
    fieldCount: fieldCounts.get(form.id) ?? 0,
    submissionCount: submissionCounts.get(form.id) ?? 0,
    publicUrl: `/forms/${form.slug}`,
  }));
}

export async function createFormAction(formData: FormData) {
  "use server";

  const payload = parseAdminFormPayload(formData);
  const formId = await upsertEventForm(payload);
  redirect(`/admin/forms?created=${formId}`);
}

export async function submitPublishedFormResponse(input: FormSubmissionInput) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("form_submissions").insert({
    form_id: input.formId,
    event_id: input.eventId,
    tenant_id: input.tenantId,
    auth_user_id: input.authUserId,
    submitter_name: input.submitterName,
    submitter_email: input.submitterEmail,
    submitter_phone: input.submitterPhone,
    submitter_role: input.submitterRole,
    answers: input.answers,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw error;
  }
}

export async function upsertEventForm(input: EventFormUpsertInput) {
  const viewer = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const adminUser = viewer.user;

  if (!adminUser) {
    throw new Error("Admin session is required.");
  }

  const slug = slugify(input.slug || input.title);
  if (!slug) {
    throw new Error("Form slug is required.");
  }

  const linkedEvent = input.eventId
    ? await supabase
        .from("events")
        .select("tenant_id")
        .eq("id", input.eventId)
        .maybeSingle()
    : null;
  const { data: defaultTenantId } = await supabase.rpc("get_default_tenant_id");
  const tenantId = linkedEvent?.data?.tenant_id ?? defaultTenantId ?? null;

  if (!tenantId) {
    throw new Error("Unable to resolve a tenant for this form.");
  }

  const payload = {
    title: input.title.trim(),
    slug,
    description: input.description?.trim() || null,
    event_id: input.eventId,
    tenant_id: tenantId,
    status: input.status,
    requires_authentication: input.requiresAuthentication,
    success_message: input.successMessage.trim() || "Your response has been recorded.",
    published_at: input.status === "published" ? new Date().toISOString() : null,
    created_by: adminUser.id,
  };

  const { data: form, error } = input.id
    ? await supabase
        .from("event_forms")
        .update(payload)
        .eq("id", input.id)
        .select("*")
        .single()
    : await supabase.from("event_forms").insert(payload).select("*").single();

  if (error || !form) {
    throw error ?? new Error("Unable to save the form.");
  }

  const { error: deleteError } = await supabase.from("form_fields").delete().eq("form_id", form.id);
  if (deleteError) {
    throw deleteError;
  }

  const fieldsPayload = input.fields.map((field, index) => ({
    form_id: form.id,
    field_key: slugify(field.fieldKey).replace(/-/g, "_"),
    label: field.label.trim(),
    field_type: field.fieldType,
    placeholder: field.placeholder?.trim() || null,
    help_text: field.helpText?.trim() || null,
    is_required: Boolean(field.isRequired),
    options: ((field.options ?? []) as unknown) as Json,
    settings: ((field.settings ?? {}) as unknown) as Json,
    sort_order: field.sortOrder ?? index,
  }));

  if (fieldsPayload.length) {
    const { error: fieldsError } = await supabase.from("form_fields").insert(fieldsPayload);
    if (fieldsError) {
      throw fieldsError;
    }
  }

  revalidatePath("/admin");
  revalidatePath("/events");
  if (form.slug) {
    revalidatePath(`/forms/${form.slug}`);
  }

  return form.id;
}

export function parseAdminFormPayload(formData: FormData): EventFormUpsertInput {
  const rawFieldState = formData.get("fieldState") ?? formData.get("fields");
  const parsedFields = typeof rawFieldState === "string" ? JSON.parse(rawFieldState) : [];

  if (!Array.isArray(parsedFields)) {
    throw new Error("Field definition payload is invalid.");
  }

  return {
    id: typeof formData.get("formId") === "string" ? (formData.get("formId") as string) : undefined,
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    eventId: String(formData.get("eventId") ?? "").trim() || null,
    status: formData.get("status") === "published" ? "published" : "draft",
    requiresAuthentication: formData.get("requiresAuthentication") === "on",
    successMessage: String(formData.get("successMessage") ?? "").trim(),
    fields: parsedFields.map((field, index) => ({
      id: typeof field.id === "string" ? field.id : undefined,
      fieldKey: String(field.fieldKey ?? "").trim(),
      label: String(field.label ?? "").trim(),
      fieldType: normalizeFieldType(field.fieldType ?? null),
      placeholder: typeof field.placeholder === "string" ? field.placeholder : null,
      helpText: typeof field.helpText === "string" ? field.helpText : null,
      isRequired: Boolean(field.isRequired),
      options: Array.isArray(field.options)
        ? field.options.flatMap((option: unknown) => {
            if (typeof option === "string") {
              const cleaned = option.trim();

              if (!cleaned) {
                return [];
              }

              return [{ label: cleaned, value: slugify(cleaned) }];
            }

            if (!option || typeof option !== "object" || Array.isArray(option)) {
              return [];
            }

            const optionRecord = option as { label?: unknown; value?: unknown };
            const label = typeof optionRecord.label === "string" ? optionRecord.label.trim() : "";
            const value = typeof optionRecord.value === "string" ? optionRecord.value.trim() : label;

            if (!label || !value) {
              return [];
            }

            return [{ label, value }];
          })
        : [],
      settings:
        field.settings && typeof field.settings === "object" && !Array.isArray(field.settings)
          ? (field.settings as Json)
          : {},
      sortOrder: typeof field.sortOrder === "number" ? field.sortOrder : index,
    })),
  };
}
