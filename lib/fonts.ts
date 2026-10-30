import {
  Archivo,
  Bebas_Neue,
  Bitter,
  Caveat,
  Comfortaa,
  Cormorant_Garamond,
  Dancing_Script,
  Fira_Code,
  Fraunces,
  Fredoka,
  Inter,
  JetBrains_Mono,
  Lexend,
  Lora,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Righteous,
  Sora,
  Space_Grotesk,
  Space_Mono,
} from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap" });
const sora = Sora({ subsets: ["latin"], display: "swap" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap" });
const archivo = Archivo({ subsets: ["latin"], display: "swap" });
const outfit = Outfit({ subsets: ["latin"], display: "swap" });

const playfairDisplay = Playfair_Display({ subsets: ["latin"], display: "swap" });
const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });
const lora = Lora({ subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], display: "swap" });
const bitter = Bitter({ subsets: ["latin"], display: "swap" });

const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", display: "swap" });
const righteous = Righteous({ subsets: ["latin"], weight: "400", display: "swap" });
const comfortaa = Comfortaa({ subsets: ["latin"], display: "swap" });
const fredoka = Fredoka({ subsets: ["latin"], display: "swap" });
const lexend = Lexend({ subsets: ["latin"], display: "swap" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

const caveat = Caveat({ subsets: ["latin"], display: "swap" });
const dancingScript = Dancing_Script({ subsets: ["latin"], display: "swap" });

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap" });
const firaCode = Fira_Code({ subsets: ["latin"], display: "swap" });

export const FONT_CLASS_MAP: Record<string, string> = {
  "Inter": inter.className,
  "Space Grotesk": spaceGrotesk.className,
  "Sora": sora.className,
  "Plus Jakarta Sans": plusJakartaSans.className,
  "Archivo": archivo.className,
  "Outfit": outfit.className,
  "Playfair Display": playfairDisplay.className,
  "Cormorant Garamond": cormorantGaramond.className,
  "Lora": lora.className,
  "Fraunces": fraunces.className,
  "Bitter": bitter.className,
  "Bebas Neue": bebasNeue.className,
  "Righteous": righteous.className,
  "Comfortaa": comfortaa.className,
  "Fredoka": fredoka.className,
  "Lexend": lexend.className,
  "Space Mono": spaceMono.className,
  "Caveat": caveat.className,
  "Dancing Script": dancingScript.className,
  "JetBrains Mono": jetbrainsMono.className,
  "Fira Code": firaCode.className,
};
