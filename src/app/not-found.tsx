import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">404</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Event not found</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              The event may still be under review, unpublished, or the link may be incorrect.
            </p>
          </div>
          <Button asChild>
            <Link href="/events">Back to events</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
