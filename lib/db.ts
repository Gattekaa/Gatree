import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.GATREE_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (databaseUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    });
  }

  const connectionUrl = new URL(databaseUrl);
  if (process.env.NODE_ENV === "production" && !["localhost", "127.0.0.1", "[::1]"].includes(connectionUrl.hostname)) {
    connectionUrl.searchParams.set("sslmode", "verify-full");
  }
  const pool = new Pool({
    connectionString: connectionUrl.toString(),
    connectionTimeoutMillis: 10_000,
    
    keepAlive: true,
    
    idleTimeoutMillis: 60_000,
    
    max: 10,
  });

  const schema = new URL(databaseUrl).searchParams.get("schema") || "public";
  const adapter = new PrismaPg(pool, { schema });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
