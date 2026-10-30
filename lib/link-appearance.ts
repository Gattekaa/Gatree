import { z } from "zod";

function isColor(value: string) {
  if (/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value))
    return true;
  const match = value.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i,
  );
  return (
    !!match &&
    match.slice(1, 4).every((channel) => Number(channel) <= 255) &&
    (match[4] === undefined || Number(match[4]) <= 1)
  );
}

const colorSchema = z
  .string()
  .max(80)
  .refine(isColor, "Invalid color")
  .nullable()
  .optional();
export const linkAppearanceSchema = z.object({
  bgColor: colorSchema,
  textColor: colorSchema,
});
