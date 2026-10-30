"use client";

import { ColorSwatchInput } from "@/components/editor/color-swatch-input";
import type { LinkStyleConfig } from "@/types";

interface LinkStyleTranslations {
  variant: string;
  variantFilled: string;
  variantOutlined: string;
  variantShadow: string;
  border: string;
  borderSharp: string;
  borderRounded: string;
  borderPill: string;
  buttonColor: string;
  customColors: string;
  buttonBackground: string;
  textColor: string;
  shadowColor: string;
  preview: string;
  previewLabel: string;
}

interface LinkStylePickerProps {
  value: LinkStyleConfig;
  onChange: (style: LinkStyleConfig) => void;
  translations: LinkStyleTranslations;
}

const LINK_COLOR_PRESETS = [
  { bg: "#1e2028", text: "#f7f8f8", label: "Default" },
  { bg: "#ffffff", text: "#111111", label: "Light" },
  { bg: "rgba(255,255,255,0.08)", text: "#f7f8f8", label: "Glass" },
  { bg: "rgba(255,255,255,0.05)", text: "#f7f8f8", label: "Subtle" },
  { bg: "#5e6ad2", text: "#ffffff", label: "Primary" },
  { bg: "#10b981", text: "#ffffff", label: "Green" },
  { bg: "#f97316", text: "#ffffff", label: "Orange" },
  { bg: "#ec4899", text: "#ffffff", label: "Pink" },
  { bg: "#8b5cf6", text: "#ffffff", label: "Purple" },
  { bg: "#06b6d4", text: "#ffffff", label: "Cyan" },
  { bg: "#000000", text: "#ffffff", label: "Black" },
  { bg: "#1f2937", text: "#e5e7eb", label: "Slate" },
];

export function LinkStylePicker({
  value,
  onChange,
  translations: t,
}: LinkStylePickerProps) {
  return (
    <div className="space-y-6">
      {}
      <div className="space-y-2.5">
        <p className="break-words text-[13px] font-medium text-ink">
          {t.variant}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...value, variant: "filled" })}
            className={`rounded-xl flex-1 border px-4 py-3 text-[13px] font-medium transition-all ${
              value.variant === "filled"
                ? "border-brutal-green bg-surface-2 text-ink "
                : "border-hairline-strong text-ink-subtle hover:border-ink-subtle"
            }`}
          >
            {t.variantFilled}
          </button>
          <button
            onClick={() => onChange({ ...value, variant: "outlined" })}
            className={`rounded-xl flex-1 border px-4 py-3 text-[13px] font-medium transition-all ${
              value.variant === "outlined"
                ? "border-brutal-green bg-surface-2 text-ink "
                : "border-hairline-strong text-ink-subtle hover:border-ink-subtle"
            }`}
          >
            {t.variantOutlined}
          </button>
          <button
            onClick={() => onChange({ ...value, variant: "brutal" })}
            className={`rounded-xl flex-1 border px-4 py-3 text-[13px] font-medium transition-all ${
              value.variant === "brutal"
                ? "border-brutal-green bg-surface-2 text-ink "
                : "border-hairline-strong text-ink-subtle hover:border-ink-subtle"
            }`}
          >
            {t.variantShadow}
          </button>
        </div>
      </div>

      {}
      <div className="space-y-2.5">
        <p className="break-words text-[13px] font-medium text-ink">
          {t.border}
        </p>
        <div className="flex gap-2">
          {(["sharp", "rounded", "pill"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...value, radius: r })}
              className={`rounded-xl flex flex-1 flex-col items-center gap-2 border px-3 py-3 transition-all ${
                value.radius === r
                  ? "border-brutal-green bg-surface-2"
                  : "border-hairline-strong hover:border-ink-subtle"
              }`}
            >
              <div
                className="h-3.5 w-full max-w-13 border border-ink-subtle/60"
                style={{
                  borderRadius:
                    r === "sharp" ? "2px" : r === "rounded" ? "6px" : "9999px",
                }}
              />
              <span className="text-xs font-medium text-ink-subtle">
                {r === "sharp"
                  ? t.borderSharp
                  : r === "rounded"
                    ? t.borderRounded
                    : t.borderPill}
              </span>
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="space-y-2.5">
        <p className="break-words text-[13px] font-medium text-ink">
          {t.buttonColor}
        </p>
        <div className="grid grid-cols-6 gap-2">
          {LINK_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.label}
              aria-label={preset.label}
              aria-pressed={
                value.bgColor === preset.bg && value.textColor === preset.text
              }
              onClick={() =>
                onChange({
                  ...value,
                  bgColor: preset.bg,
                  textColor: preset.text,
                })
              }
              className={`rounded-xl group relative aspect-square border transition-all hover:scale-110 ${
                value.bgColor === preset.bg && value.textColor === preset.text
                  ? "border-brutal-green scale-110"
                  : "border-hairline-strong hover:border-ink-subtle"
              }`}
              style={{ backgroundColor: preset.bg }}
              title={preset.label}
            >
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-bold opacity-80"
                style={{ color: preset.text }}
              >
                Aa
              </span>
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="rounded-2xl border border-hairline bg-surface-2 p-4">
        <p className="break-words mb-3 text-[12px] font-medium text-ink-subtle">
          {t.customColors}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="break-words text-xs text-ink-tertiary">
              {t.buttonBackground}
            </p>
            <ColorSwatchInput
              label={t.buttonBackground}
              value={value.bgColor}
              onChange={(v) => onChange({ ...value, bgColor: v })}
            />
          </div>
          <div className="space-y-2">
            <p className="break-words text-xs text-ink-tertiary">
              {t.textColor}
            </p>
            <ColorSwatchInput
              label={t.textColor}
              value={value.textColor}
              onChange={(v) => onChange({ ...value, textColor: v })}
            />
          </div>
          {value.variant === "brutal" && (
            <div className="col-span-2 space-y-2">
              <p className="break-words text-xs text-ink-tertiary">
                {t.shadowColor}
              </p>
              <ColorSwatchInput
                label={t.shadowColor}
                value={value.shadowColor || "#000000"}
                onChange={(v) => onChange({ ...value, shadowColor: v })}
              />
            </div>
          )}
        </div>
      </div>

      {}
      <div className="rounded-2xl border border-hairline bg-surface-2 p-4">
        <p className="break-words mb-3 text-[12px] font-medium text-ink-subtle">
          {t.preview}
        </p>
        <div className="flex justify-center">
          <div
            className="flex h-12 w-full max-w-70 items-center justify-center text-[14px] font-semibold"
            style={{
              borderRadius:
                value.radius === "sharp"
                  ? "4px"
                  : value.radius === "rounded"
                    ? "8px"
                    : "9999px",
              ...(value.variant === "brutal"
                ? {
                    border: `2px solid ${value.textColor === "#ffffff" || value.textColor === "#f7f8f8" ? "rgba(255,255,255,0.6)" : "#000000"}`,
                    backgroundColor: value.bgColor,
                    color: value.textColor,
                    boxShadow: `4px 4px 0px ${value.shadowColor || "#000000"}`,
                  }
                : value.variant === "outlined"
                  ? {
                      border: `2px solid ${value.bgColor}`,
                      backgroundColor: "transparent",
                      color: value.textColor,
                    }
                  : { backgroundColor: value.bgColor, color: value.textColor }),
            }}
          >
            {t.previewLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
