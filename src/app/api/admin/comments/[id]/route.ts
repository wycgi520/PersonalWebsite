import { NextRequest } from 'next/server';
import { administrator } from '@/lib/server/auth';
import { db } from '@/lib/server/db';
import { body, handle, HttpError, json, reviewInput, sameOrigin } from '@/lib/server/http';
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    sameOrigin(request); const admin = await administrator(request.headers);
    if (!admin) throw new HttpError(403, 'Administrator required');
    const { id } = await params; const { status } = reviewInput.parse(await body(request));
    if (!await db().comment.findUnique({ where: { id } })) throw new HttpError(404, 'Comment not found');
    await db().$transaction(async tx => {
      await tx.comment.update({ where: { id }, data: { status } });
      await tx.review.create({ data: { commentId: id, adminId: admin.id, status } });
    });
    return json({ status });
  });
}
