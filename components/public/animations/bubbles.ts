import type { AnimationRenderer } from "./types";

export class BubblesRenderer implements AnimationRenderer {
  private bubbles: { x: number; y: number; size: number; speed: number; wobble: number; opacity: number }[] = [];
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() {
    this.bubbles = [];
    this.time = 0;
    const count = Math.floor(this.canvas.width / 20);
    for (let i = 0; i < Math.min(count, 40); i++) {
      this.bubbles.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height + Math.random() * this.canvas.height,
        size: 4 + Math.random() * 20,
        speed: 0.3 + Math.random() * 0.8,
        wobble: Math.random() * Math.PI * 2,
        opacity: 0.05 + Math.random() * 0.15,
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.01;

    for (const b of this.bubbles) {
      b.y -= b.speed;
      b.x += Math.sin(this.time + b.wobble) * 0.3;

      if (b.y < -b.size * 2) {
        b.y = this.canvas.height + b.size;
        b.x = Math.random() * this.canvas.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(150, 200, 255, ${b.opacity})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(200, 230, 255, ${b.opacity * 0.8})`;
      this.ctx.fill();
    }
  }
}
