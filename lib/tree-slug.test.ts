import assert from "node:assert/strict";
import test from "node:test";
import { isTreeSlugAvailable, treeSlugSchema } from "./tree-slug";
import { createTreeSchema, updateTreeSchema } from "./validations";

test("a second tree belonging to the same account still occupies its URL", () => {
  const own = { id: "tree-two", userId: "owner" };
  assert.equal(isTreeSlugAvailable(own, "owner", null), false);
  assert.equal(isTreeSlugAvailable(own, "owner", "tree-one"), false);
  assert.equal(isTreeSlugAvailable(own, "owner", "tree-two"), true);
  assert.equal(isTreeSlugAvailable(null, "owner", "tree-one"), true);
});
test("excluding another account's tree does not make its URL available", () => {
  assert.equal(
    isTreeSlugAvailable(
      { id: "private-tree", userId: "other" },
      "owner",
      "private-tree",
    ),
    false,
  );
});
test("creation and editing reject invalid or reserved public addresses", () => {
  for (const slug of [
    "a",
    "a".repeat(31),
    "UPPERCASE",
    "with spaces",
    "path/child",
    "dashboard",
    "api",
    "en",
    "s",
    "login",
    "editor",
    "settings",
  ]) {
    assert.equal(treeSlugSchema.safeParse(slug).success, false, slug);
    assert.equal(
      createTreeSchema.safeParse({ title: "Example", slug }).success,
      false,
      slug,
    );
    assert.equal(updateTreeSchema.safeParse({ slug }).success, false, slug);
  }
  assert.equal(
    updateTreeSchema.safeParse({ slug: "vinicius-martins-2026" }).success,
    true,
  );
});
