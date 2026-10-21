import { readArticles } from '../src/lib/writing/content';
const articles = readArticles();
console.log(`Content valid: ${articles.length} language files, ${articles.filter(p => !p.draft).length} published.`);
