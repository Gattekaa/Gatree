"use client";

import { useEffect, useRef, useState, useTransition } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  delay = 1000
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const prevValueRef = useRef(value);

  useEffect(() => {

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (value === prevValueRef.current) return;
    prevValueRef.current = value;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setStatus("saving");
      startTransition(async () => {
        try {
          await saveFn(value);
          setStatus("saved");

          setTimeout(() => setStatus("idle"), 2000);
        } catch {
          setStatus("error");
        }
      });
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, saveFn]);

  return { status };
}
