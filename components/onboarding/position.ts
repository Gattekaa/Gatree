export interface TourRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type TourViewport = TourRect;
export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, Math.max(min, max)));

export function spotlightRect(
  rect: TourRect,
  width: number,
  height: number,
): TourRect {
  const left = clamp(rect.left - 8, 2, width - 2);
  const top = clamp(rect.top - 8, 2, height - 2);
  const right = clamp(rect.left + rect.width + 8, left, width - 2);
  const bottom = clamp(rect.top + rect.height + 8, top, height - 2);
  return { left, top, width: right - left, height: bottom - top };
}

export function positionCoach(
  target: TourRect | null,
  viewport: TourViewport,
  measuredHeight: number,
) {
  const margin = 12;
  const gap = 16;
  const width = Math.min(360, viewport.width - margin * 2);
  const maxHeight = Math.max(0, viewport.height - margin * 2);
  const height = Math.min(measuredHeight, maxHeight);
  const minLeft = viewport.left + margin;
  const minTop = viewport.top + margin;
  const maxLeft = viewport.left + viewport.width - margin - width;
  let left = minLeft + (viewport.width - margin * 2 - width) / 2;
  let top = minTop + (maxHeight - height) / 2;
  let placement: TourPlacement = "center";
  let limit = maxHeight;

  if (target) {
    const right = target.left + target.width;
    const bottom = target.top + target.height;
    const below = viewport.top + viewport.height - margin - bottom - gap;
    const above = target.top - gap - minTop;
    if (
      viewport.width >= 768 &&
      viewport.left + viewport.width - margin - right - gap >= width
    ) {
      placement = "right";
      left = right + gap;
      top = target.top + (target.height - height) / 2;
    } else if (viewport.width >= 768 && target.left - gap - minLeft >= width) {
      placement = "left";
      left = target.left - gap - width;
      top = target.top + (target.height - height) / 2;
    } else if (below >= height) {
      placement = "bottom";
      left = target.left + (target.width - width) / 2;
      top = bottom + gap;
    } else if (above >= height) {
      placement = "top";
      left = target.left + (target.width - width) / 2;
      top = target.top - gap - height;
    } else if (Math.max(above, below) >= 200) {
      placement = above > below ? "top" : "bottom";
      limit = Math.max(above, below);
      left = target.left + (target.width - width) / 2;
      top = placement === "top" ? target.top - gap - limit : bottom + gap;
    }
  }
  return {
    left: clamp(left, minLeft, maxLeft),
    top: clamp(
      top,
      minTop,
      viewport.top + viewport.height - margin - Math.min(height, limit),
    ),
    width,
    maxHeight: limit,
    placement,
  };
}

export function shadePath(
  rect: TourRect | null,
  width: number,
  height: number,
) {
  const outer = `M0 0H${width}V${height}H0Z`;
  if (!rect || rect.width <= 0 || rect.height <= 0) return outer;
  const x = rect.left,
    y = rect.top;
  const right = x + rect.width,
    bottom = y + rect.height;
  const radius = Math.min(12, rect.width / 2, rect.height / 2);
  return `${outer} M${x + radius} ${y}H${right - radius}Q${right} ${y} ${right} ${y + radius}V${bottom - radius}Q${right} ${bottom} ${right - radius} ${bottom}H${x + radius}Q${x} ${bottom} ${x} ${bottom - radius}V${y + radius}Q${x} ${y} ${x + radius} ${y}Z`;
}
