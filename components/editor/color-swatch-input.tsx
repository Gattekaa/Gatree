"use client";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useColorDraft } from "@/hooks/use-color-draft";
import { ColorPicker } from "react-beautiful-color";

interface ColorSwatchInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorSwatchInput({
  value,
  onChange,
  label,
}: ColorSwatchInputProps) {
  const { color, input, changeColor, changeInput } = useColorDraft(
    value,
    onChange,
  );

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="rounded-xl h-9 w-9 shrink-0 border border-hairline-strong transition-colors hover:border-ink-subtle"
            style={{ backgroundColor: color.format("rgba") }}
            aria-label={label || "Escolher cor"}
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border border-hairline-strong bg-surface-1 p-3"
          align="start"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ColorPicker
            color={color}
            onChange={changeColor}
            className="bg-transparent! p-0! shadow-none! border-none! min-h-0! w-50 overflow-hidden"
          >
            <ColorPicker.Saturation className="w-full" />
            <ColorPicker.Hue className="h-3! mt-3! w-full" />
          </ColorPicker>
        </PopoverContent>
      </Popover>
      <Input
        aria-label={label || "Código da cor"}
        value={input}
        onChange={(e) => changeInput(e.target.value)}
        className="h-9 flex-1 font-mono text-[12px]"
      />
    </div>
  );
}
