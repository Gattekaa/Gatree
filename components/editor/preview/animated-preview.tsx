"use client";

import { createRenderer } from "@/components/public/animations";
import { useEffect, useRef } from "react";

interface AnimatedPreviewProps {
  variant: string;
  className?: string;
}

export function AnimatedPreview({ variant, className }: AnimatedPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let renderer = createAndInit();

    function createAndInit() {
      const rect = container!.getBoundingClientRect();
      canvas!.width = rect.width;
      canvas!.height = rect.height;
      const r = createRenderer(variant, ctx!, canvas!);
      r.init();
      return r;
    }

    const observer = new ResizeObserver(() => {
      renderer = createAndInit();
    });
    observer.observe(container);

    function loop() {
      renderer.draw();
      animationRef.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [variant]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className || ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
