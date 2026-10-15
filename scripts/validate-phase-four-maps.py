"""Phase IV chronology, geometry, coverage and preservation gates."""
from pathlib import Path
import json,hashlib,runpy
from shapely.geometry import shape,Point,box
from shapely.ops import unary_union
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'phase-iv-maps-review'
read=lambda p:json.loads((ROOT/p).read_text())
rows=read('src/data/barbarossa-phase-iv-timeline.json');dates=[r['date'] for r in rows]
collections={n:read('public/data/history/'+n+'.geojson')['features'] for n in ['military-control','military-operations','formation-positions','dated-fronts','historical-logistics']}
G={f['properties']['id']:shape(f['geometry']) for f in read('public/data/history/europe-geometries.geojson')['features']};states=read('src/data/territorial-states.json');sources={s['id'] for s in read('src/data/sources.json')};context=read('public/data/history/phase-iv-study-context.json');coverage=read('phase-iv-maps-review/coverage-matrix.json')
assert len(rows)==10 and len(coverage)>0
baseline=read('phase-iv-maps-review/before-hashes.json')
for p,h in baseline.items():
 if p.startswith('src/content/articles/') or p=='src/map/cartography.js':assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h,('Protected content/palette changed',p)
ids=set();features={};report=[]
for name,fs in collections.items():
 for f in fs:
  p=f['properties'];features[p['id']]=f
  if not p['id'].startswith('p4-'):continue
  assert p['id'] not in ids,p['id'];ids.add(p['id']);g=shape(f['geometry']);assert g.is_valid and not g.is_empty,p['id']
  assert len(p['snapshots'])==1 and p['snapshots'][0] in dates and p['phaseId']=='4'
  assert p['sourceIds'] and all(s in sources and p['sourceLocators'].get(s) for s in p['sourceIds']),p['id']
  assert p['note'] and p['accuracy'] and p['uncertainty'] and p['observationDate']<=p['snapshots'][0],p['id']
  if name=='military-operations' and g.geom_type=='LineString':assert p.get('movementType') in ['advance','counterattack','retreat','transfer','planned','breakout']
  if name=='formation-positions':assert p['locationType']=='sector label' and p.get('echelon') and 'commander' in p
  if p.get('movementType')!='planned' and p.get('movementEnd'):assert p['movementEnd']<=p['snapshots'][0],p['id']
# Historical article links do not send a user to a nonexistent section.
articles={a['slug']:a for a in [read(str(p.relative_to(ROOT))) for p in (ROOT/'src/content/articles').glob('*.json')]}
for d in dates:
 fs={n:[f for f in vs if d in f['properties']['snapshots']] for n,vs in collections.items()}
 assert all(fs.values()),d
 reach=shape(features['p4-'+d+'-reach']['geometry']);held=unary_union([G[r['geometryRef']] for r in states if r['id'].startswith('p4-'+d) and r['militaryControl']=='Soviet Union'])
 romanian=shape(features['p4-'+d+'-romanian-authority']['geometry'])
 assert romanian.intersection(reach).area<1e-8,(d,'Romanian/German authority overlap')
 assert romanian.covers(Point(30.723,46.482))==(d>='1941-10-16'),(d,'Odessa occupation chronology')
 assert held.covers(Point(30.723,46.482))==(d<'1941-10-16'),(d,'Odessa defense chronology')
 assert reach.covers(Point(22.6,58.9))==(d>='1941-10-21'),(d,'Hiiumaa not entirely German before 21 October')
 assert reach.covers(Point(22.12,58.08))==(d>='1941-10-05'),(d,'Sõrve surrender chronology')
 assert held.covers(Point(37.617,55.755)),(d,'Moscow must remain Soviet-held')
 assert held.covers(Point(37.62,54.2)),(d,'Tula must remain Soviet-held')
 assert held.covers(Point(33.53,44.60)),(d,'Sevastopol must remain Soviet-held')
 assert held.covers(Point(36.47,45.36)),(d,'Kerch not fully cleared before final date')
 assert held.covers(Point(39.72,47.23)),(d,'Rostov must remain Soviet-held')
 for city,xy,capture in [('Orel',(36.07,52.97),'1941-10-03'),('Kalinin',(35.9,56.86),'1941-10-14'),('Kharkov',(36.23,49.99),'1941-10-24'),('Tikhvin',(33.52,59.65),'1941-11-08')]:
  assert reach.covers(Point(xy))==(d>=capture),(d,city,'control chronology')
 assert not any('pocket' in f['properties']['id'] for f in fs['military-control']) if d<'1941-10-07' else True
 for xy in [(6.96,50.94),(13.4,52.52),(9.99,53.55)]:assert any(r['visualCategory']=='german-core' and G[r['geometryRef']].covers(Point(xy)) for r in states if r['startDate']<=d<=r['endDate']),(d,'Germany clipping')
 for p in context[d]['paragraphs']:
  assert p['articleSlug'] in articles and p['section'] in [s['id'] for s in articles[p['articleSlug']]['sections']]
  assert p['text'] and p['disposition'] in ['mapped','qualified','contextual','unresolved']
  assert all(id in ids for id in p['featureIds'])
  assert all(s in sources for s in p['sourceIds'])
 for r in [r for r in coverage if r['date']==d]:assert r['claim'] and r['contextId'] in {p['id'] for p in context[d]['paragraphs']} and r['status']=='implemented'
 report.append({'date':d,'features':{n:len(v) for n,v in fs.items()},'paragraphs':len(context[d]['paragraphs']),'sentenceRecords':sum(r['date']==d for r in coverage)})
# Each current front differs where the sourced military situation changes. A
# stable central sector is allowed during the November lull; other fronts change.
frontHashes=[hashlib.sha256(json.dumps([f['geometry'] for f in collections['dated-fronts'] if d in f['properties']['snapshots']],sort_keys=True).encode()).hexdigest() for d in dates];assert len(set(frontHashes))==10
# No earlier snapshot can acquire a new Phase IV feature.
assert all(min(f['properties']['snapshots'])>='1941-09-30' for vs in collections.values() for f in vs if f['properties']['id'].startswith('p4-'))
OUT.mkdir(exist_ok=True);(OUT/'phase-iv-validation.json').write_text(json.dumps({'result':'passed','dates':report,'sentencesAccountedFor':len(coverage),'protectedArticleFiles':sum(p.startswith('src/content/articles/') for p in baseline),'paletteUnchanged':True},indent=2)+'\n')
print('Phase IV passed: ten distinct dated situations, city-control chronology, feature sources, full article context, protected articles and unchanged palette.')
