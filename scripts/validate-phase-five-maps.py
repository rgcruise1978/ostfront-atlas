"""Historical, geometry, citation, chronology and preservation gates for Phase V."""
from pathlib import Path
import json,hashlib,zipfile,runpy,re
from html.parser import HTMLParser
from shapely.geometry import shape,Point
from shapely.ops import unary_union
R=Path(__file__).resolve().parents[1];O=R/'phase-v-maps-review';read=lambda p:json.loads((R/p).read_text());before=zipfile.ZipFile(O/'before-state.zip');old=lambda p:json.loads(before.read(p));baseline=read('phase-v-maps-review/before-manifest.json')
records=runpy.run_path(str(R/'scripts/phase-five-map-records.py'));P=records['P'];dates=records['DATES'];articles={a['slug']:a for a in [json.loads(p.read_text()) for p in (R/'src/content/articles').glob('*.json')]};assert len(articles)==50
for path,h in baseline.items():
 if path.startswith('src/content/articles/') or path=='src/map/cartography.js' or path.startswith('public/data/geography/'):
  assert hashlib.sha256((R/path).read_bytes()).hexdigest()==h,('Protected file changed',path)
for name in ['src/data/sources.json','src/data/territorial-states.json']:
 current={r['id']:r for r in read(name)}
 assert all(current[r['id']]==r for r in old(name)),('Earlier record changed',name)
idx=read('src/data/map-snapshot-index.json');assert all(idx[d]==v for d,v in old('src/data/map-snapshot-index.json').items() if d<dates[0])
for name in ['public/data/history/europe-geometries.geojson','public/data/history/military-control.geojson','public/data/history/military-operations.geojson','public/data/history/formation-positions.geojson','public/data/history/dated-fronts.geojson','public/data/history/historical-logistics.geojson','public/data/history/territorial-changes.geojson']:
 current={f['properties']['id']:f for f in read(name)['features']};assert all(current[f['properties']['id']]==f for f in old(name)['features']),('Earlier geometry changed',name)
# Border reference extension may add dates, never alter old geometry or metadata.
p='public/data/history/reference-borders.geojson';cur={f['properties']['id']:f for f in read(p)['features']}
for f in old(p)['features']:
 g=cur[f['properties']['id']];assert g['geometry']==f['geometry'];assert set(f['properties']['snapshots'])<=set(g['properties']['snapshots'])
 for k,v in f['properties'].items():
  if k not in ['snapshots','endDate']:assert g['properties'][k]==v
sources={s['id'] for s in read('src/data/sources.json')};states=read('src/data/territorial-states.json');G={f['properties']['id']:shape(f['geometry']) for f in read('public/data/history/europe-geometries.geojson')['features']}
collections={n:read('public/data/history/'+n+'.geojson')['features'] for n in ['military-control','formation-positions','military-operations','dated-fronts','historical-logistics','territorial-changes']};context=read('public/data/history/phase-v-study-context.json');coverage=read('phase-v-maps-review/coverage-matrix.json');ids=set();features={}
for layer,fs in collections.items():
 for f in fs:
  p=f['properties'];features[p['id']]=f
  if not p['id'].startswith('p5-'):continue
  assert p['id'] not in ids;ids.add(p['id']);g=shape(f['geometry']);assert g.is_valid and not g.is_empty,p['id']
  assert p['snapshots']==[p['startDate']] and p['startDate']==p['endDate'] and p['startDate'] in dates and p['phaseId']=='5'
  assert p['sourceIds'] and all(s in sources and p['sourceLocators'].get(s) for s in p['sourceIds']),('Sources',p['id'])
  assert p['accuracy'] and p['uncertainty'] and p['note'] and p['articleSlug'] in articles
  assert p['articleSections'] and all(s in [x['id'] for x in articles[p['articleSlug']]['sections']] for s in p['articleSections'])
  if p.get('movementType')!='planned' and p.get('movementEnd'):assert p['movementStart']<=p['movementEnd']<=p['startDate'],('Future movement',p['id'])
  if layer=='formation-positions':assert p['locationType']=='sector label' and p['echelon'] and 'commander' in p
