import type { BackgroundConfig } from "@/types";

export function getBackgroundStyle(background: BackgroundConfig | null): React.CSSProperties {
  if (!background) return { backgroundColor: "#010102" };

  switch (background.type) {
    case "gradient":
      return { background: background.value };
    case "solid":
      return { backgroundColor: background.value };
    case "image":
      return {
        backgroundColor: "#010102",
        backgroundImage: `url(${background.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    case "animated": {

      const base = (background.config as Record<string, unknown> | undefined)?.base as string | undefined;
      if (base && base.includes("gradient")) {
        return { background: base };
      }
      return { backgroundColor: base || "#010102" };
    }
    default:
      return { backgroundColor: "#010102" };
  }
}
