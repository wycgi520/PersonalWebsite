/** 文章分类。新增分类只需在这里追加一项，筛选与标签会自动出现 */
export const CATEGORIES = [
  { id: 'tech', zh: '技术', en: 'Engineering' },
  { id: 'life', zh: '生活', en: 'Life' },
  { id: 'note', zh: '随笔', en: 'Notes' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export interface LocalizedCategory { id: CategoryId; label: string }
export interface LocalizedPost {
  id: string; cat: CategoryId; catLabel: string; date: string;
  read: number; title: string; summary: string;
}
export function localizeCategories(locale: 'zh' | 'en'): LocalizedCategory[] {
  return CATEGORIES.map(c => ({id: c.id, label: c[locale]}));
}
export function archiveByYear(list: {date: string}[]) {
  const counts = new Map<string, number>();
  for (const p of list) counts.set(p.date.slice(0,4), (counts.get(p.date.slice(0,4)) ?? 0) + 1);
  return [...counts].sort(([a],[b]) => b.localeCompare(a)).map(([year,count]) => ({year,count}));
}
