import assert from "node:assert/strict";
import test from "node:test";
import { createLatestSaveQueue } from "./latest-save-queue";

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test("rapid selections cannot finish out of order; pending selections coalesce to the latest", async () => {
  const first = deferred();
  const last = deferred();
  const requests: string[] = [];
  let databaseColor = "initial";
  let activeRequests = 0;
  const queue = createLatestSaveQueue<string>({
    save: async (color) => {
      assert.equal(++activeRequests, 1, "only one save can be in flight");
      requests.push(color);
      await (color === "red" ? first.promise : last.promise);
      databaseColor = color;
      activeRequests--;
    },
    onError: (error) => {
      throw error;
    },
  });
  queue.enqueue("red");
  queue.enqueue("blue");
  queue.enqueue("gold");
  assert.deepEqual(requests, ["red"]);
  first.resolve();
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(requests, ["red", "gold"]);
  assert.equal(databaseColor, "red");
  last.resolve();
  await queue.whenIdle();
  assert.equal(databaseColor, "gold");
  assert.equal(activeRequests, 0);
});

test("a failed outdated save does not prevent the latest selection from being persisted", async () => {
  const first = deferred();
  const errors: Array<{ color: string; isLatest: boolean }> = [];
  let databaseColor = "initial";
  const queue = createLatestSaveQueue<string>({
    save: async (color) => {
      if (color === "red") await first.promise;
      databaseColor = color;
    },
    onError: (_, color, isLatest) => errors.push({ color, isLatest }),
  });
  queue.enqueue("red");
  queue.enqueue("gold");
  first.reject(new Error("network failed"));
  await queue.whenIdle();
  assert.equal(databaseColor, "gold");
  assert.deepEqual(errors, [{ color: "red", isLatest: false }]);
});

test("the latest save error is reported and the queue accepts a retry", async () => {
  let fail = true;
  let databaseColor = "initial";
  const errors: boolean[] = [];
  const queue = createLatestSaveQueue<string>({
    save: async (color) => {
      if (fail) throw new Error("not authorized");
      databaseColor = color;
    },
    onError: (_, __, isLatest) => errors.push(isLatest),
  });
  queue.enqueue("gold");
  await queue.whenIdle();
  assert.deepEqual(errors, [true]);
  assert.equal(databaseColor, "initial");
  fail = false;
  queue.enqueue("gold");
  await queue.whenIdle();
  assert.equal(databaseColor, "gold");
});

type AppearancePatch = {
  background?: string;
  linkStyle?: string;
  theme: string | null;
};

async function saveAppearanceSequence(selections: AppearancePatch[]) {
  const gate = deferred();
  const saved: AppearancePatch[] = [];
  const queue = createLatestSaveQueue<AppearancePatch>({
    save: async (patch) => {
      saved.push(patch);
      if (saved.length === 1) await gate.promise;
    },
    mergePending: (previous, next) => ({ ...previous, ...next }),
    onError: (error) => {
      throw error;
    },
  });
  queue.enqueue({ theme: null });
  for (const selection of selections) queue.enqueue(selection);
  assert.equal(saved.length, 1);
  gate.resolve();
  await queue.whenIdle();
  return saved.at(-1);
}

test("coalescing background and link color edits preserves both pending fields", async () => {
  const final = await saveAppearanceSequence([
    { background: "blue", theme: null },
    { linkStyle: "gold", theme: null },
  ]);
  assert.deepEqual(final, {
    background: "blue",
    linkStyle: "gold",
    theme: null,
  });
});

test("a theme selected last replaces pending manual background and link styles", async () => {
  const final = await saveAppearanceSequence([
    { background: "blue", theme: null },
    { linkStyle: "gold", theme: null },
    {
      background: "preset-bg",
      linkStyle: "preset-link",
      theme: "chosen-theme",
    },
  ]);
  assert.deepEqual(final, {
    background: "preset-bg",
    linkStyle: "preset-link",
    theme: "chosen-theme",
  });
});

test("a link style selected after a preset retains its background and clears the theme flag", async () => {
  const final = await saveAppearanceSequence([
    {
      background: "preset-bg",
      linkStyle: "preset-link",
      theme: "chosen-theme",
    },
    { linkStyle: "gold", theme: null },
  ]);
  assert.deepEqual(final, {
    background: "preset-bg",
    linkStyle: "gold",
    theme: null,
  });
});

test("a failed background request is retained when the pending edit changes another field", async () => {
  const gate = deferred();
  let requests = 0;
  let database: AppearancePatch = { theme: null };
  const queue = createLatestSaveQueue<AppearancePatch>({
    save: async (patch) => {
      if (++requests === 1) await gate.promise;
      database = { ...database, ...patch };
    },
    mergePending: (previous, next) => ({ ...previous, ...next }),
    onError: (_, __, isLatest) => assert.equal(isLatest, false),
  });
  queue.enqueue({ background: "blue", theme: null });
  queue.enqueue({ linkStyle: "gold", theme: null });
  gate.reject(new Error("temporary network failure"));
  await queue.whenIdle();
  assert.deepEqual(database, {
    background: "blue",
    linkStyle: "gold",
    theme: null,
  });
  assert.equal(requests, 2);
});

test("preview notification waits until the newest selection is persisted", async () => {
  const first = deferred();
  const last = deferred();
  const refreshes: string[] = [];
  const queue = createLatestSaveQueue<string>({
    save: async (color) => {
      await (color === "red" ? first.promise : last.promise);
    },
    onError: (error) => {
      throw error;
    },
    onSuccess: (color, isLatest) => {
      if (isLatest) refreshes.push(color);
    },
  });
  queue.enqueue("red");
  queue.enqueue("gold");
  assert.deepEqual(refreshes, []);
  first.resolve();
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(
    refreshes,
    [],
    "an old completed save cannot refresh an optimistic preview",
  );
  last.resolve();
  await queue.whenIdle();
  assert.deepEqual(refreshes, ["gold"]);
});
