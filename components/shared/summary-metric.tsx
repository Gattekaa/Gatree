import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SummaryMetric({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  detail?: ReactNode;
}) {
  return (
    <div className="border-hairline min-w-0 border-l px-3.5 py-[18px] first:border-l-0 max-[374px]:px-2.5 md:px-7 md:py-6">
      <dt className="text-ink-subtle flex min-h-[34px] items-start text-xs leading-[1.4] md:min-h-5 md:items-center md:gap-3 md:text-[13px]">
        <span className="bg-product-accent/10 hidden size-9 shrink-0 place-items-center rounded-xl md:grid">
          <Icon
            className="text-primary"
            size={17}
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </span>
        {label}
      </dt>
      <dd className="mt-2 text-[25px] leading-[1.2] font-semibold tracking-[-.04em] tabular-nums max-[374px]:text-[22px] md:mt-[13px] md:text-[36px]">
        {value}
        {detail != null && (
          <span className="text-ink-tertiary mt-[7px] block text-[11px] md:text-xs">
            {detail}
          </span>
        )}
      </dd>
    </div>
  );
}
