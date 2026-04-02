import Link from "next/link";

import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminAnalyticsSnapshot } from "@/features/analytics/server/analytics";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalyticsSnapshot();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Protected publishing, forms, tenants, and analytics."
        description="Only admins can access this workspace. Public users, students, faculty, and coordinators are server-blocked from admin routes."
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
              Published events
            </p>
            <p className="text-4xl font-semibold">{analytics.totals.publishedEvents}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Review queue</p>
            <p className="text-4xl font-semibold">{analytics.totals.reviewQueue}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
              Total submissions
            </p>
            <p className="text-4xl font-semibold">{analytics.totals.totalSubmissions}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">Form management</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Create a public form route, link it to an event, and publish it as `/forms/[slug]`.
            </p>
            <Button asChild>
              <Link href="/admin/forms">Open forms</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">Analytics</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Track registrations by event, volume over time, account-role breakdowns, and tenant activity.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/analytics">View analytics</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">Review queue</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Review poster extraction output before publishing event records to the public-facing site.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/events">Open queue</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
