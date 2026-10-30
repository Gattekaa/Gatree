import assert from "node:assert/strict";
import test from "node:test";
import { decodeCityName, summarizeCities } from "./geolocation";

test("decodes Vercel city names including accents and spaces", () => {
  assert.equal(decodeCityName("S%C3%A3o%20Vicente"), "São Vicente");
  assert.equal(decodeCityName(encodeURIComponent("東京")), "東京");
  assert.equal(decodeCityName("São Vicente"), "São Vicente");
  assert.equal(decodeCityName("A+B"), "A+B");
});

test("missing or malformed city headers cannot break analytics", () => {
  assert.equal(decodeCityName(null), null);
  assert.equal(decodeCityName(undefined), null);
  assert.equal(decodeCityName("  "), null);
  assert.equal(decodeCityName("City%"), "City%");
  assert.equal(decodeCityName("%E0%A4%A"), "%E0%A4%A");
});

test("historical and new names are combined without losing visits", () => {
  assert.deepEqual(summarizeCities([
    { city: "S%C3%A3o%20Vicente", region: "SP", _count: { id: 7 } },
    { city: "São Vicente", region: "SP", _count: { id: 3 } },
  ]), [{ name: "São Vicente", parentName: "SP", count: 10, percentage: 100 }]);
});

test("different states remain separate and equivalent Unicode names merge", () => {
  const result = summarizeCities([
    { city: "São Vicente", region: "SP", _count: { id: 2 } },
    { city: "São Vicente".normalize("NFD"), region: "SP", _count: { id: 1 } },
    { city: "São Vicente", region: "RN", _count: { id: 1 } },
  ]);
  assert.equal(result.length, 2);
  assert.equal(result[0].count, 3);
  assert.equal(result[0].percentage, 75);
  assert.equal(result[1].parentName, "RN");
});

test("normalization happens before limiting the top cities", () => {
  assert.deepEqual(summarizeCities([
    { city: "Santos", region: "SP", _count: { id: 6 } },
    { city: "São Vicente", region: "SP", _count: { id: 4 } },
    { city: "S%C3%A3o%20Vicente", region: "SP", _count: { id: 4 } },
  ], 1), [{ name: "São Vicente", parentName: "SP", count: 8, percentage: 57.1 }]);
});

test("empty reports return no rows", () => {
  assert.deepEqual(summarizeCities([]), []);
});
