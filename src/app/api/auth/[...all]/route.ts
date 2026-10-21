import { NextRequest } from 'next/server';
import { createAuth } from '@/lib/server/auth';
import { handle, sameOrigin } from '@/lib/server/http';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
async function authRequest(request: NextRequest) {
  return handle(async () => {
    if (request.method !== 'GET') sameOrigin(request);
    const response = await createAuth().handler(request);
    const result = new NextResponse(response.body, response);
    result.headers.set('Cache-Control', 'no-store');
    return result;
  });
}
export const GET = authRequest;
export const POST = authRequest;
