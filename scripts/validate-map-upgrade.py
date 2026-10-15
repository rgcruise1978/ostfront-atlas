"""Dated map checks tied to the actual baseline, including all review chapters."""
import json,hashlib,os
from pathlib import Path
from shapely.geometry import shape,Point,box
from shapely.ops import unary_union,transform
from pyproj import Transformer
ROOT=Path(__file__).resolve().parents[1];OUT=Path(os.environ.get('OSTFRONT_AUDIT_DIR', str(ROOT.parents[1]/'outputs/phase-iii-military-maps')))
read=lambda p:json.loads((ROOT/p).read_text())
mappedDates=[e['date'] for n in ['timeline','barbarossa-timeline','barbarossa-phase-ii-timeline','barbarossa-phase-iii-timeline'] for e in read('src/data/'+n+'.json')]
referenceDates=[e['date'] for e in read('src/data/barbarossa-phase-iv-timeline.json')]
dates=mappedDates+referenceDates
assert len(dates)==len(set(dates))==41 and len(mappedDates)==31 and len(referenceDates)==10
sources={s['id'] for s in read('src/data/sources.json')};records=read('src/data/territorial-states.json')
G={f['properties']['id']:shape(f['geometry']) for f in read('public/data/history/europe-geometries.geojson')['features']}
assert len({r['id'] for r in records})==len(records)
assert all(g.is_valid and not g.is_empty for g in G.values())
for r in records:
 assert r['geometryRef'] in G and r['startDate']<=r['endDate']
 assert r['countryName'] and r['labelAnchors'] and all(s in sources for s in r['sourceIds']),r['id']
collections={n:read('public/data/history/'+n+'.geojson')['features'] for n in ['military-control','military-operations','formation-positions','dated-fronts','historical-logistics','reference-borders']}
for name,features in collections.items():
 assert len({f['properties']['id'] for f in features})==len(features),name
 for f in features:
  p=f['properties'];assert shape(f['geometry']).is_valid and not shape(f['geometry']).is_empty,p['id']
  assert p['snapshots'] and all(d in dates for d in p['snapshots']),p['id']
  assert all(s in sources for s in p['sourceIds']),(p['id'],p['sourceIds'])
  assert p['accuracy'] and p['uncertainty'] and p['note'],p['id']
  if name=='formation-positions':assert p['locationType']=='sector label' and 'commander' in p and p['observationDate']<=min(p['snapshots']),p['id']
  if name=='military-operations' and f['geometry']['type']=='LineString' and f['properties'].get('category') not in ['civilian','advance_axis']:assert p['movementType'] in ['advance','retreat','counterattack','transfer','planned','breakout'],p['id']
projection=Transformer.from_crs(4326,6933,always_xy=True).transform
area=lambda g:transform(projection,g).area/1e6
land=shape(read('public/data/geography/europe-land.geojson')['features'][0]['geometry'])
rows=[]
for d in mappedDates:
 active=[r for r in records if r['startDate']<=d<=r['endDate']];gs=[G[r['geometryRef']] for r in active]
 assert active,d
 gap=area(land.difference(unary_union(gs+[shape(f['geometry']) for f in collections['military-control'] if d in f['properties']['snapshots']])).intersection(box(-12,35,45,69)))
 assert gap<100,(d,'large unshaded land gap',gap)
 for i,g in enumerate(gs):
  for j,h in enumerate(gs[i+1:],i+1):assert not g.intersects(h) or area(g.intersection(h))<25,(d,active[i]['id'],active[j]['id'])
 for xy in [(6.96,50.94),(13.4,52.52),(9.99,53.55)]:assert any(r['visualCategory']=='german-core' and G[r['geometryRef']].covers(Point(xy)) for r in active),(d,xy,'Germany cutoff')
 assert any(r['name']=='Slovak Republic' and G[r['geometryRef']].covers(Point(17.11,48.15)) for r in active),d
 counts={n:sum(d in f['properties']['snapshots'] for f in fs) for n,fs in collections.items()}
 if d.startswith('1941'):assert counts['formation-positions']>=15 and counts['historical-logistics']>=3,(d,counts)
 if d>='1941-07-10':assert counts['dated-fronts']==3 and counts['military-control']>0,(d,counts)
 rows.append(dict(date=d,politicalRegions=len(active),countries=len({r['countryName'] for r in active}),unshadedLandKm2=round(gap,2),**counts))
