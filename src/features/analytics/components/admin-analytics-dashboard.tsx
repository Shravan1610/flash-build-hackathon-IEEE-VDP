"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AdminAnalyticsSnapshot } from "@/features/analytics/server/analytics";

function formatShortDate(day: string) {
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

const roleChartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function AdminAnalyticsDashboard({
  analytics,
}: {
  analytics: AdminAnalyticsSnapshot;
}) {
  const submissionsByDay = analytics.submissionsByDay.map((item) => ({
    date: formatShortDate(item.day),
    submissions: item.count,
  }));
  const topEvents = analytics.submissionsByEvent.slice(0, 6).map((item) => ({
    event: item.label,
    count: item.count,
  }));
  const roleBreakdown = Object.entries(analytics.roleBreakdown).map(([role, count]) => ({
    role: role.replaceAll("_", " "),
    count,
  }));

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Analytics"
        title="Shadcn chart analytics for the event platform"
        description="Registrations, role mix, and top-performing events rendered with a dark neutral, violet, and teal dashboard system."
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Total forms</p>
            <p className="text-4xl font-semibold">{analytics.totals.totalForms}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Published forms</p>
            <p className="text-4xl font-semibold">{analytics.totals.publishedForms}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Published events</p>
            <p className="text-4xl font-semibold">{analytics.totals.publishedEvents}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Total submissions</p>
            <p className="text-4xl font-semibold">{analytics.totals.totalSubmissions}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardHeader>
            <CardTitle>Registrations over the last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[320px] w-full"
              config={{
                submissions: {
                  label: "Submissions",
                  color: "var(--chart-1)",
                },
              }}
            >
              <BarChart data={submissionsByDay}>
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                <Bar dataKey="submissions" fill="var(--chart-1)" radius={[18, 18, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardHeader>
            <CardTitle>Account role mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer
              className="mx-auto h-[280px] max-w-[320px]"
              config={{
                student: { label: "Student", color: "var(--chart-1)" },
                faculty: { label: "Faculty", color: "var(--chart-2)" },
                admin: { label: "Admin", color: "var(--chart-3)" },
                student_coordinator: { label: "Student coordinator", color: "var(--chart-4)" },
              }}
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                <Pie
                  data={roleBreakdown}
                  dataKey="count"
                  innerRadius={64}
                  nameKey="role"
                  outerRadius={104}
                  strokeWidth={0}
                >
                  {roleBreakdown.map((entry, index) => (
                    <Cell key={entry.role} fill={roleChartColors[index % roleChartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="grid gap-3">
              {roleBreakdown.map((entry, index) => (
                <div
                  key={entry.role}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: roleChartColors[index % roleChartColors.length] }}
                    />
                    <span className="capitalize">{entry.role}</span>
                  </div>
                  <span className="font-medium">{entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardHeader>
            <CardTitle>Top events by registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[320px] w-full"
              config={{
                count: {
                  label: "Registrations",
                  color: "var(--chart-2)",
                },
              }}
            >
              <BarChart data={topEvents} layout="vertical" margin={{ left: 18 }}>
                <CartesianGrid horizontal={false} />
                <XAxis allowDecimals={false} axisLine={false} tickLine={false} type="number" />
                <YAxis
                  axisLine={false}
                  dataKey="event"
                  tickLine={false}
                  tickMargin={12}
                  type="category"
                  width={140}
                />
                <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 16, 16, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/20">
          <CardHeader>
            <CardTitle>Submission role breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {Object.entries(analytics.submissionRoleBreakdown).map(([label, value], index) => (
              <div
                key={label}
                className="rounded-[24px] border border-border/70 bg-muted/20 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                      {label.replaceAll("_", " ")}
                    </p>
                    <p className="text-3xl font-semibold">{value}</p>
                  </div>
                  <div
                    className="h-12 w-1.5 rounded-full"
                    style={{ backgroundColor: roleChartColors[index % roleChartColors.length] }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
