import { marked } from 'marked';

export const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const plainText = value => String(value || '').replace(/<sup\b[\s\S]*?<\/sup>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&(amp|lt|gt|quot|apos|nbsp|rsquo|lsquo|ndash|mdash);/g, (_, n) => ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',rsquo:'’',lsquo:'‘',ndash:'–',mdash:'—'}[n])).replace(/\s+/g, ' ').trim();

// Read the current article directly: there is no separately maintained prose cache.
// A reading connection never serves as evidence for a feature's military geometry.
export function studyContextFor(article) {
  if (!article) return null;
  const html = marked.parse(article.body);
  const sections = [{id:'article-top', label:'Opening context'}, ...(article.sections || []).map(s => ({id:s.id,label:s.label}))];
  const notes = new Map((article.evidenceNotes || []).map(n => [n.id,n]));
  let section = 'article-top', count = 0;
  const paragraphs = [];
  const prefix = article.phaseId ? `p${article.phaseId}` : article.campaignId === 'poland-1939' ? 'poland' : 'p1';
  for (const match of html.matchAll(/<h2\b[^>]*>[\s\S]*?<\/h2>|<(p|li)\b[^>]*>[\s\S]*?<\/\1>/gi)) {
    const block = match[0];
    if (/^<h2/i.test(block)) { section = block.match(/\bid="([^"]+)"/)?.[1] || section; continue; }
    const text = plainText(block);
    if (!text) continue;
    const sourceIds = [], sourceLocators = {}, evidenceNotes = [];
    for (const link of block.matchAll(/<a\b([^>]+)>([\s\S]*?)<\/a>/gi)) {
      const href = link[1].match(/href="([^"]+)"/)?.[1] || '';
      if (href.startsWith('#source-')) {
        const id = href.slice(8); if (!sourceIds.includes(id)) sourceIds.push(id);
        const locator = plainText(link[1].match(/title="([^"]+)"/)?.[1] || '');
        sourceLocators[id] ??= []; if (locator && !sourceLocators[id].includes(locator)) sourceLocators[id].push(locator);
      } else if (notes.has(href.slice(1))) {
        const note = notes.get(href.slice(1)); evidenceNotes.push(note);
        for (const id of note.sourceIds || []) { if (!sourceIds.includes(id)) sourceIds.push(id); }
      }
    }
    paragraphs.push({id:`${prefix}-context-${article.historicalDate || article.slug}-${++count}`,section,text,sourceIds,sourceLocators,evidenceNotes,
      temporalScope:'Explanatory study passage. Earlier and later events retain the dates stated in the text; no same-day position is inferred.'});
  }
  return {articleSlug:article.slug,title:article.title,sections:sections.filter(s => paragraphs.some(p => p.section === s.id)),paragraphs};
}

const excluded = new Set(['german','soviet','germany','soviet union','poland','finland','romania','military','front','army','western','northern','southern','eastern']);
export function readingTerms(feature) {
  const p = feature.properties || feature;
  const main = p.title || p.name || '';
  return [...new Set([p.subject,main.split(' · ')[0],main.split(':')[0],p.commander,p.name])]
    .filter(t => t && t.length >= 5 && !excluded.has(fold(t)) && !/\d{4}-\d{2}-\d{2}/.test(t));
}
export function sectionConnections(context, records) {
  if (!context) return [];
  return context.sections.map(section => {
    const passages = context.paragraphs.filter(p => p.section === section.id);
    const text = fold(passages.map(p => p.text).join(' '));
    const features = records.filter(r => (r.articleSections || []).includes(section.id) || readingTerms(r).some(term => text.includes(fold(term))));
    return {...section,passages,featureIds:features.map(f => f.id),disposition:features.length ? 'Reading connections to dated features; feature evidence remains separate' : 'Explanatory context; no defensible geographic connection assigned'};
  });
}
