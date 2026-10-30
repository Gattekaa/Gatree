import { AuroraRenderer } from "./aurora";
import { BubblesRenderer } from "./bubbles";
import { ConfettiRenderer } from "./confetti";
import { DotsRenderer } from "./dots";
import { FirefliesRenderer } from "./fireflies";
import { GradientFlowRenderer } from "./gradient-flow";
import { MatrixRenderer } from "./matrix";
import { ParticlesRenderer } from "./particles";
import { RainRenderer } from "./rain";
import { SmokeRenderer } from "./smoke";
import { SnowRenderer } from "./snow";
import { StarsRenderer } from "./stars";
import type { AnimationRenderer } from "./types";
import { WavesRenderer } from "./waves";

export type { AnimationRenderer };

export function createRenderer(
  variant: string,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
): AnimationRenderer {
  switch (variant) {
    case "dots": return new DotsRenderer(ctx, canvas);
    case "particles": return new ParticlesRenderer(ctx, canvas);
    case "waves": return new WavesRenderer(ctx, canvas);
    case "aurora": return new AuroraRenderer(ctx, canvas);
    case "fireflies": return new FirefliesRenderer(ctx, canvas);
    case "rain": return new RainRenderer(ctx, canvas);
    case "stars": return new StarsRenderer(ctx, canvas);
    case "gradient-flow": return new GradientFlowRenderer(ctx, canvas);
    case "bubbles": return new BubblesRenderer(ctx, canvas);
    case "snow": return new SnowRenderer(ctx, canvas);
    case "matrix": return new MatrixRenderer(ctx, canvas);
    case "confetti": return new ConfettiRenderer(ctx, canvas);
    case "smoke": return new SmokeRenderer(ctx, canvas);
    default: return new DotsRenderer(ctx, canvas);
  }
}
