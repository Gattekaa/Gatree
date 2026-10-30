import assert from "node:assert/strict";
import test from "node:test";
import { linkAppearanceSchema } from "./link-appearance";
import { getLinkButtonStyle } from "./link-style";
import { normalizeSocialUrl, SOCIAL_PLATFORMS } from "./social-platforms";

const defaults = { variant: "filled", radius: "rounded", bgColor: "#202020", textColor: "#ffffff" } as const;

test("individual colors affect only the selected link and null restores page defaults", () => {
  const first = { bgColor: "#ffcc00", textColor: "#111111" };
  assert.equal(getLinkButtonStyle(first, defaults, "8px").backgroundColor, "#ffcc00");
  assert.equal(getLinkButtonStyle({}, defaults, "8px").backgroundColor, defaults.bgColor);
  assert.equal(getLinkButtonStyle({ bgColor: null, textColor: null }, defaults, "8px").color, defaults.textColor);
  assert.equal(defaults.bgColor, "#202020");
});

test("custom colors also apply to outlined and shadow buttons", () => {
  const colors = { bgColor: "#aabbcc", textColor: "#112233" };
  const outlined = getLinkButtonStyle(colors, { ...defaults, variant: "outlined" }, "99px");
  assert.equal(outlined.border, "2px solid #aabbcc");
  assert.equal(outlined.backgroundColor, "transparent");
  assert.equal(outlined.color, "#112233");
  const shadow = getLinkButtonStyle(colors, { ...defaults, variant: "brutal", shadowColor: "#334455" }, "4px");
  assert.equal(shadow.boxShadow, "4px 4px 0px #334455");
});

test("server accepts colors and explicit resets while rejecting URLs or CSS declarations", () => {
  for (const bgColor of [null, "#fff", "#11223344", "rgba(255, 255, 255, 0.08)"]) assert.equal(linkAppearanceSchema.safeParse({ bgColor }).success, true);
  for (const bgColor of ["url(https://audit.invalid)", "red;display:none", "rgba(300,0,0,1)"]) assert.equal(linkAppearanceSchema.safeParse({ bgColor }).success, false);
});

test("social URLs use their real domains and cannot spoof a network hostname", () => {
  assert.equal(normalizeSocialUrl("twitch", "twitch.tv/example"), "https://twitch.tv/example");
  assert.equal(normalizeSocialUrl("twitter", "https://x.com/example"), "https://x.com/example");
  assert.equal(normalizeSocialUrl("telegram", "https://t.me/example"), "https://t.me/example");
  for (const url of ["https://github.com.audit.invalid/user", "https://github.com@audit.invalid", "javascript:alert(1)", "https://audit.invalid/github.com", "https://github.com:8443/user"]) assert.equal(normalizeSocialUrl("github", url), null);
});

test("every suggested social profile URL passes the same validation as saved URLs", () => {
  for (const platform of SOCIAL_PLATFORMS) assert.ok(normalizeSocialUrl(platform.id, platform.placeholder), platform.id);
});
