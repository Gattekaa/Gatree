import assert from "node:assert/strict";
import test from "node:test";
import {
  getInstagramDisplay,
  readInstagramEmbedHeight,
  instagramDisplaySchema,
  instagramEmbedUrl,
  normalizeInstagramPostUrl,
} from "./instagram";
import { serverLinkSchema } from "./validations";
import { contentSecurityPolicy } from "./security-policy";

const post = "https://www.instagram.com/p/AbCd_123/";

test("post and Reel links are canonicalized without tracking queries", () => {
  assert.equal(
    normalizeInstagramPostUrl(
      "instagram.com/p/AbCd_123/?igsh=tracking#fragment",
    ),
    post,
  );
  assert.equal(
    normalizeInstagramPostUrl("https://instagram.com/reels/Reel-123/"),
    "https://www.instagram.com/reel/Reel-123/",
  );
  assert.equal(
    normalizeInstagramPostUrl("https://www.instagram.com/p/C/"),
    "https://www.instagram.com/p/C/",
  );
  assert.equal(
    normalizeInstagramPostUrl(
      "https://www.instagram.com/instagram/reel/DfFSUCaB3Ty/",
    ),
    "https://www.instagram.com/reel/DfFSUCaB3Ty/",
  );
  assert.equal(instagramEmbedUrl(post), post + "embed/");
});
test("profiles, forged hosts, credentials and injected paths are not embeddable posts", () => {
  for (const value of [
    "https://instagram.com/my-profile",
    "https://instagram.com.evil.test/p/AbCd_123/",
    "https://evil.test/p/AbCd_123/",
    "https://user:password@instagram.com/p/AbCd_123/",
    "https://instagram.com:8443/p/AbCd_123/",
    "javascript:alert(1)",
    "https://instagram.com/p/AbCd_123/embed/",
    "https://instagram.com/p/%3Cscript%3E/",
    "https://instagram.com/stories/profile/123",
  ])
    assert.equal(normalizeInstagramPostUrl(value), null, value);
});
test("curated posts require 1–6 unique URLs and never accept arbitrary embed HTML", () => {
  assert.deepEqual(getInstagramDisplay({ mode: "posts", posts: [post] }), {
    mode: "posts",
    posts: [post],
  });
  for (const value of [
    null,
    { mode: "posts", posts: [] },
    { mode: "posts", posts: [post, post + "?igsh=duplicate"] },
    {
      mode: "posts",
      posts: Array.from(
        { length: 7 },
        (_, i) => `https://instagram.com/p/Test${i}/`,
      ),
    },
    { mode: "posts", posts: [post], html: "<script>alert(1)</script>" },
  ])
    assert.equal(getInstagramDisplay(value), null);
  assert.ok(
    instagramDisplaySchema.safeParse({ mode: "posts", posts: [post] }).success,
  );
});
test("only Instagram links can store post display options; simple links remain compatible", () => {
  const link = {
    type: "LINK",
    label: "Instagram",
    url: "https://instagram.com/my-profile",
    icon: "instagram",
  };
  assert.ok(
    serverLinkSchema.safeParse({
      ...link,
      instagramConfig: { mode: "posts", posts: [post] },
    }).success,
  );
  assert.ok(
    serverLinkSchema.safeParse({ ...link, instagramConfig: null }).success,
  );
  assert.ok(serverLinkSchema.safeParse(link).success);
  for (const changed of [
    { type: "HEADER" },
    { icon: "github" },
    { url: "https://github.com/my-profile" },
  ])
    assert.equal(
      serverLinkSchema.safeParse({
        ...link,
        ...changed,
        instagramConfig: { mode: "posts", posts: [post] },
      }).success,
      false,
    );
});
test("Instagram embeds are permitted without relaxing the script policy", () => {
  const policy = contentSecurityPolicy("test", false);
  assert.match(policy, /frame-src[^;]*https:\/\/www\.instagram\.com/);
  assert.doesNotMatch(
    policy.split(";").find((part) => part.trim().startsWith("script-src"))!,
    /unsafe-inline|unsafe-eval|instagram/,
  );
});

test("embed height messages are bounded and malformed values are ignored", () => {
  assert.equal(
    readInstagramEmbedHeight(
      JSON.stringify({ type: "MEASURE", details: { height: 885.2 } }),
    ),
    886,
  );
  assert.equal(
    readInstagramEmbedHeight({ type: "MEASURE", details: { height: 999999 } }),
    1600,
  );
  assert.equal(
    readInstagramEmbedHeight({ type: "MEASURE", details: { height: 1 } }),
    320,
  );
  for (const value of [
    "invalid JSON",
    null,
    { type: "OTHER", details: { height: 640 } },
    { type: "MEASURE", details: { height: "640" } },
    { type: "MEASURE", details: { height: Infinity } },
  ])
    assert.equal(readInstagramEmbedHeight(value), null);
});
