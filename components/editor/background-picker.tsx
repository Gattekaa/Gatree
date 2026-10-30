"use client";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedAction } from "@/hooks/use-debounce";
import { useColorDraft } from "@/hooks/use-color-draft";
import type { BackgroundConfig } from "@/types";
import { Circle, Sparkles, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import { ColorPicker } from "react-beautiful-color";
import { Input } from "../ui/input";

interface BackgroundPickerProps {
  value: BackgroundConfig | null;
  onChange: (bg: BackgroundConfig) => void;
}

const SOLID_PRESETS = [
  "#010102",
  "#0a0a0a",
  "#111111",
  "#1a1a1a",
  "#0d1117",
  "#1e1e2e",
  "#16213e",
  "#1a1a2e",
  "#0f172a",
  "#1e293b",
  "#0c1445",
  "#1a0a2e",
  "#0a192f",
  "#112240",
  "#1d1d42",
  "#2a1b5e",
  "#0a1a0f",
  "#0d2818",
  "#064e3b",
  "#134e4a",
  "#1a0a0a",
  "#2d1515",
  "#451a03",
  "#1c1917",
  "#18181b",
  "#27272a",
  "#3f3f46",
  "#52525b",
];

const GRADIENT_PRESETS = [
  {
    value: "linear-gradient(135deg, #0c1445 0%, #1a3a5c 50%, #0d2137 100%)",
    label: "Deep Ocean",
  },
  {
    value: "linear-gradient(180deg, #020024 0%, #090979 50%, #00d4ff 100%)",
    label: "Midnight",
  },
  {
    value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    label: "Royal",
  },
  {
    value: "linear-gradient(180deg, #1a1035 0%, #0d0620 100%)",
    label: "Violet",
  },
  { value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", label: "Iris" },
  {
    value: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
    label: "Purple Rain",
  },
  {
    value: "linear-gradient(160deg, #0f0515 0%, #2d1b69 50%, #0f0515 100%)",
    label: "Deep Purple",
  },
  {
    value: "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)",
    label: "Sunset",
  },
  {
    value: "linear-gradient(135deg, #1a0a0a 0%, #2d1515 50%, #1a0f05 100%)",
    label: "Ember",
  },
  {
    value: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
    label: "Sunrise",
  },
  {
    value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    label: "Pink Flame",
  },
  {
    value: "linear-gradient(160deg, #0a1a0f 0%, #0d2818 50%, #071510 100%)",
    label: "Forest",
  },
  {
    value: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    label: "Emerald",
  },
  {
    value: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
    label: "Abyss",
  },
  {
    value: "linear-gradient(135deg, #0a0a1a 0%, #151530 50%, #0a0a1a 100%)",
    label: "Cosmos",
  },
  {
    value: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    label: "Night Sky",
  },
  {
    value: "linear-gradient(135deg, #232526 0%, #414345 100%)",
    label: "Charcoal",
  },
  { value: "linear-gradient(135deg, #141e30 0%, #243b55 100%)", label: "Navy" },
  { value: "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)", label: "Aqua" },
  { value: "linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)", label: "Neon" },
  {
    value: "linear-gradient(135deg, #09203f 0%, #537895 100%)",
    label: "Steel",
  },
  {
    value: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    label: "Deep Sea",
  },
  {
    value: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    label: "Lavender",
  },
  {
    value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    label: "Peach",
  },
];

const ANIMATED_PRESETS = [
  {
    value: "dots",
    label: "Pontos",
    icon: Circle,
    description: "Pontos flutuantes",
    base: "linear-gradient(180deg, #0a0a1a 0%, #0d0d2b 100%)",
  },
  {
    value: "particles",
    label: "Partículas",
    icon: Sparkles,
    description: "Rede conectada",
    base: "linear-gradient(135deg, #080820 0%, #0a0a2e 50%, #05051a 100%)",
  },
  {
    value: "waves",
    label: "Ondas",
    icon: Waves,
    description: "Ondas com gradiente",
    base: "linear-gradient(180deg, #020210 0%, #0a0a30 50%, #050520 100%)",
  },
  {
    value: "aurora",
    label: "Aurora",
    icon: Sparkles,
    description: "Aurora boreal",
    base: "linear-gradient(180deg, #000a0a 0%, #001515 50%, #000808 100%)",
  },
  {
    value: "fireflies",
    label: "Vagalumes",
    icon: Circle,
    description: "Luzes pulsantes",
    base: "linear-gradient(180deg, #0a0a05 0%, #151508 50%, #0a0a03 100%)",
  },
  {
    value: "rain",
    label: "Chuva",
    icon: Waves,
    description: "Gotas caindo",
    base: "linear-gradient(180deg, #05080f 0%, #0a1020 50%, #030810 100%)",
  },
  {
    value: "stars",
    label: "Estrelas",
    icon: Sparkles,
    description: "Céu estrelado",
    base: "linear-gradient(180deg, #020208 0%, #05051a 40%, #000005 100%)",
  },
  {
    value: "gradient-flow",
    label: "Flow",
    icon: Circle,
    description: "Gradientes em movimento",
    base: "linear-gradient(135deg, #0a0515 0%, #080820 50%, #050510 100%)",
  },
  {
    value: "bubbles",
    label: "Bolhas",
    icon: Circle,
    description: "Bolhas subindo",
    base: "linear-gradient(180deg, #020815 0%, #061025 50%, #030810 100%)",
  },
  {
    value: "snow",
    label: "Neve",
    icon: Circle,
    description: "Flocos de neve",
    base: "linear-gradient(180deg, #0a1020 0%, #151d35 50%, #0a1020 100%)",
  },
  {
    value: "matrix",
    label: "Matrix",
    icon: Sparkles,
    description: "Código caindo",
    base: "#000000",
  },
  {
    value: "confetti",
    label: "Confetti",
    icon: Sparkles,
    description: "Confetes coloridos",
    base: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)",
  },
  {
    value: "smoke",
    label: "Fumaça",
    icon: Waves,
    description: "Fumaça subindo",
    base: "linear-gradient(180deg, #050508 0%, #0a0a12 50%, #050508 100%)",
  },
];

export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const currentType = value?.type || "solid";
  const [activeTab, setActiveTab] = useState<string>(currentType);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border border-hairline-strong bg-surface-2">
          <TabsTrigger
            value="solid"
            className="flex-1 data-[state=active]:border-brutal-blue data-[state=active]:text-brutal-blue text-xs tracking-normal leading-[1.5]"
          >
            Sólido
          </TabsTrigger>
          <TabsTrigger
            value="gradient"
            className="flex-1 data-[state=active]:border-brutal-blue data-[state=active]:text-brutal-blue text-xs tracking-normal leading-[1.5]"
          >
            Gradiente
          </TabsTrigger>
          <TabsTrigger
            value="animated"
            className="flex-1 data-[state=active]:border-brutal-blue data-[state=active]:text-brutal-blue text-xs tracking-normal leading-[1.5]"
          >
            Animado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solid" className="mt-4 space-y-4">
          <div>
            <Label className="mb-2 block text-[12px] font-medium text-ink-subtle">
              Presets
            </Label>
            <div className="grid grid-cols-7 gap-1.5">
              {SOLID_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onChange({ type: "solid", value: color });
                  }}
                  className={`rounded-xl aspect-square w-full border transition-all hover:scale-110 ${
                    value?.type === "solid" && value.value === color
                      ? "border-brutal-blue scale-110"
                      : "border-hairline-strong hover:border-ink-subtle"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-hairline bg-surface-2 p-4">
            <Label className="mb-3 block text-[12px] font-medium text-ink-subtle">
              Personalizar
            </Label>
            <SolidColorPicker
              value={value?.type === "solid" ? value.value : "#010102"}
              onChange={(hex) => {
                onChange({ type: "solid", value: hex });
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="gradient" className="mt-4 space-y-4">
          <div>
            <Label className="mb-2 block text-[12px] font-medium text-ink-subtle">
              Presets
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    onChange({ type: "gradient", value: preset.value });
                  }}
                  className={`rounded-xl group relative aspect-4/3 w-full overflow-hidden border transition-all ${
                    value?.type === "gradient" && value.value === preset.value
                      ? "border-brutal-blue"
                      : "border-hairline-strong hover:border-brutal-blue"
                  }`}
                  style={{ background: preset.value }}
                  title={preset.label}
                >
                  <span className="absolute inset-x-0 bottom-0 bg-black px-1.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <GradientBuilder
            value={value?.type === "gradient" ? value.value : ""}
            onChange={(v) => onChange({ type: "gradient", value: v })}
          />
        </TabsContent>

        <TabsContent value="animated" className="mt-4 space-y-3">
          <p className="break-words text-[12px] text-ink-tertiary">
            Fundos animados com partículas e efeitos visuais
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ANIMATED_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() =>
                  onChange({
                    type: "animated",
                    value: preset.value,
                    config: { base: preset.base },
                  })
                }
                className={`rounded-xl group relative aspect-4/3 overflow-hidden border transition-all ${
                  value?.type === "animated" && value.value === preset.value
                    ? "border-brutal-blue"
                    : "border-hairline-strong hover:border-ink-subtle"
                }`}
                style={{ background: preset.base }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <preset.icon className="h-4 w-4 text-white/60" />
                  <span className="text-xs font-medium text-white/80">
                    {preset.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GradientBuilder({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [gradient, setGradient] = useState(() => ({
    source: value,
    value,
    ...parseSimpleGradient(value),
  }));
  if (gradient.source !== value) {
    setGradient({ source: value, value, ...parseSimpleGradient(value) });
  }
  const { color1, color2, angle } = gradient;

  function buildGradient(c1: string, c2: string, deg: number) {
    return `linear-gradient(${deg}deg, ${c1} 0%, ${c2} 100%)`;
  }

  const { run: debouncedOnChange, cancel: cancelChange } = useDebouncedAction(
    onChange,
    600,
  );

  useEffect(() => cancelChange, [value, cancelChange]);

  function changeGradient(
    patch: Partial<Pick<typeof gradient, "color1" | "color2" | "angle">>,
  ) {
    const next = { ...gradient, ...patch };
    next.value = buildGradient(next.color1, next.color2, next.angle);
    setGradient(next);
    debouncedOnChange(next.value);
  }

  return (
    <div className="rounded-2xl border border-hairline bg-surface-2 p-4 space-y-4">
      <Label className="text-[12px] font-medium text-ink-subtle">
        Criar gradiente
      </Label>

      <div
        className="h-16 w-full border border-hairline-strong"
        style={{ background: gradient.value }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="break-words text-xs font-medium text-ink-tertiary">
            Cor 1
          </p>
          <SolidColorPicker
            value={color1}
            onChange={(color1) => changeGradient({ color1 })}
          />
        </div>
        <div className="space-y-2">
          <p className="break-words text-xs font-medium text-ink-tertiary">
            Cor 2
          </p>
          <SolidColorPicker
            value={color2}
            onChange={(color2) => changeGradient({ color2 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="break-words text-xs font-medium text-ink-tertiary">
            Ângulo
          </p>
          <span className="text-xs tabular-nums text-ink-tertiary">
            {angle}°
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={360}
          value={angle}
          onChange={(e) => changeGradient({ angle: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <div className="flex justify-between gap-1">
          {[0, 45, 90, 135, 180, 270].map((deg) => (
            <button
              key={deg}
              onClick={() => changeGradient({ angle: deg })}
              className={`rounded-xl px-2 py-1 text-xs font-medium transition-colors ${
                angle === deg
                  ? "bg-surface-3 text-primary"
                  : "text-ink-tertiary hover:bg-surface-3 hover:text-ink-subtle"
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SolidColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const { color, input, changeColor, changeInput } = useColorDraft(
    value,
    onChange,
  );

  return (
    <div className="space-y-2" onPointerDown={(e) => e.stopPropagation()}>
      <ColorPicker
        color={color}
        onChange={changeColor}
        className="bg-transparent! p-0! rounded-none! shadow-none! border-none! min-h-0! w-full"
      >
        <ColorPicker.Saturation className="w-full rounded-none!" />
        <ColorPicker.Hue className="w-full h-3! mt-3!" />
      </ColorPicker>
      <div className="flex items-center gap-2">
        <div
          className="h-7 w-7 shrink-0 border border-hairline-strong"
          style={{ backgroundColor: color.format("rgba") }}
        />
        <Input
          value={input}
          onChange={(e) => changeInput(e.target.value)}
          wrapperClassName="h-7"
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}

function parseSimpleGradient(value: string): {
  color1: string;
  color2: string;
  angle: number;
} {
  if (!value) return { color1: "#0a0a1a", color2: "#151530", angle: 135 };

  const match = value.match(
    /linear-gradient\((\d+)deg,\s*([^,]+?)\s+\d+%,\s*(?:[^,]+?\s+\d+%,\s*)?([^)]+?)\s+\d+%\)/,
  );
  if (match) {
    return {
      angle: parseInt(match[1], 10),
      color1: match[2].trim(),
      color2: match[3].trim(),
    };
  }

  return { color1: "#0a0a1a", color2: "#151530", angle: 135 };
}
