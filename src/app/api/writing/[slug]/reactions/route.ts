import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { handle, json, published, visitor } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return handle(async () => {
    const { slug } = await params; published(slug); const v = await visitor(request);
    const [likes, liked, comments] = await Promise.all([
      db().like.count({ where: { slug } }), db().like.findUnique({ where: { slug_visitorId: { slug, visitorId: v.id } } }),
      db().comment.count({ where: { slug, status: 'APPROVED' } }),
    ]);
    return v.attach(json({ likes, liked: Boolean(liked), comments }));
  });
}
