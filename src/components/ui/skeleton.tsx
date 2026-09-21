import type * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="skeleton"
      className={cn(
        "block animate-pulse rounded-2xl bg-foreground/10",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
