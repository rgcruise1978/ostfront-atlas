"""Reproducible 22-date enrichment; reads the preserved start-of-task data.
Run with ../../work/map-venv/bin/python scripts/upgrade-map-system.py from project.
Source artwork stays in the research folder, not the public site.
"""
import json,zipfile,re,math
from pathlib import Path
from shapely.geometry import shape,mapping,Point,Polygon,LineString,box
from shapely import make_valid
from shapely.ops import unary_union

ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT.parents[1]/'outputs/all-maps-upgrade'
BACKUP=zipfile.ZipFile(OUT/'before-map-upgrade.zip')
def base(path):return json.loads(BACKUP.read(path))
def save(path,value):
 p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
FC=lambda features:{'type':'FeatureCollection','features':features}
states=base('src/data/territorial-states.json');geoms=base('public/data/history/europe-geometries.geojson')['features']
G={f['properties']['id']:shape(f['geometry']) for f in geoms}
sources=json.loads((ROOT/'src/data/sources.json').read_text());known={s['id'] for s in sources}
ops=base('public/data/history/military-operations.geojson')['features'];control=base('public/data/history/military-control.geojson')['features']
changes=base('src/data/territorial-changes.json');delta=base('public/data/history/territorial-changes.geojson')['features']
formations=[];logistics=[];fronts=[];borders=[]
timelines={n:base('src/data/'+n+'.json') for n in ['timeline','barbarossa-timeline','barbarossa-phase-ii-timeline']}
DATES=[e['date'] for t in timelines.values() for e in t];P2=[e['date'] for e in timelines['barbarossa-phase-ii-timeline']]

def source(id,institution,title,url,notes,kind='Historical map research'):
 if id not in known:
  sources.append(dict(id=id,institution=institution,title=title,url=url,type=kind,relevance=notes,notes=notes,date=None,supports=DATES,reuseRights='Original map interpretation; source artwork is not redistributed. Underlying licensed geometry keeps its existing attribution.'));known.add(id)

source('atlas-command-oob','George E. Blau · U.S. Department of the Army','The German Campaign in Russia: Planning and Operations (1940–1942), DA Pamphlet 20-261a (1955), chart: German Order of Battle, 22 June 1941','https://www.landsurvival.com/MANUALS/UsArmyWwiiGermanPlanOpsRussia1940-421955.pdf','German command names and opening organizational relationships from the inspected order-of-battle chart. Later positions use dated situation sheets; a chart does not establish headquarters coordinates.')
source('atlas-alignment','United States Holocaust Memorial Museum · treaty and campaign records','Axis Alliance in World War II; existing dated occupation and diplomatic records','https://encyclopedia.ushmm.org/content/en/article/axis-alliance-in-world-war-ii','Alignment categories distinguish formal partners, co-belligerents, occupation and the British–Soviet alliance; country identity and military control remain separate.')

