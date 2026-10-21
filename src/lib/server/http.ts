import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from './db';
import { publishedArticles, validSlug } from '@/lib/writing/content';

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function handle(work: () => Promise<NextResponse>) {
  try { return await work(); } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ error: 'Invalid input' }, 400);
    console.error('Writing request failed:', error instanceof Error ? error.name : 'UnknownError');
    return json({ error: 'Service unavailable. Please retry.' }, 503);
  }
}
export function sameOrigin(request: NextRequest) {
  const configured = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const expected = configured ? new URL(configured).origin : request.nextUrl.origin;
  if (request.headers.get('origin') !== expected) throw new HttpError(403, 'Invalid origin');
}
export function published(slug: string) {
  if (!validSlug(slug) || !publishedArticles().some(p => p.id === slug)) throw new HttpError(404, 'Article not found');
}
export async function body(request: NextRequest) {
  // Bound actual bytes too; Content-Length is not trusted.
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Missing body');
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); throw new HttpError(413, 'Body too large'); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}
const cookieName = 'gy-writing-visitor';
function signature(id: string) {
  if (!process.env.BETTER_AUTH_SECRET) throw new Error('Visitor signing secret is missing');
  return createHmac('sha256', process.env.BETTER_AUTH_SECRET).update(id).digest('hex');
}
export async function visitor(request: NextRequest) {
  const [candidate, sig] = (request.cookies.get(cookieName)?.value ?? '').split('.');
  let id: string | undefined;
  if (candidate && /^[0-9a-f-]{36}$/.test(candidate) && sig && /^[0-9a-f]{64}$/.test(sig) &&
      timingSafeEqual(Buffer.from(sig), Buffer.from(signature(candidate)))) id = candidate;
  id ??= randomUUID();
  await db().visitor.upsert({ where: { id }, create: { id }, update: {} });
  return { id, attach(response: NextResponse) {
    response.cookies.set(cookieName, `${id}.${signature(id)}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 31536000 });
    return response;
  } };
}
export function ipSubject(request: NextRequest) {
  // Only enable behind the supplied Nginx config, which OVERWRITES X-Real-IP.
  const ip = process.env.TRUST_PROXY === '1' ? request.headers.get('x-real-ip') : null;
  const value = ip && isIP(ip) ? ip : 'untrusted';
  return createHmac('sha256', process.env.BETTER_AUTH_SECRET!).update(value).digest('hex');
}
export async function limit(request: NextRequest, id: string, action: 'comment' | 'like') {
  const policies = action === 'comment' ? [[60, 1], [3600, 5]] : [[60, 30]];
  const subjects = [`visitor:${id}`, `ip:${ipSubject(request)}`];
  const now = Date.now();
  // Lock counters in consistent order and check quotas in one transaction.
  await db().$transaction(async tx => {
    for (const subject of subjects) for (const [seconds, max] of policies) {
      const bucket = Math.floor(now / (seconds * 1000));
      const key = `${action}:${subject}:${seconds}:${bucket}`;
      const expiresAt = new Date((bucket + 1) * seconds * 1000);
      // RETURNING is the post-increment value. Prisma upsert can hand back the previous count.
      const rows = await tx.$queryRaw<Array<{ count: number }>>`
        INSERT INTO "RateLimit" ("key", "count", "expiresAt")
        VALUES (${key}, 1, ${expiresAt})
        ON CONFLICT ("key") DO UPDATE SET "count" = "RateLimit"."count" + 1
        RETURNING "count"`;
      if (Number(rows[0]?.count) > max) throw new HttpError(429, 'Too many requests. Please try later.');
    }
  });
}
export async function setLike(slug: string, visitorId: string, liked: boolean) {
  if (liked) await db().like.createMany({ data: [{ slug, visitorId }], skipDuplicates: true });
  else await db().like.deleteMany({ where: { slug, visitorId } });
  return { liked, likes: await db().like.count({ where: { slug } }) };
}
export const commentInput = z.object({ nickname: z.string().trim().min(1).max(30), text: z.string().trim().min(1).max(500) }).strict();
export const reviewInput = z.object({ status: z.enum(['APPROVED', 'REJECTED', 'HIDDEN']) }).strict();
export const publicCommentFields = { id: true, nickname: true, text: true, createdAt: true } satisfies Prisma.CommentSelect;
