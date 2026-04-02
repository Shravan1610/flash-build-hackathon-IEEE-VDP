import * as React from "react";
import type { Route } from "next";
import Link from "next/link";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOutAction } from "@/features/auth/server/actions";
import { getCurrentUserContext } from "@/features/auth/server/auth";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/events", label: "Events" },
  { href: "/search", label: "Search" },
];

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const userContext = await getCurrentUserContext();
  const workspaceItems =
    userContext.canManageTenant && !userContext.isAdmin
      ? ([{ href: "/workspace", label: "Workspace" }] satisfies Array<{ href: Route; label: string }>)
      : [];
  const adminItems = userContext.isAdmin
    ? ([{ href: "/admin", label: "Admin" }] satisfies Array<{ href: Route; label: string }>)
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-50" />
      <header className="sticky top-0 z-20 border-b border-slate-900/8 bg-white/82 text-slate-950 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-zinc-950/78 dark:text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
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
            {[...navItems, ...workspaceItems, ...adminItems].map((item) => (
              <Link
                key={item.href}
                className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-black/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <AnimatedThemeToggler />
            {userContext.isAuthenticated ? (
              <>
                <Badge variant="outline">
                  {(userContext.role ?? (userContext.isAdmin ? "admin" : "member")).replaceAll("_", " ")}
                </Badge>
                <form action={signOutAction}>
                  <Button size="sm" type="submit" variant="outline">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth">Login / Signup</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
