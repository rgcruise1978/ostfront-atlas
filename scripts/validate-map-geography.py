"""Meaningful chronology, shared-boundary, source and campaign checks."""
import json, tarfile, hashlib
from pathlib import Path
from shapely.geometry import shape, Point, box
from shapely.ops import unary_union, transform
from pyproj import Transformer

ROOT=Path(__file__).resolve().parents[1];BASE=ROOT.parents[1]
read=lambda p:json.loads((ROOT/p).read_text())
records=read('src/data/territorial-states.json');sources={r['id'] for r in read('src/data/sources.json')}
geoms={f['properties']['id']:shape(f['geometry']) for f in read('public/data/history/europe-geometries.geojson')['features']}
control=read('public/data/history/military-control.geojson')['features'];ops=read('public/data/history/military-operations.geojson')['features'];changes=read('src/data/territorial-changes.json')
dates=[e['date'] for e in read('src/data/timeline.json')+read('src/data/barbarossa-timeline.json')]
project=Transformer.from_crs(4326,6933,always_xy=True).transform
area=lambda g:transform(project,g).area/1e6
active=lambda d:[r for r in records if r['startDate']<=d<=r['endDate']]
at=lambda d,xy:[r for r in active(d) if geoms[r['geometryRef']].covers(Point(xy))]
assert len(dates)==13 and len(set(dates))==13
assert len({r['id'] for r in records})==len(records),'Duplicate dated territorial IDs'
assert all(g.is_valid and not g.is_empty for g in geoms.values()),'Invalid or empty territory geometry'
for r in records:
    assert r['geometryRef'] in geoms and r['startDate']<=r['endDate']
    assert all(id in sources for id in r['sourceIds']),r['id']
    assert all(key in r for key in ['sovereigntyStatus','militaryControl','occupationAdministration','annexationClaim','politicalAlignment','accuracy','uncertainty','visualCategory']),r['id']
for collection in [control,ops]:
    assert len({f['properties']['id'] for f in collection})==len(collection)
    for f in collection:
        p=f['properties'];assert shape(f['geometry']).is_valid,p['id']
        assert p['snapshots'] and all(d in dates for d in p['snapshots'])
        assert all(id in sources for id in p['sourceIds']),p['id']
        assert p['accuracy'] and p['uncertainty'] and p['note'],p['id']
land=shape(read('public/data/geography/europe-land.geojson')['features'][0]['geometry'])
coverage=[]
for d in dates:
    rs=active(d);gs=[geoms[r['geometryRef']] for r in rs]
    gap=area(land.difference(unary_union(gs)).intersection(box(-12,35,45,69)))
    assert gap<100,f'{d}: unexplained large land gap {gap:.0f} km²'
    overlaps=[]
    for i,g in enumerate(gs):
        for j,h in enumerate(gs[i+1:],i+1):
            km=area(g.intersection(h)) if g.intersects(h) else 0
            if km>25:overlaps.append((rs[i]['id'],rs[j]['id'],round(km)))
    assert not overlaps,f'{d}: overlapping political regions {overlaps}'
    assert any(r['name']=='Slovak Republic' for r in at(d,(17.11,48.15))),d
    assert any(r['name']=='Hungary' for r in at(d,(21.26,48.72))),d
    for xy in [(6.96,50.94),(13.4,52.52),(9.99,53.55)]:
        assert any(r['visualCategory']=='german-core' for r in at(d,xy)),(d,xy)
    assert any(r['visualCategory']=='soviet-core' for r in at(d,(37.62,55.75))),d
    coverage.append({'date':d,'politicalFeatures':len(rs),'operationalAreas':sum(d in f['properties']['snapshots'] for f in control),'unshadedEuropeanLandKm2':round(gap,2)})
assert any(r['name']=='Poland' for r in at('1939-09-01',(24,49.84)))
assert all(r['militaryControl']!='Soviet Union' for r in at('1939-09-17',(24,49.84)))
assert not any(r['startDate']=='1939-11-21' for r in active('1939-10-26'))
assert not any(f['geometry']['type']=='LineString' and '1941-06-21' in f['properties']['snapshots'] for f in ops)
reach=[f for f in control if f['properties']['id'].startswith('reach-')]
assert len(reach)==7 and len({hashlib.sha256(json.dumps(f['geometry']).encode()).hexdigest() for f in reach})==7
for f in reach:
    g=shape(f['geometry']);assert not g.covers(Point(32.05,54.78)),'Smolensk shown reached prematurely'
    assert not g.covers(Point(30.52,50.45)),'Kyiv shown reached prematurely'
    assert f['properties']['annexationClaim']=='None established by this operational area'
assert any(f['properties']['id']=='pocket-1941-07-03' for f in control),'Encircled resistance erased'
assert any(f['properties']['id']=='lepel-counterstroke-1941-07-06' for f in ops)
assert any(f['properties']['id']=='slovak-transfer-Spisz-1941-06-21' for f in ops)
assert all('1939-10-26' not in f['properties']['snapshots'] for f in ops if f['properties']['id'].startswith('slovak-transfer-'))
for c in changes:
    assert c['eventDate']<=c['effectiveVisualizationDate'] and all(id in sources for id in c['sourceIds']),c['id']
    assert all(k in c for k in ['previousControl','newControl','previousAdministration','newAdministration','sovereigntyOrClaim','featureIds','uncertainty'])
# Keep chapters byte-identical to the checkpoint from the start of map work.
backup=BASE/'outputs/map-completion/before-map-work.tar.gz'
unchanged=0
with tarfile.open(backup) as tar:
    for m in tar.getmembers():
        if '/content/articles/' in m.name and m.name.endswith('.json') and not Path(m.name).name.startswith('._'):
            path=ROOT/m.name.lstrip('./')
            assert path.read_bytes()==tar.extractfile(m).read(),f'Article changed: {path.name}'
            unchanged+=1
report={'result':'passed','snapshotChecks':coverage,'articlesUnchanged':unchanged,'geometryCount':len(geoms),'operationalFeatures':len(ops),'precisionLimits':['November Slovak transfer perimeter not digitized; dated event locations only','October Łódź administrative perimeter unresolved; no invented district circle','Local Greek and Yugoslav occupation subdivisions and Finnish cessions generalized','Forward operational areas are source interpretations, not surveyed fronts or secure occupation']}
out=BASE/'outputs/map-completion/geography-validation.json';out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
