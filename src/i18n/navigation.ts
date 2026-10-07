import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// 带语言前缀的导航 API，组件内统一从这里引入，而不是 next/link / next/navigation
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
