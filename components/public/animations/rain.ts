import type { AnimationRenderer } from "./types";

export class RainRenderer implements AnimationRenderer {
  private drops: { x: number; y: number; speed: number; length: number; opacity: number }[] = [];

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() {
    this.drops = [];
    const count = Math.floor((this.canvas.width) / 3);
    for (let i = 0; i < Math.min(count, 200); i++) {
      this.drops.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: 4 + Math.random() * 6,
        length: 15 + Math.random() * 30,
        opacity: 0.1 + Math.random() * 0.2,
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const d of this.drops) {
      d.y += d.speed;
      if (d.y > this.canvas.height) {
        d.y = -d.length;
        d.x = Math.random() * this.canvas.width;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(d.x, d.y);
      this.ctx.lineTo(d.x + 0.5, d.y + d.length);
      this.ctx.strokeStyle = `rgba(150, 180, 255, ${d.opacity})`;
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();
    }
  }
}
