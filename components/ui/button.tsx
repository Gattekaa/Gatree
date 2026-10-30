import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-[13px] font-semibold uppercase tracking-wider transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-2 border-hairline-strong bg-surface-1 text-ink hover:bg-surface-2",
        destructive:
          "border-2 border-error bg-error text-white hover:bg-error/90",
        outline:
          "border-2 border-hairline-strong bg-transparent text-ink hover:bg-surface-2",
        secondary:
          "border-2 border-hairline-strong bg-surface-2 text-ink hover:bg-surface-3",
        ghost:
          "border-2 border-transparent text-ink-subtle hover:bg-surface-2 hover:text-ink",
        link: "border-2 border-transparent text-primary underline-offset-4 hover:underline hover:text-primary-hover",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        "product:normal-case product:tracking-normal product:border product:shadow-none product:rounded-full product:min-h-11 product:font-medium product:transition-colors",
        buttonVariants({ variant, size, className }),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
