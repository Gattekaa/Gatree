import type { AnimationRenderer } from "./types";

export class ConfettiRenderer implements AnimationRenderer {
  private pieces: { x: number; y: number; size: number; speed: number; rotation: number; rotSpeed: number; color: string; drift: number }[] = [];
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() {
    this.pieces = [];
    this.time = 0;
    const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#c77dff", "#ff9a76"];
    const count = Math.floor(this.canvas.width / 15);

    for (let i = 0; i < Math.min(count, 60); i++) {
      this.pieces.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: 4 + Math.random() * 6,
        speed: 0.5 + Math.random() * 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        drift: Math.random() * Math.PI * 2,
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.01;

    for (const p of this.pieces) {
      p.y += p.speed;
      p.x += Math.sin(this.time + p.drift) * 0.5;
      p.rotation += p.rotSpeed;

      if (p.y > this.canvas.height + 10) {
        p.y = -10;
        p.x = Math.random() * this.canvas.width;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color + "40";
      this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      this.ctx.restore();
    }
  }
}
