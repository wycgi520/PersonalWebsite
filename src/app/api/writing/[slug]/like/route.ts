import { NextRequest } from 'next/server';
import { z } from 'zod';
import { body, handle, json, limit, published, sameOrigin, setLike, visitor } from '@/lib/server/http';
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return handle(async () => {
    sameOrigin(request); const { slug } = await params; published(slug);
    const input = z.object({ liked: z.boolean() }).strict().parse(await body(request));
    const v = await visitor(request); await limit(request, v.id, 'like');
    return v.attach(json(await setLike(slug, v.id, input.liked)));
  });
}
