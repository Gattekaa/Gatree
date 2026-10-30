"use client";

import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import * as React from "react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
}: DateTimePickerProps) {
  const { date, time } = React.useMemo(() => {
    if (!value) return { date: undefined as Date | undefined, time: "" };
    const [d, t] = value.split("T");
    if (!d) return { date: undefined, time: "" };
    const parsed = parse(d, "yyyy-MM-dd", new Date());
    return { date: parsed, time: t || "00:00" };
  }, [value]);

  function handleDateSelect(selected: Date | undefined) {
    if (!selected) {
      onChange("");
      return;
    }
    const dateStr = format(selected, "yyyy-MM-dd");
    onChange(`${dateStr}T${time || "00:00"}`);
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    onChange(`${dateStr}T${e.target.value || "00:00"}`);
  }

  function handleClear() {
    onChange("");
  }

  return (
    <div className="flex items-stretch gap-2">
      {}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex flex-1 items-center gap-2 border-2 border-hairline-strong product:border product:rounded-xl product:min-h-12 bg-canvas px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-surface-2",
              date ? "text-ink" : "text-ink-tertiary",
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-ink-tertiary" />
            {date
              ? format(date, "dd MMM yyyy", { locale: ptBR })
              : placeholder || "Selecionar data"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={handleDateSelect} />
        </PopoverContent>
      </Popover>

      {}
      <div className="relative w-[88px] shrink-0">
        <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
          <Clock className="h-3.5 w-3.5 text-ink-tertiary" />
        </div>
        <input
          data-slot="input"
          type="time"
          value={time}
          onChange={handleTimeChange}
          disabled={!date}
          className="h-full w-full border-2 border-hairline-strong product:border product:rounded-xl product:min-h-12 bg-canvas py-2.5 pl-8 pr-2 text-[13px] text-ink outline-none transition-colors focus:border-primary disabled:opacity-40 [color-scheme:dark] product:[html.light_&]:[color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </div>

      {}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center justify-center border-2 border-hairline-strong product:border product:rounded-xl product:min-h-12 px-2 text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-ink active:scale-95"
          aria-label="Limpar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
