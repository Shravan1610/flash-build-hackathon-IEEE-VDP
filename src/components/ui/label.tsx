import * as React from "react";

import { cn } from "@/lib/utils/cn";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground", className)}
      {...props}
    />
  );
}