assert not any(f['geometry']['type']=='LineString' and '1941-06-21' in f['properties']['snapshots'] for f in collections['military-operations'])
assert not any('kiev' in f['properties']['id'].lower() and 'pocket' in f['properties']['title'].lower() for f in collections['military-control'])
for d in ['1941-07-10','1941-07-16','1941-07-23','1941-07-30','1941-08-06','1941-08-12','1941-08-19','1941-08-21','1941-08-25']:
 assert any(f['properties']['id']=='reach-'+d for f in collections['military-control'])
assert any(f['properties']['movementType']=='planned' for f in collections['military-operations'] if '1941-08-21' in f['properties']['snapshots'] and f['geometry']['type']=='LineString')

# Preserve earlier geography and chronology regression gates.
at=lambda d,xy:[r for r in records if r['startDate']<=d<=r['endDate'] and G[r['geometryRef']].covers(Point(xy))]
for d in mappedDates:
 assert any(r['name']=='Hungary' for r in at(d,(21.26,48.72))),d
 assert any(r['visualCategory']=='soviet-core' for r in at(d,(37.62,55.75))),d
assert any(r['name']=='Poland' for r in at('1939-09-01',(24,49.84)))
assert all(r['militaryControl']!='Soviet Union' for r in at('1939-09-17',(24,49.84)))
reach=[f for f in collections['military-control'] if f['properties']['id'].startswith('reach-')]
assert len(reach)==16 and len({hashlib.sha256(json.dumps(f['geometry']).encode()).hexdigest() for f in reach})==16
for f in reach:
 if f['properties']['snapshots'][0]<'1941-07-10':
  assert not shape(f['geometry']).covers(Point(32.05,54.78)),'Premature Smolensk reach'
  assert not shape(f['geometry']).covers(Point(30.52,50.45)),'Premature Kiev reach'
assert any(f['properties']['id']=='pocket-1941-07-03' for f in collections['military-control'])
assert any(f['properties']['id']=='lepel-counterstroke-1941-07-06' for f in collections['military-operations'])
assert any(f['properties']['id']=='slovak-transfer-Spisz-1941-06-21' for f in collections['military-operations'])
for c in read('src/data/territorial-changes.json'):
 assert c['eventDate']<=c['effectiveVisualizationDate'] and all(i in sources for i in c['sourceIds']),c['id']
 assert all(k in c for k in ['previousControl','newControl','previousAdministration','newAdministration','sovereigntyOrClaim','featureIds','uncertainty'])

# Phase IV is a geographic reference, not a claimed dated military reconstruction.
for d in referenceDates:
 assert any(d in f['properties']['snapshots'] for f in collections['reference-borders']),d
 for name in ['military-control','military-operations','formation-positions','dated-fronts','historical-logistics']:
  assert not any(d in f['properties']['snapshots'] for f in collections[name]),(d,name)

protected={p:h for p,h in json.loads((OUT/'before-hashes.json').read_text()).items() if p.startswith('src/content/articles/')}
for p,h in protected.items():assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h,('Article changed',p)
report=dict(result='passed',dates=rows,articlesUnchanged=len(protected),features={n:len(f) for n,f in collections.items()},precisionLimits=['Forward edges are regional syntheses, not surveyed continuous fronts','Several daily German sheets inaccessible: dated documentary synthesis and lower-confidence connecting sectors explicitly identified','Fine administrative boundaries retain documented limits','Modern natural river courses are a separately licensed physical reference'])
(OUT/'data-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print('Passed 31 military map dates and 10 reference-only dates, geometry validity, sources, temporal records and',len(protected),'unchanged articles.')
print(report['features'])
