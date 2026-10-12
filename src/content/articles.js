const modules = import.meta.glob('./articles/*.json', { eager: true, import: 'default' });
export const articles = Object.values(modules).sort((a, b) =>
  (b.publicationDate || b.historicalDate).localeCompare(a.publicationDate || a.historicalDate)
);
export const articleBySlug = (slug) => articles.find((item) => item.slug === slug);
