"use client";

import { cn } from "@/lib/utils";
import { Tabs as TabsPrimitive } from "radix-ui";
import * as React from "react";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-10 items-center gap-1 border-2 border-hairline-strong bg-surface-2 p-1 text-ink-subtle product:rounded-full product:border product:h-12",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-4 py-1.5 text-[13px] font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-surface-1 data-[state=active]:text-ink data-[state=active]:border-b-2 data-[state=active]:border-primary",
        "data-[state=inactive]:hover:text-ink product:rounded-full product:min-h-9 product:data-[state=active]:border-0 product:data-[state=active]:bg-product-accent product:data-[state=active]:text-on-primary",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("mt-2 focus-visible:outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
