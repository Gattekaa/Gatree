import type { AnimationRenderer } from "./types";

export class SmokeRenderer implements AnimationRenderer {
  private puffs: { x: number; y: number; size: number; speed: number; opacity: number; growth: number }[] = [];
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() {
    this.puffs = [];
    this.time = 0;
    for (let i = 0; i < 20; i++) {
      this.spawnPuff();
    }
  }

  private spawnPuff() {
    this.puffs.push({
      x: this.canvas.width * (0.3 + Math.random() * 0.4),
      y: this.canvas.height + Math.random() * 100,
      size: 30 + Math.random() * 60,
      speed: 0.3 + Math.random() * 0.6,
      opacity: 0.03 + Math.random() * 0.06,
      growth: 0.3 + Math.random() * 0.5,
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.005;

    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i];
      p.y -= p.speed;
      p.x += Math.sin(this.time * 2 + i) * 0.3;
      p.size += p.growth;
      p.opacity *= 0.998;

      if (p.y < -p.size || p.opacity < 0.005) {
        this.puffs.splice(i, 1);
        this.spawnPuff();
        continue;
      }

      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, `rgba(200, 200, 220, ${p.opacity})`);
      gradient.addColorStop(0.5, `rgba(150, 150, 180, ${p.opacity * 0.5})`);
      gradient.addColorStop(1, "transparent");
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
