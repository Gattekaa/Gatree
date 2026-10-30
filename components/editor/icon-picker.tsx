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
import { Search, X } from "lucide-react";
import { useState } from "react";

interface IconPickerProps {
  value: string | null;
  onChange: (icon: string | null) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = LINK_ICONS.filter((icon) =>
    icon.label.toLowerCase().includes(search.toLowerCase()),
  );

  const socialIcons = filteredIcons.filter((i) => i.category === "social");
  const genericIcons = filteredIcons.filter((i) => i.category === "generic");

  const SelectedIcon = value ? ICON_COMPONENT_MAP[value] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 border border-hairline bg-surface-2 px-3 text-ink hover:bg-surface-3 text-sm leading-[1.5]"
        >
          {SelectedIcon ? (
            <>
              <SelectedIcon className="h-4 w-4" />
              {LINK_ICONS.find((i) => i.name === value)?.label || value}
            </>
          ) : (
            <span className="text-ink-tertiary">Escolher ícone</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 border-hairline bg-surface-1 p-3"
      >
        {}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-tertiary" />
          <Input
            placeholder="Buscar ícone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-hairline bg-surface-2 pl-8 text-ink placeholder:text-ink-tertiary text-xs tracking-normal leading-[1.5]"
          />
        </div>

        {}
        {value && (
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="mb-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-ink-subtle hover:bg-surface-2 text-xs tracking-normal leading-[1.5]"
          >
            <X className="h-3.5 w-3.5" />
            Remover ícone
          </button>
        )}

        <div className="max-h-56 overflow-y-auto">
          {}
          {socialIcons.length > 0 && (
            <>
              <p className="break-words mb-1 px-2 font-medium text-ink-tertiary text-xs tracking-normal leading-[1.5]">
                Redes Sociais
              </p>
              <div className="mb-2 grid grid-cols-4 gap-1">
                {socialIcons.map((icon) => {
                  const IconComp = ICON_COMPONENT_MAP[icon.name];
                  if (!IconComp) return null;
                  return (
                    <button
                      key={icon.name}
                      onClick={() => {
                        onChange(icon.name);
                        setOpen(false);
                      }}
                      title={icon.label}
                      className={`flex h-9 w-full items-center justify-center rounded-md transition-colors hover:bg-surface-2 ${
                        value === icon.name
                          ? "bg-product-accent/10 text-primary"
                          : "text-ink-subtle"
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {}
          {genericIcons.length > 0 && (
            <>
              <p className="break-words mb-1 px-2 font-medium text-ink-tertiary text-xs tracking-normal leading-[1.5]">
                Genéricos
              </p>
              <div className="grid grid-cols-4 gap-1">
                {genericIcons.map((icon) => {
                  const IconComp = ICON_COMPONENT_MAP[icon.name];
                  if (!IconComp) return null;
                  return (
                    <button
                      key={icon.name}
                      onClick={() => {
                        onChange(icon.name);
                        setOpen(false);
                      }}
                      title={icon.label}
                      className={`flex h-9 w-full items-center justify-center rounded-md transition-colors hover:bg-surface-2 ${
                        value === icon.name
                          ? "bg-product-accent/10 text-primary"
                          : "text-ink-subtle"
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {filteredIcons.length === 0 && (
            <p className="break-words py-4 text-center text-ink-tertiary text-xs tracking-normal leading-[1.5]">
              Nenhum ícone encontrado
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
