import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { body, commentInput, handle, HttpError, json, limit, publicCommentFields, published, sameOrigin, visitor } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return handle(async () => {
    const { slug } = await params; published(slug);
    const cursor = request.nextUrl.searchParams.get('cursor');
    const anchor = cursor ? await db().comment.findFirst({ where: { id: cursor, slug, status: 'APPROVED' } }) : null;
    if (cursor && !anchor) throw new HttpError(400, 'Invalid cursor');
    const rows = await db().comment.findMany({ where: { slug, status: 'APPROVED', ...(anchor ? { OR: [
      { createdAt: { gt: anchor.createdAt } }, { createdAt: anchor.createdAt, id: { gt: anchor.id } },
    ] } : {}) }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: 21, select: publicCommentFields });
    return json({ items: rows.slice(0, 20), nextCursor: rows.length > 20 ? rows[19].id : null });
  });
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return handle(async () => {
    sameOrigin(request); const { slug } = await params; published(slug);
    const input = commentInput.parse(await body(request)); const v = await visitor(request);
    await limit(request, v.id, 'comment');
    await db().comment.create({ data: { slug, visitorId: v.id, ...input } });
    return v.attach(json({ status: 'PENDING' }, 202));
  });
}
