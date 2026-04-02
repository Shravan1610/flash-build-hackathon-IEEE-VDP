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
    <Card className="border-none bg-[#0f5f55] text-primary-foreground">
      <CardHeader>
        <CardTitle>Search published events</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <div className="space-y-2">
            <Label className="text-primary-foreground/70" htmlFor="event-query">
              Keyword
            </Label>
            <Input
              className="border-white/10 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/55"
              defaultValue={filters.query}
              id="event-query"
              name="query"
              placeholder="Hackathon, AI, membership..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-primary-foreground/70" htmlFor="event-category">
              Category
            </Label>
            <select
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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
            <Label className="text-primary-foreground/70" htmlFor="event-date">
              From date
            </Label>
            <Input
              className="border-white/10 bg-white/10 text-primary-foreground"
              defaultValue={filters.from}
              id="event-date"
              name="from"
              type="date"
            />
          </div>
          <div className="flex items-end gap-3">
            <Button className="bg-white text-[#0f5f55] hover:bg-white/90" type="submit">
              Apply
            </Button>
            <Button asChild className="border-white/10 bg-white/10 text-primary-foreground hover:bg-white/15" variant="outline">
              <Link href="/search">Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
