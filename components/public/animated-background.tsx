"use client";

import { useEffect, useRef } from "react";
import { createRenderer } from "./animations";

interface AnimatedBackgroundProps {
  variant: string;
  config?: Record<string, unknown>;
  children: React.ReactNode;
}

export function AnimatedBackground({ variant, config, children }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let renderer = createAndInit();

    function createAndInit() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      const r = createRenderer(variant, ctx!, canvas!);
      r.init();
      return r;
    }

    const handleResize = () => {
      renderer = createAndInit();
    };

    window.addEventListener("resize", handleResize);

    function loop() {
      renderer.draw();
      animationRef.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [variant]);

  const baseBackground = (config?.base as string) || "#010102";
  const bgStyle: React.CSSProperties = baseBackground.includes("gradient")
    ? { background: baseBackground }
    : { backgroundColor: baseBackground };

  return (
    <div className="relative min-h-dvh w-full" style={bgStyle}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
