import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 跳过 API、Next 内部资源和带扩展名的静态文件
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
