import { getAdminAnalyticsSnapshot } from "@/features/analytics/server/analytics";
import { AdminAnalyticsDashboard } from "@/features/analytics/components/admin-analytics-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalyticsSnapshot();

  return <AdminAnalyticsDashboard analytics={analytics} />;
}
