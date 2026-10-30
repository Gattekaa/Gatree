import type { AnimationRenderer } from "./types";

export class StarsRenderer implements AnimationRenderer {
  private stars: { x: number; y: number; size: number; phase: number; speed: number }[] = [];
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() {
    this.stars = [];
    this.time = 0;
    const count = Math.floor((this.canvas.width * this.canvas.height) / 8000);
    for (let i = 0; i < Math.min(count, 150); i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: 0.8 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 2,
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.008;
    for (const s of this.stars) {
      const twinkle = (Math.sin(this.time * s.speed + s.phase) + 1) * 0.5;
      const alpha = 0.15 + twinkle * 0.85;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size * (0.5 + twinkle * 0.5), 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.fill();

      if (s.size > 2 && twinkle > 0.7) {
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${(twinkle - 0.7) * 1.5})`;
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(s.x - s.size * 2, s.y);
        this.ctx.lineTo(s.x + s.size * 2, s.y);
        this.ctx.moveTo(s.x, s.y - s.size * 2);
        this.ctx.lineTo(s.x, s.y + s.size * 2);
        this.ctx.stroke();
      }
    }
  }
}
