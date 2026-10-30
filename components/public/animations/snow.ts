import type { AnimationRenderer } from "./types";

export class SnowRenderer implements AnimationRenderer {
  private flakes: { x: number; y: number; size: number; speed: number; drift: number; opacity: number }[] = [];
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() {
    this.flakes = [];
    this.time = 0;
    const count = Math.floor(this.canvas.width / 8);
    for (let i = 0; i < Math.min(count, 120); i++) {
      this.flakes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: 1 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1.5,
        drift: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.005;

    for (const f of this.flakes) {
      f.y += f.speed;
      f.x += Math.sin(this.time + f.drift) * 0.5;

      if (f.y > this.canvas.height) {
        f.y = -5;
        f.x = Math.random() * this.canvas.width;
      }
      if (f.x < 0) f.x = this.canvas.width;
      if (f.x > this.canvas.width) f.x = 0;

      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
      this.ctx.fill();
    }
  }
}
