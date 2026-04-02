import * as React from "react";
import type { Route } from "next";
import Link from "next/link";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/events", label: "Events" },
  { href: "/search", label: "Search" },
  { href: "/admin/uploads", label: "Admin Uploads" },
  { href: "/admin/events", label: "Review Queue" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-50" />
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/events">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
              IEEE
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                SRM IST Vadapalani
              </p>
              <p className="text-lg font-semibold">Event Poster Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-card hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <AnimatedThemeToggler />
            <Badge variant="outline">Review-first MVP</Badge>
            <Button asChild size="sm">
              <Link href="/admin/uploads">Upload Poster</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