# Preserve sovereign identity and independent labels alongside changing control.
country_names={'germany':'GERMAN REICH','protectorate':'BOHEMIA & MORAVIA','danzig-prewar':'DANZIG','danzig-annexation':'DANZIG','oct-annex':'POLAND','oct-gg':'POLAND','lodz-october-unresolved':'POLAND','soviet-poland-oct':'POLAND','german-poland-1941':'POLAND','gg-1941':'POLAND','soviet-poland-1941':'POLAND','finnish-cessions':'FINLAND · 1940 cessions','soviet-bessarabia':'BESSARABIA & N. BUKOVINA'}
neutral={'Sweden','Switzerland','Liechtenstein','Portugal','Andorra','Monaco','San Marino','Vatican City','Ireland','Turkey'}
axis={'Germany','Slovakia','Hungary','Romania','Bulgaria','Italy'}
def alignment(r,date):
 name=r['name'];actor=r['militaryControl'];country=r.get('countryName',name).title()
 if 'unresolved' in r['visualCategory']:return ('unresolved','Status unresolved')
 if actor=='Germany':return ('axis','German authority / Axis')
 if actor in ['Hungary','Romania','Bulgaria','Slovakia']:
  if date<'1940-09-01' and actor in ['Romania','Hungary','Bulgaria']:return ('neutral','Neutral / own administration')
  if actor=='Romania' and date=='1941-06-21':return ('axis','Axis partner; offensive begins later')
  return ('axis','Axis partner / own administration')
 if actor=='Italy':return ('axis','Axis partner; non-belligerent in September 1939' if date<'1940-06-10' else 'Axis belligerent / own or occupation administration')
 if actor=='Finland':return ('cobelligerent','German co-belligerent; not a Tripartite Pact member' if date>='1941-06-25' else 'Military cooperation with Germany; not yet at war with USSR' if date>='1941-06-21' else 'Independent / neutral')
 if actor=='Soviet Union':return ('allied','Allied with Britain against Germany' if date>='1941-07-12' else 'Fighting Germany; Anglo-Soviet agreement not yet signed' if date>='1941-06-22' else 'Separate power; pact with Germany is not a formal military alliance')
 if actor=='United Kingdom':return ('allied','Allied belligerent' if date>='1939-09-03' else 'Guarantee to Poland; war not yet declared')
 if actor=='France':return ('allied','Allied belligerent' if date>='1939-09-03' else 'Independent / guarantee to Poland')
 if actor=='French State':return ('collaboration','Vichy administration; collaboration does not equal German territorial annexation')
 if actor=='Poland':return ('allied','Polish state; British/French guarantees; resistance and government continue')
 if actor=='Croatian client administration':return ('axis','German–Italian client administration')
 if name in ['Spain']:return ('neutral','Non-belligerent' if date>='1941-06-21' else 'Neutral')
 if name in neutral:return ('neutral','Neutral / own administration')
 return ('independent',r['politicalAlignment'])

for r in states:
 if r['endDate']=='1941-07-09':r['endDate']='1941-08-25'
 name=r['name']
 display=country_names.get(r['id'])
 if display is None:
  display=name.replace(' under Soviet occupation','').replace(' under German occupation','').replace('German-occupied ','').replace('French State · unoccupied zone','FRANCE').replace('Slovak Republic','SLOVAKIA').upper()
  if r['id'].startswith('soviet-') and any(n in r['id'] for n in ['lithuania','latvia','estonia']):display=r['id'].replace('soviet-','').upper()
  if r['id'].startswith('treaty-sector-'):display='POLAND'
  if r['id'].startswith('yugoslav-'):display='YUGOSLAVIA'
  if r['id'].startswith('greece-'):display='GREECE'
  if r['id']=='croatia-client':display='CROATIA'
 r['countryName']=display
 r['controller']=r['militaryControl']
 r['subtitle']=('German occupation' if r['militaryControl'].startswith('Germany') and r['visualCategory']!='german-core' else 'Soviet occupation / claim' if r['visualCategory']=='soviet-occupation' else 'Vichy administration' if r['id']=='france-vichy' else r['occupationAdministration'] if r['id'].startswith(('yugoslav-','greece-')) else '')
 g=G[r['geometryRef']]
 representative=g.representative_point();r['labelCoordinates']=r.get('labelCoordinates') or [representative.x,representative.y]
 minx,miny,maxx,maxy=g.bounds
 candidates=[]
 for ix in range(1,12):
  for iy in range(1,12):
   x=minx+(maxx-minx)*ix/12;y=miny+(maxy-miny)*iy/12
   if g.contains(Point(x,y)):candidates.append([round(x,4),round(y,4)])
 r['labelAnchors']=[r['labelCoordinates'],[round(representative.x,4),round(representative.y,4)],*candidates]
 r['alignmentByPeriod']=[dict(startDate='1939-08-23',endDate='1939-10-26',key=alignment(r,'1939-09-17')[0],label=alignment(r,'1939-09-17')[1]),dict(startDate='1941-06-21',endDate='1941-08-25',key=alignment(r,'1941-06-21')[0],label=alignment(r,'1941-06-21')[1])]

