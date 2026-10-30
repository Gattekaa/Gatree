"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSlugAvailability } from "@/hooks/use-analytics";
import { useDebounce } from "@/hooks/use-debounce";
import { getAppDomain } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";

interface SlugEditorProps {
  currentSlug: string;
  onSave: (newSlug: string) => void;
  isSaving: boolean;
}

export function SlugEditor({ currentSlug, onSave, isSaving }: SlugEditorProps) {
  const [slug, setSlug] = useState(currentSlug);
  const hasChanged = slug !== currentSlug;

  const debouncedSlug = useDebounce(hasChanged ? slug : "", 500);
  const { data: slugCheck, isLoading: checkingSlug } =
    useSlugAvailability(debouncedSlug);
  const slugAvailable =
    hasChanged && debouncedSlug === slug
      ? (slugCheck?.available ?? null)
      : null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 30),
    );
  }

  const statusIcon = checkingSlug ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-tertiary" />
  ) : hasChanged && slugAvailable === true ? (
    <Check className="h-3.5 w-3.5 text-brutal-green" />
  ) : hasChanged && slugAvailable === false ? (
    <X className="h-3.5 w-3.5 text-error" />
  ) : null;

  return (
    <div className="space-y-2">
      <Label className="text-ink text-sm leading-[1.5]">Slug da URL</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={slug}
            onChange={handleChange}
            leftAddon={
              <span className="text-ink-tertiary text-xs tracking-normal leading-[1.5]">
                {getAppDomain()}/
              </span>
            }
            rightAddon={statusIcon}
            className="h-full"
            wrapperClassName={cn(
              "h-12 rounded-xl",
              hasChanged && slugAvailable === true && "border-brutal-green",
              hasChanged && slugAvailable === false && "border-error",
            )}
          />
        </div>
        {hasChanged && slugAvailable === true && (
          <Button
            onClick={() => onSave(slug)}
            disabled={isSaving}
            size="sm"
            className="h-12 rounded-full bg-product-accent px-3 text-on-primary hover:bg-primary-hover text-xs tracking-normal leading-[1.5]"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Salvar"
            )}
          </Button>
        )}
      </div>
      {hasChanged && slugAvailable === false && !checkingSlug && (
        <p className="break-words text-error text-xs tracking-normal leading-[1.5]">
          Slug indisponível
        </p>
      )}
    </div>
  );
}
