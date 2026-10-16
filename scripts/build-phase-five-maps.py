"""Reproducible Phase V maps; earlier records and article bytes are preserved."""
from pathlib import Path
import json,runpy,re,hashlib,copy,math
from html.parser import HTMLParser
from shapely.geometry import shape,mapping,Polygon,Point,LineString,box
from shapely import make_valid
from shapely.ops import unary_union
ROOT=Path(__file__).resolve().parents[1];H=ROOT/'public/data/history';D=ROOT/'src/data';OUT=ROOT/'phase-v-maps-review'
R=runpy.run_path(str(Path(__file__).with_name('phase-five-map-records.py')));P=R['P'];DATES=R['DATES']
read=lambda p:json.loads(p.read_text())
def write(p,d):p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
FC=lambda fs:{'type':'FeatureCollection','features':fs}
def clean(g):
 g=make_valid(g)
 if g.geom_type=='GeometryCollection':g=unary_union([x for x in g.geoms if x.geom_type in ['Polygon','MultiPolygon']])
 return g
collections={n:read(H/(n+'.geojson')) for n in ['military-control','military-operations','formation-positions','dated-fronts','historical-logistics','territorial-changes']}
for c in collections.values():c['features']=[f for f in c['features'] if not f['properties']['id'].startswith('p5-')]
geo=read(H/'europe-geometries.geojson');geo['features']=[f for f in geo['features'] if not f['properties']['id'].startswith('p5-')];G={f['properties']['id']:shape(f['geometry']) for f in geo['features']}
states=[s for s in read(D/'territorial-states.json') if not s['id'].startswith('p5-')]
# New continuation records rather than edits to any earlier dated state.
for s in list(states):
 if s['endDate']=='1941-11-14' and not s['id'].startswith(('p3-','p4-')):
  t=copy.deepcopy(s);t.update(id='p5-continuation-'+s['id'],startDate=DATES[0],endDate=DATES[-1],phaseId='5')
  for p in t.get('alignmentByPeriod',[]):
   if p.get('endDate')=='1941-11-14':p['endDate']=DATES[-1]
  states.append(t)
articles={d:next(read(p) for p in (ROOT/'src/content/articles').glob('*.json') if read(p).get('historicalDate')==d) for d in DATES}
sources=read(D/'sources.json');BASE=['p5-cmh-moscow'];L={}
for a in articles.values():
 for k,v in a.get('sourceLocators',{}).items():L[k]='; '.join(v[:2])
for k,title,url,notes in [('p5-map-moscow','Map 3: Army Group Center, 15 November–5 December 1941','3','Printed p.46. Dotted front is 15 November; dashed front is 5 December. Attack arrows summarize the interval, not eight daily fronts. Scale bar 50 miles / 50 kilometres. Intermediate dates use the chapter narrative and named localities.'),('p5-map-south','Map 4: Army Group South, 28 November–3 December 1941','4','Printed p.56. Dashed front is 28 November; dotted front is 3 December; Soviet arrows summarize the retreat interval. Scale bars 50 miles / 50 kilometres. 29 November position is a qualified transition, not the completed Mius withdrawal.'),('p5-map-north','Map 5: Army Group North, 1 December 1941','5','Printed p.58. Dashed front is 1 December. Scale bars 50 miles / 50 kilometres. Used for northern sector orientation, with dated text for preceding and following events.')]:
  sources=[s for s in sources if s['id']!=k];sources.append(dict(id=k,institution='Earl F. Ziemke and Magna E. Bauer · U.S. Army Center of Military History',title='Moscow to Stalingrad (1987), '+title,date='1987',url='https://www.ibiblio.org/hyperwar/USA/USA-EF-Decision/maps/USA-EF-Decision-'+url+'.jpg',type='Official retrospective military-history map',relevance='Phase V dated regional reconstruction',supports=DATES,notes='Full image inspected for this task. '+notes,reuseRights='U.S. government historical map. Original vector interpretation; source artwork is not reproduced in the public atlas.'));L[k]=notes
L['p4-usma-1949']='Printed p.44 footnote: Hoth transferred to 17th Army on 5 October. Position shown from the CMH southern map; no precise headquarters inferred.'
L['p4-transnistria']='Museum article and map, governorate between Dniester and Southern Bug; original regional geometry retained. No sovereign transfer inferred.'
L['p4-kirchubel-barbarossa']='End Game: Typhoon; northern and southern regional dispositions. Precise local fronts are not established by this broad campaign account.'
L['p4-cmh-leningrad']='Chapter VII, pp.135–139: Tikhvin, Ladoga transshipment and ice-road operations. A supply connection is distinct from adequate delivery capacity.'
FEATURES={d:[] for d in DATES}
def feature(layer,d,key,title,coords,kind='Point',actor='',src=None,note='',**extra):
 src=src or BASE;f=dict(type='Feature',geometry=dict(type=kind,coordinates=coords),properties=dict(id=f'p5-{d}-{key}',title=title,name=title,label=title,actor=actor,category='engagement' if layer=='military-operations' else 'formation' if layer=='formation-positions' else 'rail-corridor' if layer=='historical-logistics' else 'front' if layer=='dated-fronts' else 'military_area',snapshots=[d],startDate=d,endDate=d,observationDate=d,reportingTime='Dated regional synthesis; component event dates in notes',accuracy='Regional locality/sector interpretation',uncertainty='Sectors and route bends are approximate. This is not a headquarters coordinate, surveyed tactical route, or proof of secure control between localities.',evidenceStatus='documented event / regional interpretation',locationType='sector label' if layer=='formation-positions' else 'locality or schematic corridor',sourceIds=src,sourceLocators={s:[L.get(s,'See the corresponding published study’s source locators.')] for s in src},note=note,phaseId='5',operationalContext=True));f['properties'].update(extra)
 collections[layer]['features'].append(f);FEATURES[d].append(f);return f

