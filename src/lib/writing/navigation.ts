import { CATEGORIES, type CategoryId } from '@/lib/data/posts';
export const validCategory = (value: string | null): value is CategoryId => CATEGORIES.some(c => c.id === value);
export function returnToWriting(cat: string | null, from: string | null) {
  const query = validCategory(cat) ? `?cat=${cat}` : '';
  const anchor = from && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(from) ? `#${from}` : '';
  return `/writing${query}${anchor}`;
}
