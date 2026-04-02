import Link from "next/link";
import { ArrowRight, CalendarRange, ChartColumnIncreasing, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventGrid } from "@/features/event-catalog/components/event-grid";
import { listPublishedEvents } from "@/features/event-catalog/server/events";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listPublishedEvents();
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-4 rounded-[36px] border border-slate-900/8 bg-white/58 p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.28)] backdrop-blur-sm transition-colors duration-300 dark:border-white/8 dark:bg-black/18 dark:shadow-[0_36px_120px_-56px_rgba(0,0,0,0.8)] sm:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">Public Portal</p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Campus events, registrations, and live forms in one public-facing hub.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300">
              Browse published IEEE CS events without signing in, open registration forms instantly,
              and create an account only if you want a saved student or faculty identity for
              submissions.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-slate-900/8 bg-white/72 text-slate-950 shadow-[0_40px_120px_-56px_rgba(15,23,42,0.3)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-white/6 dark:text-white dark:shadow-[0_40px_120px_-56px_rgba(0,0,0,0.85)]">
          <CardHeader className="bg-linear-to-r from-primary via-primary to-accent text-primary-foreground">
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6">
            <div className="rounded-[24px] border border-slate-900/8 bg-slate-950/6 p-4 transition-colors duration-300 dark:border-white/8 dark:bg-black/24">
              <p className="text-sm uppercase tracking-[0.16em] text-violet-500 dark:text-violet-300">Public</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                Anyone can browse events and open published registration forms.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-900/8 bg-slate-950/6 p-4 transition-colors duration-300 dark:border-white/8 dark:bg-black/24">
              <p className="text-sm uppercase tracking-[0.16em] text-violet-500 dark:text-violet-300">Optional login</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                Students and faculty can create accounts for faster, role-aware submissions.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-900/8 bg-slate-950/6 p-4 transition-colors duration-300 dark:border-white/8 dark:bg-black/24">
              <p className="text-sm uppercase tracking-[0.16em] text-violet-500 dark:text-violet-300">Protected workspaces</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                Admins handle publishing and analytics while faculty workspaces can invite students
                and student coordinators.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="border-slate-900/8 bg-white/70 text-slate-950 shadow-[0_28px_100px_-56px_rgba(15,23,42,0.24)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-white/6 dark:text-white dark:shadow-[0_28px_100px_-56px_rgba(0,0,0,0.9)]">
          <CardContent className="space-y-3 p-6">
            <CalendarRange className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Live event discovery</h3>
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
              Public event details, poster previews, dates, venues, and linked registration routes.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-900/8 bg-white/70 text-slate-950 shadow-[0_28px_100px_-56px_rgba(15,23,42,0.24)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-white/6 dark:text-white dark:shadow-[0_28px_100px_-56px_rgba(0,0,0,0.9)]">
          <CardContent className="space-y-3 p-6">
            <FileSpreadsheet className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Dynamic forms</h3>
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
              Google-Form-style field configurations published as in-app URLs like `/forms/[slug]`.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-900/8 bg-white/70 text-slate-950 shadow-[0_28px_100px_-56px_rgba(15,23,42,0.24)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-white/6 dark:text-white dark:shadow-[0_28px_100px_-56px_rgba(0,0,0,0.9)]">
          <CardContent className="space-y-3 p-6">
            <ChartColumnIncreasing className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Admin analytics</h3>
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
              Registration volume, form performance, and role-based breakdowns for decision-making.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6 rounded-[36px] border border-slate-900/8 bg-white/52 p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.22)] backdrop-blur-sm transition-colors duration-300 dark:border-white/8 dark:bg-black/14 dark:shadow-[0_36px_120px_-56px_rgba(0,0,0,0.75)] sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">Upcoming</p>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Featured IEEE CS events
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-300 sm:text-base">
                Open any event to see its poster and jump straight into the linked registration form.
              </p>
            </div>
          </div>
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
