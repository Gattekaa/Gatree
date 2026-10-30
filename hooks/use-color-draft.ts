"use client";

import { useEffect, useRef, useState } from "react";
import { Color } from "react-beautiful-color";

function parseColor(value: string) {
  try {
    return new Color(value);
  } catch {
    return new Color("#1e2028");
  }
}

// External presets only synchronize the editor. Only user gestures emit a save.
export function useColorDraft(
  value: string,
  onChange: (value: string) => void,
  delay = 300,
) {
  const [draft, setDraft] = useState(() => ({
    source: value,
    input: value,
    color: parseColor(value),
  }));
  const callbackRef = useRef(onChange);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (draft.source !== value) {
    setDraft({ source: value, input: value, color: parseColor(value) });
  }

  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  // A newer preset or an unmount must discard any pending edit of the old color.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [value, delay],
  );

  function scheduleChange(nextValue: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (delay === 0) {
      timerRef.current = null;
      callbackRef.current(nextValue);
      return;
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      callbackRef.current(nextValue);
    }, delay);
  }

  function changeColor(color: Color) {
    const input = color.getRgba().a < 1 ? color.format("rgba") : color.getHex();
    setDraft((current) => ({ ...current, input, color }));
    scheduleChange(input);
  }

  function changeInput(input: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDraft((current) => ({ ...current, input }));
    if (!/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(input))
      return;
    setDraft((current) => ({ ...current, color: parseColor(input) }));
    scheduleChange(input);
  }

  return { color: draft.color, input: draft.input, changeColor, changeInput };
}
