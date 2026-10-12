import fs from 'node:fs';
import path from 'node:path';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const timeline = read('src/data/timeline.json');
const sources = read('src/data/sources.json');
const places = read('public/data/geography/reference-places.geojson');
const land = read('public/data/geography/natural-earth-land.geojson');
const historical = read('public/data/history/poland-1939.geojson');
const sourceIds = new Set(sources.map(source => source.id));
const expectedDates = ['1939-08-23', '1939-09-01', '1939-09-17', '1939-09-28', '1939-10-26'];

function assert(condition, message) { if (!condition) throw new Error(message); }
assert(JSON.stringify(timeline.map(event => event.date)) === JSON.stringify(expectedDates), 'Timeline dates differ from the five verified selections');
assert(sourceIds.size === sources.length, 'Source IDs must be unique');
const articles = new Map();
for (const file of fs.readdirSync('src/content/articles')) {
  if (!file.endsWith('.json')) continue;
  const article = read(path.join('src/content/articles', file));
  for (const key of ['slug', 'title', 'subtitle', 'historicalPeriod', 'body']) assert(article[key] !== undefined && article[key] !== null, `${file} lacks ${key}`);
  assert(article.slug === file.slice(0, -5), `${file} slug differs from filename`);
  assert(!articles.has(article.slug), `Duplicate article slug ${article.slug}`);
  if (article.status === 'placeholder') {
    assert(article.historicalDate && !article.publicationDate, `${file} needs a historical date and no publication date`);
  } else {
    assert(article.publicationDate && article.author && article.body, `${file} lacks published article content`);
  }
  for (const id of article.sourceIds) assert(sourceIds.has(id), `${file} references unknown source ${id}`);
  articles.set(article.slug, article);
}
for (const event of timeline) {
  assert(event.sourceIds.length > 0, `Missing sources for ${event.id}`);
  for (const id of event.sourceIds) assert(sourceIds.has(id), `Unknown source ${id}`);
  assert(articles.has(event.articleSlug), `Missing article for ${event.id}`);
  assert(articles.get(event.articleSlug).historicalDate === event.date, `Article date differs for ${event.id}`);
}
for (const [name, collection] of [['land', land], ['places', places], ['historical', historical]]) {
  assert(collection.type === 'FeatureCollection' && Array.isArray(collection.features), `${name} is not a GeoJSON FeatureCollection`);
}
for (const place of places.features) {
  const [longitude, latitude] = place.geometry.coordinates;
  assert(longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90, `Invalid longitude/latitude for ${place.properties.name}`);
  assert(sourceIds.has(place.properties.sourceId), `Unknown place source for ${place.properties.name}`);
}
for (const feature of historical.features) {
  const p = feature.properties || {};
  for (const key of ['id', 'category', 'startDate', 'entity', 'sourceIds', 'uncertainty']) assert(p[key] !== undefined, `Historical feature missing ${key}`);
  for (const id of p.sourceIds) assert(sourceIds.has(id), `Historical feature cites unknown source ${id}`);
}
console.log(`Validated ${timeline.length} dates, ${sources.length} sources, ${places.features.length} reference places, ${historical.features.length} historical geometries.`);
