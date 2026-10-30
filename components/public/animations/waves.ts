import type { AnimationRenderer } from "./types";

export class WavesRenderer implements AnimationRenderer {
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() { this.time = 0; }

  draw() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    this.time += 0.006;

    const layers = [
      { offset: 0.55, amp: 60, freq: 0.003, speed: 1, color: [94, 106, 210], alpha: 0.12 },
      { offset: 0.6, amp: 45, freq: 0.004, speed: 1.3, color: [130, 143, 255], alpha: 0.08 },
      { offset: 0.65, amp: 55, freq: 0.0025, speed: 0.8, color: [60, 80, 180], alpha: 0.1 },
      { offset: 0.7, amp: 35, freq: 0.005, speed: 1.5, color: [94, 106, 210], alpha: 0.06 },
      { offset: 0.45, amp: 70, freq: 0.002, speed: 0.6, color: [150, 100, 255], alpha: 0.05 },
    ];

    for (const layer of layers) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, h);

      for (let x = 0; x <= w; x += 2) {
        const y = h * layer.offset +
          Math.sin(x * layer.freq + this.time * layer.speed) * layer.amp +
          Math.sin(x * layer.freq * 2.5 + this.time * layer.speed * 0.7) * (layer.amp * 0.4) +
          Math.cos(x * layer.freq * 0.5 + this.time * layer.speed * 1.2) * (layer.amp * 0.3);
        this.ctx.lineTo(x, y);
      }

      this.ctx.lineTo(w, h);
      this.ctx.closePath();

      const [r, g, b] = layer.color;
      const gradient = this.ctx.createLinearGradient(0, h * layer.offset - layer.amp, 0, h);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${layer.alpha})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${layer.alpha * 0.4})`);
      gradient.addColorStop(1, "transparent");
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      this.ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h * layer.offset +
          Math.sin(x * layer.freq + this.time * layer.speed) * layer.amp +
          Math.sin(x * layer.freq * 2.5 + this.time * layer.speed * 0.7) * (layer.amp * 0.4) +
          Math.cos(x * layer.freq * 0.5 + this.time * layer.speed * 1.2) * (layer.amp * 0.3);
        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${layer.alpha * 2})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }
  }
}
