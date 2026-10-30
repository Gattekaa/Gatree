"use client";

import { Input } from "@/components/ui/input";
import { MAX_INSTAGRAM_POSTS } from "@/lib/instagram";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Trash2 } from "lucide-react";
import { useId } from "react";

type Copy = Dictionary["editor"]["linkForm"]["instagramDisplay"];

export function InstagramDisplayEditor({
  mode,
  posts,
  error,
  onModeChange,
  onPostsChange,
  translations: t,
}: {
  mode: "link" | "posts";
  posts: string[];
  error: string | null;
  onModeChange: (mode: "link" | "posts") => void;
  onPostsChange: (posts: string[]) => void;
  translations: Copy;
}) {
  const id = useId();
  return (
    <fieldset className="space-y-4 rounded-2xl border border-hairline bg-surface-2 p-4">
      <legend className="px-1 text-sm font-medium text-ink">{t.title}</legend>
      <div className="grid grid-cols-2 gap-2">
        {(["link", "posts"] as const).map((choice) => (
          <button
            key={choice}
            type="button"
            aria-pressed={mode === choice}
            onClick={() => onModeChange(choice)}
            className={`min-h-12 rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${mode === choice ? "border-primary bg-product-accent/10 text-ink" : "border-hairline-strong text-ink-subtle hover:bg-surface-3"}`}
          >
            {choice === "link" ? t.simple : t.posts}
          </button>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-ink-tertiary">
        {mode === "posts" ? t.hint : t.simpleHint}
      </p>
      {mode === "posts" && (
        <div className="space-y-3">
          {posts.map((post, index) => (
            <div key={index} className="space-y-1.5">
              <label
                className="text-xs font-medium text-ink"
                htmlFor={`${id}-post-${index}`}
              >
                {t.postLabel} {index + 1}
              </label>
              <div className="flex gap-2">
                <Input
                  id={`${id}-post-${index}`}
                  value={post}
                  placeholder="https://www.instagram.com/p/.../"
                  wrapperClassName="h-12 min-w-0 flex-1"
                  aria-invalid={!!error}
                  aria-describedby={error ? `${id}-error` : undefined}
                  onChange={(event) =>
                    onPostsChange(
                      posts.map((value, position) =>
                        position === index ? event.target.value : value,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  aria-label={`${t.remove} ${index + 1}`}
                  onClick={() =>
                    onPostsChange(
                      posts.length === 1
                        ? [""]
                        : posts.filter((_, position) => position !== index),
                    )
                  }
                  className="grid size-12 shrink-0 place-items-center rounded-xl border border-hairline text-ink-subtle hover:text-error focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>
            </div>
          ))}
          {posts.length < MAX_INSTAGRAM_POSTS && (
            <button
              type="button"
              onClick={() => onPostsChange([...posts, ""])}
              className="rounded-full border border-hairline-strong px-4 py-2.5 text-xs font-medium text-ink hover:bg-surface-3"
            >
              {t.add}
            </button>
          )}
          {error && (
            <p id={`${id}-error`} role="alert" className="text-xs text-error">
              {error}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
