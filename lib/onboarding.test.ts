import assert from "node:assert/strict";
import test from "node:test";
import {
  createTourContinuationStore,
  createTourSeenStore,
  queuedTourTree,
  updateWelcomeTourFlag,
} from "./onboarding";

test("automatic editor guide starts only on the successfully created tree route", () => {
  assert.equal(queuedTourTree("idle", "/editor/existing"), null);
  assert.equal(queuedTourTree("waiting", "/editor/existing"), null);
  assert.equal(queuedTourTree("tree:first", "/dashboard"), null);
  assert.equal(queuedTourTree("tree:first", "/editor/other"), null);
  assert.equal(queuedTourTree("tree:first", "/editor/first"), "first");
  assert.equal(queuedTourTree("done", "/editor/first"), null);
});

test("new account waits for creation success and continues only for its first tree", () => {
  const store = createTourContinuationStore(() => undefined);
  store.treeCreated("new", "ignored-before-intro");
  assert.equal(store.getProgress("new"), "idle");
  store.waitForTree("new");
  assert.equal(store.getProgress("new"), "waiting");
  store.treeCreated("new", "first");
  assert.equal(store.getProgress("new"), "tree:first");
  store.treeCreated("new", "second");
  assert.equal(store.getProgress("new"), "tree:first");
  store.finish("new");
  store.treeCreated("new", "third");
  store.waitForTree("new");
  assert.equal(store.getProgress("new"), "done");
});

test("skipping cancels the automatic continuation", () => {
  const store = createTourContinuationStore(() => undefined);
  store.finish("user");
  store.treeCreated("user", "first");
  assert.equal(store.getProgress("user"), "done");
});

test("continuation survives reload, stays isolated per account and follows other tabs", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const first = createTourContinuationStore(() => storage);
  first.waitForTree("user");
  const second = createTourContinuationStore(() => storage);
  assert.equal(second.getProgress("user"), "waiting");
  assert.equal(second.getProgress("other"), "idle");
  second.treeCreated("user", "my-tree");
  assert.equal(first.getProgress("user"), "tree:my-tree");
  first.finish("user");
  assert.equal(second.getProgress("user"), "done");
});

test("continuation keeps progressing when browser storage rejects writes", () => {
  const store = createTourContinuationStore(() => {
    throw new Error("blocked");
  });
  let notifications = 0;
  const unsubscribe = store.subscribe(() => {
    notifications++;
  });
  store.waitForTree("user");
  store.treeCreated("user", "first");
  assert.equal(store.getProgress("user"), "tree:first");
  store.finish("user");
  assert.equal(notifications, 3);
  unsubscribe();
});

test("signup offers the tour and ordinary logins never restart it", () => {
  const firstSession = updateWelcomeTourFlag(undefined, "signUp");
  assert.equal(firstSession, true);
  assert.equal(updateWelcomeTourFlag(firstSession), true);
  assert.equal(
    updateWelcomeTourFlag(firstSession, "update", {
      user: { showWelcomeTour: false },
    }),
    false,
  );
  assert.equal(updateWelcomeTourFlag(firstSession, "signIn"), false);
  assert.equal(updateWelcomeTourFlag(undefined, "signIn"), false);
});

test("client session updates cannot force the signup-only offer", () => {
  assert.equal(
    updateWelcomeTourFlag(false, "update", { user: { showWelcomeTour: true } }),
    false,
  );
  assert.equal(
    updateWelcomeTourFlag(false, "update", {
      user: { showWelcomeTour: "true" },
    }),
    false,
  );
  assert.equal(
    updateWelcomeTourFlag(true, "update", {
      user: { showWelcomeTour: "false" },
    }),
    true,
  );
});

test("completion survives a reload and stays isolated per account", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const first = createTourSeenStore(() => storage);
  assert.equal(first.hasSeen("first-user"), false);
  first.markSeen("first-user");
  const reloaded = createTourSeenStore(() => storage);
  assert.equal(reloaded.hasSeen("first-user"), true);
  assert.equal(reloaded.hasSeen("second-user"), false);
});

test("blocked browser storage retains completion and notifies subscribers", () => {
  const store = createTourSeenStore(() => {
    throw new Error("storage blocked");
  });
  let notifications = 0;
  const unsubscribe = store.subscribe(() => {
    notifications++;
  });
  assert.equal(store.hasSeen("user"), false);
  store.markSeen("user");
  assert.equal(store.hasSeen("user"), true);
  assert.equal(notifications, 1);
  unsubscribe();
  store.markSeen("other-user");
  assert.equal(notifications, 1);
});
