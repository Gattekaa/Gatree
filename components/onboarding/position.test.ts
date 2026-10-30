import assert from "node:assert/strict";
import test from "node:test";
import { positionCoach, spotlightRect } from "./position";

test("spotlight includes padding without escaping the viewport", () => {
  assert.deepEqual(
    spotlightRect({ left: 1, top: 1, width: 318, height: 638 }, 320, 640),
    {
      left: 2,
      top: 2,
      width: 316,
      height: 636,
    },
  );
});

test("desktop coach sits beside the highlighted control when there is room", () => {
  const target = { left: 1200, top: 120, width: 150, height: 50 };
  const result = positionCoach(
    target,
    { left: 0, top: 0, width: 1440, height: 900 },
    300,
  );
  assert.equal(result.placement, "left");
  assert.ok(result.left + result.width <= target.left - 16);
});

test("mobile coach fits the viewport and sits below the target", () => {
  const result = positionCoach(
    { left: 20, top: 100, width: 280, height: 50 },
    { left: 0, top: 0, width: 320, height: 640 },
    300,
  );
  assert.equal(result.placement, "bottom");
  assert.equal(result.width, 296);
  assert.ok(result.left >= 12 && result.left + result.width <= 308);
  assert.ok(result.top >= 166 && result.top + 300 <= 628);
});

test("an oversized target keeps the coach usable in a small viewport", () => {
  const result = positionCoach(
    { left: 0, top: 0, width: 320, height: 640 },
    { left: 0, top: 0, width: 320, height: 640 },
    900,
  );
  assert.equal(result.placement, "center");
  assert.equal(result.top, 12);
  assert.equal(result.maxHeight, 616);
});
