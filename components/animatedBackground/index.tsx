"use client"
import type React from "react";
import { useMemo } from "react";
import { GridBackground, AuroraBackground, BeamsBackground, DotsBackground, GradientBackground, SparklesBackground, VortexBackground } from "./backgrounds/index";

interface BackgroundTheme {
  variant?: string,
  children: React.ReactNode
}


export const AnimatedBackgrounds = [
  {
    slug: "aurora",
    name: "Aurora",
    component: AuroraBackground,
  },
  {
    slug: "beams",
    name: "Beams",
    component: BeamsBackground,
  },
  {
    slug: "dots",
    name: "Dots",
    component: DotsBackground,
  },
  {
    slug: "gradient",
    name: "Gradient",
    component: GradientBackground,
  },
  {
    slug: "sparkles",
    name: "Sparkles",
    component: SparklesBackground,
  },
  {
    slug: "vortex",
    name: "Vortex",
    component: VortexBackground,
  },
  {
    slug: "grid",
    name: "Grid",
    component: GridBackground,
  },
]

export default function AnimatedBackground({ variant, children }: BackgroundTheme) {
  const Background = useMemo(() => {
    const background = AnimatedBackgrounds.find((background) => background.slug === variant)
    return background?.component
  }, [variant])

  return (
    <div className="w-full h-full bg-indigo-900/15">
      <div className="w-full h-full overflow-hidden">
        {Background && <Background />}
      </div>
      <div className="fixed left-0 top-0 z-10 w-full h-full overflow-auto">
        {children}
      </div>
    </div>
  )
}