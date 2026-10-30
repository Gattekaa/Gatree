"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { ReferrerData } from "@/types";
import { Globe, Info, Link2 } from "lucide-react";

interface ReferrerListProps {
  data: ReferrerData[];
  translations?: Dictionary["analytics"];
  locale?: string;
}

export function ReferrerList({
  data,
  translations,
  locale = "pt-BR",
}: ReferrerListProps) {
  if (data.length === 0) {
    return (
      <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
        <h2 className="text-ink text-sm leading-[1.5] font-semibold">
          {translations?.trafficSource ?? "Origem do Tráfego"}
        </h2>
        <div className="mt-8 flex h-32 flex-col items-center justify-center gap-2">
          <Link2 className="text-ink-tertiary h-8 w-8" />
          <p className="text-ink-subtle text-sm leading-[1.5]">
            {translations?.noReferrerData ?? "Sem dados de referência"}
          </p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((r) => r.count));

  return (
    <TooltipProvider>
      <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-ink text-sm leading-[1.5] font-semibold">
            {translations?.trafficSource ?? "Origem do Tráfego"}
          </h2>
          <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
            {data.length}{" "}
            {data.length === 1
              ? (translations?.source ?? "fonte")
              : (translations?.sources ?? "fontes")}
          </span>
        </div>

        <div className="space-y-3">
          {data.map((r) => {
            const percentage = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
            const isDirect = r.referrer === "Direto";

            return (
              <div key={r.referrer} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Globe className="text-ink-tertiary h-3.5 w-3.5 shrink-0" />
                    <span className="text-ink truncate text-xs leading-[1.5] tracking-normal">
                      {isDirect
                        ? (translations?.directAccess ?? "Acesso direto")
                        : r.referrer}
                    </span>
                    {isDirect && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={
                              translations?.directAccess ?? "Acesso direto"
                            }
                            className="text-ink-tertiary hover:text-ink-subtle grid size-6 shrink-0 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          >
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-56 text-center font-normal"
                        >
                          {translations?.directAccessTooltip ??
                            "Digitou a URL, usou favoritos, ou veio de um app que não envia origem"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-ink text-xs leading-[1.5] font-medium tracking-normal tabular-nums">
                      {r.count.toLocaleString(locale)}
                    </span>
                    <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
                      {r.percentage.toLocaleString(locale)}%
                    </span>
                  </div>
                </div>
                <div className="bg-surface-3 h-1 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full ${isDirect ? "bg-ink-tertiary/50" : "bg-product-accent/40"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
