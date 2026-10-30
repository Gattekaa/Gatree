import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface TrendBadgeProps {
  value: number;
}

export function TrendBadge({ value }: TrendBadgeProps) {
  if (value === 0) {
    return (
      <span className="border-hairline-strong bg-surface-2 text-ink-subtle inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs tabular-nums leading-[1.5] tracking-normal">
        <Minus className="h-3 w-3" />
        0%
      </span>
    );
  }

  const isPositive = value > 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs tabular-nums leading-[1.5] tracking-normal ${
        isPositive
          ? "border-success/30 bg-success/10 text-success"
          : "border-error/30 bg-error/10 text-error"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {value}%
    </span>
  );
}
