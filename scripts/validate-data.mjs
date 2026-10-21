import fs from 'node:fs';
import { createHash } from 'node:crypto';
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
  } else if (article.status === 'ready-for-review') {
    assert(article.preparedDate && article.author && article.body && !article.publicationDate, `${file} needs complete unpublished review content`);
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
  assert(article.status === 'published' && article.publicationDate && article.body && article.sections.length >= 7 && article.sections.length <= 10, 'Expected a complete published Barbarossa study');
  assert(event.snapshotStatus === 'source-qualified-operational-reference' && event.geographicFeatureIds.length > 0, 'Dated operational reference is missing');
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
const longitudes = coordinates => typeof coordinates[0] === 'number' ? [coordinates[0]] : coordinates.flatMap(longitudes);
const germanSource = neighbors.features.find(feature => feature.properties.name === 'Germany');
const germanOpening = openingControl.features.find(feature => feature.properties.id === 'barbarossa-germany-1939-core');
assert(germanSource && germanOpening, 'German boundary reference is missing');
assert(Math.min(...longitudes(germanOpening.geometry.coordinates)) <= Math.min(...longitudes(germanSource.geometry.coordinates)) + 0.05, 'Barbarossa map cuts off western Germany');
assert(Math.max(...longitudes(germanOpening.geometry.coordinates)) >= Math.max(...longitudes(germanSource.geometry.coordinates)) - 0.05, 'Barbarossa map cuts off eastern Germany');
for (const collection of [openingControl, openingFrontier, openingNeighbors]) for (const feature of collection.features) {
  assert(feature.properties.startDate === '1941-06-21' && feature.properties.endDate === '1941-07-09', 'Opening reference has an unexpected date span');
  assert(feature.properties.sourceIds?.every(id=>sourceIds.has(id)), `Unknown 1941 map source for ${feature.properties.id}`);
  assert(feature.properties.uncertainty, `Missing uncertainty note for ${feature.properties.id}`);
}
assert(openingControl.features.some(feature=>feature.properties.id === 'barbarossa-soviet-bessarabia-bukovina'), 'The 1940 Romanian territorial change is missing');
for (const name of ['Brest-Litovsk','Vilnius','Leningrad','Helsinki']) assert(openingPlaces.features.some(feature=>feature.properties.name===name), `Missing 1941 place ${name}`);
for (const article of articles.values()) assert(article.author === 'Robert M. Dobo', 'Original atlas author credit is inconsistent');
const capitals = read('src/data/capitals.json');
assert(['berlin','moscow','warsaw','bratislava'].every(id=>capitals.some(c=>c.id===id)), 'Missing primary capital');
for (const capital of capitals) {
  assert(capital.coordinates.length === 2 && capital.coordinates.every(Number.isFinite), 'Invalid capital coordinate');
  for (const id of capital.sourceIds) assert(sourceIds.has(id), 'Unknown capital source');
}
console.log('Validated eight complete published Barbarossa studies, dated map references and expanded capital records.');

const phaseTwo = read('src/data/barbarossa-phase-ii-timeline.json');
const phaseThree = read('src/data/barbarossa-phase-iii-timeline.json');
const phaseFour = read('src/data/barbarossa-phase-iv-timeline.json');
const phaseFive = read('src/data/barbarossa-phase-v-timeline.json');
const phaseTwoDates = ['1941-07-10','1941-07-16','1941-07-23','1941-07-30','1941-08-06','1941-08-12','1941-08-19','1941-08-21','1941-08-25'];
const phaseThreeDates = ['1941-08-26','1941-08-29','1941-09-03','1941-09-08','1941-09-12','1941-09-16','1941-09-19','1941-09-26','1941-09-29'];
const phaseFourDates = ['1941-09-30','1941-10-02','1941-10-07','1941-10-13','1941-10-16','1941-10-19','1941-10-24','1941-11-02','1941-11-09','1941-11-14'];
assert(JSON.stringify(phaseTwo.map(event=>event.date)) === JSON.stringify(phaseTwoDates), 'Phase II dates differ from the fixed brief');
assert(JSON.stringify(phaseThree.map(event=>event.date)) === JSON.stringify(phaseThreeDates), 'Phase III dates differ from the fixed brief');
assert(JSON.stringify(phaseFour.map(event=>event.date)) === JSON.stringify(phaseFourDates), 'Phase IV dates differ from the fixed brief');
const wholeCampaign = [...barbarossa, ...phaseTwo, ...phaseThree, ...phaseFour, ...phaseFive];
assert(new Set(wholeCampaign.map(event=>event.id)).size === 44, 'Barbarossa dates must remain unique');
const phaseOneLast = articles.get(barbarossa.at(-1).articleSlug);
assert(phaseOneLast.nextArticleSlug === phaseTwo[0].articleSlug, 'Missing July 9 to July 10 study transition');
const militaryLayers = [read('public/data/history/military-control.geojson'), read('public/data/history/military-operations.geojson')];
for (const [index,event] of phaseTwo.entries()) {
  const article = articles.get(event.articleSlug);
  assert(article && article.historicalDate === event.date && article.phaseId === '2' && article.campaignId === 'barbarossa-1941', 'Broken Phase II article identity');
  assert(article.status === 'published' && article.publicationDate && article.preparedDate && article.author === 'Robert M. Dobo' && article.reviewedDate, 'Phase II studies require completed review and publication metadata');
  assert(article.reviewedBodySha256 === createHash('sha256').update(article.body).digest('hex'), `${article.slug}: study text differs from its completed editorial review`);
  const prose = article.body.replace(/<sup\b[\s\S]*?<\/sup>/g, '').replace(/<h[1-6]\b[\s\S]*?<\/h[1-6]>/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&');
  const words = (prose.match(/[\p{L}\p{N}_]+(?:[’'–-][\p{L}\p{N}_]+)*/gu) || []).length;
  assert(words > 0 && words === article.narrativeWordCount, `${article.slug}: substantive prose word count is invalid (${words})`);
  assert(article.sections.length >= 6 && article.sections.length <= 9, `${article.slug}: expected 6–9 sections`);
  const asideCount = (article.body.match(/<aside\b/g) || []).length;
  assert(asideCount >= 2 && asideCount <= 3, `${article.slug}: expected 2–3 historical asides`);
  for (const section of article.sections) assert(article.body.includes(`id="${section.id}"`), `${article.slug}: missing contents target`);
  for (const [sourceIndex,id] of article.sourceIds.entries()) {
    assert(article.body.includes(`id="cite-${id}"`) && article.body.includes(`href="#source-${id}"`), `${article.slug}: broken citation target or return link`);
    assert(article.sourceLocators[id]?.length > 0, `${article.slug}: missing source locator`);
    const citations = [...article.body.matchAll(/href="#source-([^"]+)"[^>]*>\[(\d+)\]/g)].filter(match=>match[1]===id);
    assert(citations.length && citations.every(match=>Number(match[2])===sourceIndex+1), `${article.slug}: incorrect reference number`);
  }
  assert(article.previousArticleSlug === wholeCampaign[7+index].articleSlug, 'Broken previous-study chronology');
  assert(article.nextArticleSlug === (phaseTwo[index+1] || phaseThree[0]).articleSlug, 'Broken next-study chronology');
  assert(event.snapshotStatus === 'documented-regional-synthesis' && event.geographicFeatureIds.includes(`reach-${event.date}`), 'Phase II needs a dated, qualified regional reconstruction');
  for (const id of event.sourceIds) assert(sourceIds.has(id), 'Unknown Phase II reference');
  const datedOperations=militaryLayers[1].features.filter(f=>f.properties.snapshots?.includes(event.date));
  assert(datedOperations.length>0 && militaryLayers[0].features.some(f=>f.properties.id===`reach-${event.date}` && f.properties.snapshots.includes(event.date)), 'Phase II dated operational records are missing');
  assert(datedOperations.every(f=>f.properties.snapshots.every(date=>date===event.date || !phaseTwoDates.includes(date))), 'An unchanged operational feature leaks across Phase II dates');
}
assert(['berlin','moscow','warsaw','bucharest','helsinki'].every(id=>capitals.some(c=>c.id===id && c.endDate >= '1941-08-25')), 'Primary capital markers expire before the end of Phase II');
console.log('Validated nine reviewed and published Phase II studies, reviewed body hashes, prose counts, citations, continuity and dated regional map records.');

const snapshotIndex=read('src/data/map-snapshot-index.json');
const datedLayers=[...militaryLayers,read('public/data/history/formation-positions.geojson'),read('public/data/history/dated-fronts.geojson'),read('public/data/history/historical-logistics.geojson')];
const referenceBorders=read('public/data/history/reference-borders.geojson');
const expandedPlaces=read('public/data/geography/europe-places.geojson');
const phaseThreePlaces=['Yelnya','Shlisselburg','Novgorod-Seversk','Lokhvytsia'];
for (const name of phaseThreePlaces) {
  const feature=expandedPlaces.features.find(f=>f.properties.name===name);
  assert(feature?.geometry.type==='Point' && feature.properties.priority===2 && sourceIds.has(feature.properties.sourceId), `Phase III reference place missing or unsourced: ${name}`);
}
const easternReferenceStates=read('src/data/territorial-states.json');
for (const id of ['soviet-union','soviet-poland-1941','soviet-estonia','finnish-cessions']) {
  const state=easternReferenceStates.find(record=>record.id===id);
  assert(state && state.endDate==='1941-08-25' && state.sourceIds.every(sourceId=>sourceIds.has(sourceId)), `Unverified eastern political reference: ${id}`);
}
assert(phaseThree.find(event=>event.date==='1941-08-29').defaultView==='tallinn' && phaseThree.find(event=>event.date==='1941-09-03').defaultView==='yelnya' && phaseThree.find(event=>event.date==='1941-09-08').defaultView==='leningrad', 'Phase III regional defaults are missing');
for (const [index,event] of phaseThree.entries()) {
  const article=articles.get(event.articleSlug);
  assert(article && article.historicalDate===event.date && article.campaignId==='barbarossa-1941' && article.phaseId==='3', `Broken Phase III article identity: ${event.date}`);
  assert(article.status==='published' && article.author==='Robert M. Dobo' && article.preparedDate && article.body && article.publicationDate, `Phase III must contain a published full study: ${event.date}`);
  const prose = article.body.replace(/<sup\b[\s\S]*?<\/sup>/g, '').replace(/<h[1-6]\b[\s\S]*?<\/h[1-6]>/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&');
  const words = (prose.match(/[\p{L}\p{N}_]+(?:[’'–-][\p{L}\p{N}_]+)*/gu) || []).length;
  assert(words >= 3500 && words <= 5000 && words === article.narrativeWordCount, `${article.slug}: substantive prose word count is invalid (${words})`);
  assert(article.sections.length >= 6 && article.sections.length <= 9, `${article.slug}: expected 6–9 sections`);
  const asideCount = (article.body.match(/<aside\b/g) || []).length;
  assert(asideCount >= 2 && asideCount <= 3, `${article.slug}: expected 2–3 historical asides`);
  for (const section of article.sections) assert(article.body.includes(`id="${section.id}"`), `${article.slug}: missing contents target`);
  for (const [sourceIndex,id] of article.sourceIds.entries()) {
    assert(article.body.includes(`id="cite-${id}"`) && article.body.includes(`href="#source-${id}"`), `${article.slug}: broken citation target or return link`);
    assert(article.sourceLocators[id]?.length > 0, `${article.slug}: missing source locator`);
    const citations = [...article.body.matchAll(/href="#source-([^"]+)"[^>]*>\[(\d+)\]/g)].filter(match=>match[1]===id);
    assert(citations.length && citations.every(match=>Number(match[2])===sourceIndex+1), `${article.slug}: incorrect reference number`);
  }

  assert(article.outlineTopics?.length>=10 && article.chronologyNotes?.length>0, `Phase III outline is incomplete: ${event.date}`);
  assert(article.previousArticleSlug===wholeCampaign[16+index].articleSlug && article.nextArticleSlug===(phaseThree[index+1] || phaseFour[0]).articleSlug, `Broken Phase III reading sequence: ${event.date}`);
  assert(event.snapshotStatus==='dated-regional-synthesis' && event.geographicFeatureIds.length>0 && event.mapAccuracy, `Phase III map status is inaccurate: ${event.date}`);
  assert(event.defaultView && event.sourceIds.length>0 && event.sourceIds.every(id=>sourceIds.has(id)), `Phase III source or view missing: ${event.date}`);
  assert(snapshotIndex[event.date]?.areas>0 && snapshotIndex[event.date]?.formations>=20 && snapshotIndex[event.date]?.operations>=5, `Phase III snapshot claims unbuilt military data: ${event.date}`);
  for (const layer of datedLayers) for (const feature of layer.features.filter(f=>f.properties.snapshots?.includes(event.date))) assert(feature.properties.id.startsWith(`p3-${event.date}-`) && feature.properties.snapshots.length===1, `Stale or undated military record in Phase III: ${event.date}`);
  assert(referenceBorders.features.every(feature=>feature.properties.snapshots.includes(event.date)), `Historical border reference missing for ${event.date}`);
}
assert(['berlin','moscow','warsaw','bucharest','helsinki','kiev'].every(id=>capitals.some(c=>c.id===id && c.endDate>='1941-09-29')), 'Phase III capital markers are missing');
console.log('Validated nine full published Phase III studies, word counts, citations and dated Phase III military reconstructions.');

assert(phaseFour.length===10 && phaseThree.at(-1).date==='1941-09-29' && phaseFour[0].date==='1941-09-30', 'Missing 29–30 September continuity');
for (const [index,event] of phaseFour.entries()) {
  const article=articles.get(event.articleSlug);
  assert(article?.historicalDate===event.date && article.campaignId==='barbarossa-1941' && article.phaseId==='4', `Broken Phase IV article identity: ${event.date}`);
  assert(article.author==='Robert M. Dobo' && ['research-brief','ready-for-review','published'].includes(article.status) && (article.status==='published' ? article.publicationDate && article.reviewedDate && article.reviewedBodySha256===createHash('sha256').update(article.body).digest('hex') : !article.publicationDate) && article.outlineTopics?.length>=10, `Phase IV entry has invalid authorship or review state: ${event.date}`);
  if (article.status==='research-brief') assert(!article.body, `Phase IV brief has an unreviewed narrative: ${event.date}`);
  else {
    const prose=article.body.replace(/<sup\b[\s\S]*?<\/sup>/g,'').replace(/<h[1-6]\b[\s\S]*?<\/h[1-6]>/g,'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&');
    const words=(prose.match(/[\p{L}\p{N}_]+(?:[’'–-][\p{L}\p{N}_]+)*/gu)||[]).length;
    assert(words>=3500 && words<=5000 && words===article.narrativeWordCount, `${article.slug}: invalid Phase IV study word count (${words})`);
    assert(article.sections?.length>=6 && article.sections.length<=9 && (article.body.match(/<aside\b/g)||[]).length>=2, `${article.slug}: incomplete sections or historical asides`);
    for (const section of article.sections) assert(article.body.includes(`id="${section.id}"`), `${article.slug}: missing contents target`);
    for (const [sourceIndex,id] of article.sourceIds.entries()) {
      assert(article.body.includes(`id="cite-${id}"`) && article.body.includes(`href="#source-${id}"`) && article.sourceLocators?.[id]?.length>0, `${article.slug}: citation or locator missing for ${id}`);
      const citations=[...article.body.matchAll(/href="#source-([^"]+)"[^>]*>\[(\d+)\]/g)].filter(match=>match[1]===id);
      assert(citations.length && citations.every(match=>Number(match[2])===sourceIndex+1), `${article.slug}: incorrect reference number for ${id}`);
    }
  }
  assert(article.previousArticleSlug===wholeCampaign[25+index].articleSlug && article.nextArticleSlug===phaseFour[index+1]?.articleSlug, `Broken Phase IV reading sequence: ${event.date}`);
  assert(event.snapshotStatus==='dated-regional-synthesis' && event.geographicFeatureIds.length>0 && event.mapAccuracy && event.defaultView, `Phase IV requires dated military features: ${event.date}`);
  assert(event.sourceIds.length>0 && event.sourceIds.every(id=>sourceIds.has(id)), `Phase IV source record missing: ${event.date}`);
  assert(snapshotIndex[event.date]?.operations>0 && snapshotIndex[event.date]?.formations>0 && snapshotIndex[event.date]?.areas>0, `Phase IV snapshot is missing military data: ${event.date}`);
  for (const layer of datedLayers) for (const feature of layer.features.filter(f=>f.properties.snapshots?.includes(event.date))) assert(feature.properties.id.startsWith(`p4-${event.date}-`) && feature.properties.snapshots.length===1 && feature.properties.sourceLocators && feature.properties.note, `Undated or unsourced Phase IV feature: ${event.date}`);
  assert(referenceBorders.features.every(feature=>feature.properties.snapshots.includes(event.date)), `Historical border reference missing for ${event.date}`);
}
assert(['berlin','moscow','warsaw','bucharest','helsinki'].every(id=>capitals.some(c=>c.id===id && c.endDate>='1941-11-14')), 'Phase IV primary capital markers are missing');
console.log('Validated ten Phase IV records, study citations, reviewed publication hashes and counts, 44-date chronology, and honest map-status labels.');

const phaseFiveDates=['1941-11-15','1941-11-18','1941-11-21','1941-11-24','1941-11-28','1941-11-29','1941-12-02','1941-12-05'];
assert(JSON.stringify(phaseFive.map(event=>event.date))===JSON.stringify(phaseFiveDates),'Phase V fixed dates changed');
for(const [index,event] of phaseFive.entries()) {
 const article=articles.get(event.articleSlug),snapshot=snapshotIndex[event.date];
 assert(article?.historicalDate===event.date&&article.phaseId==='5'&&article.author==='Robert M. Dobo','Phase V identity mismatch');
 assert(article.status==='published'&&article.body&&article.preparedDate&&article.publicationDate&&article.reviewedDate&&article.reviewedBodySha256===createHash('sha256').update(article.body).digest('hex')&&article.outlineTopics.length>=14,'Phase V must contain complete reviewed published studies with matching review hashes');
 const prose=article.body.replace(/<sup\b[\s\S]*?<\/sup>/g,'').replace(/<p\b[^>]*class="eyebrow"[^>]*>[\s\S]*?<\/p>/g,'').replace(/<h[1-6]\b[\s\S]*?<\/h[1-6]>/g,'').replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&(?:amp|quot|apos|lt|gt);/g,entity=>({'&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>'})[entity]);
 const words=(prose.match(/[\p{L}\p{N}_]+(?:[’'–-][\p{L}\p{N}_]+)*/gu)||[]).length;
 assert(words>=3000&&words<=5000&&words===article.substantiveWordCount&&words===article.narrativeWordCount,`${article.slug}: incorrect substantive word count (${words})`);
 assert(article.sections.length>=6&&article.sections.length<=9&&article.sections.every(section=>article.body.includes(`id="${section.id}"`)),`${article.slug}: missing contents targets`);
 const asideCount=(article.body.match(/<aside\b/g)||[]).length;
 assert(asideCount>=2&&asideCount<=3,`${article.slug}: historical asides missing`);
 const bodyIds=[...article.body.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 assert(new Set(bodyIds).size===bodyIds.length,`${article.slug}: duplicate article anchors`);
 for(const [sourceIndex,id] of article.sourceIds.entries()) {
  const citations=[...article.body.matchAll(/href="#source-([^"]+)"[^>]*>\[(\d+)\]/g)].filter(match=>match[1]===id);
  assert(article.body.includes(`id="cite-${id}"`)&&citations.length&&citations.every(match=>Number(match[2])===sourceIndex+1),`${article.slug}: broken citation numbering or return target`);
 }
 assert(article.previousArticleSlug===wholeCampaign[35+index].articleSlug&&article.nextArticleSlug===phaseFive[index+1]?.articleSlug,'Phase V reading sequence mismatch');
 assert(article.sourceIds.length>0&&article.sourceIds.every(id=>sourceIds.has(id)&&article.sourceLocators[id]?.length),'Phase V research references missing');
 assert(event.snapshotStatus==='dated-regional-synthesis'&&event.geographicFeatureIds.length>0&&!event.politicalReferenceDate,'Phase V reconstruction status invalid');
 assert(['operations','areas','formations','logistics','fronts'].every(key=>snapshot[key]>0),'Phase V military layer missing');
 for(const layer of datedLayers) for(const feature of layer.features.filter(f=>f.properties.snapshots?.includes(event.date))) {
  const p=feature.properties;assert(p.id.startsWith('p5-')&&p.sourceIds?.length&&p.sourceIds.every(id=>sourceIds.has(id)&&p.sourceLocators?.[id]?.length),'Phase V feature lacks evidence or inherits an earlier position');
  if(p.movementType!=='planned'&&p.movementEnd)assert(p.movementEnd<=event.date,'Future movement leaked into selected date');
 }

}
assert(['berlin','moscow','warsaw','bucharest','helsinki'].every(id=>capitals.some(c=>c.id===id&&c.endDate>='1941-12-05')),'Phase V capital roles missing');
console.log('Validated eight published Phase V studies with reviewed body hashes, substantive word counts, citations, contents, chronological links and sourced dated regional maps.');
