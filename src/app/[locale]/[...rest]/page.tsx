import { notFound } from 'next/navigation';

// 让 [locale] 下的未知路径渲染本地化的 not-found.tsx（next-intl 推荐做法）
export default function CatchAllPage() {
  notFound();
}
