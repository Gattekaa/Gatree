import type { LocationData } from "@/types";

export function decodeCityName(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;

  try {
    return decodeURIComponent(value).trim().normalize("NFC") || null;
  } catch {
    // Malformed percent escapes must not interrupt tracking or analytics.
    return value.trim().normalize("NFC");
  }
}

interface CityGroup {
  city: string | null;
  region: string | null;
  _count: { id: number };
}

export function summarizeCities(groups: readonly CityGroup[], limit = 50): LocationData[] {
  const cities = new Map<string, Omit<LocationData, "percentage">>();
  let total = 0;

  for (const group of groups) {
    const name = decodeCityName(group.city) || "Desconhecido";
    const parentName = group.region || undefined;
    const key = JSON.stringify([name, parentName]);
    const city = cities.get(key);
    if (city) city.count += group._count.id;
    else cities.set(key, { name, parentName, count: group._count.id });
    total += group._count.id;
  }

  return Array.from(cities.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((city) => ({
      ...city,
      percentage: total > 0 ? Math.round((city.count / total) * 1000) / 10 : 0,
    }));
}
