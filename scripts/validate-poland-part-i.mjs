import fs from 'node:fs';
import assert from 'node:assert/strict';
import { marked } from 'marked';
import { createHash } from 'node:crypto';

const dir = 'src/content/articles';
const articles = fs.readdirSync(dir).filter(file => file.endsWith('.json')).map(file => JSON.parse(fs.readFileSync(`${dir}/${file}`, 'utf8')));
const poland = articles.filter(article => article.campaignId === 'poland-1939');
const sources = new Set(JSON.parse(fs.readFileSync('src/data/sources.json', 'utf8')).map(source => source.id));
const targets = new Map(articles.map(article => [article.slug, new Set([
  ...Array.from(marked.parse(article.body).matchAll(/\bid="([^"]+)"/g), match => match[1]),
  'article-top', 'article-sources', ...(article.evidenceNotes?.length ? ['article-notes'] : []),
  ...article.sourceIds.map(id => `source-${id}`), ...(article.evidenceNotes || []).map(note => note.id),
]) ]));
assert.equal(poland.length, 6);
const counts = [20,27,22,22,25];
const studies = poland.filter(article => !article.isCollectionIntroduction).sort((a,b) => a.historicalDate.localeCompare(b.historicalDate));
const noteNumbers = [];
let asides = 0, tables = 0, checkedLinks = 0;
for (const [index, article] of studies.entries()) {
  assert.equal(article.evidenceNotes.length, counts[index], article.slug);
  assert.equal(new Set(article.asideNavigation.map(aside => aside.id)).size, article.asideNavigation.length, 'Asides need distinct destinations');
  assert.equal(article.reviewedBodySha256, createHash('sha256').update(article.body).digest('hex'));
  for (const note of article.evidenceNotes) {
    noteNumbers.push(Number(note.id.replace('part-i-note-', '')));
    assert(note.text.length > 20 && note.sourceIds.length);
    assert(article.body.includes(`id="ref-${note.id}"`) && article.body.includes(`href="#${note.id}"`), `Unlinked note ${note.id}`);
    for (const id of note.sourceIds) assert(sources.has(id) && article.sourceIds.includes(id), `Unknown note source ${id}`);
  }
  for (const aside of article.asideNavigation) {
    assert(targets.get(article.slug).has(aside.id), `Missing aside ${aside.id}`);
    assert(article.sections.some(section => section.asides?.some(item => item.id === aside.id)), `Aside absent from contents: ${aside.id}`);
    asides++;
  }
  tables += (article.body.match(/<table\b/g) || []).length;
}
assert.deepEqual(noteNumbers.sort((a,b) => a-b), Array.from({ length:116 }, (_,i) => i+1));
assert.equal(asides, 15); assert.equal(tables, 2);
for (const article of poland) {
  const html = marked.parse(article.body);
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `Duplicate passage IDs: ${article.slug}`);
  assert(!/\(chapter \d+\)|\[\[note:|BodyFirst|Heading[1-4]/i.test(html), `Book extraction residue: ${article.slug}`);
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href=match[1];
    if (href.startsWith('#')) assert(targets.get(article.slug).has(href.slice(1)), `Broken anchor ${article.slug}${href}`);
    else if (href.startsWith('/articles/')) {
      const url=new URL(href,'https://ostkrieg.com');
      const slug=url.pathname.split('/').pop();
      assert(targets.has(slug), `Broken study link ${href}`);
      if (url.hash) assert(targets.get(slug).has(url.hash.slice(1)), `Broken study fragment ${href}`);
    }
    checkedLinks++;
  }
}
for (const article of articles.filter(article => article.campaignId !== 'poland-1939')) assert(!article.evidenceNotes, 'Part I notes leaked to another collection');
console.log(`Validated 6 Poland pages, 15 linked asides, 2 tables, all 116 notes and ${checkedLinks} body links.`);
