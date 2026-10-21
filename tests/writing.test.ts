import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArticle, readArticles, sortArticles, adjacentArticles } from '../src/lib/writing/content';
import { renderMarkdown } from '../src/lib/writing/markdown';
import { returnToWriting } from '../src/lib/writing/navigation';
const source = (draft = false, body = '## Heading\n\n正文 text') => `---\ntitle: Test\nsummary: Summary\ncategory: tech\ndate: "2026-10-21"\ndraft: ${draft}\n---\n${body}`;
test('content validates dates, required metadata, draft state and nonempty publication', () => {
  assert.equal(parseArticle(source(), 'example', 'zh').read, 1);
  assert.throws(() => parseArticle(source().replace('2026-10-21', '2026-02-30'), 'example', 'zh'));
  assert.throws(() => parseArticle(source().replace('draft: false', ''), 'example', 'zh'));
  assert.throws(() => parseArticle(source(false, ''), 'example', 'zh'));
  assert.throws(() => parseArticle(source(), '../escape', 'zh'));
  assert.equal(parseArticle(source(true, ''), 'example', 'zh').draft, true);
});
test('locale files are independent and absent translations are not invented', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-test-'));
  try {
    fs.mkdirSync(path.join(root, 'example'));
    fs.writeFileSync(path.join(root, 'example/zh.md'), source());
    const rows = readArticles(root);
    assert.equal(rows.length, 1); assert.equal(rows[0].locale, 'zh');
  } finally {fs.rmSync(root, {recursive: true});}
});
test('chronology is deterministic, with newer previous and older next', () => {
  const a = parseArticle(source(), 'a', 'zh'); const b = {...a, id: 'b'}; const c = {...a, id: 'c', date: '2026-01-01'};
  assert.deepEqual(sortArticles([c,b,a]).map(p => p.id), ['a','b','c']);
  assert.equal(adjacentArticles([c,b,a], 'b').previous?.id, 'a');
  assert.equal(adjacentArticles([c,b,a], 'b').next?.id, 'c');
  assert.equal(adjacentArticles([c,b,a], 'a').previous, undefined);
  assert.equal(adjacentArticles([c,b,a], 'c').next, undefined);
  assert.deepEqual(adjacentArticles([a], 'unknown'), {});
});
test('Markdown escapes HTML, removes executable links and creates unique CJK anchors', async () => {
  const {html, headings} = await renderMarkdown('## 标题\n\n<script>alert(1)</script>\n\n## 标题\n\n[bad](javascript:alert%281%29)\n\n```ts\nconst value = 1;\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |');
  assert.deepEqual(headings.map(h => h.id), ['标题','标题-1']);
  assert.ok(!html.includes('<script')); assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('hljs-keyword')); assert.ok(html.includes('<table>'));
});
test('return links only preserve valid categories and article anchors', () => {
  assert.equal(returnToWriting('tech','example'), '/writing?cat=tech#example');
  assert.equal(returnToWriting('https://evil.test','../escape'), '/writing');
});
