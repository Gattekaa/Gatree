import { useMemo } from "react";

export function useMemoizeValue<T>(value: T): T {
  const memoizedValue = useMemo(() => value, [value]);
  return memoizedValue;
}