reports=[]
class Count(HTMLParser):
 def __init__(self):super().__init__();self.n=0
 def handle_starttag(self,t,a):
  if t=='p':self.n+=1
for d in dates:
 fs={n:[f for f in fl if f['properties']['snapshots']==[d]] for n,fl in collections.items()};reach=shape(features['p5-'+d+'-reach']['geometry']);held=unary_union([G[s['geometryRef']] for s in states if s['id'].startswith('p5-'+d) and s['militaryControl']=='Soviet Union'])
 for name in ['Moscow','Tula','Leningrad','Sevastopol','Dmitrov','Kashira']:assert held.covers(Point(P[name])),(d,name,'must remain Soviet-held')
 for name in ['Kalinin','Kharkov','Taganrog','Tikhvin']:assert reach.covers(Point(P[name])),(d,name,'must remain occupied')
 for name,capture in [('Klin','1941-11-24'),('Solnechnogorsk','1941-11-24'),('Istra','1941-11-28'),('Venev','1941-11-24'),('Mikhaylov','1941-11-28'),('Kerch','1941-11-18')]:assert reach.covers(Point(P[name]))==(d>=capture),(d,name,'capture chronology')
 assert reach.covers(Point(P['Rostov']))==('1941-11-21'<=d<='1941-11-28'),(d,'Rostov chronology')
 assert held.covers(Point(P['Rostov']))==(d<'1941-11-21' or d>='1941-11-29')
 assert reach.intersection(held).area<1e-8
 for xy in [(6.96,50.94),(13.4,52.52),(9.99,53.55)]:assert any(s['visualCategory']=='german-core' and G[s['geometryRef']].covers(Point(xy)) for s in states if s['startDate']<=d<=s['endDate']),(d,'Germany clipping')
 rows=context[d]['paragraphs'];a=articles[context[d]['articleSlug']];parser=Count();parser.feed(a['body']);assert len(rows)==parser.n,(d,'paragraph coverage')
 assert all(row['featureIds']==[] or row['disposition']=='qualified' for row in rows)
 for row in rows:
  assert row['section'] in [s['id'] for s in a['sections']] and row['text']
  assert all(fid in ids and features[fid]['properties']['snapshots']==[d] for fid in row['featureIds'])
  assert all(s in sources and row['sourceLocators'].get(s) for s in row['sourceIds'])
 assert len([x for x in coverage if x['articleDate']==d])==len(rows)
 assert len(fs['formation-positions'])>=40 and len(fs['military-operations'])>=10 and len(fs['historical-logistics'])>=10
 assert {'Germany','Soviet Union'} <= {f['properties']['actor'] for f in fs['formation-positions']}
 if d<'1941-11-28':assert not any('1st Guards Cavalry' in f['properties']['title'] for f in fs['formation-positions'])
 if d=='1941-11-24':assert any('78th Rifle' in f['properties']['title'] for f in fs['formation-positions'])
 if d=='1941-11-28':assert 'p5-'+d+'-canal-foothold' in features
 if d=='1941-11-29':assert not any('canal-foothold' in f['properties']['id'] for f in fs['military-control'])
 if d=='1941-12-05':assert all(f['properties'].get('movementType')=='planned' for f in fs['military-operations'] if f['properties']['id'].endswith(('western-north-plan','rokossovsky-plan','southern-plan','yelets-plan')))
 reports.append(dict(date=d,counts={k:len(v) for k,v in fs.items()},paragraphs=len(rows)))
report=dict(result='passed',articlesUnchanged=50,paletteUnchanged=True,earlierDatesUnchanged=41,earlierSourceRecordsUnchanged=len(old('src/data/sources.json')),paragraphs=len(coverage),features=len(ids),dates=reports)


# Offshore closure must not leave an artificial Soviet strip on the north
# Crimean approaches or annex the Soviet Kuban coast to the German reach.
for d in dates:
 reach=next(shape(f['geometry']) for f in read('public/data/history/military-control.geojson')['features'] if f['properties']['id']=='p5-'+d+'-reach')
 assert reach.covers(Point(34.76641037,46.22229558)),(d,'Arabat coastal cutoff')
 assert not reach.covers(Point(38.28,46.70)),(d,'Premature occupation of Yeysk')

(O/'validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
