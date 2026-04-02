import Link from "next/link";

import { requireAdminUser } from "@/features/auth/server/auth";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminUser();

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="h-fit rounded-[28px] border border-white/10 bg-sidebar/90 p-4 shadow-2xl shadow-black/25 backdrop-blur">
        <div className="rounded-[22px] border border-white/10 bg-card/70 p-4">
          <p className="text-sm font-medium text-foreground">Menu</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Lyra preset / neutral / violet / teal
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          <Button asChild className="justify-start rounded-[18px]" size="sm" variant="outline">
            <Link href="/admin">Overview</Link>
          </Button>
          <Button asChild className="justify-start rounded-[18px]" size="sm" variant="outline">
            <Link href="/admin/forms">Forms</Link>
          </Button>
          <Button asChild className="justify-start rounded-[18px]" size="sm" variant="outline">
            <Link href="/admin/analytics">Analytics</Link>
          </Button>
          <Button asChild className="justify-start rounded-[18px]" size="sm" variant="outline">
            <Link href="/admin/events">Review queue</Link>
          </Button>
          <Button asChild className="justify-start rounded-[18px]" size="sm" variant="outline">
            <Link href="/admin/uploads">Poster uploads</Link>
          </Button>
        </div>
      </aside>

      <div className="space-y-8">{children}</div>
    </div>
  );
}
