// Retain the published source records; present the collection introduction under the current site identity.
const modules = import.meta.glob('./articles/*.json', { eager: true, import: 'default' });
export const articles = Object.values(modules).map(article => article.isCollectionIntroduction
  ? { ...article, subtitle: "An introduction to the first Ost Krieg timeline" }
  : article).sort((a, b) =>
  (b.publicationDate || b.historicalDate).localeCompare(a.publicationDate || a.historicalDate)
);
export const articleBySlug = (slug) => articles.find((item) => item.slug === slug);

export const ORIGINAL_AUTHOR = 'Robert M. Dobo';
export const isArticleDraft = article => ['placeholder', 'research-brief'].includes(article?.status);

export const articleStatusLabel = article => article?.status === 'ready-for-review' ? 'Study — editorial review pending' : isArticleDraft(article) ? 'Research brief · in preparation' : 'Published';
