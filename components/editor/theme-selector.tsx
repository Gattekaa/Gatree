"use client";

import { LINK_RADIUS_MAP, THEME_CATEGORIES } from "@/lib/constants";
import { Check, Sparkles } from "lucide-react";

interface ThemeSelectorProps {
  currentTheme: string | null;
  onSelect: (themeId: string) => void;
}

export function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
  return (
    <div className="space-y-8">
      {THEME_CATEGORIES.map((category) => (
        <div key={category.id}>
          <div className="mb-3 flex items-center gap-2">
            <h4 className="text-[13px] font-semibold text-ink">
              {category.name}
            </h4>
            <span className="text-xs text-brutal-yellow">
              {category.themes.length} temas
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
            {category.themes.map((theme) => {
              const isSelected = currentTheme === theme.id;
              const bgStyle =
                theme.background.type === "gradient"
                  ? { background: theme.background.value }
                  : theme.background.type === "animated"
                    ? {
                        background:
                          "linear-gradient(135deg, #010102 0%, #16181d 100%)",
                      }
                    : { backgroundColor: theme.background.value };
              const radius = LINK_RADIUS_MAP[theme.linkStyle.radius];
              const isOutlined = theme.linkStyle.variant === "outlined";

              return (
                <button
                  key={theme.id}
                  onClick={() => onSelect(theme.id)}
                  className={`rounded-xl group relative flex flex-col items-center gap-2 border p-2.5 transition-all duration-200 ${
                    isSelected
                      ? "border-brutal-yellow bg-surface-2 "
                      : "border-hairline-strong hover:border-ink-subtle hover:bg-surface-2"
                  }`}
                >
                  {}
                  <div
                    className="relative flex h-18 w-full flex-col items-center justify-center gap-0.75 overflow-hidden"
                    style={bgStyle}
                  >
                    {}
                    {theme.background.type === "animated" && (
                      <div className="absolute right-1 top-1">
                        <Sparkles className="h-2.5 w-2.5 text-primary/60" />
                      </div>
                    )}

                    {}
                    <div className="h-3 w-3 rounded-full bg-white/20" />

                    {}
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1.25 w-4/5"
                        style={{
                          borderRadius: radius,
                          ...(isOutlined
                            ? {
                                border: `1px solid ${theme.linkStyle.bgColor}`,
                                backgroundColor: "transparent",
                              }
                            : { backgroundColor: theme.linkStyle.bgColor }),
                          opacity: 1 - i * 0.15,
                        }}
                      />
                    ))}
                  </div>

                  {}
                  <span
                    className={`text-xs font-medium transition-colors ${isSelected ? "text-brutal-yellow" : "text-ink-subtle group-hover:text-ink"}`}
                  >
                    {theme.name}
                  </span>

                  {}
                  {isSelected && (
                    <div className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brutal-yellow shadow-sm">
                      <Check className="h-2.5 w-2.5 text-black" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
