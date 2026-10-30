import type { AnimationRenderer } from "./types";

export class MatrixRenderer implements AnimationRenderer {
  private columns: { x: number; y: number; speed: number; chars: string[] }[] = [];
  private time = 0;

  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {}

  init() {
    this.columns = [];
    this.time = 0;
    const fontSize = 14;
    const cols = Math.floor(this.canvas.width / fontSize);
    const chars = "01アイウエオカキクケコサシスセソ".split("");

    for (let i = 0; i < cols; i++) {
      const columnChars: string[] = [];
      const length = 5 + Math.floor(Math.random() * 15);
      for (let j = 0; j < length; j++) {
        columnChars.push(chars[Math.floor(Math.random() * chars.length)]);
      }
      this.columns.push({
        x: i * fontSize,
        y: Math.random() * this.canvas.height * -1,
        speed: 1 + Math.random() * 3,
        chars: columnChars,
      });
    }
  }

  draw() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.time++;

    this.ctx.font = "14px monospace";

    for (const col of this.columns) {
      col.y += col.speed;

      for (let i = 0; i < col.chars.length; i++) {
        const y = col.y + i * 16;
        if (y < 0 || y > this.canvas.height) continue;

        const isHead = i === col.chars.length - 1;
        const fade = 1 - (i / col.chars.length);

        if (isHead) {
          this.ctx.fillStyle = "rgba(180, 255, 180, 0.9)";
        } else {
          this.ctx.fillStyle = `rgba(0, 200, 80, ${fade * 0.4})`;
        }

        this.ctx.fillText(col.chars[i], col.x, y);

        if (Math.random() < 0.02) {
          const chars = "01アイウエオカキクケコサシスセソ".split("");
          col.chars[i] = chars[Math.floor(Math.random() * chars.length)];
        }
      }

      if (col.y > this.canvas.height + col.chars.length * 16) {
        col.y = -col.chars.length * 16;
        col.speed = 1 + Math.random() * 3;
      }
    }
  }
}
