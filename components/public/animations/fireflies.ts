import type { AnimationRenderer } from "./types";

export class FirefliesRenderer implements AnimationRenderer {
  private flies: { x: number; y: number; phase: number; speed: number; size: number }[] = [];
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() {
    this.flies = [];
    this.time = 0;
    const count = Math.floor((this.canvas.width * this.canvas.height) / 25000);
    for (let i = 0; i < Math.min(count, 50); i++) {
      this.flies.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        size: 3 + Math.random() * 4,
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.015;
    for (const f of this.flies) {
      f.x += Math.sin(this.time * f.speed + f.phase) * 0.6;
      f.y += Math.cos(this.time * f.speed * 0.7 + f.phase) * 0.4;
      if (f.x < 0) f.x = this.canvas.width;
      if (f.x > this.canvas.width) f.x = 0;
      if (f.y < 0) f.y = this.canvas.height;
      if (f.y > this.canvas.height) f.y = 0;
      const glow = (Math.sin(this.time * 2 + f.phase) + 1) * 0.5;
      const alpha = 0.3 + glow * 0.7;

      const gradient = this.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 5);
      gradient.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.4})`);
      gradient.addColorStop(0.5, `rgba(255, 200, 50, ${alpha * 0.1})`);
      gradient.addColorStop(1, "transparent");
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(f.x - f.size * 5, f.y - f.size * 5, f.size * 10, f.size * 10);

      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.size * (0.3 + glow * 0.7), 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 240, 120, ${alpha})`;
      this.ctx.fill();
    }
  }
}
