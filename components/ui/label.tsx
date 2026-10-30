"use client";

import { cn } from "@/lib/utils";
import { Label as LabelPrimitive } from "radix-ui";
import * as React from "react";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-[14px] sm:text-[13px] font-medium text-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
