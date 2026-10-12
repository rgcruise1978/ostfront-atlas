import fs from 'node:fs';
import path from 'node:path';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const timeline = read('src/data/timeline.json');
const sources = read('src/data/sources.json');
const places = read('public/data/geography/reference-places.geojson');
const rivers = read('public/data/geography/major-rivers.geojson');
const riverLabels = read('public/data/geography/river-labels.geojson');
const land = read('public/data/geography/natural-earth-land.geojson');
const boundary = read('public/data/history/poland-1939-reference.geojson');
const neighbors = read('public/data/history/surrounding-1939-reference.geojson');
const areaLabels = read('public/data/history/surrounding-area-labels.geojson');
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
for (const [name, collection] of [['land', land], ['places', places], ['rivers', rivers], ['river labels', riverLabels], ['boundary', boundary], ['neighbors', neighbors], ['area labels', areaLabels], ['historical', historical]]) {
  assert(collection.type === 'FeatureCollection' && Array.isArray(collection.features), `${name} is not a GeoJSON FeatureCollection`);
}
for (const place of places.features) {
  const [longitude, latitude] = place.geometry.coordinates;
  assert(longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90, `Invalid longitude/latitude for ${place.properties.name}`);
  assert(sourceIds.has(place.properties.sourceId), `Unknown place source for ${place.properties.name}`);
}
assert(places.features.length >= 20, 'Expected mapped reference cities');
assert(rivers.features.length === 9, 'Expected nine named river courses');
assert(riverLabels.features.length === rivers.features.length, 'Every river needs a map label');
for (const label of riverLabels.features) {
  assert(label.geometry.type === 'Point', `Invalid label for ${label.properties.name}`);
  assert(sourceIds.has(label.properties.sourceId), `Unknown river label source for ${label.properties.name}`);
}
for (const river of rivers.features) {
  assert(river.geometry.type === 'MultiLineString' && river.geometry.coordinates.length > 0, `Invalid river geometry for ${river.properties.name}`);
  assert(sourceIds.has(river.properties.sourceId), `Unknown river source for ${river.properties.name}`);
}
assert(boundary.features.length === 1, 'Expected one fixed Poland border reference');
for (const feature of boundary.features) {
  assert(feature.geometry.type === 'Polygon', 'Poland border reference must be a polygon');
  const p = feature.properties || {};
  for (const key of ['id', 'title', 'category', 'entity', 'startDate', 'sourceIds', 'uncertainty', 'note']) assert(p[key], `Border reference missing ${key}`);
  for (const id of p.sourceIds) assert(sourceIds.has(id), `Border reference cites unknown source ${id}`);
}
assert(neighbors.features.length === 6, 'Expected six surrounding state outlines');
for (const feature of neighbors.features) {
  assert(['Polygon', 'MultiPolygon'].includes(feature.geometry.type), `Invalid surrounding geometry for ${feature.properties.name}`);
  for (const id of feature.properties.sourceIds) assert(sourceIds.has(id), `Unknown surrounding source ${id}`);
}
assert(areaLabels.features.length === 11, 'Expected Poland and ten surrounding area labels');
for (const feature of areaLabels.features) {
  assert(feature.geometry.type === 'Point', `Invalid surrounding label for ${feature.properties.name}`);
  for (const id of feature.properties.sourceIds) assert(sourceIds.has(id), `Unknown area label source ${id}`);
}
assert(historical.features.length === 1, 'Expected the dated partition line');
assert(historical.features.some(feature => feature.properties.category === 'partition-demarcation' && feature.geometry.type === 'LineString' && feature.properties.startDate === '1939-09-28'), 'Missing dated partition line');
for (const feature of historical.features) {
  const p = feature.properties || {};
  for (const key of ['id', 'category', 'startDate', 'entity', 'sourceIds', 'uncertainty']) assert(p[key] !== undefined, `Historical feature missing ${key}`);
  for (const id of p.sourceIds) assert(sourceIds.has(id), `Historical feature cites unknown source ${id}`);
}
console.log(`Validated ${timeline.length} dates, ${sources.length} sources, ${places.features.length} cities, ${rivers.features.length} rivers, ${boundary.features.length} Poland outline, ${neighbors.features.length} surrounding outlines, ${historical.features.length} dated features.`);
