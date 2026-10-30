"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSlugAvailability } from "@/hooks/use-analytics";
import { useDebounce } from "@/hooks/use-debounce";
import { getAppDomain } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { treeSlugSchema } from "@/lib/tree-slug";
import { Check, Loader2, X } from "lucide-react";
import { useId, useState } from "react";

interface SlugEditorProps {
  treeId: string;
  currentSlug: string;
  onSave: (newSlug: string) => void;
  isSaving: boolean;
  translations: Dictionary["editor"]["urlEditor"];
}

export function SlugEditor({
  treeId,
  currentSlug,
  onSave,
  isSaving,
  translations: t,
}: SlugEditorProps) {
  const inputId = useId();
  const [slug, setSlug] = useState(currentSlug);
  const hasChanged = slug !== currentSlug;
  const valid = treeSlugSchema.safeParse(slug).success;
  const debouncedSlug = useDebounce(hasChanged && valid ? slug : "", 500);
  const { data, isFetching, isError } = useSlugAvailability(
    debouncedSlug,
    treeId,
  );
  const checking =
    hasChanged && valid && (debouncedSlug !== slug || isFetching);
  const available =
    hasChanged && valid && !checking && !isError && data?.available === true;
  const unavailable =
    hasChanged && valid && !checking && !isError && data?.available === false;
  const message = !hasChanged
    ? null
    : !valid
      ? t.invalid
      : checking
        ? t.checking
        : isError
          ? t.checkError
          : available
            ? t.available
            : unavailable
              ? t.unavailable
              : null;
  const statusIcon =
    checking || isSaving ? (
      <Loader2 aria-hidden className="size-4 animate-spin" />
    ) : available ? (
      <Check aria-hidden className="size-4 text-success" />
    ) : unavailable || (hasChanged && !valid) ? (
      <X aria-hidden className="size-4 text-error" />
    ) : null;

  return (
    <div className="space-y-3">
      <Label htmlFor={inputId} className="text-sm text-ink">
        {t.label}
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1">
          <Input
            id={inputId}
            value={slug}
            disabled={isSaving}
            autoComplete="off"
            spellCheck={false}
            maxLength={30}
            aria-describedby={message ? `${inputId}-status` : undefined}
            aria-invalid={hasChanged && (!valid || unavailable)}
            onChange={(event) =>
              setSlug(
                event.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "")
                  .slice(0, 30),
              )
            }
            leftAddon={
              <span className="whitespace-nowrap text-xs text-ink-tertiary">
                {getAppDomain()}/
              </span>
            }
            rightAddon={statusIcon}
            wrapperClassName="h-12 rounded-xl"
          />
        </div>
        <Button
          type="button"
          onClick={() => {
            if (available && !isSaving) onSave(slug);
          }}
          disabled={!available || isSaving}
          className="h-12 rounded-full bg-product-accent px-5 text-sm text-on-primary hover:bg-primary-hover"
        >
          {isSaving ? (
            <>
              <Loader2 aria-hidden className="mr-2 size-4 animate-spin" />
              {t.saving}
            </>
          ) : (
            t.save
          )}
        </Button>
      </div>
      {message && (
        <p
          id={`${inputId}-status`}
          role="status"
          className={`text-xs leading-relaxed ${unavailable || !valid || isError ? "text-error" : available ? "text-success" : "text-ink-tertiary"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
