"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { DeviceData } from "@/types";
import { Monitor, Smartphone, Tablet } from "lucide-react";

interface DeviceChartProps {
  data: DeviceData[];
  translations?: Dictionary["analytics"];
  locale?: string;
}

const DEVICE_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  desktop: { icon: Monitor, label: "Desktop", color: "bg-product-accent" },
  mobile: { icon: Smartphone, label: "Mobile", color: "bg-product-accent/50" },
  tablet: { icon: Tablet, label: "Tablet", color: "bg-ink-tertiary" },
  unknown: { icon: Monitor, label: "Outro", color: "bg-surface-4" },
};

export function DeviceChart({
  data,
  translations,
  locale = "pt-BR",
}: DeviceChartProps) {
  if (data.length === 0) {
    return (
      <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
        <h2 className="text-ink text-sm leading-[1.5] font-semibold">
          {translations?.devices ?? "Dispositivos"}
        </h2>
        <div className="mt-8 flex h-32 items-center justify-center">
          <p className="text-ink-subtle text-sm leading-[1.5]">
            {translations?.noDeviceData ?? "Sem dados"}
          </p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
      <h2 className="text-ink mb-5 text-sm leading-[1.5] font-semibold">
        {translations?.devices ?? "Dispositivos"}
      </h2>

      {}
      <div className="bg-surface-3 mb-5 flex h-2.5 w-full overflow-hidden rounded-full">
        {data.map((d) => {
          const config = DEVICE_CONFIG[d.device] || DEVICE_CONFIG.unknown;
          return (
            <div
              key={d.device}
              className={`h-full ${config.color}`}
              style={{ width: `${d.percentage.toLocaleString(locale)}%` }}
            />
          );
        })}
      </div>

      {}
      <div className="space-y-3">
        {data.map((d) => {
          const config = DEVICE_CONFIG[d.device] || DEVICE_CONFIG.unknown;
          const Icon = config.icon;
          return (
            <div key={d.device} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
                <Icon className="text-ink-subtle h-4 w-4" />
                <span className="text-ink text-xs leading-[1.5] tracking-normal">
                  {d.device === "unknown" && locale.startsWith("en")
                    ? "Other"
                    : config.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ink text-xs leading-[1.5] font-medium tracking-normal tabular-nums">
                  {d.count.toLocaleString(locale)}
                </span>
                <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
                  {d.percentage.toLocaleString(locale)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {}
      <div className="border-hairline-strong mt-4 border-t pt-3">
        <div className="flex items-center justify-between">
          <span className="text-ink-subtle text-xs leading-[1.5] tracking-normal">
            Total
          </span>
          <span className="text-ink text-xs leading-[1.5] font-medium tracking-normal tabular-nums">
            {total.toLocaleString(locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