def point(d,key,title,place,actor='Soviet Union',src=None,note='',**kw):return feature('military-operations',d,key,title,P[place] if isinstance(place,str) else place,actor=actor,src=src,note=note,**kw)
def move(d,key,title,places,actor='Germany',typ='advance',src=None,note='',start=None,end=None,outcome='Reported operational direction',**kw):
 coords=[P[p] if isinstance(p,str) else p for p in places];f=feature('military-operations',d,key,title,coords,'LineString',actor,src,note,movementType=typ,movementStart=start or d,movementEnd=end or d,outcome=outcome,labelCoordinates=coords[len(coords)//2],shortLabel=kw.pop('shortLabel',title),**kw);return f

def form(d,key,title,xy,actor,commander,parent,echelon='army',note='',src=None):return feature('formation-positions',d,key,title,xy,actor=actor,src=src,note=note or 'Representative command sector, not a surveyed headquarters or full unit footprint.',echelon=echelon,commander=commander,parentFormation=parent,displayLabel=title+('\n'+commander if commander else ''),labelPriority=1 if echelon in ['army-group','front'] else 2 if echelon=='army' else 3)
def log(d,key,title,places,src=None,note='',category='rail-corridor'):
 xy=[P[p] if isinstance(p,str) else p for p in places];return feature('historical-logistics',d,key,title,xy if len(xy)>1 else xy[0],'LineString' if len(xy)>1 else 'Point',src=src,note=note,category=category,labelCoordinates=xy[len(xy)//2])
def area(d,key,title,g,visual,actor,src,note):
 f=feature('military-control',d,key,title,[],actor=actor,src=src,note=note,visualCategory=visual,pattern='contested-cross' if visual=='contested' else 'occupation-hatch',militaryControl='Continued Soviet resistance' if visual=='contested' else 'Reported operational reach; consolidation unresolved',sovereigntyStatus='Military situation does not transfer sovereignty');f['geometry']=mapping(clean(g));return f
# More precise source passages override broad defaults at feature creation.
L['p5-cmh-moscow']='Chapter III, pp.49–65: dated Moscow and Rostov operations; see feature event and interval. Map 3 supplies only 15 November and 5 December lines.'
L['p5-rostov-museum']='Museum chronology, paragraphs beginning 17 November, 21 November, 27 November and 29 November; named divisional junction, Don crossings and recapture. Local recollection does not establish exact street positions.'
L['p5-guderian-flanks']='Section Attack on Tula, dated entries 17–18, 21, 24, 27 November and 2–5 December. Postwar command account; claims of responsibility, strength and losses treated critically.'
L['p5-canal-report28']='Western Front report: TsAMO f.208 op.2511 d.219 ll.404–405; reproduced armoured-train commander report at 14:35; 29th/50th Brigade accounts. Published transcriptions inspected, not archival originals; conflicting times and enemy-loss claims not adopted.'
maskIds=['soviet-union','poland-soviet-east','estonia','finnish-cessions-1940'];mask=clean(unary_union([G[k] for k in maskIds]))
priorFinn=next(shape(f['geometry']) for f in collections['military-control']['features'] if f['properties']['id']=='p4-1941-11-14-finnish-reach')
romanian=next(shape(f['geometry']) for f in collections['military-control']['features'] if f['properties']['id']=='p4-1941-11-14-romanian-authority')
crimea=mask.intersection(box(32.3,44.2,36.7,46.1))
sev=Polygon([(33.37,44.78),(33.58,44.83),(33.72,44.74),(33.77,44.60),(33.67,44.49),(33.41,44.48),(33.37,44.78)]).intersection(mask)
oranienbaum=Polygon([(29.1,59.94),(29.75,60.02),(29.9,59.86),(29.65,59.76),(29.15,59.78),(29.1,59.94)]).intersection(mask)
previous=next(shape(f['geometry']) for f in collections['military-control']['features'] if f['properties']['id']=='p4-1941-11-14-reach')
for i,d in enumerate(DATES):
 src=['p5-cmh-moscow','p5-map-moscow','p5-map-south','p5-map-north']
 edge=R['NORTH'][d]+R['CENTRE'][d][1:]+R['SOUTH'][d][1:]
 # Close offshore through the Azov/Kerch/Black Sea waters, keeping the
 # Soviet Kuban coast outside and avoiding a straight cutoff across Crimea.
 envelope=Polygon([(-25,edge[0][1]),*edge,(37.5,46.7),(36.55,46.25),(36.65,45.75),(36.65,45.3),(36.60,44.85),(35.5,44.1),(32,43.6),(-25,43.6),(-25,edge[0][1])])
 reach=clean(mask.intersection(envelope).union(crimea).difference(sev.union(oranienbaum).union(priorFinn).union(romanian)))
 # Kerch's evacuation/capture falls on 16 November: retain a separate Soviet
 # peninsula on 15 November only; do not import late-December landings.
 if d=='1941-11-15':reach=clean(reach.difference(Polygon([(35.35,45.10),(35.3,45.6),(36.8,45.7),(36.8,44.9),(35.35,45.10)])))
 area(d,'reach','German occupation / forward operational reach',reach,'operational','Germany',src,'Dated regional envelope anchored to named localities and operational accounts. Joins away from documented engagements have low confidence; hatching is not proof of consolidated control. No arrow buffers are used. Moscow, Tula, Leningrad and Sevastopol remain Soviet-held.')
 area(d,'romanian-authority','Transnistria · Romanian administration',romanian,'romanian-military','Romania',['p4-transnistria'],'Regional authority between Dniester and Southern Bug; no sovereign annexation inferred. Earlier inspected geographic interpretation retained.')
 area(d,'finnish-reach','Finnish Svir / Karelian operational sector',priorFinn,'finnish-operational','Finland',['p5-map-north','p4-kirchubel-barbarossa'],'Broad Svir and isthmus setting; not a newly surveyed daily line across all Karelia. No German–Finnish junction east of Ladoga. Fine northern changes remain unresolved.')
 held=clean(mask.difference(reach.union(romanian).union(priorFinn)))
 for part in maskIds:
  g=clean(G[part].intersection(held))
  if g.is_empty:continue
  id=f'p5-{d}-{part}-held';geo['features'].append(dict(type='Feature',properties={'id':id},geometry=mapping(g)))
  anchors=[[x,y] for x in [30,32,34,36,38,40,42,45,50] for y in [45,48,51,53,55,56,57,59,60,62,65] if g.covers(Point(x,y))];label=next((a for a in anchors if a==[40,55]),list(g.representative_point().coords)[0])
  states.append(dict(id=id,name='Soviet-held territory',historicalName='Soviet Union',geometryRef=id,entity='Soviet Union',countryName='SOVIET UNION',sovereigntyStatus='Occupation and disputed incorporations remain separate from country identity',militaryControl='Soviet Union',controller='Soviet Union',occupationAdministration='Soviet administration / defended territory',annexationClaim='None inferred',politicalAlignment='Allied belligerent',startDate=d,endDate=d,visualCategory='soviet-core' if part=='soviet-union' else 'soviet-occupation',sourceIds=src,sourceLocators={s:[L[s]] for s in src},accuracy='Regional residual outside documented Axis reach',uncertainty='Connecting edges are generalized; local control unresolved between documented positions.',note='Defended cities and maritime pockets retained. Not an assertion of a continuous surveyed front.',labelCoordinates=label,labelAnchors=[label]+anchors,labelPriority=2,phaseId='5',operationalContext=True,subtitle=''))
 for part,country,label,controller,visual in [('estonia','Estonia',[25.5,58.8],'Germany','german-occupation'),('poland-soviet-east','Poland',[25,52],'Germany','german-occupation'),('transnistria','Soviet Ukraine',[29.6,47.6],'Romania','romanian-military')]:
  g=romanian if part=='transnistria' else clean(G[part].intersection(reach));id=f'p5-{d}-{part}-occupied'
  if g.is_empty:continue
  if not g.covers(Point(label)):label=list(g.representative_point().coords)[0]
  geo['features'].append(dict(type='Feature',properties={'id':id},geometry=mapping(g)))
  states.append(dict(id=id,name=country+' · '+controller+' occupation',historicalName=country,geometryRef=id,entity=country,countryName=country.upper(),sovereigntyStatus='Occupation is not sovereign transfer',militaryControl=controller,controller=controller,occupationAdministration='Romanian Transnistria administration' if part=='transnistria' else 'German occupation; administrative divisions not reconstructed',annexationClaim='None inferred',politicalAlignment='Occupied territory',startDate=d,endDate=d,visualCategory=visual,sourceIds=['p4-transnistria'] if part=='transnistria' else src,accuracy='Historical country outline / regional military partition',uncertainty='Administrative and local tactical boundaries are generalized.',note='Country identity remains visible independently of military control.',labelCoordinates=label,labelAnchors=[label],labelPriority=2,phaseId='5',operationalContext=True,subtitle=controller+' authority'))
 for region,coords,ss in [('north',R['NORTH'][d],['p5-map-north','p5-cmh-counteroffensive']),('center',R['CENTRE'][d],['p5-map-moscow','p5-cmh-moscow']),('south',R['SOUTH'][d],['p5-map-south','p5-cmh-moscow'])]:
  feature('dated-fronts',d,'front-'+region,'Approximate contact · '+region,coords,'LineString',src=ss,note='Original regional synthesis. Only the endpoint dates printed on source maps are directly mapped there; this selected date also uses the chronological narrative. Connecting segments have lower confidence.',confidence='generalized regional contact')
 feature('dated-fronts',d,'sevastopol-front','Sevastopol · landward defence',[(33.37,44.78),(33.58,44.83),(33.72,44.74),(33.77,44.60)],'LineString',src=['p5-cmh-crimea'],note='Fortress perimeter generalized; sea communications remain possible. No December assault or later amphibious landing is backdated.')
 for kind,g in [('gain',reach.difference(previous)),('loss',previous.difference(reach))]:
  g=clean(g)
  if not g.is_empty:
   f=feature('territorial-changes',d,'change-'+kind,'Change in reconstructed forward reach',[],src=src,snapshotDate=d,changeKind=kind,note='Difference between selected regional interpretations, including revised uncertain connecting edges; not a surveyed tally of captured settlements.');f['geometry']=mapping(g)
 previous=reach
 # Army groups/fronts, independent country identity and sector markers.
 for key,title,xy,actor,commander,parent,echelon,ss in [
 ('agn','Army Group North',(28.5,57.3),'Germany','Wilhelm von Leeb','','army-group',['p5-map-north']),('agc','Army Group Centre',(32.5,54.7),'Germany','Fedor von Bock','','army-group',['p5-map-moscow']),('ags','Army Group South',(32.4,48.5),'Germany','Walter von Reichenau' if d>='1941-12-02' else 'Gerd von Rundstedt','','army-group',['p5-cmh-moscow']),('wf','Western Front',(38.3,55.45),'Soviet Union','Georgy Zhukov','Stavka','front',BASE),('kf','Kalinin Front',(36.2,57.3),'Soviet Union','Ivan Konev','Stavka','front',BASE),('lf','Leningrad Front',(30.7,60.25),'Soviet Union','','Stavka','front',['p5-map-north']),('nwf','Northwestern Front',(34,58.3),'Soviet Union','','Stavka','front',['p5-map-north']),('swf','Southwestern Front',(38.1,50.4),'Soviet Union','Semyon Timoshenko','Stavka','front',['p5-map-south']),('sf','Southern Front',(40.25,48.1),'Soviet Union','Yakov Cherevichenko','Stavka','front',BASE)]:form(d,key,title,xy,actor,commander,parent,echelon,src=ss)
 for key,title,xy,commander,parent,ss in [('a9','9th Army',(35.1,56.65),'Adolf Strauss','Army Group Centre',BASE),('a4','4th Army',(36.2,55.1),'Günther von Kluge','Army Group Centre',BASE),('a2','2nd Army',(36.9,52.35),'','Army Group Centre',['p5-map-moscow']),('pg3','3rd Panzer Group',[(35.8,56.4),(36.05,56.43),(36.4,56.39),(36.86,56.38),(37.29,56.36),(37.3,56.29),(37.34,56.22),(37.32,56.22)][i],'Georg-Hans Reinhardt','Army Group Centre',BASE),('pg4','4th Panzer Group',[(36.15,55.88),(36.35,55.87),(36.58,55.92),(36.82,56.04),(37.07,55.98),(37.12,55.99),(37.14,55.99),(37.14,55.99)][i],'Erich Hoepner','Army Group Centre',BASE),('pa2','2nd Panzer Army',(37.1,53.7) if i<2 else (38.0,53.75),'Heinz Guderian','Army Group Centre',BASE),('a18','18th Army',(29.8,59.25),'Georg von Küchler','Army Group North',['p5-map-north']),('a16','16th Army',(31.5,57.85),'Ernst Busch','Army Group North',['p5-map-north']),('a6','6th Army',(35.8,50.4),'','Army Group South',['p5-map-south']),('a17','17th Army',(37.1,48.7),'Hermann Hoth','Army Group South',['p5-map-south','p4-usma-1949']),('pa1','1st Panzer Army',(39.1,47.5) if i<6 else (38.45,47.55),'Ewald von Kleist','Army Group South',BASE),('a11','11th Army',(34.4,45.15),'Erich von Manstein','Army Group South',['p5-cmh-crimea'])]:form(d,key,title,xy,'Germany',commander,parent,src=ss)
 for key,title,xy,commander,parent in [('s22','22nd Army',(33.6,57.25),'','Kalinin Front'),('s29','29th Army',(35.45,57.08),'','Kalinin Front'),('s31','31st Army',(36.3,56.95),'','Kalinin Front'),('s30','30th Army',(36.65 if i<3 else 37.0,56.65),'Dmitry Lelyushenko' if d>='1941-11-18' else '', 'Kalinin Front' if d=='1941-11-15' else 'Western Front'),('s16','16th Army',[(36.5,56.04),(36.65,56.06),(36.91,56.06),(37.14,55.98),(37.32,55.87),(37.34,55.87),(37.36,55.86),(37.36,55.86)][i],'Konstantin Rokossovsky','Western Front'),('s5','5th Army',(37.05,55.68),'','Western Front'),('s33','33rd Army',(37.12,55.38),'','Western Front'),('s43','43rd Army',(37.19,55.15),'','Western Front'),('s49','49th Army',(37.52,54.88),'','Western Front'),('s50','50th Army',(37.67,54.24),'','Western Front'),('s3','3rd Army',(38.6,53.1),'','Southwestern Front'),('s13','13th Army',(39.0,52.5),'','Southwestern Front')]:form(d,key,title,xy,'Soviet Union',commander,parent,src=['p5-map-moscow','p5-cmh-moscow'])
 for key,title,xy,parent,commander in [('s40','40th Army',(37.7,51.35),'Southwestern Front',''),('s21','21st Army',(37.3,50.7),'Southwestern Front',''),('s38','38th Army',(37.2,50.05),'Southwestern Front',''),('s6','6th Army',(38.0,49.3),'Southwestern Front',''),('s12','12th Army',(39.0,48.9),'Southern Front',''),('s18','18th Army',(39.4,48.5),'Southern Front',''),('s37','37th Army',(39.8,47.9),'Southern Front',''),('s9','9th Army',(40.0,47.6),'Southern Front',''),('s56','56th Army · independent' if d<'1941-11-24' else '56th Army',(39.85,47.1),'Southern theatre / independent' if d<'1941-11-24' else 'Southern Front','Fyodor Remezov')]:form(d,key,title,xy,'Soviet Union',commander,parent,src=['p5-map-south','p5-cmh-moscow','p5-rostov-museum'])
 for key,title,xy,commander,parent,ss in [('s4i','4th Independent Army',(34.0,59.7),'Kirill Meretskov','Stavka',['p5-cmh-counteroffensive','p5-map-north']),('s52','52nd Army',(32.4,59.05),'','Northern theatre',['p5-map-north']),('s54','54th Army',(32.5,60.02),'','Leningrad Front',['p5-map-north']),('s8','8th Army',(29.5,59.89),'','Leningrad Front',['p5-map-north']),('maritime','Independent Maritime Army',(33.5,44.61),'Ivan Petrov','Sevastopol Defence Region',['p5-cmh-crimea'])]:form(d,key,title,xy,'Soviet Union',commander,parent,src=ss)
 form(d,'black-sea','Black Sea Fleet',(34.1,43.95),'Soviet Union','Filipp Oktyabrsky','Soviet Navy','fleet',src=['p5-cmh-crimea'])
 if i>=3:
  form(d,'shock1','1st Shock Army · assembling' if i==3 else '1st Shock Army',(37.64,56.36),'Soviet Union','Vasily Kuznetsov','Stavka' if d<'1941-11-29' else 'Western Front',note='Kuznetsov arrives 23 November with one brigade; holdings build through the month. Control passes to Zhukov on 29 November; no fully equipped army is assumed before arrival.')
 if i>=4:form(d,'s20','20th Army',(37.64,56.04),'Soviet Union','Andrei Vlasov','Stavka' if d<'1941-11-29' else 'Western Front',note='Forming on the northern approaches in late November; assignment is distinct from complete concentration.')
 if i>=3:form(d,'s10','10th Army · in transit' if i==3 else '10th Army · arriving',(44,54.0) if i==3 else (39.8,54.4),'Soviet Union','Filipp Golikov','Stavka' if d<'1941-11-29' else 'Western Front',note='Orders 24 November: movement from Syzran by rail and on foot. This is a regional arrival/transit marker, not a claim that all divisions were deployed.')
 # Persistent logistical relationships and physical choke points.
 for key,title,places,ss,note in [('german-trunk','Smolensk–Vyazma–Gzhatsk corridor',['Smolensk','Vyazma','Gzhatsk'],['p5-map-moscow','cmh-blitz'],'Period railway/supply axis. Schematic between named junctions; no daily railhead, throughput or uninterrupted service asserted.'),('moscow-road','Mozhaisk–Moscow highway',['Mozhaisk','Kubinka','Odintsovo','Moscow'],['p5-map-moscow'],'Schematic westward communication axis; bends do not trace the road. Modern motorways are not used.'),('klin-rail','Kalinin–Klin–Moscow rail corridor',['Kalinin','Klin','Solnechnogorsk','Moscow'],['p5-map-moscow'],'Strategic railway alignment; the line crosses opposing positions and is not continuous through-service.'),('tula-road','Orel–Tula road and rear connection',['Orel','Mtsensk','Plavsk','Tula'],['p5-guderian-flanks','p5-map-moscow'],'German rear approach and Soviet-held Tula bottleneck; road corridor, not a railway or claim of free passage.'),('tula-moscow','Tula–Serpukhov–Moscow connections',['Tula','Serpukhov','Moscow'],['p5-guderian-flanks'],'Schematic road/rail communications. Railway interdiction on 3 December is a later event on earlier snapshots.'),('ryazan-line','Ryazan–Kolomna reinforcement railway',['Ryazan','Kolomna','Moscow'],['p5-guderian-flanks','p5-cmh-moscow'],'German demolition patrols after 27 November did not reach their intended target. A threatened route is not a severed route.'),('rostov-line','Mariupol–Taganrog–Rostov corridor',['Mariupol','Taganrog','Sambek','Rostov'],['p5-map-south','p5-cmh-moscow'],'Road/rail relationship behind the lower Don salient. Northern Soviet pressure endangered the route; serviceability varies.'),('don-crossing','Lower Don crossing approaches',['Rostov','Bataysk'],['p5-rostov-museum'],'Crossing corridor at town scale; individual bridge/ferry or ice track not surveyed. Seasonal ice is not proof of unrestricted vehicle access.'),('tikhvin-rail','Vologda–Tikhvin–Volkhov railway',['Vologda','Tikhvin','Volkhov','Voibokalo'],['p5-map-north','p4-cmh-leningrad'],'Single-track communications interrupted by German possession of Tikhvin. Recovery and restored traffic are later events.'),('sevastopol-sea','Black Sea supply connection',['Novorossiysk',(36,43.8),'Sevastopol'],['p5-cmh-crimea'],'Schematic maritime connection, not a convoy track; naval supply remains exposed to weather and attack.')]:log(d,key,title,places,src=ss,note=note,category='sea-route' if key=='sevastopol-sea' else 'road-corridor' if key in ['tula-road','don-crossing'] else 'rail-corridor')
 log(d,'ladoga','Ladoga · hazardous ice supply' if d>='1941-11-24' else 'Ladoga · transshipment and water supply',['Kobona','Osinovets','Leningrad'],src=['p4-cmh-leningrad'],category='ice-route' if d>='1941-11-24' else 'sea-route',note='Trucks began crossing 22 November. This line indicates the lake crossing relationship, not a safe surveyed ice road. Early loads were very restricted; food delivery remained inadequate.' if d>='1941-11-24' else 'Water transport and transshipment remained difficult. The truck ice road begins 22 November, after this selected date.')
 for key,title,place,ss,note in [('tula-defence','Tula · continuing defence','Tula',['p5-tula-library','p5-cmh-moscow'],'50th Army and local formations retain the city. No completed German encirclement is asserted.'),('leningrad-siege','Leningrad · blockade continues','Leningrad',['p5-map-north','p4-cmh-leningrad'],'City remains Soviet-held under siege. Tikhvin pressure does not mean the blockade is lifted.'),('sevastopol','Sevastopol · Soviet defence','Sevastopol',['p5-cmh-crimea'],'Landward isolation coexists with Black Sea supply. November land defences retained; later assault and landing outcomes excluded.')]:point(d,key,title,place,src=ss,note=note,eventKind='checked',outcome='Continuing Soviet defence')
 # Civilians: town-level records, never invented homes or witness coordinates.
 for key,title,place,ss,note in [('tula-workers','Tula · workers, evacuation and repair','Tula',['p5-tula-library','p5-tula-regiment-order'],'City-level context: Workers’ Regiment formed by 23 October resolution; remaining workshops support defence while equipment and workers are evacuated.'),('moscow-labour','Moscow · defensive labour and industrial evacuation','Moscow',['p4-harrison-industry','cmh-blitz'],'Regional civic context accumulated during the autumn, not a new event occurring everywhere on the selected date. No invented factory journey or resumed-production date.'),('prisoners','Occupied western USSR · Soviet prisoners','Vyazma',['ushmm-pow-treatment'],'Regional association only, not a plotted detention facility. Starvation, exposure and killings reflected occupation policy; detailed camp sites and prisoner routes are unresolved.')]:point(d,key,title,place,src=ss,note=note,category='civilian',domain='civilian',observationDate='Autumn 1941 · contextual')
 if d>='1941-11-18':point(d,'shelter-order','Moscow region · shelter destruction order','Moscow',src=['p5-stavka0428'],note='Order 0428 dated 17 November prescribed destruction and evacuation. Moscow is the issuing-command context, not a damaged village. The specified belt is not drawn as a verified destruction zone.',category='civilian',domain='civilian',observationDate='1941-11-17')
 if d>='1941-11-21':point(d,'rostov-civilians','Rostov · first occupation and civilian loss','Rostov',src=['p5-winkler-rostov'],note='Town-level testimony for 21–29 November; no invented street or family home. The 1942 massacre is not projected into 1941. Numbers and the Magal family’s inferred identity remain qualified.',category='civilian',domain='civilian',observationDate='1941-11-21–29')
 if d>='1941-11-24':
  point(d,'klin-museum','Klin · museum staff under occupation','Klin',src=['p5-klin-museum','p5-klin-history'],note='Museum employees remain in the occupied town. Evacuation to Votkinsk was 24 August, earlier context; museum sources differ on entry 22/23 November.',category='civilian',domain='civilian')
  point(d,'istra-museum','Istra · museum evacuation and fighting','Istra',src=['p5-istra-museum'],note='Earlier evacuation was delayed by unavailable vehicles; two lorries removed part of the collection in early November. Local combat withdrawal on 27–28 November is separately dated.',category='civilian',domain='civilian')
 if d>='1941-11-28':point(d,'canal-engineer','Komsomolsky works · demolition and displaced families','Komsomolsky works',src=['p5-canal-musienko'],note='Installation-level association with Musienko’s recollection; exact demolition and return times uncertain. His food delivery dated 6 December is later context, not a completed journey on this map.',category='civilian',domain='civilian',observationDate='Late November–December recollection; 6 December delivery remains later context')
 if d=='1941-12-05':point(d,'leningrad-diaries','Leningrad · Mukhina and Ryabinkin diaries','Leningrad',src=['p5-leningrad-diaries'],note='City-level context, not the location of either home: Mukhina’s 21 November birthday and Ryabinkin’s early-November exhaustion. Individual experiences are not general ration returns.',category='civilian',domain='civilian',observationDate='November 1941 diary entries')
 # Date-specific operations and lower formations are supplied below.
 exec((ROOT/'scripts/phase-five-operations.py').read_text())
# Context and coverage preserve every article paragraph and its claim-level
# citation locators. A link is an association, never proof of every sentence.
class Paragraphs(HTMLParser):
 def __init__(self):super().__init__();self.sections=[];self.section='';self.label='';self.rows=[];self.inp=False;self.inhead=False;self.text=[];self.refs=[];self.skip=0;self.aside=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='aside':self.aside=True
  if tag=='h2':self.section=a.get('id','');self.inhead=True;self.label=''
  if tag=='p':self.inp=True;self.text=[];self.refs=[]
  if tag=='sup':self.skip+=1
  if tag=='a' and a.get('href','').startswith('#source-'):self.refs.append((a['href'][8:],a.get('title','')))
 def handle_data(self,t):
  if self.inhead:self.label+=t
  if self.inp and not self.skip:self.text.append(t)
 def handle_endtag(self,tag):
  if tag=='h2':self.inhead=False;self.sections.append(dict(id=self.section,label=self.label))
  if tag=='sup':self.skip=max(0,self.skip-1)
  if tag=='p' and self.inp:
   self.inp=False;txt=''.join(self.text).strip()
   if txt:self.rows.append(dict(section=self.section,text=txt,aside=self.aside,sourceIds=list(dict.fromkeys(x[0] for x in self.refs)),sourceLocators={s:[loc for sid,loc in self.refs if sid==s and loc] for s,_ in self.refs}))
  if tag=='aside':self.aside=False
context={};coverage=[];totals=[]
for d in DATES:
 article=articles[d];parser=Paragraphs();parser.feed(article['body']);fs=FEATURES[d]
 for n,row in enumerate(parser.rows):
  text=row['text'].lower();links=[];subjects=[name for name in P if re.search(r'\b'+re.escape(name.lower())+r'\b',text)]
  for f in fs:
   p=f['properties'];title=p['title'].lower()
   names=[name for name in subjects if name.lower() in title]
   if names and set(row['sourceIds']).intersection(p['sourceIds']):links.append(p['id'])
   elif p.get('commander') and p['commander'].split()[-1].lower() in text and set(row['sourceIds']).intersection(p['sourceIds']):links.append(p['id'])
  # Diplomatic, aggregate and retrospective statements remain contextual even
  # when they mention a place shared with a tactical feature.
  contextual=any(t in text for t in ['harriman','steinhardt','cordell hull','lend-lease','743,112','686,000','one hundred thousand','2012 search','sergei','magal','moussia','karol kewes','twenty men','one to a million'])
  if contextual:links=[]
  row.update(id=f'p5-context-{d}-{n+1}',articleSlug=article['slug'],articleDate=d,geographicSubjects=subjects,featureIds=list(dict.fromkeys(links)),disposition='qualified' if links else 'contextual',temporalScope='Read explicit dates in paragraph. Only features belonging to the selected snapshot are linked; later developments remain context.',reason='Linked sectors and corridors provide geographic association. They do not establish every sentence as a same-day position; source and event intervals remain explicit.' if links else 'Analytical, testimony, diplomatic, earlier/later development or unlocated tactical detail retained without invented coordinates.')
  for sid in row['sourceIds']:
   if not row['sourceLocators'][sid]:row['sourceLocators'][sid]=article['sourceLocators'].get(sid,[])
  coverage.append(row)
 context[d]=dict(articleSlug=article['slug'],title=article['title'],sections=parser.sections,paragraphs=parser.rows,destinations=[],precision='Dated regional synthesis. Points identify sectors or localities; routes and connecting edges are generalized. Later article developments are contextual, not silently added to the selected day.')
 if d=='1941-11-24':context[d]['destinations']=[dict(name='Votkinsk · earlier museum evacuation',coordinates=P['Votkinsk'],note='Two freight wagons left Klin 24 August. Earlier destination, not a movement on 24 November. No exact railway itinerary reconstructed.',sourceIds=['p5-klin-museum'])]
 for f in fs:
  refs=[r for r in parser.rows if f['properties']['id'] in r['featureIds']]
  f['properties'].update(focusZoom=9.5 if any(word in f['properties']['title'] for word in ['Peremilovo','29th Rifle Brigade','50th Rifle Brigade','Komsomolsky','Dmitrov–Yakhroma','canal crossing']) else 6.4,articleSlug=article['slug'],articleSections=list(dict.fromkeys(r['section'] for r in refs)) or [article['sections'][0]['id']],contextIds=[r['id'] for r in refs])
 totals.append(dict(date=d,paragraphs=len(parser.rows),mappedAssociations=sum(bool(r['featureIds']) for r in parser.rows),**{k:sum(d in f['properties']['snapshots'] for f in v['features']) for k,v in collections.items()}))
write(H/'phase-v-study-context.json',context);write(OUT/'coverage-matrix.json',coverage);write(OUT/'date-summary.json',totals)
index=read(D/'map-snapshot-index.json');timeline=read(D/'barbarossa-phase-v-timeline.json')
for e in timeline:
 d=e['date'];fs=FEATURES[d];e.pop('politicalReferenceDate',None)
 e.update(kind='Dated regional military reconstruction',snapshotStatus='dated-regional-synthesis',geographicFeatureIds=[f['properties']['id'] for f in fs],sourceIds=list(dict.fromkeys(s for f in fs for s in f['properties']['sourceIds'])),mapAccuracy='Source-qualified dated regional reconstruction. Formation sectors and schematic corridors are distinct from exact positions; intermediate front joins have lower confidence. Every article paragraph has linked Study Context. Future actions stay contextual or explicitly ordered plans.',summary=articles[d]['summary'])
 index[d].update(operations=sum(d in f['properties']['snapshots'] for f in collections['military-operations']['features']),areas=sum(d in f['properties']['snapshots'] for f in collections['military-control']['features']),formations=sum(d in f['properties']['snapshots'] for f in collections['formation-positions']['features']),fronts=sum(d in f['properties']['snapshots'] for f in collections['dated-fronts']['features']),logistics=sum(d in f['properties']['snapshots'] for f in collections['historical-logistics']['features']),controlCategories=['operational','finnish-operational','romanian-military','contested'],movementActors=sorted({f['properties']['actor'] for f in collections['military-operations']['features'] if d in f['properties']['snapshots'] and f['geometry']['type']=='LineString'}),timeConvention='Daily regional synthesis; component event intervals and later plans explicitly identified',precision='Source-qualified locality and command-sector reconstruction. Connecting fronts, control edges and corridor bends are generalized; the 28 November canal foothold is an intraday contested area, not secure end-of-day control.',referenceDate=d)
# Historical border references continue; no earlier snapshot memberships removed.
borders=read(H/'reference-borders.geojson')
for f in borders['features']:
 for d in DATES:
  if d not in f['properties']['snapshots']:f['properties']['snapshots'].append(d)
 if f['properties'].get('endDate','')<'1941-12-05':f['properties']['endDate']='1941-12-05'
(H/'reference-borders.geojson').write_text(json.dumps(borders,ensure_ascii=False,indent=2)+'\n')
# Place names are separate from military control, with period and modern forms.
placeNames=['Moscow','Klin','Solnechnogorsk','Istra','Yakhroma','Dmitrov','Peremilovo','Krasnaya Polyana','Dedenevo','Naro-Fominsk','Kashira','Venev','Stalinogorsk','Uzlovaya','Dedilovo','Bogoroditsk','Yepifan','Mikhaylov','Yefremov','Ryazan','Kolomna','Aleksin','Yasnaya Polyana','Syzran','Votkinsk','Rybinsk','Aksay','Bataysk','Sambek','Verkhne-Gnilovskaya','Matveyev Kurgan','Voroshilovgrad','Slavyansk','Oboyan','Yelets','Livny','Novosil','Voibokalo','Kirishi']
places=FC([dict(type='Feature',geometry=dict(type='Point',coordinates=P[n]),properties=dict(id='p5-place-'+n.lower().replace(' ','-'),name=n,periodName=n,modernName={'Stalinogorsk':'Novomoskovsk','Voroshilovgrad':'Luhansk','Krasnaya Polyana':'Lobnya district'}.get(n,n),sourceIds=['p5-map-moscow','p5-map-south','p5-map-north'],note='Named locality for geographic orientation, not a historical urban footprint or unit position.',accuracy='Locality reference',priority=1)) for n in placeNames])
write(ROOT/'public/data/geography/phase-v-places.geojson',places)
write(ROOT/'public/data/geography/phase-v-focus-places.geojson',FC([f for f in places['features'] if f['properties']['name'] not in ['Aksay','Bataysk','Sambek','Verkhne-Gnilovskaya','Yasnaya Polyana','Novosil','Voibokalo','Kirishi']]))
for name,fc in collections.items():write(H/(name+'.geojson'),fc)
write(H/'europe-geometries.geojson',geo);write(D/'territorial-states.json',states);write(D/'sources.json',sources);write(D/'barbarossa-phase-v-timeline.json',timeline);write(D/'map-snapshot-index.json',index)
print(json.dumps(totals,indent=2));print('All paragraphs',len(coverage))
