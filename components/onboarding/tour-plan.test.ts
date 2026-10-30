import assert from "node:assert/strict";
import test from "node:test";
import dictionary from "../../dictionaries/pt-BR.json";
import { buildTourPlan, selectTourTree } from "./tour-plan";
const copy = dictionary.onboarding.guided.steps;

test("empty accounts only visit real controls that do not require a tree", () => {
  const plan = buildTourPlan("/dashboard", undefined, copy);
  assert.equal(plan.length, 6);
  assert.equal(plan[0].id, "dashboard");
  assert.equal(plan.at(-1)?.id, "finish");
  assert.ok(plan.every((step) => !/^\/(editor|analytics)\//.test(step.path)));
});
test("accounts with a tree include its real editor and analytics routes", () => {
  const plan = buildTourPlan("/dashboard", "my-profile", copy);
  assert.equal(plan.length, 14);
  assert.equal(
    plan.find((step) => step.id === "addLink")?.path,
    "/editor/my-profile",
  );
  assert.equal(
    plan.find((step) => step.id === "period")?.path,
    "/analytics/my-profile",
  );
});
test("manual tours start on the current page and finish on the create control", () => {
  const plan = buildTourPlan("/shortener", "my-profile", copy);
  assert.equal(plan[0].id, "shortener");
  assert.equal(plan[1].id, "shortenerSearch");
  assert.equal(plan.at(-1)?.target, '[data-tour="dashboard-create"]');
});
test("current owned trees take priority over the first active tree", () => {
  const trees = [
    { slug: "inactive", status: "INACTIVE" },
    { slug: "first", status: "ACTIVE" },
    { slug: "current", status: "ACTIVE" },
  ];
  assert.equal(selectTourTree(trees, "/editor/current")?.slug, "current");
  assert.equal(selectTourTree(trees, "/shortener")?.slug, "first");
  assert.equal(selectTourTree([], "/editor/not-owned"), undefined);
});
test("tree slugs are encoded in navigated routes", () => {
  const plan = buildTourPlan("/dashboard", "a/b?c", copy);
  assert.equal(
    plan.find((step) => step.id === "editorTitle")?.path,
    "/editor/a%2Fb%3Fc",
  );
});

test("welcome always starts on dashboard and excludes supplied trees", () => {
  const plan = buildTourPlan("/settings", "already-exists", copy, "welcome");
  assert.equal(plan.length, 6);
  assert.deepEqual(
    plan.map((step) => step.id),
    [
      "dashboard",
      "createTree",
      "shortener",
      "shortenerSearch",
      "preferences",
      "finish",
    ],
  );
  assert.ok(plan.every((step) => !/^\/(editor|analytics)\//.test(step.path)));
  assert.equal(plan[0].path, "/dashboard");
  assert.equal(plan.at(-1)?.description, copy.welcomeFinish.description);
});

test("welcome continuation copy does not change manual completion", () => {
  const manual = buildTourPlan("/dashboard", undefined, copy);
  const welcome = buildTourPlan("/dashboard", undefined, copy, "welcome");
  assert.equal(manual.at(-1)?.description, copy.finish.description);
  assert.notEqual(welcome.at(-1)?.description, manual.at(-1)?.description);
  assert.equal(welcome.at(-1)?.target, manual.at(-1)?.target);
});

test("first-tree waits for a real tree slug", () => {
  assert.deepEqual(
    buildTourPlan("/dashboard", undefined, copy, "first-tree"),
    [],
  );
  assert.deepEqual(buildTourPlan("/editor", "", copy, "first-tree"), []);
});

test("first-tree only visits editor and analytics and ends on analytics", () => {
  const plan = buildTourPlan("/settings", "first-tree", copy, "first-tree");
  assert.deepEqual(
    plan.map((step) => step.id),
    [
      "editorTitle",
      "addLink",
      "appearance",
      "preview",
      "sharing",
      "analytics",
      "period",
    ],
  );
  assert.equal(plan.length, 7);
  assert.ok(
    plan.slice(0, 5).every((step) => step.path === "/editor/first-tree"),
  );
  assert.ok(
    plan.slice(5).every((step) => step.path === "/analytics/first-tree"),
  );
  assert.equal(plan.at(-1)?.target, '[data-tour="analytics-period"]');
  assert.ok(plan.every((step) => step.id !== "finish"));
});

test("first-tree encodes the real tree slug in both routes", () => {
  const plan = buildTourPlan("/dashboard", "a/b?c", copy, "first-tree");
  assert.equal(plan[0].path, "/editor/a%2Fb%3Fc");
  assert.equal(plan.at(-1)?.path, "/analytics/a%2Fb%3Fc");
});

test("welcome and manual modes retain their own English completion copy", async () => {
  const english = (await import("../../dictionaries/en.json")).default
    .onboarding.guided.steps;
  const welcome = buildTourPlan(
    "/analytics/current",
    "current",
    english,
    "welcome",
  );
  const manual = buildTourPlan(
    "/analytics/current",
    "current",
    english,
    "manual",
  );
  assert.equal(welcome.length, 6);
  assert.equal(welcome.at(-1)?.description, english.welcomeFinish.description);
  assert.equal(manual.at(-1)?.description, english.finish.description);
  assert.equal(manual[0].id, "analytics");
});
