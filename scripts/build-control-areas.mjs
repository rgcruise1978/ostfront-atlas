import fs from 'node:fs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const boundary = read('public/data/history/poland-1939-reference.geojson').features[0].geometry.coordinates[0];
const treatyLine = read('public/data/history/poland-1939.geojson').features[0].geometry.coordinates;

function nearestSegment(point) {
  let best = { distance: Infinity };
  for (let index = 0; index < boundary.length - 1; index += 1) {
    const a = boundary[index], b = boundary[index + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy)));
    const snapped = [a[0] + t * dx, a[1] + t * dy];
    const distance = Math.hypot(point[0] - snapped[0], point[1] - snapped[1]);
    if (distance < best.distance) best = { index, snapped, distance };
  }
  return best;
}

function path(from, to) {
  const points = [from.snapped];
  let index = (from.index + 1) % (boundary.length - 1);
  while (index !== (to.index + 1) % (boundary.length - 1)) {
    points.push(boundary[index]);
    index = (index + 1) % (boundary.length - 1);
  }
  points.push(to.snapped);
  return points;
}

function contains(ring, point) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

const north = nearestSegment(treatyLine[0]);
const south = nearestSegment(treatyLine.at(-1));
if (north.distance > 0.05 || south.distance > 0.05) throw new Error('Treaty trace no longer meets the Poland outline closely enough');
const trace = [north.snapped, ...treatyLine, south.snapped];
const a = [...path(north, south), ...trace.toReversed()];
const b = [...path(south, north), ...trace];
const west = contains(a, [16.89994, 52.405753]) ? a : b;
const east = west === a ? b : a;
if (!contains(east, [24.029995, 49.83498]) || contains(west, [24.029995, 49.83498])) throw new Error('October control sectors failed city checks');

const shared = {
  category: 'military_control',
  startDate: '1939-10-26',
  endDate: '1939-10-26',
  accuracy: 'generalized sector, not a surveyed control boundary',
  legalStatus: 'Military occupation; no Polish consent or recognized transfer of sovereignty',
  sourceIds: ['ushmm-invasion-poland', 'ushmm-german-administration', 'us-state-frus-1939-border-report', 'umn-historical-borders-1939'],
  uncertainty: 'The sector edge follows the approximate 28 September treaty trace. Local implementation, pockets, and administrative sub-boundaries are not resolved here.'
};
function closeRing(points) {
  const ring = points.filter((point, index) => index === 0 || point[0] !== points[index - 1][0] || point[1] !== points[index - 1][1]);
  if (ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) ring.push(ring[0]);
  return ring;
}
const features = [
  { id: 'october-1939-german-occupied-sector', title: 'German-occupied Polish sector', actor: 'Germany', note: 'By 26 October, this broad western sector was under German occupation. Some areas were claimed for annexation while the remainder was organized under the General Government; this fill does not equate those statuses.', ring: west },
  { id: 'october-1939-soviet-occupied-sector', title: 'Soviet-occupied Polish sector', actor: 'Soviet Union', note: 'By 26 October, this broad eastern sector was under Soviet occupation. Formal Soviet incorporation measures followed later; this fill does not portray recognized Soviet sovereignty.', ring: east }
].map(({ ring, ...properties }) => ({ type: 'Feature', properties: { ...shared, ...properties }, geometry: { type: 'Polygon', coordinates: [closeRing(ring)] } }));
fs.writeFileSync('public/data/history/control-areas.geojson', JSON.stringify({ type: 'FeatureCollection', features }) + '\n');
