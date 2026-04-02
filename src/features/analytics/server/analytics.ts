import { requireAdmin } from "@/features/auth/server/admin-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface AnalyticsCountPoint {
  day: string;
  count: number;
}

interface EventCountPoint {
  eventId: string;
  label: string;
  count: number;
}

export interface AnalyticsMetric {
  label: string;
  value: string;
  detail: string;
}

export interface AnalyticsSeriesPoint {
  label: string;
  value: number;
}

export interface AdminAnalyticsSnapshot {
  totals: {
    publishedEvents: number;
    reviewQueue: number;
    totalForms: number;
    publishedForms: number;
    totalSubmissions: number;
  };
  roleBreakdown: Record<string, number>;
  submissionRoleBreakdown: Record<string, number>;
  submissionsByEvent: EventCountPoint[];
  submissionsByDay: AnalyticsCountPoint[];
  metrics: AnalyticsMetric[];
  submissionsByRole: AnalyticsSeriesPoint[];
  topForms: AnalyticsSeriesPoint[];
}

export async function getAdminAnalyticsSnapshot(): Promise<AdminAnalyticsSnapshot> {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const [{ data: forms }, { data: submissions }, { data: events }, { data: profiles }] = await Promise.all([
    supabase.from("event_forms").select("id, event_id, status, created_at, published_at, slug, title"),
    supabase.from("form_submissions").select("form_id, event_id, submitted_at, submitter_role"),
    supabase.from("events").select("id, title, status"),
    supabase.from("user_profiles").select("role"),
  ]);

  const formsList = forms ?? [];
  const submissionsList = submissions ?? [];
  const eventsList = events ?? [];
  const publishedForms = formsList.filter((form) => form.status === "published");
  const publishedEvents = eventsList.filter((event) => event.status === "published").length;
  const reviewQueue = eventsList.filter((event) => event.status !== "published").length;

  const submissionsByDay = new Map<string, number>();
  const submissionsByRole = new Map<string, number>();
  const roleBreakdown = new Map<string, number>();
  const submissionRoleBreakdown = new Map<string, number>();
  const submissionsByEventMap = new Map<string, EventCountPoint>();
  const topFormsMap = new Map<string, number>();
  const formNameById = new Map(formsList.map((form) => [form.id, form.title]));
  const eventNameById = new Map(eventsList.map((event) => [event.id, event.title ?? "Untitled event"]));
  const formEventById = new Map(formsList.map((form) => [form.id, form.event_id]));

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const current = new Date();
    current.setDate(current.getDate() - (6 - index));
    return current.toISOString().slice(0, 10);
  });

  for (const date of last7Days) {
    submissionsByDay.set(date, 0);
  }

  for (const submission of submissionsList) {
    const dayKey = submission.submitted_at.slice(0, 10);
    if (submissionsByDay.has(dayKey)) {
      submissionsByDay.set(dayKey, (submissionsByDay.get(dayKey) ?? 0) + 1);
    }

    const roleLabel = submission.submitter_role ?? "public";
    submissionsByRole.set(roleLabel, (submissionsByRole.get(roleLabel) ?? 0) + 1);
    submissionRoleBreakdown.set(
      roleLabel,
      (submissionRoleBreakdown.get(roleLabel) ?? 0) + 1,
    );
    topFormsMap.set(submission.form_id, (topFormsMap.get(submission.form_id) ?? 0) + 1);

    const eventId = submission.event_id ?? formEventById.get(submission.form_id) ?? null;
    if (eventId) {
      submissionsByEventMap.set(eventId, {
        eventId,
        label: eventNameById.get(eventId) ?? "Untitled event",
        count: (submissionsByEventMap.get(eventId)?.count ?? 0) + 1,
      });
    }
  }

  for (const profile of profiles ?? []) {
    roleBreakdown.set(profile.role, (roleBreakdown.get(profile.role) ?? 0) + 1);
  }

  const metrics: AnalyticsMetric[] = [
    {
      label: "Published forms",
      value: String(publishedForms.length),
      detail: `${formsList.length} total forms`,
    },
    {
      label: "Total submissions",
      value: String(submissionsList.length),
      detail: "Across all public form URLs",
    },
    {
      label: "Avg. submissions / form",
      value:
        formsList.length > 0
          ? (submissionsList.length / Math.max(formsList.length, 1)).toFixed(1)
          : "0.0",
      detail: "All drafts and published forms combined",
    },
  ];

  return {
    totals: {
      publishedEvents,
      reviewQueue,
      totalForms: formsList.length,
      publishedForms: publishedForms.length,
      totalSubmissions: submissionsList.length,
    },
    roleBreakdown: Object.fromEntries(roleBreakdown),
    submissionRoleBreakdown: Object.fromEntries(submissionRoleBreakdown),
    submissionsByEvent: Array.from(submissionsByEventMap.values()).sort((left, right) => right.count - left.count),
    metrics,
    submissionsByDay: Array.from(submissionsByDay.entries()).map(([day, count]) => ({
      day,
      count,
    })),
    submissionsByRole: Array.from(submissionsByRole.entries()).map(([label, value]) => ({
      label,
      value,
    })),
    topForms: Array.from(topFormsMap.entries())
      .map(([formId, value]) => ({
        label: formNameById.get(formId) ?? "Untitled form",
        value,
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5),
  };
}
