"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LINK_ICONS } from "@/lib/constants";
import { ICON_COMPONENT_MAP } from "@/lib/icons";
import { Check, Search, X } from "lucide-react";
import { useId, useState } from "react";

export interface IconPickerTranslations {
  choose: string;
  search: string;
  remove: string;
  social: string;
  generic: string;
  empty: string;
  labels: Record<string, string>;
}

export function IconPicker({
  value,
  onChange,
  translations: t,
}: {
  value: string | null;
  onChange: (icon: string | null) => void;
  translations: IconPickerTranslations;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const id = useId();
  const labelFor = (icon: (typeof LINK_ICONS)[number]) =>
    t.labels[icon.name] || icon.label;
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = LINK_ICONS.filter((icon) =>
    normalize(`${labelFor(icon)} ${icon.name}`).includes(
      normalize(search.trim()),
    ),
  );
  const selected = LINK_ICONS.find((icon) => icon.name === value);
  const SelectedIcon = value ? ICON_COMPONENT_MAP[value] : null;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 gap-2 border border-hairline bg-surface-2 px-3 text-sm text-ink hover:bg-surface-3"
        >
          {SelectedIcon && <SelectedIcon className="size-4 shrink-0" />}
          {selected ? labelFor(selected) : t.choose}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] border-hairline bg-surface-1 p-3"
      >
        <Input
          leftIcon={Search}
          aria-label={t.search}
          placeholder={t.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          wrapperClassName="mb-3 h-11"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="mb-3 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm text-ink-subtle transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X className="size-4" aria-hidden="true" />
            {t.remove}
          </button>
        )}
        <div className="max-h-[min(24rem,45dvh)] space-y-4 overflow-y-auto overscroll-contain pr-1">
          {(["social", "generic"] as const).map((category) => {
            const icons = filtered.filter((icon) => icon.category === category);
            if (!icons.length) return null;
            return (
              <section key={category} aria-labelledby={`${id}-${category}`}>
                <h3
                  id={`${id}-${category}`}
                  className="mb-2 px-1 text-xs font-medium text-ink-tertiary"
                >
                  {t[category]}
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {icons.map((icon) => {
                    const Icon = ICON_COMPONENT_MAP[icon.name];
                    if (!Icon) return null;
                    const active = value === icon.name;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        aria-pressed={active}
                        title={labelFor(icon)}
                        onClick={() => {
                          onChange(icon.name);
                          setOpen(false);
                        }}
                        className={`relative flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border px-1.5 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${active ? "border-primary/40 bg-product-accent/10 text-primary" : "border-transparent text-ink-subtle hover:border-hairline hover:bg-surface-2 hover:text-ink"}`}
                      >
                        <Icon className="size-5 shrink-0" />
                        <span className="text-center text-[11px] font-medium leading-tight">
                          {labelFor(icon)}
                        </span>
                        {active && (
                          <Check
                            className="absolute right-1.5 top-1.5 size-3"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {!filtered.length && (
            <p
              role="status"
              className="px-3 py-8 text-center text-sm text-ink-tertiary"
            >
              {t.empty}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
