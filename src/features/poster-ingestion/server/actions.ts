"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/features/auth/server/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, EventCategory, EventStatus, PosterSourceFileType } from "@/types/supabase";
import { slugify } from "@/lib/utils/slugify";

import { extractEventMetadataFromPosterText } from "../lib/extract-event-metadata";
import { extractPosterTextWithGemini } from "./gemini-ocr";

function normalizePosterMimeType(file: File): PosterSourceFileType {
  if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf") {
    return file.type;
  }

  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
  if (lowerName.endsWith(".png")) return "image/png";
  return "application/pdf";
}

function buildStoragePath(fileName: string) {
  const cleanedName = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  return `raw/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${cleanedName}`;
}

function inferReviewStatus(confidence: number) {
  return (confidence >= 0.72 ? "draft" : "review_required") satisfies EventStatus;
}

export async function uploadPosterAction(formData: FormData) {
  await requireAdminUser();
  const file = formData.get("poster");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/uploads?error=missing-file");
  }

  const admin = createSupabaseAdminClient();
  const mimeType = normalizePosterMimeType(file);
  const storagePath = buildStoragePath(file.name);
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("posters")
    .upload(storagePath, bytes, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    redirect(`/admin/uploads?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: publicUrlData } = admin.storage.from("posters").getPublicUrl(storagePath);

  let rawText = "";
  let confidence = 0.16;

  try {
    const ocrResult = await extractPosterTextWithGemini({
      bytes,
      fileName: file.name,
      mimeType,
    });
    rawText = ocrResult.rawText;
  } catch (error) {
    rawText = "";
    console.error("Poster OCR failed during upload.", error);
  }

  const extracted = extractEventMetadataFromPosterText({
    rawText,
    fileName: file.name,
  });
  confidence = extracted.confidence;

  const { data: defaultTenantId } = await admin.rpc("get_default_tenant_id");
  if (!defaultTenantId) {
    redirect("/admin/uploads?error=missing-default-tenant");
  }

  const insertPayload: Database["public"]["Tables"]["events"]["Insert"] = {
    tenant_id: defaultTenantId,
    slug: extracted.slug,
    title: extracted.title,
    description_raw_text: rawText || null,
    event_date: extracted.eventDate,
    start_time: extracted.startTime,
    end_time: extracted.endTime,
    venue: extracted.venue,
    category: extracted.category as EventCategory | null,
    status: inferReviewStatus(confidence),
    poster_storage_path: storagePath,
    poster_public_url: publicUrlData.publicUrl,
    source_file_type: mimeType,
    ocr_text: rawText || null,
    extraction_confidence: confidence,
  };

  const { data: event, error: insertError } = await admin
    .from("events")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insertError || !event) {
    redirect(`/admin/uploads?error=${encodeURIComponent(insertError?.message ?? "Unable to save event")}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect(`/admin/events?uploaded=${event.id}`);
}

export async function updateReviewEventAction(formData: FormData) {
  await requireAdminUser();
  const eventId = String(formData.get("eventId") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  const eventDate = String(formData.get("eventDate") ?? "").trim() || null;
  const startTime = String(formData.get("startTime") ?? "").trim() || null;
  const endTime = String(formData.get("endTime") ?? "").trim() || null;
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const description = String(formData.get("descriptionRawText") ?? "").trim() || null;
  const confidenceValue = Number(formData.get("confidence") ?? 0.5);

  if (!eventId) {
    redirect("/admin/events?error=missing-event");
  }

  const admin = createSupabaseAdminClient();
  const nextStatus =
    status === "published" ? "published" : status === "rejected" ? "rejected" : "draft";

  const { error } = await admin
    .from("events")
    .update({
      slug: title ? slugify(title) : null,
      title,
      description_raw_text: description,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      venue,
      category: category as EventCategory | null,
      status: nextStatus,
      extraction_confidence: Number.isFinite(confidenceValue) ? confidenceValue : 0.5,
      published_at: nextStatus === "published" ? new Date().toISOString() : null,
    })
    .eq("id", eventId);

  if (error) {
    redirect(`/admin/events?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect(`/admin/events?updated=${eventId}`);
}
