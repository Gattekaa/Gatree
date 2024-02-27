"use client"
import type React from "react";
import { useEffect, useRef } from "react";
import { backgrounds } from "@/assets/static/animated-background";

interface BackgroundTheme {
  variant?: string,
  children: React.ReactNode
}

export default function AnimatedBackground({ variant, children }: BackgroundTheme) {
  const videoRed = useRef<HTMLVideoElement>(null)
  function Background(): React.ReactNode {
    return backgrounds.find((background) => background.slug === variant)?.fileName
  }

  useEffect(() => {
    if (variant) {
      videoRed.current?.load()
    }
  }, [variant])

  return (
    <div className="w-full h-full bg-indigo-900/15">
      <div className="w-full h-full">
        <div className="w-full h-full">
          {
            variant ? (
              <video
                ref={videoRed}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={`/backgrounds/${Background()}`} type="video/mp4" />
              </video>
            ) : null
          }
        </div>
      </div>
      <div className="absolute left-0 top-0 z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}