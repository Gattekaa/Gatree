import type { CSSProperties } from "react";
import type { LinkStyleConfig } from "@/types";

export function getLinkButtonStyle(
  link: { bgColor?: string | null; textColor?: string | null },
  defaults: LinkStyleConfig,
  radius: string,
  shadowOffset = 4,
): CSSProperties {
  const background = link.bgColor || defaults.bgColor;
  const color = link.textColor || defaults.textColor;
  const base = { borderRadius: radius, color };
  if (defaults.variant === "outlined") {
    return {
      ...base,
      backgroundColor: "transparent",
      border: `2px solid ${background}`,
    };
  }
  if (defaults.variant === "brutal") {
    return {
      ...base,
      backgroundColor: background,
      border: `2px solid ${color === "#ffffff" || color === "#f7f8f8" ? "rgba(255,255,255,0.6)" : "#000000"}`,
      boxShadow: `${shadowOffset}px ${shadowOffset}px 0px ${defaults.shadowColor || "#000000"}`,
    };
  }
  return { ...base, backgroundColor: background };
}
