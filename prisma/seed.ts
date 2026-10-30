import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { addHours, startOfDay, subDays } from "date-fns";
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

const USER_EMAIL = "vinihbieel49@gmail.com";

const LOCATION_HIERARCHY: {
  country: string;
  weight: number;
  regions: { name: string; cities: string[] }[];
}[] = [
  {
    country: "BR",
    weight: 5,
    regions: [
      { name: "SP", cities: ["São Paulo", "Campinas", "Santos"] },
      { name: "RJ", cities: ["Rio de Janeiro", "Niterói", "Petrópolis"] },
      { name: "MG", cities: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"] },
      { name: "RS", cities: ["Porto Alegre", "Caxias do Sul", "Pelotas"] },
      { name: "PR", cities: ["Curitiba", "Londrina", "Maringá"] },
      { name: "BA", cities: ["Salvador", "Feira de Santana"] },
    ],
  },
  {
    country: "US",
    weight: 3,
    regions: [
      { name: "CA", cities: ["Los Angeles", "San Francisco", "San Diego"] },
      { name: "NY", cities: ["New York", "Brooklyn", "Buffalo"] },
      { name: "TX", cities: ["Houston", "Austin", "Dallas"] },
      { name: "FL", cities: ["Miami", "Orlando", "Tampa"] },
    ],
  },
  {
    country: "PT",
    weight: 2,
    regions: [
      { name: "Lisboa", cities: ["Lisboa", "Sintra", "Cascais"] },
      { name: "Porto", cities: ["Porto", "Vila Nova de Gaia", "Matosinhos"] },
    ],
  },
  {
    country: "DE",
    weight: 1,
    regions: [
      { name: "Berlin", cities: ["Berlin"] },
      { name: "Bayern", cities: ["München", "Nürnberg"] },
      { name: "NRW", cities: ["Köln", "Düsseldorf"] },
    ],
  },
  {
    country: "FR",
    weight: 1,
    regions: [
      { name: "Île-de-France", cities: ["Paris", "Versailles"] },
      { name: "PACA", cities: ["Marseille", "Nice"] },
    ],
  },
  {
    country: "AR",
    weight: 2,
    regions: [
      { name: "Buenos Aires", cities: ["Buenos Aires", "La Plata"] },
      { name: "Córdoba", cities: ["Córdoba", "Villa Carlos Paz"] },
    ],
  },
  {
    country: "MX",
    weight: 1,
    regions: [
      { name: "CDMX", cities: ["Ciudad de México", "Coyoacán"] },
      { name: "Jalisco", cities: ["Guadalajara", "Puerto Vallarta"] },
    ],
  },
  {
    country: "JP",
    weight: 1,
    regions: [
      { name: "Tokyo", cities: ["Tokyo", "Shibuya"] },
      { name: "Osaka", cities: ["Osaka", "Kyoto"] },
    ],
  },
  {
    country: "GB",
    weight: 1,
    regions: [
      { name: "England", cities: ["London", "Manchester", "Birmingham"] },
      { name: "Scotland", cities: ["Edinburgh", "Glasgow"] },
    ],
  },
  {
    country: "CA",
    weight: 1,
    regions: [
      { name: "Ontario", cities: ["Toronto", "Ottawa"] },
      { name: "BC", cities: ["Vancouver", "Victoria"] },
    ],
  },
];

const WEIGHTED_LOCATIONS: typeof LOCATION_HIERARCHY[number][] = LOCATION_HIERARCHY.flatMap((loc) =>
  Array.from({ length: loc.weight }, () => loc)
);

function randomLocation(): { country: string; region: string; city: string } {
  const loc = randomFrom(WEIGHTED_LOCATIONS);
  const region = randomFrom(loc.regions);
  const city = randomFrom(region.cities);
  return { country: loc.country, region: region.name, city };
}

const DEVICES = ["mobile", "desktop", "tablet"];
const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Opera"];
const REFERRERS = [
  "instagram.com",
  "twitter.com",
  "google.com",
  "facebook.com",
  "linkedin.com",
  "tiktok.com",
  null,
  null,
  null,
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  const time = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return addHours(new Date(time), randomInt(0, 23));
}

async function main() {
  console.log("🌱 Seeding database...");

  let user = await db.user.findUnique({ where: { email: USER_EMAIL } });
  if (!user) {
    user = await db.user.create({
      data: {
        email: USER_EMAIL,
        name: "Vinícius Martins",
        image: null,
        emailVerified: new Date(),
      },
    });
    console.log("✅ User created:", user.email);
  } else {
    console.log("✅ User found:", user.email);
  }

  await db.tree.deleteMany({ where: { userId: user.id } });
  console.log("🗑️  Cleared existing trees");

  await db.analyticsEvent.deleteMany({});
  console.log("🗑️  Cleared analytics events");

  const now = new Date();

  const tree1 = await db.tree.create({
    data: {
      title: "Vinícius Martins",
      description: "Desenvolvedor Full Stack · Links pessoais e profissionais",
      slug: "vinicius",
      userId: user.id,
      status: "ACTIVE",
      createdAt: subDays(now, 120),
      theme: "midnight",
      background: {
        type: "animated",
        value: "aurora",
        config: { base: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" },
      },
      linkStyle: {
        variant: "filled",
        radius: "rounded",
        bgColor: "rgba(255,255,255,0.08)",
        textColor: "#ffffff",
      },
      seoTitle: "Vinícius Martins - Links",
      seoDescription: "Todos os meus links em um só lugar",
      links: {
        create: [
          {
            label: "Meu Portfólio",
            url: "https://viniciusmartins.dev",
            icon: "globe",
            type: "LINK",
            position: 0,
            enabled: true,
          },
          {
            label: "GitHub",
            url: "https://github.com/viniciusmartins",
            icon: "github",
            type: "LINK",
            position: 1,
            enabled: true,
          },
          {
            label: "LinkedIn",
            url: "https://linkedin.com/in/viniciusmartins",
            icon: "linkedin",
            type: "LINK",
            position: 2,
            enabled: true,
          },
          {
            label: "Projetos",
            url: "",
            icon: null,
            type: "HEADER",
            position: 3,
            enabled: true,
          },
          {
            label: "Gatree - Link in Bio",
            url: "https://gatree.app",
            icon: "link",
            type: "LINK",
            position: 4,
            enabled: true,
          },
          {
            label: "Lofi Coding Playlist",
            url: "https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS",
            icon: "music",
            type: "SPOTIFY",
            position: 5,
            enabled: true,
          },
          {
            label: "Me manda um email",
            url: "vinihbieel49@gmail.com",
            icon: "mail",
            type: "EMAIL",
            position: 6,
            enabled: true,
          },
          {
            label: "WhatsApp",
            url: "5511999999999",
            icon: "message-circle",
            type: "WHATSAPP",
            position: 7,
            enabled: true,
          },
        ],
      },
    },
    include: { links: true },
  });
  console.log("🌳 Tree 1 created:", tree1.title);

  const tree2 = await db.tree.create({
    data: {
      title: "Beats & Code",
      description: "Music producer & developer. Listen to my beats 🎵",
      slug: "beats-and-code",
      userId: user.id,
      status: "ACTIVE",
      createdAt: subDays(now, 95),
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
      seoDescription: "Beats, code e conteúdo sobre produção musical e programação",
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
            label: "Beat Tape Vol. 3",
            url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            icon: "play",
            type: "YOUTUBE",
            position: 1,
            enabled: true,
          },
          {
            label: "Chill Vibes Mix",
            url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
            icon: "music",
            type: "SPOTIFY",
            position: 2,
            enabled: true,
          },
          {
            label: "SoundCloud Profile",
            url: "https://soundcloud.com/chillhop-music",
            icon: "headphones",
            type: "SOUNDCLOUD",
            position: 3,
            enabled: true,
          },
          {
            label: "Conteúdo",
            url: "",
            icon: null,
            type: "HEADER",
            position: 4,
            enabled: true,
          },
          {
            label: "Como eu faço beats com código",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            icon: "play",
            type: "YOUTUBE",
            position: 5,
            enabled: true,
          },
          {
            label: "Blog sobre Music & Tech",
            url: "https://dev.to",
            icon: "book-open",
            type: "LINK",
            position: 6,
            enabled: true,
          },
          {
            label: "Me siga no Instagram",
            url: "https://instagram.com",
            icon: "camera",
            type: "LINK",
            position: 7,
            enabled: true,
          },
          {
            label: "Studio localização",
            url: "https://maps.google.com/?q=São+Paulo,+Brazil",
            icon: "map-pin",
            type: "MAP",
            position: 8,
            enabled: true,
          },
        ],
      },
    },
    include: { links: true },
  });
  console.log("🌳 Tree 2 created:", tree2.title);

  const tree3 = await db.tree.create({
    data: {
      title: "TechStartup Co.",
      description: "Building the future of productivity. YC W24.",
      slug: "techstartup",
      userId: user.id,
      status: "ACTIVE",
      createdAt: subDays(now, 60),
      theme: "clean-white",
      background: {
        type: "solid",
        value: "#0a0a0b",
        config: {},
      },
      linkStyle: {
        variant: "filled",
        radius: "rounded",
        bgColor: "rgba(255,255,255,0.05)",
        textColor: "#ffffff",
      },
      seoTitle: "TechStartup Co. - Links",
      seoDescription: "Conheça nossa startup de produtividade",
      links: {
        create: [
          {
            label: "Nosso produto",
            url: "https://linear.app",
            icon: "rocket",
            type: "LINK",
            position: 0,
            enabled: true,
          },
          {
            label: "Estamos contratando!",
            url: "https://careers.notion.so",
            icon: "briefcase",
            type: "LINK",
            position: 1,
            enabled: true,
          },
          {
            label: "Demo do Produto",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            icon: "play",
            type: "YOUTUBE",
            position: 2,
            enabled: true,
          },
          {
            label: "Fale com nosso time",
            url: "contact@techstartup.co",
            icon: "mail",
            type: "EMAIL",
            position: 3,
            enabled: true,
          },
          {
            label: "Ligar comercial",
            url: "+5511988887777",
            icon: "phone",
            type: "PHONE",
            position: 4,
            enabled: true,
          },
          {
            label: "Sobre nós",
            url: "",
            icon: null,
            type: "TEXT",
            position: 5,
            enabled: true,
          },
          {
            label: "Twitter / X",
            url: "https://x.com",
            icon: "at-sign",
            type: "LINK",
            position: 6,
            enabled: true,
          },
        ],
      },
    },
    include: { links: true },
  });
  console.log("🌳 Tree 3 created:", tree3.title);

  const tree4 = await db.tree.create({
    data: {
      title: "Projeto Secreto",
      description: "Em breve...",
      slug: "projeto-secreto",
      userId: user.id,
      status: "INACTIVE",
      links: {
        create: [
          {
            label: "Coming Soon",
            url: "https://example.com",
            icon: "lock",
            type: "LINK",
            position: 0,
            enabled: true,
          },
        ],
      },
    },
    include: { links: true },
  });
  console.log("🌳 Tree 4 created:", tree4.title, "(inactive)");

  console.log("\n📊 Generating analytics data...");

  const trees = [tree1, tree2, tree3];

  for (const tree of trees) {
    const viewsPerDay = tree.id === tree1.id ? 45 : tree.id === tree2.id ? 30 : 20;
    const clickRate = 0.35;

    const treeViewEvents: {
      sourceType: string;
      sourceId: string;
      country: string | null;
      region: string | null;
      city: string | null;
      device: string;
      browser: string;
      referrer: string | null;
      createdAt: Date;
    }[] = [];

    const linkClickEvents: {
      sourceType: string;
      sourceId: string;
      country: string | null;
      region: string | null;
      city: string | null;
      device: string;
      browser: string;
      referrer: string | null;
      createdAt: Date;
    }[] = [];

    for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
      const dayStart = startOfDay(subDays(now, daysAgo));

      const growthFactor = 1 + (90 - daysAgo) / 90 * 0.6;

      const dayOfWeek = dayStart.getDay();
      const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;

      const noise = 0.7 + Math.random() * 0.6;

      const dayViews = Math.round(viewsPerDay * growthFactor * weekendFactor * noise);

      for (let v = 0; v < dayViews; v++) {
        const createdAt = randomDate(dayStart, addHours(dayStart, 23));
        const location = randomLocation();
        const device = randomFrom(DEVICES);

        treeViewEvents.push({
          sourceType: "tree_view",
          sourceId: tree.id,
          country: location.country,
          region: location.region,
          city: location.city,
          device,
          browser: randomFrom(BROWSERS),
          referrer: randomFrom(REFERRERS),
          createdAt,
        });

        if (Math.random() < clickRate) {
          const enabledLinks = tree.links.filter(
            (l) => l.enabled && l.type !== "HEADER" && l.type !== "TEXT"
          );
          if (enabledLinks.length > 0) {

            const weights = enabledLinks.map((_, i) => Math.max(1, enabledLinks.length - i));
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let r = Math.random() * totalWeight;
            let selectedLink = enabledLinks[0];
            for (let i = 0; i < enabledLinks.length; i++) {
              r -= weights[i];
              if (r <= 0) {
                selectedLink = enabledLinks[i];
                break;
              }
            }

            linkClickEvents.push({
              sourceType: "link_click",
              sourceId: selectedLink.id,
              country: location.country,
              region: location.region,
              city: location.city,
              device,
              browser: randomFrom(BROWSERS),
              referrer: randomFrom(REFERRERS),
              createdAt: addHours(createdAt, Math.random() * 0.1),
            });
          }
        }
      }
    }

    const BATCH_SIZE = 500;
    for (let i = 0; i < treeViewEvents.length; i += BATCH_SIZE) {
      await db.analyticsEvent.createMany({
        data: treeViewEvents.slice(i, i + BATCH_SIZE),
      });
    }

    for (let i = 0; i < linkClickEvents.length; i += BATCH_SIZE) {
      await db.analyticsEvent.createMany({
        data: linkClickEvents.slice(i, i + BATCH_SIZE),
      });
    }

    console.log(
      `  📈 ${tree.title}: ${treeViewEvents.length} views, ${linkClickEvents.length} clicks (90 days)`
    );
  }

  console.log("\n🔗 Creating short links...");

  await db.shortLink.deleteMany({ where: { userId: user.id } });

  const shortLinks = await Promise.all([
    db.shortLink.create({
      data: {
        slug: "portfolio",
        url: "https://viniciusmartins.dev",
        title: "Meu Portfólio",
        description: "Site pessoal com projetos e experiência",
        userId: user.id,
        createdAt: subDays(now, 45),
      },
    }),
    db.shortLink.create({
      data: {
        slug: "github",
        url: "https://github.com/viniciusmartins",
        title: "GitHub Profile",
        userId: user.id,
        createdAt: subDays(now, 38),
      },
    }),
    db.shortLink.create({
      data: {
        slug: "linkedin",
        url: "https://linkedin.com/in/viniciusmartins",
        title: "LinkedIn",
        userId: user.id,
        createdAt: subDays(now, 30),
      },
    }),
    db.shortLink.create({
      data: {
        slug: "gatree-demo",
        url: "https://gatree.app/vinicius",
        title: "Demo do Gatree",
        description: "Minha página de links no Gatree",
        userId: user.id,
        createdAt: subDays(now, 25),
      },
    }),
    db.shortLink.create({
      data: {
        slug: "projeto-x",
        url: "https://projeto-secreto.vercel.app",
        title: "Projeto X (protegido)",
        passwordHash: "$2b$10$Hu3lCks1LuBXzfunXoMqw.LktCgOd4ifq56ozi0fuJAkhq24htWhS",
        userId: user.id,
        createdAt: subDays(now, 20),
      },
    }),
    db.shortLink.create({
      data: {
        slug: "promo-verao",
        url: "https://store.example.com/summer-sale",
        title: "Promoção de Verão",
        description: "Link temporário para campanha",
        expiresAt: subDays(now, 2),
        userId: user.id,
        createdAt: subDays(now, 15),
      },
    }),
    db.shortLink.create({
      data: {
        slug: "deck-2025",
        url: "https://pitch.com/public/my-startup-deck",
        title: "Pitch Deck 2025",
        description: "Deck para investidores",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user.id,
        createdAt: subDays(now, 10),
      },
    }),
  ]);

  console.log(`  ✅ ${shortLinks.length} short links created`);

  console.log("📊 Generating short link analytics...");

  const clicksConfig: { link: typeof shortLinks[number]; clicksPerDay: number }[] = [
    { link: shortLinks[0], clicksPerDay: 25 },
    { link: shortLinks[1], clicksPerDay: 18 },
    { link: shortLinks[2], clicksPerDay: 12 },
    { link: shortLinks[3], clicksPerDay: 35 },
    { link: shortLinks[4], clicksPerDay: 5 },
    { link: shortLinks[5], clicksPerDay: 8 },
    { link: shortLinks[6], clicksPerDay: 15 },
  ];

  for (const { link, clicksPerDay } of clicksConfig) {
    const linkAge = Math.floor((now.getTime() - link.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysToGenerate = Math.min(linkAge, 60);

    const events: {
      sourceType: string;
      sourceId: string;
      country: string | null;
      region: string | null;
      city: string | null;
      device: string | null;
      browser: string | null;
      referrer: string | null;
      createdAt: Date;
    }[] = [];

    for (let daysAgo = 0; daysAgo < daysToGenerate; daysAgo++) {

      if (link.expiresAt && subDays(now, daysAgo) > link.expiresAt) {
        continue;
      }

      const dayStart = startOfDay(subDays(now, daysAgo));

      const growthFactor = 1 + (daysToGenerate - daysAgo) / daysToGenerate * 0.5;
      const weekendFactor = dayStart.getDay() === 0 || dayStart.getDay() === 6 ? 1.2 : 1;
      const noise = 0.6 + Math.random() * 0.8;

      const dayClicks = Math.round(clicksPerDay * growthFactor * weekendFactor * noise);

      for (let c = 0; c < dayClicks; c++) {
        const createdAt = randomDate(dayStart, addHours(dayStart, 23));
        const location = randomLocation();
        const device = randomFrom(DEVICES);

        events.push({
          sourceType: "short_link_click",
          sourceId: link.id,
          country: location.country,
          region: location.region,
          city: location.city,
          device,
          browser: randomFrom(BROWSERS),
          referrer: randomFrom(REFERRERS),
          createdAt,
        });
      }
    }

    const BATCH_SIZE = 500;
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      await db.analyticsEvent.createMany({
        data: events.slice(i, i + BATCH_SIZE),
      });
    }

    console.log(`  📈 ${link.slug}: ${events.length} clicks (${daysToGenerate} days)`);
  }

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
