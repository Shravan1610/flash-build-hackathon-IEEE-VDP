import * as React from "react";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk, Public_Sans } from "next/font/google";

import { SiteShell } from "@/components/layout/site-shell";
import { cn } from "@/lib/utils/cn";

import "./globals.css";

const themeInitScript = `
  (function () {
    try {
      var storedTheme = localStorage.getItem("theme");
      var shouldUseDark =
        storedTheme === "dark" ||
        (!storedTheme || window.matchMedia("(prefers-color-scheme: dark)").matches);
      var resolvedTheme = shouldUseDark ? "dark" : "light";
      document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.style.colorScheme = resolvedTheme;
    } catch (error) {
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    }
  })();
`;

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "IEEE CS VDP Event Platform",
  description: "Poster-to-portal event publishing for IEEE CS SRM IST Vadapalani.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", publicSans.variable)}>
      <body
        className={cn(
          spaceGrotesk.variable,
          ibmPlexMono.variable,
          "min-h-screen bg-background font-[family-name:var(--font-heading)] text-foreground antialiased",
        )}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
