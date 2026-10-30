import { cn } from "@/lib/utils";
import * as React from "react";

type TextareaProps = React.ComponentProps<"textarea">;

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full border-2 border-hairline-strong bg-canvas px-3.5 py-2.5 text-[16px] sm:text-[14px] font-mono text-ink transition-colors placeholder:text-ink-tertiary product:border product:rounded-xl product:font-sans",
        "hover:border-ink-tertiary",
        "focus:border-primary focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
export type { TextareaProps };
