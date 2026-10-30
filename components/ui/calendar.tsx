"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center items-center h-7",
        caption_label: "text-body-sm font-medium text-ink",
        nav: "absolute inset-x-2 top-3 flex items-center justify-between z-10",
        button_previous: cn(
          "inline-flex h-7 w-7 product:h-9 product:w-9 product:rounded-full product:border items-center justify-center border-2 border-hairline-strong bg-surface-1 text-ink-subtle cursor-pointer hover:bg-surface-2 hover:text-ink transition-colors"
        ),
        button_next: cn(
          "inline-flex h-7 w-7 product:h-9 product:w-9 product:rounded-full product:border items-center justify-center border-2 border-hairline-strong bg-surface-1 text-ink-subtle cursor-pointer hover:bg-surface-2 hover:text-ink transition-colors"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-ink-tertiary w-9 font-medium text-[11px] uppercase text-center",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center text-body-sm",
        day_button: cn(
          "inline-flex h-9 w-9 product:rounded-full items-center justify-center font-normal text-ink cursor-pointer transition-colors",
          "hover:bg-surface-3 hover:text-ink",
          "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-0",
          "aria-selected:bg-primary aria-selected:text-on-primary aria-selected:font-medium",
        ),
        selected: "bg-primary text-on-primary font-medium product:rounded-full product:bg-product-accent",
        today: "bg-surface-3 text-ink font-semibold product:rounded-full",
        outside: "text-ink-tertiary opacity-50",
        disabled: "text-ink-tertiary opacity-30",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") return <ChevronLeft className="h-4 w-4" />;
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
