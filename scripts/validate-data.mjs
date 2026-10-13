import fs from 'node:fs';
import path from 'node:path';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const timeline = read('src/data/timeline.json');
const sources = read('src/data/sources.json');
const places = read('public/data/geography/reference-places.geojson');
const rivers = read('public/data/geography/major-rivers.geojson');
const secondaryRivers = read('public/data/geography/secondary-rivers.geojson');
const surroundingRivers = read('public/data/geography/surrounding-rivers.geojson');
const riverLabels = read('public/data/geography/river-labels.geojson');
const land = read('public/data/geography/natural-earth-land.geojson');
const boundary = read('public/data/history/poland-1939-reference.geojson');
const neighbors = read('public/data/history/surrounding-1939-reference.geojson');
const areaLabels = read('public/data/history/surrounding-area-labels.geojson');
const historical = read('public/data/history/poland-1939.geojson');
const control = read('public/data/history/control-areas.geojson');
const operations = read('public/data/history/advance-axes.geojson');
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
  if (article.status === 'placeholder' || article.status === 'research-brief') {
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
for (const [name, collection] of [['land', land], ['places', places], ['rivers', rivers], ['secondary rivers', secondaryRivers], ['surrounding rivers', surroundingRivers], ['river labels', riverLabels], ['boundary', boundary], ['neighbors', neighbors], ['area labels', areaLabels], ['historical', historical], ['control', control], ['operations', operations]]) {
  assert(collection.type === 'FeatureCollection' && Array.isArray(collection.features), `${name} is not a GeoJSON FeatureCollection`);
}
for (const place of places.features) {
  const [longitude, latitude] = place.geometry.coordinates;
  assert(longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90, `Invalid longitude/latitude for ${place.properties.name}`);
  assert(sourceIds.has(place.properties.sourceId), `Unknown place source for ${place.properties.name}`);
  if (place.properties.nameSourceId) assert(sourceIds.has(place.properties.nameSourceId), `Unknown historical name source for ${place.properties.name}`);
}
assert(places.features.length === 210, 'Expected 210 mapped reference cities');
assert(new Set(places.features.map(place => place.properties.name)).size === places.features.length, 'Place labels must be unique');
assert(places.features.every(place => [1, 2, 3].includes(place.properties.priority)), 'Every place needs a supported zoom priority');
assert(rivers.features.length === 9, 'Expected nine named river courses');
assert(secondaryRivers.features.length === 4, 'Expected four local secondary river courses');
for (const river of secondaryRivers.features) {
  assert(river.geometry.type === 'LineString' && river.geometry.coordinates.length > 1, `Invalid secondary river geometry for ${river.properties.name}`);
  assert(sourceIds.has(river.properties.sourceId), `Unknown secondary river source for ${river.properties.name}`);
}
assert(surroundingRivers.features.length === 51, 'Expected 51 regional river segments');
assert(new Set(surroundingRivers.features.map(feature => feature.properties.name)).size === 33, 'Expected 33 named regional rivers');
for (const river of surroundingRivers.features) {
  assert(['LineString', 'MultiLineString'].includes(river.geometry.type), `Invalid regional river geometry for ${river.properties.name}`);
  assert(['major', 'secondary'].includes(river.properties.importance), `Missing regional river importance for ${river.properties.name}`);
  assert(sourceIds.has(river.properties.sourceId), `Unknown regional river source for ${river.properties.name}`);
}
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
assert(neighbors.features.length === 7, 'Expected seven surrounding state outlines');
for (const feature of neighbors.features) {
  assert(['Polygon', 'MultiPolygon'].includes(feature.geometry.type), `Invalid surrounding geometry for ${feature.properties.name}`);
  for (const id of feature.properties.sourceIds) assert(sourceIds.has(id), `Unknown surrounding source ${id}`);
}
assert(areaLabels.features.length === 12, 'Expected Poland and eleven surrounding area labels');
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
assert(control.features.length === 2, 'Expected two October occupation sectors');
assert(new Set(control.features.map(feature => feature.properties.actor)).size === 2, 'October sectors must identify Germany and the Soviet Union');
for (const feature of control.features) {
  const p = feature.properties;
  assert(feature.geometry.type === 'Polygon' && feature.geometry.coordinates.length === 1, `Invalid control geometry for ${p.id}`);
  const ring = feature.geometry.coordinates[0];
  assert(ring.length > 3 && JSON.stringify(ring[0]) === JSON.stringify(ring.at(-1)), `Unclosed control polygon ${p.id}`);
  assert(p.startDate === '1939-10-26' && p.endDate === '1939-10-26', `Control polygon appears on an unsupported date: ${p.id}`);
  assert(p.accuracy && p.uncertainty && p.legalStatus && p.note, `Missing control metadata for ${p.id}`);
  for (const id of p.sourceIds) assert(sourceIds.has(id), `Unknown control source ${id}`);
}
const axes = operations.features.filter(feature => ['advance_axis', 'planned_axis'].includes(feature.properties.category));
const annotations = operations.features.filter(feature => !['advance_axis', 'planned_axis'].includes(feature.properties.category));
assert(axes.length === 14, 'Expected five German, two later Soviet and seven Soviet planned axes');
assert(axes.filter(f => f.properties.category === 'planned_axis').length === 7, 'Expected seven planned Soviet directions');
assert(new Set(operations.features.map(f => f.properties.id)).size === operations.features.length, 'Operation IDs must be unique');
assert(axes.filter(feature => feature.properties.actor === 'Germany').length === 5, 'Expected five German axes');
assert(annotations.filter(feature => feature.properties.category === 'army_group').length === 4, 'Expected two German army groups and two Soviet fronts');
assert(annotations.filter(feature => feature.properties.category === 'engagement').length === 4, 'Expected four engagement localities');
for (const feature of operations.features) {
  const p = feature.properties;
  assert(p.accuracy && p.uncertainty && p.note, `Missing accuracy note for ${p.id}`);
  assert(p.snapshots.every(date => expectedDates.includes(date)), `Unsupported date for ${p.id}`);
  assert(!p.snapshots.includes('1939-08-23'), `Invasion feature appears before invasion: ${p.id}`);
  if (p.actor === 'Soviet Union') assert(p.snapshots.every(date => date >= '1939-09-17'), `Premature Soviet axis: ${p.id}`);
  if (['advance_axis', 'planned_axis'].includes(p.category)) assert(feature.geometry.type === 'LineString' && feature.geometry.coordinates.length > 1, `Invalid axis ${p.id}`);
  else {
    assert(feature.geometry.type === 'Point' && feature.geometry.coordinates.every(Number.isFinite), `Invalid annotation ${p.id}`);
    assert(JSON.stringify(p.snapshots) === (p.actor === 'Soviet Union' ? '["1939-09-17"]' : '["1939-09-01"]'), `Annotation leaks to another date: ${p.id}`);
  }
  if (p.category === 'planned_axis') assert(p.movementStatus === 'planned' && p.orderDate === '1939-09-14' && JSON.stringify(p.snapshots) === '["1939-09-17"]', `Unqualified planned direction ${p.id}`);
  for (const id of p.sourceIds) assert(sourceIds.has(id), `Unknown map source ${id}`);
}
for (const article of articles.values()) {
  if (!article.sections) continue;
  for (const section of article.sections) assert(article.body.includes(`id="${section.id}"`), `Missing chapter anchor ${section.id}`);
  for (const id of article.sourceIds) assert(article.body.includes(`id="cite-${id}"`), `Missing citation return target ${id}`);
}
console.log(`Validated ${timeline.length} dates, ${sources.length} sources, ${places.features.length} cities, ${axes.length} axes, ${annotations.length} dated annotations and all chapter citation anchors.`);

const sovietResearch = read('public/data/history/soviet-operations-research.json');
assert(sovietResearch.groups.length === 7, 'Expected seven research records');
for (const group of sovietResearch.groups) {
  assert(group.actualPositionOn17September === null, 'Planned objectives must not become observed positions');
  assert(operations.features.some(f => f.properties.id === group.mapFeatureId), 'Missing research-to-map link');
  for (const id of group.sourceIds) assert(sourceIds.has(id), `Unknown research source ${id}`);
}
for (const event of read('public/data/history/soviet-campaign-events.json').events) {
  assert(event.startDate >= '1939-09-17' && event.endDate >= event.startDate, 'Invalid campaign chronology');
  for (const id of event.sourceIds) assert(sourceIds.has(id), `Unknown chronology source ${id}`);
}

const barbarossa = read('src/data/barbarossa-timeline.json');
const phaseDates = ['1941-06-21','1941-06-22','1941-06-25','1941-06-28','1941-07-01','1941-07-03','1941-07-06','1941-07-09'];
assert(JSON.stringify(barbarossa.map(event=>event.date)) === JSON.stringify(phaseDates), 'Barbarossa Phase I dates differ from the fixed brief');
for (const event of barbarossa) {
  const article = articles.get(event.articleSlug);
  assert(article && article.historicalDate === event.date && article.campaignId === 'barbarossa-1941', 'Broken campaign/date/article connection');
  assert(article.status === 'research-brief' && !article.publicationDate && article.body === '' && article.outlineTopics.length > 0, 'Brief must not claim publication');
  assert(event.snapshotStatus === 'research-pending' && event.geographicFeatureIds.length === 0, 'An unverified military situation must not be claimed');
  for (const id of event.sourceIds) assert(sourceIds.has(id), 'Unknown Barbarossa source');
}
const openingControl = read('public/data/history/barbarossa-1941-opening-control.geojson');
const openingFrontier = read('public/data/history/barbarossa-1941-opening-frontier.geojson');
const openingNeighbors = read('public/data/history/barbarossa-1941-neighbors.geojson');
const openingLabels = read('public/data/history/barbarossa-1941-area-labels.geojson');
const openingPlaces = read('public/data/geography/barbarossa-reference-places.geojson');
assert(openingControl.features.length === 8 && openingFrontier.features.length === 3 && openingNeighbors.features.length === 2, 'Opening territorial reference is incomplete');
assert(openingLabels.features.length === 15 && openingPlaces.features.length === 213, 'Opening geographic context is incomplete');
assert(new Set(openingControl.features.map(feature=>feature.properties.id)).size === 8, 'Opening control IDs must be unique');
for (const collection of [openingControl, openingFrontier, openingNeighbors]) for (const feature of collection.features) {
  assert(feature.properties.startDate === '1941-06-21' && feature.properties.endDate === '1941-07-09', 'Opening reference has an unexpected date span');
  assert(feature.properties.sourceIds?.every(id=>sourceIds.has(id)), `Unknown 1941 map source for ${feature.properties.id}`);
  assert(feature.properties.uncertainty, `Missing uncertainty note for ${feature.properties.id}`);
}
assert(openingControl.features.some(feature=>feature.properties.id === 'barbarossa-soviet-bessarabia-bukovina'), 'The 1940 Romanian territorial change is missing');
for (const name of ['Brest-Litovsk','Vilnius','Leningrad','Helsinki']) assert(openingPlaces.features.some(feature=>feature.properties.name===name), `Missing 1941 place ${name}`);
for (const article of articles.values()) assert(article.author === 'R.G. Cruise', 'Original atlas author credit is inconsistent');
const capitals = read('src/data/capitals.json');
assert(capitals.map(c=>c.id).sort().join(',') === 'berlin,moscow,warsaw', 'Missing primary capital');
for (const capital of capitals) {
  assert(capital.coordinates.length === 2 && capital.coordinates.every(Number.isFinite), 'Invalid capital coordinate');
  for (const id of capital.sourceIds) assert(sourceIds.has(id), 'Unknown capital source');
}
console.log('Validated eight unpublished Barbarossa briefs and three capital records.');
