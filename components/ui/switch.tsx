"use client";

import { cn } from "@/lib/utils";
import { Switch as SwitchPrimitive } from "radix-ui";
import * as React from "react";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border-2 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 product:rounded-full product:h-6 product:w-11 product:border product:data-[state=checked]:bg-product-accent product:data-[state=checked]:border-product-accent",
        "data-[state=checked]:border-brutal-green data-[state=checked]:bg-brutal-green data-[state=unchecked]:border-hairline-strong data-[state=unchecked]:bg-surface-3",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-3.5 w-3.5 bg-white ring-0 transition-transform duration-150 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5",
          "data-[state=checked]:bg-black data-[state=unchecked]:bg-ink product:rounded-full product:h-[18px] product:w-[18px] product:data-[state=checked]:translate-x-[21px] product:data-[state=unchecked]:translate-x-[3px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
