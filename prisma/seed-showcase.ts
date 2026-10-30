

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL not set");

  if (databaseUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({ accelerateUrl: databaseUrl });
  }

  const adapter = new PrismaPg(databaseUrl);
  return new PrismaClient({ adapter });
}

const db = createClient();

const SHOWCASE_SLUG = "beats-and-code";
const SHOWCASE_EMAIL = "showcase@gatree.app";

async function main() {
  console.log("🎯 Seeding showcase tree...");

  let user = await db.user.findUnique({ where: { email: SHOWCASE_EMAIL } });
  if (!user) {
    user = await db.user.create({
      data: {
        email: SHOWCASE_EMAIL,
        name: "Gatree Showcase",
        emailVerified: new Date(),
      },
    });
  }

  const existing = await db.tree.findUnique({ where: { slug: SHOWCASE_SLUG } });
  if (existing) {
    console.log("✅ Showcase tree already exists, skipping.");
    return;
  }

  await db.tree.create({
    data: {
      title: "Beats & Code",
      description: "Music producer & developer. Listen to my beats 🎵",
      slug: SHOWCASE_SLUG,
      userId: user.id,
      status: "ACTIVE",
      theme: "neon-purple",
      background: {
        type: "animated",
        value: "particles",
        config: { base: "linear-gradient(135deg, #1a0533, #2d1b69)" },
      },
      linkStyle: {
        variant: "outlined",
        radius: "pill",
        bgColor: "transparent",
        textColor: "#e0d4ff",
      },
      seoTitle: "Beats & Code - Music & Dev",
      seoDescription: "Beats, code e conteúdo sobre produção musical",
      links: {
        create: [
          {
            label: "Últimos Beats",
            url: "",
            icon: null,
            type: "HEADER",
            position: 0,
            enabled: true,
          },
          {
            label: "Lofi Girl Radio",
            url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            icon: "play",
            type: "YOUTUBE",
            position: 1,
            enabled: true,
          },
          {
            label: "Chill Vibes",
            url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
            icon: "music",
            type: "SPOTIFY",
            position: 2,
            enabled: true,
          },
          {
            label: "SoundCloud",
            url: "https://soundcloud.com/chillhop-music",
            icon: "headphones",
            type: "SOUNDCLOUD",
            position: 3,
            enabled: true,
          },
          {
            label: "Links",
            url: "",
            icon: null,
            type: "HEADER",
            position: 4,
            enabled: true,
          },
          {
            label: "Blog sobre Music & Tech",
            url: "https://dev.to",
            icon: "book-open",
            type: "LINK",
            position: 5,
            enabled: true,
          },
          {
            label: "Me siga no Instagram",
            url: "https://instagram.com",
            icon: "camera",
            type: "LINK",
            position: 6,
            enabled: true,
          },
          {
            label: "Studio",
            url: "https://maps.google.com/?q=São+Paulo,+Brazil",
            icon: "map-pin",
            type: "MAP",
            position: 7,
            enabled: true,
          },
          {
            label: "WhatsApp",
            url: "5511999999999",
            icon: "message-circle",
            type: "WHATSAPP",
            position: 8,
            enabled: true,
          },
        ],
      },
    },
  });

  console.log("✅ Showcase tree created: /" + SHOWCASE_SLUG);
}

main()
  .catch((e) => {
    console.error("❌ Showcase seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
