import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";

export function CatalogHero() {
  return (
    <section className="grid gap-8 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
      <SectionHeading
        eyebrow="Public Discovery"
        title="From unstructured posters to a campus-ready event catalog."
        description="The public portal surfaces published IEEE CS events with concise metadata, searchable categories, and tenant-aware publishing controls behind the scenes."
      />

      <div className="rounded-[32px] border border-border/60 bg-card/90 p-6 shadow-[0_24px_80px_-48px_rgba(15,95,85,0.5)]">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-accent">
          <Sparkles className="h-4 w-4" />
          Public Event Portal
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Upload flow, admin review, and public discovery are separated into feature modules so the
          OCR pipeline can evolve without destabilizing the event portal.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/search">
              Search Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
