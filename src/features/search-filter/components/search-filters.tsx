import Link from "next/link";

import { eventCategories } from "@/features/event-catalog/types/event";
import type { EventSearchFilters } from "@/features/search-filter/types/search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchFiltersProps {
  filters: EventSearchFilters;
}

export function SearchFilters({ filters }: SearchFiltersProps) {
  return (
    <Card className="border-slate-900/8 bg-white/72 text-slate-950 shadow-[0_28px_100px_-56px_rgba(15,23,42,0.22)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-accent/18 dark:text-white dark:shadow-[0_28px_100px_-56px_rgba(0,0,0,0.9)]">
      <CardHeader>
        <CardTitle>Search published events</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-white/70" htmlFor="event-query">
              Keyword
            </Label>
            <Input
              className="border-slate-900/8 bg-slate-950/4 text-slate-950 placeholder:text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-white/55"
              defaultValue={filters.query}
              id="event-query"
              name="query"
              placeholder="Hackathon, AI, membership..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-white/70" htmlFor="event-category">
              Category
            </Label>
            <select
              className="flex h-11 w-full rounded-2xl border border-slate-900/8 bg-slate-950/4 px-4 text-sm text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus-visible:ring-white/30"
              defaultValue={filters.category ?? "All"}
              id="event-category"
              name="category"
            >
              <option value="All">All categories</option>
              {eventCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-white/70" htmlFor="event-date">
              From date
            </Label>
            <Input
              className="border-slate-900/8 bg-slate-950/4 text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-white"
              defaultValue={filters.from}
              id="event-date"
              name="from"
              type="date"
            />
          </div>
          <div className="flex items-end gap-3">
            <Button type="submit">
              Apply
            </Button>
            <Button
              asChild
              className="border-slate-900/8 bg-slate-950/4 text-slate-700 hover:bg-slate-950/8 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              variant="outline"
            >
              <Link href="/search">Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
