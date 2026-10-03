import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  // useTextProtocol avoids a MySQL error 1267 ("Illegal mix of collations")
  // that some MariaDB server versions throw on contains()/LIKE filters —
  // the binary protocol's default param binding sends the pattern string
  // without the column's collation attached.
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string, { useTextProtocol: true });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
