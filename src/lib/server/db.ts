import { PrismaClient } from '@prisma/client';
const globalDb = globalThis as unknown as { writingDb?: PrismaClient };
export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return globalDb.writingDb ??= new PrismaClient();
}
