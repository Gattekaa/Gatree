import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

interface InputProps extends React.ComponentProps<"input"> {
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  wrapperClassName?: string;
}

function Input({
  className,
  type,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftAddon,
  rightAddon,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <div
      data-slot="input-wrapper"
      className={cn(
        "flex h-11 w-full items-center rounded-sm border-2 border-hairline-strong bg-canvas transition-colors product:border product:rounded-xl product:h-12",
        "hover:not-focus-within:border-ink-tertiary",
        "focus-within:border-primary",
        wrapperClassName,
      )}
    >
      {LeftIcon && (
        <div className="pointer-events-none flex shrink-0 items-center pl-3.5">
          <LeftIcon className="h-4 w-4 text-ink-tertiary" />
        </div>
      )}
      {leftAddon && (
        <div className="pointer-events-none flex shrink-0 items-center pl-3.5">
          {leftAddon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent py-2 text-[16px] sm:text-[14px] font-mono text-ink outline-none ring-0 placeholder:text-ink-tertiary product:min-w-0 product:font-sans product:[html.light_&]:[color-scheme:light] product:[html.dark_&]:[color-scheme:dark] focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          leftAddon || LeftIcon ? "pl-1 pr-3.5" : "px-3.5",
          (rightAddon || RightIcon) && "pr-2",
          className,
        )}
        {...props}
      />
      {RightIcon && (
        <div className="pointer-events-none flex shrink-0 items-center pr-3.5">
          <RightIcon className="h-4 w-4 text-ink-tertiary" />
        </div>
      )}
      {rightAddon && (
        <div className="pointer-events-none flex shrink-0 items-center pr-3.5">
          {rightAddon}
        </div>
      )}
    </div>
  );
}

export { Input };
export type { InputProps };