def feat(id,title,geometry,date,actor='Germany',kind='formation',sources=None,**extra):
 props=dict(id=id,title=title,name=title,label=title,actor=actor,category=kind,snapshots=[date],startDate=date,endDate=date,sourceIds=sources or ['loc-lage-'+date],accuracy='Generalized operational sector; not a surveyed headquarters location',uncertainty='Source locations and reporting times vary. Approximate sector anchors do not locate every component of a formation.',note='Position denotes an operational sector, not a headquarters or proof of control of all intervening ground.',locationType='sector label',evidenceStatus='reported',observationDate=date)
 props.update(extra)
 return dict(type='Feature',geometry=mapping(geometry),properties=props)

def formation(id,name,commander,xy,date,region,echelon='army',actor='Germany',parent='',sources=None,**extra):
 if actor=='Germany' and sources:
  sources=[s for s in sources if s.startswith('loc-lage-') or s in ['atlas-july30-map','cmh-blitz','blau-planning','atlas-command-oob','us-army-polish-campaign']] or ['cmh-blitz']
 formations.append(feat(id+'-'+date,name,Point(xy),date,actor,'formation',sources,commander=commander,displayLabel=name+'\n'+commander if commander else name,echelon=echelon,parentFormation=parent,region=region,identityConfidence='Dated command identity; unknown commanders are left blank',positionConfidence='Representative sector anchor; not headquarters coordinates',reportingTime='See the cited sheet or document; not synchronized to one hour',**extra))

def movement(id,title,points,date,region,actor='Germany',kind='advance',sources=None,**extra):
 ops.append(feat('move-'+id+'-'+date,title,LineString(points),date,actor,'movement',sources,region=region,movementType=kind,movementStatus=kind,evidenceStatus='planned' if kind=='planned' else 'reported',locationType='generalized axis',**extra))

def event(id,title,xy,date,region,actor='Soviet Union',sources=None,**extra):
 ops.append(feat(id+'-'+date,title,Point(xy),date,actor,'engagement',sources,region=region,locationType='identified locality',**extra))

def finalize():
 save('src/data/territorial-states.json',states)
 save('src/data/sources.json',sources)
 save('public/data/history/military-operations.geojson',FC(ops))
 save('public/data/history/military-control.geojson',FC(control))
 save('public/data/history/formation-positions.geojson',FC(formations))
 save('public/data/history/historical-logistics.geojson',FC(logistics))
 save('public/data/history/dated-fronts.geojson',FC(fronts))
 save('public/data/history/reference-borders.geojson',FC(borders))
 save('src/data/territorial-changes.json',changes)
 save('public/data/history/territorial-changes.geojson',FC(delta))
 for name,events in timelines.items():save('src/data/'+name+'.json',events)
 index={}
 for date in DATES:
  active=lambda collection:[f for f in collection if date in f['properties'].get('snapshots',[])]
  oo=active(ops);cc=active(control);ff=active(formations)
  index[date]=dict(movementActors=sorted({f['properties']['actor'] for f in oo if f['geometry']['type']=='LineString'}),controlCategories=sorted({f['properties']['visualCategory'] for f in cc}),operations=len(oo),areas=len(cc),formations=len(ff),logistics=len(active(logistics)),fronts=len(active(fronts)),referenceDate=date,timeConvention=('Political situation on the stated date' if date in ['1939-08-23','1939-09-28','1939-10-26'] else 'Deployment before the invasion' if date=='1941-06-21' else 'Dated synthesis; component reports use different stated times'),precision='Regional synthesis; approximate operational edges, not surveyed fronts')
 save('src/data/map-snapshot-index.json',index)
 for row in json.loads((OUT/'coverage-matrix.json').read_text()):
  pass

if __name__=='__main__':
 import runpy
 runpy.run_path(str(ROOT/'scripts/map-research-records.py'),init_globals=globals())
