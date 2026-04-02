import Link from "next/link";
import { ArrowRight, CalendarRange, ChartColumnIncreasing, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EventGrid } from "@/features/event-catalog/components/event-grid";
import { listPublishedEvents } from "@/features/event-catalog/server/events";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listPublishedEvents();
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <SectionHeading
          eyebrow="Public Portal"
          title="Campus events, registrations, and live forms in one public-facing hub."
          description="Browse published IEEE CS events without signing in, open registration forms instantly, and create an account only if you want a saved student or faculty identity for submissions."
        />

        <Card className="overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6">
            <div className="rounded-[24px] bg-background/10 p-4">
              <p className="text-sm uppercase tracking-[0.16em] text-primary">Public</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Anyone can browse events and open published registration forms.
              </p>
            </div>
            <div className="rounded-[24px] bg-background/10 p-4">
              <p className="text-sm uppercase tracking-[0.16em] text-primary">Optional login</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Students and faculty can create accounts for faster, role-aware submissions.
              </p>
            </div>
            <div className="rounded-[24px] bg-background/10 p-4">
              <p className="text-sm uppercase tracking-[0.16em] text-primary">Protected workspaces</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Admins handle publishing and analytics while faculty workspaces can invite students and student coordinators.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-3 p-6">
            <CalendarRange className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Live event discovery</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Public event details, poster previews, dates, venues, and linked registration routes.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Dynamic forms</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Google-Form-style field configurations published as in-app URLs like `/forms/[slug]`.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <ChartColumnIncreasing className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Admin analytics</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Registration volume, form performance, and role-based breakdowns for decision-making.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Upcoming"
            title="Featured IEEE CS events"
            description="Open any event to see its poster and jump straight into the linked registration form."
          />
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/events">
                Explore events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth">Create account</Link>
            </Button>
          </div>
        </div>
        <EventGrid events={featuredEvents} />
      </section>
    </div>
  );
}
