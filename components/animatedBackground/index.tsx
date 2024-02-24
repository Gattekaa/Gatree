import type React from "react";
import LavaBackground from "../backgrounds/lavaBackground";

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

  return (
    <div className="w-full h-full bg-indigo-900/15">
      <div className="w-full h-full">
        <Background />
      </div>
      <div className="absolute left-0 top-0 z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}