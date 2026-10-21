import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import type { Root, Element, Text } from 'hast';

export interface Heading { id: string; title: string; level: number }
export async function renderMarkdown(body: string) {
  const headings: Heading[] = [];
  const slugger = new GithubSlugger();
  const text = (node: Element | Text): string => node.type === 'text' ? node.value : node.children.map(c => c.type === 'element' || c.type === 'text' ? text(c) : '').join('');
  const result = await unified().use(remarkParse).use(remarkGfm).use(remarkRehype)
    .use(() => (tree: Root) => {
      visit(tree, 'element', (node) => {
        if (/^h[1-6]$/.test(node.tagName)) {
          const title = text(node); const id = slugger.slug(title);
          node.properties.id = id;
          if (/^h[23]$/.test(node.tagName)) headings.push({ id, title, level: Number(node.tagName[1]) });
        }
        for (const key of ['href', 'src']) {
          const value = node.properties[key];
          if (typeof value === 'string' && !/^(https?:\/\/|mailto:|#|\/(?!\/)|\.?\.?\/)/i.test(value)) {
            // Relative asset names are safe; reject every explicit or encoded protocol.
            if (/[:\\\u0000-\u0020]/.test(value) || /%3a/i.test(value)) delete node.properties[key];
          }
          if (typeof value === 'string' && value.startsWith('//')) delete node.properties[key];
        }
        if (node.tagName === 'img') { node.properties.loading = 'lazy'; node.properties.decoding = 'async'; }
      });
    }).use(rehypeHighlight, { detect: false, ignoreMissing: true }).use(rehypeStringify).process(body);
  return { html: String(result), headings };
}
