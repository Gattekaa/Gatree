import assert from "node:assert/strict";
import test from "node:test";
import {
  contentSecurityPolicy,
  isAllowedHost,
  isPrivatePath,
  matchesHostname,
} from "./security-policy";
import { updateTreeSchema } from "./validations";
import { isAllowedRedirectUrl, validateLinkUrl } from "./security";
import { createMemoryRateLimiter } from "./rate-limit-memory";
import { isPublicLinkAvailable } from "./link-access";
import {
  resolveSocialDestination,
  socialAnalyticsTargets,
  socialClickId,
  socialClickPath,
} from "./social-clicks";

test("tree updates reject nested writes and owner reassignment", () => {
  for (const data of [
    { userId: "attacker" },
    { links: { deleteMany: {} } },
    { user: { connect: { id: "attacker" } } },
  ]) {
    assert.equal(updateTreeSchema.safeParse(data).success, false);
  }
  assert.deepEqual(
    updateTreeSchema.parse({
      title: "Novo título",
      description: null,
      status: "INACTIVE",
    }),
    { title: "Novo título", description: null, status: "INACTIVE" },
  );
});
test("allowed hosts use exact deployment and configured domains", () => {
  const env = {
    NODE_ENV: "production",
    NEXT_PUBLIC_APP_URL: "https://gatree.vercel.app",
    VERCEL_URL: "gatree-release.vercel.app",
  };
  assert.ok(isAllowedHost("gatree.vercel.app", env));
  assert.ok(isAllowedHost("gatree-release.vercel.app", env));
  for (const host of [
    "evil.vercel.app",
    "gatree.vercel.app.evil.test",
    "localhost",
    "user@gatree.vercel.app",
    "gatree.vercel.app/path",
  ])
    assert.equal(isAllowedHost(host, env), false);
});
test("private pages in every locale disallow framing and production scripts require a nonce", () => {
  for (const path of [
    "/login",
    "/en/login",
    "/pt-BR/editor/demo",
    "/api/auth/session",
    "/analytics/demo",
  ])
    assert.ok(isPrivatePath(path));
  assert.equal(isPrivatePath("/gatteka"), false);
  const csp = contentSecurityPolicy("test-nonce", true);
  assert.match(csp, /frame-ancestors 'none'/);
  const scripts = csp
    .split(";")
    .find((part) => part.trim().startsWith("script-src"))!;
  assert.match(scripts, /'nonce-test-nonce'/);
  assert.doesNotMatch(scripts, /unsafe-inline|unsafe-eval/);
});
test("media URL validation rejects spoofed network domains and embedded credentials", () => {
  assert.ok(matchesHostname("www.youtube.com", ["youtube.com"]));
  assert.equal(
    matchesHostname("youtube.com.attacker.test", ["youtube.com"]),
    false,
  );
  for (const [url, type] of [
    ["https://youtube.com.evil.test/watch?v=123", "YOUTUBE"],
    ["https://fakespotify.com/track/123", "SPOTIFY"],
    ["https://soundcloud.com.evil.test/track", "SOUNDCLOUD"],
    ["https://google.com.evil.test/maps", "MAP"],
  ] as const)
    assert.equal(validateLinkUrl(url, type).valid, false);
  assert.equal(
    isAllowedRedirectUrl("https://user:password@example.com"),
    false,
  );
  assert.equal(isAllowedRedirectUrl("javascript:alert(1)"), false);
});
test("15 minute limits remain active after five minutes and separate limiter instances", async () => {
  let now = 1000;
  const limiter = createMemoryRateLimiter(
    { max: 1, windowMs: 15 * 60_000 },
    () => now,
  );
  assert.ok((await limiter.check("same")).success);
  now += 6 * 60_000;
  assert.equal((await limiter.check("same")).success, false);
  assert.ok(
    (
      await createMemoryRateLimiter(
        { max: 1, windowMs: 60_000 },
        () => now,
      ).check("same")
    ).success,
  );
  now += 10 * 60_000;
  assert.ok((await limiter.check("same")).success);
});
test("direct clicks cannot bypass disabled, inactive or scheduled links", () => {
  const now = new Date("2026-10-30T12:00:00Z");
  const link = {
    enabled: true,
    scheduledStart: null,
    scheduledEnd: null,
    tree: { status: "ACTIVE" },
  };
  assert.ok(isPublicLinkAvailable(link, now));
  assert.equal(isPublicLinkAvailable({ ...link, enabled: false }, now), false);
  assert.equal(
    isPublicLinkAvailable({ ...link, tree: { status: "INACTIVE" } }, now),
    false,
  );
  assert.equal(
    isPublicLinkAvailable(
      { ...link, scheduledStart: new Date(now.getTime() + 1) },
      now,
    ),
    false,
  );
  assert.equal(
    isPublicLinkAvailable({ ...link, scheduledEnd: now }, now),
    false,
  );
});
test("social redirects resolve only saved, valid profiles and have stable analytics IDs", () => {
  const icons = [
    { platform: "github", url: "github.com/gattekaa" },
    { platform: "instagram", url: "https://instagram.com.evil.test/foo" },
    { platform: "x", url: "https://x.com/demo" },
  ];
  assert.equal(
    resolveSocialDestination(icons, "github"),
    "https://github.com/gattekaa",
  );
  assert.equal(resolveSocialDestination(icons, "instagram"), null);
  assert.equal(resolveSocialDestination(icons, "linkedin"), null);
  assert.equal(resolveSocialDestination(icons, "unknown"), null);
  assert.equal(socialClickId("tree1", "x"), socialClickId("tree1", "twitter"));
  assert.notEqual(
    socialClickId("tree1", "github"),
    socialClickId("tree2", "github"),
  );
  assert.equal(
    socialClickPath("tree1", "github"),
    "/api/click/social/tree1/github",
  );
  assert.equal(
    socialAnalyticsTargets("tree1").find(
      (target) => target.id === socialClickId("tree1", "github"),
    )?.label,
    "GitHub",
  );
});
