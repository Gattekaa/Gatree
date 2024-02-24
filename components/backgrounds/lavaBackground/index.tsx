import { cn } from "@/lib/utils";
import type React from "react";
import { useMemo } from "react";

export default function LavaBackground(): React.ReactNode {
  interface Element {
    size: number;
    color: string;
    x: number;
    y: number;
    floatTo: string;
  }
  const ELEMENT_COUNT = 30;
  const items: Element[] = [];

  function createElement({ size, color, floatTo, x, y }: Element) {
    return {
      size,
      color,
      x,
      y,
      floatTo
    };
  }

  for (let i = 0; i < ELEMENT_COUNT; i++) {
    const element = {
      size: Math.floor(Math.random() * 500) + 50, // Random size between 500 to 550
      color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`, // Random color
      x: Math.floor(Math.random() * window.innerWidth), // Random X position on screen
      y: Math.floor(Math.random() * window.innerHeight), // Random Y position on screen
      floatTo: Math.random() > 0.6 ? "floatDown" : "floatUp" // Random movement direction
    }

    const newElement = createElement(element);
    items.push(newElement);
  }

  const memoizedItems = useMemo(() => items, []);

  return memoizedItems.map((item, idx) => (
    <div
      key={idx}
      className={cn(
        "fixed w-1 h-1 rounded-full blur-[100px] brightness-[.9",
        item.floatTo === "floatDown" ? "animate-floatDown" : "animate-floatUp"
      )}
      style={{
        width: item.size,
        height: item.size,
        background: `radial-gradient(${item.color}, transparent)`,
        top: item.y,
        left: item.x,
      }}
    />
  ))
}