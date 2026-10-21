import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { CATEGORIES, type CategoryId, type LocalizedPost } from '@/lib/data/posts';
import type { Locale } from '@/i18n/routing';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(value);
  return !Number.isNaN(+parsed) && parsed.toISOString().slice(0, 10) === value;
}, 'Invalid calendar date');
const frontmatter = z.object({
  title: z.string().trim().min(1), summary: z.string().trim().min(1),
  category: z.custom<CategoryId>(value => CATEGORIES.some(c => c.id === value), 'Invalid article category'), date,
  updated: date.optional(), draft: z.boolean(),
});
export interface Article extends LocalizedPost {
  locale: Locale; body: string; draft: boolean; updated?: string;
}
export const validSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
export const validCategory = (value: string | null): value is CategoryId => CATEGORIES.some(c => c.id === value);
export function parseArticle(source: string, slug: string, locale: Locale): Article {
  if (!validSlug(slug)) throw new Error(`Invalid slug: ${slug}`);
  const { data, content } = matter(source);
  const meta = frontmatter.parse(data);
  if (meta.updated && meta.updated < meta.date) throw new Error(`${slug}: updated precedes publication`);
  if (!meta.draft && !content.trim()) throw new Error(`${slug}/${locale}: published body is empty`);
  const cjk = content.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const words = content.replace(/[\u3400-\u9fff]/g, ' ').match(/\b[\w'-]+\b/g)?.length ?? 0;
  return { id: slug, locale, cat: meta.category, catLabel: CATEGORIES.find(c => c.id === meta.category)![locale],
    title: meta.title, summary: meta.summary, date: meta.date, updated: meta.updated,
    read: Math.max(1, Math.ceil(cjk / 400 + words / 220)), body: content, draft: meta.draft };
}
export function readArticles(root = path.join(process.cwd(), 'content/writing')): Article[] {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).flatMap(d => {
    if (!validSlug(d.name)) throw new Error(`Invalid article directory: ${d.name}`);
    return (['zh', 'en'] as const).flatMap(locale => {
      const file = path.join(root, d.name, `${locale}.md`);
      return fs.existsSync(file) ? [parseArticle(fs.readFileSync(file, 'utf8'), d.name, locale)] : [];
    });
  });
}
export const sortArticles = <T extends Pick<Article, 'date' | 'id'>>(articles: T[]) =>
  [...articles].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
export function publishedArticles(locale?: Locale) {
  return sortArticles(readArticles().filter(p => !p.draft && (!locale || p.locale === locale)));
}
export function adjacentArticles(articles: Article[], slug: string) {
  const sorted = sortArticles(articles);
  const index = sorted.findIndex(p => p.id === slug);
  return index < 0 ? {} : { previous: sorted[index - 1], next: sorted[index + 1] };
}
