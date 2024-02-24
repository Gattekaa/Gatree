"use client"
import type React from "react";
import LavaBackground from "../backgrounds/lavaBackground";
import { useMemo } from "react";

interface BackgroundTheme {
  variant?: "lavaBackground",
  children: React.ReactNode
}

export default function AnimatedBackground({ variant = "lavaBackground", children }: BackgroundTheme) {
  function Background(): React.ReactNode {
    switch (variant) {
      case "lavaBackground":
        return LavaBackground()
    }
  }

  const memoizedbackground = useMemo(() => Background(), [variant])

  return (
    <div className="w-full h-full bg-indigo-900/15">
      <div className="w-full h-full">
        {memoizedbackground}
      </div>
      <div className="absolute left-0 top-0 z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}