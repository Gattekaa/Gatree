import type { AnimationRenderer } from "./types";

export class GradientFlowRenderer implements AnimationRenderer {
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() { this.time = 0; }

  draw() {
    this.time += 0.002;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);

    const orbs = [
      {
        x: w * (0.2 + Math.sin(this.time * 0.7) * 0.15),
        y: h * (0.3 + Math.cos(this.time * 0.5) * 0.15),
        r: Math.min(w, h) * 0.5,
        color: [80, 90, 200] as [number, number, number],
        alpha: 0.07,
      },
      {
        x: w * (0.8 + Math.cos(this.time * 0.6) * 0.15),
        y: h * (0.6 + Math.sin(this.time * 0.4) * 0.2),
        r: Math.min(w, h) * 0.45,
        color: [140, 50, 180] as [number, number, number],
        alpha: 0.06,
      },
      {
        x: w * (0.5 + Math.sin(this.time * 0.9) * 0.2),
        y: h * (0.8 + Math.cos(this.time * 0.7) * 0.1),
        r: Math.min(w, h) * 0.4,
        color: [40, 150, 180] as [number, number, number],
        alpha: 0.05,
      },
    ];

    for (const orb of orbs) {
      const gradient = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      const [r, g, b] = orb.color;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${orb.alpha})`);
      gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.3})`);
      gradient.addColorStop(1, "transparent");
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
