import { db } from '@/lib/server/db';
import { handle, json } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export function GET() { return handle(async () => {
  if (!process.env.BETTER_AUTH_URL || !process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) throw new Error('Writing authentication is not configured');
  await db().$queryRaw`SELECT 1 FROM "Comment" LIMIT 1`;
  await db().$queryRaw`SELECT 1 FROM "Like" LIMIT 1`;
  return json({ status: 'ok' });
}); }
