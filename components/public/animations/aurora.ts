import type { AnimationRenderer } from "./types";

export class AuroraRenderer implements AnimationRenderer {
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() { this.time = 0; }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.004;
    const colors: [number, number, number][] = [
      [0, 255, 150],
      [100, 200, 255],
      [150, 100, 255],
      [50, 255, 200],
    ];
    for (let i = 0; i < colors.length; i++) {
      const [r, g, b] = colors[i];
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.canvas.height * 0.2);
      for (let x = 0; x < this.canvas.width; x += 3) {
        const y = this.canvas.height * (0.15 + i * 0.07) +
          Math.sin(x * 0.002 + this.time * (1 + i * 0.3) + i * 2) * 80 +
          Math.sin(x * 0.005 + this.time * 0.5) * 40;
        this.ctx.lineTo(x, y);
      }
      this.ctx.lineTo(this.canvas.width, this.canvas.height);
      this.ctx.lineTo(0, this.canvas.height);
      this.ctx.closePath();
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
      gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.06)`);
      gradient.addColorStop(1, "transparent");
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }
  }
}
