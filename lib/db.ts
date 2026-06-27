import { PrismaClient } from "@prisma/client";
import { demoStore } from "./demo/store";

// DEMO mode: use an in-memory store so the app runs with no Postgres.
export const DEMO = process.env.DEMO === "1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function realClient(): PrismaClient {
  return (
    globalForPrisma.prisma ??
    new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    })
  );
}

export const prisma: PrismaClient = DEMO
  ? (demoStore as unknown as PrismaClient)
  : realClient();

if (!DEMO && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
