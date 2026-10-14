"""Apply source-qualified political changes to the shared geometry register.

Run after build-europe-foundation.py. Local masks are generalized interpretations,
with uncertain edges retained in feature metadata; never daily frontlines.
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, Point, box, LineString
from shapely.ops import split, unary_union
from shapely import make_valid

ROOT=Path(__file__).resolve().parents[1];BASE=ROOT.parents[1];DATA=ROOT/'public/data/history'
READ=lambda p:json.loads(p.read_text())
COLLECTION=READ(DATA/'europe-geometries.geojson');G={f['properties']['id']:shape(f['geometry']) for f in COLLECTION['features']}
R=READ(ROOT/'src/data/territorial-states.json');S={k:shape(v) for k,v in READ(BASE/'outputs/map-completion/research/svg-1942-geographic-masks.json').items()}
assert not any(r['id']=='france-occupied' for r in R), 'Run build-europe-foundation.py first; do not append a second chronology.'
CHANGES=[]

def clean(g):
    g=make_valid(g)
    if g.geom_type=='GeometryCollection':g=unary_union([x for x in g.geoms if x.geom_type in ['Polygon','MultiPolygon']])
    return g
def addgeo(id,g):
    g=clean(g);assert not g.is_empty and g.is_valid,id
    G[id]=g;COLLECTION['features'].append({'type':'Feature','properties':{'id':id,'geometryRef':id,'sourceId':'europe-vector-1942'},'geometry':mapping(g)});return id
def state(id,name,geo,actor,visual,start='1941-06-21',end='1941-07-09',sovereignty='',admin='',alignment='',claim='None',note='',sources=None,uncertainty='Generalized regional reconstruction. Boundary placement is not surveyed; local districts and enclaves may be unresolved.'):
    p=G[geo].representative_point()
    R.append({'id':id,'name':name,'historicalName':name,'geometryRef':geo,'entity':sovereignty or name,'sovereigntyStatus':sovereignty or name,'militaryControl':actor,'occupationAdministration':admin or 'National administration','annexationClaim':claim,'politicalAlignment':alignment or 'Occupation does not determine sovereignty','startDate':start,'endDate':end,'sourceIds':sources or ['map-europe-expansion','umn-historical-borders-1939'],'accuracy':'Generalized historical region; inspect source and uncertainty notes','uncertainty':uncertainty,'visualCategory':visual,'note':note,'labelCoordinates':[round(p.x,4),round(p.y,4)]})
def change(id,date,territory,old,new,oldadmin,newadmin,claim,ids,sources,description,uncertainty='',snapshot=None):
    CHANGES.append({'id':id,'eventDate':date,'territory':territory,'previousControl':old,'newControl':new,'previousAdministration':oldadmin,'newAdministration':newadmin,'sovereigntyOrClaim':claim,'featureIds':ids,'sourceIds':sources,'effectiveVisualizationDate':snapshot or date,'snapshotDate':snapshot or date,'uncertainty':uncertainty,'description':description})
def polygon(points):return clean(Polygon(points))
def split_at(g,line,point):
    pieces=split(g,LineString(line)).geoms
    selected=[x for x in pieces if x.covers(Point(point))];assert len(selected)==1
    return selected[0],clean(g.difference(selected[0]))

# Western occupations: governments and sovereignty remain separate from control.
for name,start,admin,visual in [('Denmark','1940-04-09','German occupation; Danish government retained under constraint','german-military'),('Norway','1940-06-10','German civilian occupation administration','german-civil'),('Netherlands','1940-05-15','German Reich commissioner; Dutch government in exile','german-civil'),('Belgium','1940-05-28','German military administration in Belgium and northern France','german-military'),('Luxembourg','1940-08-02','German civilian administration; incorporation pursued','german-civil')]:
    state('occupied-'+name.lower(),name+' under German occupation',name.lower(),'Germany',visual,start=start,sovereignty=name+'; sovereignty not extinguished by occupation',admin=admin,note='Occupation is associated with German gray while the national boundary and identity remain visible.')
    change('occupation-'+name.lower(),start,name,name,'Germany','National government',admin,'National sovereignty retained',[name.lower()],['map-europe-expansion'],'Occupation and administration changed; the state is not treated as a German province.',snapshot='1941-06-21')

# France's armistice demarcation, generalized along documented city anchors.
fr=G['france'];vichy,occupied=split_at(fr,[(7.1,47.5),(5.5,47.25),(5.0,46.8),(4.0,46.55),(2.5,46.9),(1.0,47.35),(.65,47.4),(.25,46.6),(.15,45.65),(-.4,45.2),(-.7,44.4),(-.55,43.9),(-1.05,43.25),(-1.15,42.4)],(3.9,45.5))
addgeo('france-occupied',occupied);addgeo('france-vichy',vichy)
state('france-occupied','German-occupied France','france-occupied','Germany','german-military',start='1940-06-25',sovereignty='France; occupied zone under the 1940 armistice',admin='German military occupation',note='The northern and western occupation zone is distinguished from the unoccupied French State. Local northern administration and Alsace–Lorraine incorporation boundaries require finer verification.',sources=['map-france-armistice','map-europe-expansion'],uncertainty='Armistice line is a generalized city-anchored reconstruction, not a surveyed local line. Alsace–Lorraine and northern departmental subdivisions are not digitized.')
state('france-vichy','French State · unoccupied zone','france-vichy','French State','independent',start='1940-07-10',sovereignty='France; Vichy government’s authority and legitimacy contested',admin='French State government based at Vichy',alignment='Authoritarian collaborationist regime; not directly German-occupied on these dates',sources=['map-france-armistice','map-europe-expansion'],note='The unoccupied zone existed in June–July 1941; the later November 1942 German occupation is not backdated.')
change('french-armistice','1940-06-25','France','France','Germany / French State','French national government','Occupation zone and unoccupied zone','French sovereignty distinct from occupation',['france-occupied','france-vichy'],['map-france-armistice'],'France is divided into German occupation and the unoccupied French State zone.',snapshot='1941-06-21')

# Occupied Poland: treaty line, military occupation and incorporation are separate.
trace=READ(DATA/'poland-1939.geojson')['features'][0]['geometry']['coordinates']
parts=split(G['poland'],LineString([(trace[0][0],57),*trace,(trace[-1][0],46)])).geoms
east=clean(next(p for p in parts if p.covers(Point(24,49.84))));west=clean(G['poland'].difference(east))
gg=clean(west.intersection(S['path8663']));annex=clean(west.difference(gg));addgeo('poland-german-west',west);addgeo('poland-soviet-east',east)
addgeo('general-government-1941',gg);addgeo('poland-german-annexation',annex)
# October Łódź is correctly described, while the November boundary shift is not
# turned into a fabricated precise local administrative polygon.
lodz_context=clean(west.intersection(box(18.7,51.2,20.0,52.2)));oct_gg=clean(gg.difference(lodz_context));oct_annex=clean(annex.difference(lodz_context))
addgeo('general-government-october-context',oct_gg);addgeo('annexation-october-context',oct_annex)
for id,name,geo,visual,admin,claim in [('oct-annex','Polish areas claimed for German incorporation','annexation-october-context','german-claimed','German Reich regional administrations','German incorporation effective October 26'),('oct-gg','General Government','general-government-october-context','german-civil','Hans Frank’s German civilian occupation administration','Separate German occupation administration')]:
    state(id,name,geo,'Germany',visual,start='1939-10-26',end='1939-10-26',sovereignty='Poland; no accepted transfer of sovereignty',admin=admin,claim=claim,sources=['ushmm-german-administration','occ-administrative-chronology','occ-grochowina','europe-vector-1942'],note='The pre-invasion Polish border remains a reference. Łódź was still in the General Government on October 26 and was incorporated into the Reich on November 9. The Łódź boundary region is explicitly unresolved; no district perimeter is asserted.',uncertainty='Administrative masks are regional references. The October-to-November Łódź boundary change is not precisely digitized; its location cue must not be read as a legal district perimeter.')
addgeo('lodz-october-unresolved',lodz_context)
state('lodz-october-unresolved','Łódź region · October boundary unresolved','lodz-october-unresolved','Germany','unresolved',start='1939-10-26',end='1939-10-26',sovereignty='Occupied Polish territory',admin='Łódź city remained within General Government until November 9; district boundary unresolved',sources=['occ-administrative-chronology','occ-grochowina'],note='This hatched search region marks missing boundary precision; its edges are not historical borders.',uncertainty='Geographic uncertainty mask only. No precise October district polygon is asserted.')
state('soviet-poland-oct','Eastern Poland under Soviet occupation','poland-soviet-east','Soviet Union','soviet-occupation',start='1939-10-26',end='1939-10-26',sovereignty='Poland; occupation rejected by the Polish government',admin='Soviet military and emerging civilian institutions',claim='Formal Soviet incorporation measures followed in November',sources=['occ-ukraine-assembly','boundary-soviet-citizenship','us-state-frus-1939-border-report'],note='October 26 precedes the USSR Supreme Soviet incorporation acts of November 1 and 2.')
state('german-poland-1941','Polish areas under German incorporation claim','poland-german-annexation','Germany','german-claimed',sovereignty='Poland; German incorporation contested',admin='German Reich regional administrations',claim='German incorporation of conquered Polish territory',sources=['ushmm-german-administration','europe-vector-1942'],note='Gray identifies German authority; it does not erase the prewar Polish state boundary.')
state('gg-1941','General Government','general-government-1941','Germany','german-civil',sovereignty='Poland under German occupation',admin='Hans Frank; four districts before the addition of Galicia',sources=['ushmm-german-administration','europe-vector-1942'],note='Galicia was added in August 1941 and is excluded from this June–July baseline.')
state('soviet-poland-1941','Former eastern Poland under Soviet incorporation claim','poland-soviet-east','Soviet Union','soviet-occupation',sovereignty='Poland; Soviet incorporation not accepted by Poland',admin='Soviet republic administrations',claim='Soviet incorporation in November 1939',sources=['boundary-soviet-citizenship','ushmm-soviet-annexations-map'],note='Control, Soviet legal claims and Polish sovereignty are recorded separately.')
change('polish-administration','1939-10-26','German-occupied Poland','Germany','Germany','Military occupation','Reich incorporation claims and General Government','Polish sovereignty remains contested',['annexation-october-context','general-government-october-context'],['ushmm-german-administration','occ-administrative-chronology'],'German military occupation acquires differing annexation and civilian administrative forms.',snapshot='1939-10-26')
change('soviet-poland-incorporation','1939-11-02','Eastern Poland','Soviet Union','Soviet Union','Military occupation','Soviet incorporation claims','Polish rejection persists',['poland-soviet-east'],['boundary-soviet-citizenship'],'November incorporation claims are distinguished from the October military occupation.',snapshot='1941-06-21')

for name,occupied,incorporated in [('Lithuania','1940-06-15','1940-08-03'),('Latvia','1940-06-17','1940-08-05'),('Estonia','1940-06-17','1940-08-06')]:
    state('soviet-'+name.lower(),name+' under Soviet occupation',name.lower(),'Soviet Union','soviet-occupation',start=incorporated,sovereignty=name+'; Soviet incorporation widely unrecognized',admin=name+' SSR under Soviet authority',claim='Soviet incorporation '+incorporated,sources=['ushmm-soviet-annexations-map','map-baltic-nonrecognition'],note='Occupation in June 1940 preceded Soviet incorporation claims in August. The former state outline remains an identity and sovereignty reference.')
    change('baltic-'+name.lower(),incorporated,name,name,'Soviet Union','Independent government','Soviet occupation and SSR institutions','Contested Soviet incorporation',[name.lower()],['ushmm-soviet-annexations-map','map-baltic-nonrecognition'],'Soviet occupation and incorporation claims replace independent administration; recognition is not presumed.',snapshot='1941-06-21')

# Romanian changes: reuse the checked Prut/Transylvania masks from the earlier
# reference, while adding southern Dobruja and preserving independent allies.
old=READ(DATA/'barbarossa-1941-opening-control.geojson')['features'];bess=shape(next(f for f in old if f['properties']['id']=='barbarossa-soviet-bessarabia-bukovina')['geometry'])
oldn={f['properties']['name']:shape(f['geometry']) for f in READ(DATA/'barbarossa-1941-neighbors.geojson')['features']}
nt=clean(oldn['Hungary'].difference(G['hungary']));dobruja=G['romania'].intersection(polygon([(27.4,44.0),(28.05,44.12),(28.3,44.05),(28.9,43.74),(29.2,43.7),(29.2,42.8),(26.4,42.8),(26.4,43.5),(27.4,44.0)]))
romania=clean(G['romania'].difference(bess).difference(nt).difference(dobruja));hungary=clean(G['hungary'].union(nt));bulgaria=clean(G['bulgaria'].union(dobruja))
for id,g in [('bessarabia-bukovina',bess),('romania-1941',romania),('hungary-1941',hungary),('bulgaria-1941',bulgaria)]:addgeo(id,g)
state('romania-1941','Romania','romania-1941','Romania','aligned',alignment='Axis member; participating in war against USSR',sources=['ushmm-romania-1941-map','map-axis-alignment'],note='Shows the 1940 losses to the USSR, Hungary and Bulgaria; Romania retains its own government.',uncertainty='Northern Bukovina, northern Transylvania and southern Dobruja lines are generalized. Local demarcation details remain unresolved.')
state('hungary-1941','Hungary','hungary-1941','Hungary','aligned',alignment='Axis member; own administration',sources=['ushmm-romania-1941-map','map-axis-alignment'],note='Includes the 1938–1939 acquisitions and northern Transylvania. Acquisitions in Yugoslavia are shown separately.')
state('bulgaria-1941','Bulgaria','bulgaria-1941','Bulgaria','aligned',alignment='Axis member; not participating in the June invasion of USSR',sources=['ushmm-romania-1941-map','map-axis-alignment'],note='Southern Dobruja transferred from Romania in September 1940. Bulgaria’s Balkan occupations are separate from direct German control.')
state('soviet-bessarabia','Bessarabia and northern Bukovina','bessarabia-bukovina','Soviet Union','soviet-occupation',sovereignty='Romanian territory under Soviet annexation claim',admin='Soviet administration after June 1940',claim='Soviet incorporation following the June 1940 ultimatum',sources=['ushmm-romania-1941-map','ushmm-soviet-annexations-map'],note='The Prut supplies the main geographic boundary; the northern and delta adjustments are schematic.')
for id,date,name,new,geo in [('romanian-soviet-loss','1940-06-28','Bessarabia / northern Bukovina','Soviet Union','bessarabia-bukovina'),('second-vienna-award','1940-08-30','Northern Transylvania','Hungary','hungary-1941'),('craiova-treaty','1940-09-07','Southern Dobruja','Bulgaria','bulgaria-1941')]:change(id,date,name,'Romania',new,'Romanian administration',new+' administration','Territorial transfer / annexation claim',[geo],['ushmm-romania-1941-map'],'Romania’s 1940 territorial losses change the June 1941 baseline.',snapshot='1941-06-21')

# Finnish cessions: territory changes under a treaty, unlike Baltic incorporation.
fin=G['finland'];karelia=fin.intersection(polygon([(27.75,59.9),(27.78,60.35),(28.05,60.65),(28.4,60.9),(28.8,61.15),(29.85,61.3),(30.05,61.55),(30.8,61.82),(31.1,62.3),(31.55,62.9),(35,63),(35,59.5),(27.75,59.9)]))
salla=fin.intersection(polygon([(28.65,66.0),(28.67,66.85),(29.1,67.3),(29.9,67.8),(32,67.8),(32,66),(28.65,66.0)]));ceded=clean(karelia.union(salla));addgeo('finland-1940',fin.difference(ceded));addgeo('finnish-cessions-1940',ceded)
state('finland-1941','Finland','finland-1940','Finland','independent',sovereignty='Independent Finland',alignment='Military cooperation with Germany before invasion; war with USSR from June 25–26 as a co-belligerent; not a Tripartite Pact signatory',sources=['map-finland-peace','map-finland-cobelligerency','loc-lage-1941-06-21'],note='The 1940 treaty cessions are separate. Petsamo remains Finnish on these dates. Finnish offensives and German troops in Finland do not turn the country into German sovereign territory.',uncertainty='Karelian Isthmus and Salla cession lines are broad regional reconstructions. Hanko and smaller Gulf islands are not resolved as cadastral polygons.')
state('finnish-cessions','Finnish territories ceded in 1940','finnish-cessions-1940','Soviet Union','soviet-cession',sovereignty='Ceded to USSR under the March 1940 peace treaty',admin='Soviet administration',claim='Treaty cession, distinguished from disputed Baltic incorporation',sources=['map-finland-peace','loc-lage-1941-06-21'],note='The cession geometry is generalized and checked against the printed June 21 border; the map does not show the later Finnish recovery of these areas before it occurred.')
change('winter-war-settlement','1940-03-13','Finland’s ceded eastern territories','Finland','Soviet Union','Finnish administration','Soviet administration','March 12 peace treaty',['finnish-cessions-1940'],['map-finland-peace'],'The Winter War settlement changes the Finnish–Soviet border, while Finland remains independent.',snapshot='1941-06-21')

# Slovak transfer: the event is certain; local geometry is visibly unresolved.
state('slovakia-1941','Slovak Republic','slovak-republic','Slovakia','aligned',start='1939-11-21',alignment='German client state; Axis member; own government',sources=['map-slovak-campaign','europe-vector-1939'],note='Spisz and Orawa border territories were transferred to Slovakia on November 21, 1939. Those small additions are identified by dated markers; their precise perimeter is not yet digitized. The September outline is not silently passed off as an exact 1941 boundary.',uncertainty='November 1939 border additions lack adequate digitized boundary precision. Their locations and date are mapped as events, not invented polygons.')
change('slovak-border-transfer','1939-11-21','Spisz and Orawa border districts','German occupation of Polish territory','Slovakia','Occupation','Slovak administration','German–Slovak transfer; Polish rights disputed',['slovak-republic'],['map-slovak-campaign'],'The November border transfer is marked in the 1941 series, with its local perimeter explicitly unresolved.',snapshot='1941-06-21')

# Yugoslav occupation divisions, clipped to the same historical national shell.
yugo=G['yugoslavia'];taken=Polygon();zones=[]
for id,name,mask,actor,visual,admin,alignment in [
 ('yugoslav-hungarian','Hungarian-held Bačka and Baranja',S['path3391'],'Hungary','aligned','Hungarian occupation / incorporation claim','Hungarian-administered'),
 ('yugoslav-albanian','Kosovo and adjacent Albanian occupation territory',S['al'],'Italy','italian-occupation','Italian-controlled Albania','Italian-controlled'),
 ('yugoslav-bulgarian','Bulgarian-occupied Macedonia and Pirot',S['path4093'],'Bulgaria','bulgarian-occupation','Bulgarian occupation administration','Bulgarian-administered'),
 ('yugoslav-serbia','Serbia and Banat under German military command',S['path3193'],'Germany','german-military','German military commander; local subordinate administrations','German occupation'),
 ('yugoslav-slovenia-german','Northern and eastern Slovenia',S['pl'],'Germany','german-claimed','German incorporation administration','German-controlled'),
 ('croatia-client','Independent State of Croatia',S['path3913'],'Croatian client administration','aligned','Ustaša administration; German and Italian military influence','German–Italian client state'),
 ('yugoslav-italian','Italian-held Yugoslav territories',S['path4328'],'Italy','italian-occupation','Italian occupation and incorporation administrations','Italian-controlled')]:
    part=clean(yugo.intersection(mask).difference(taken))
    if part.is_empty:continue
    addgeo(id,part);taken=clean(taken.union(part));zones.append(id)
    state(id,name,id,actor,visual,sovereignty='Prewar Yugoslav territory; partition imposed by Axis powers',admin=admin,alignment=alignment,claim='Occupation, incorporation or client-state claims vary',sources=['map-balkans-partition','europe-vector-1942'],note='Regional occupation reference corroborated against the 1941 partition account; a later SVG supplies generalized linework only. Nedić’s later government is not backdated to June.',uncertainty='Country-scale registered masks. Italian–Croatian zones of military influence and small occupation subdivisions remain unresolved.')
remainder=clean(yugo.difference(taken))
if not remainder.is_empty:
    addgeo('yugoslav-boundary-unresolved',remainder)
    state('yugoslav-boundary-unresolved','Yugoslav occupation boundary detail unresolved','yugoslav-boundary-unresolved','Axis occupation authorities','unresolved',sovereignty='Occupied Yugoslav territory',admin='German / Italian / Bulgarian / client administrations; see sources',sources=['map-balkans-partition'],note='Hatched land is retained because the available registered outlines do not resolve every local occupation division. It is not an independent blank territory.')
change('yugoslav-partition','1941-04-17','Yugoslavia','Yugoslavia','Axis occupation and client authorities','Yugoslav government','Multiple occupation administrations and Croatian client state','Imposed partition; sovereignty contested',zones,['map-balkans-partition'],'The prewar Yugoslav state is divided among distinct occupiers and client administrations.',snapshot='1941-06-21')

# Greek zones: preserve the historical land shell and mark unresolved remainders.
greek=G['greece'];greek_bulgaria=clean(greek.intersection(S['path4093']));greek_germany=clean(greek.intersection(S['path3129'].union(S['path3883'])).difference(greek_bulgaria));greek_italy=clean(greek.difference(greek_bulgaria).difference(greek_germany))
for id,name,g,actor,visual in [('greece-bulgarian','Bulgarian occupation zone in Greece',greek_bulgaria,'Bulgaria','bulgarian-occupation'),('greece-german','German occupation zone in Greece',greek_germany,'Germany','german-military'),('greece-italian','Italian occupation zone in Greece',greek_italy,'Italy','italian-occupation')]:
    if g.is_empty:continue
    addgeo(id,g);state(id,name,id,actor,visual,sovereignty='Greece under Axis occupation; Greek government continued in exile',admin=actor+' occupation administration',sources=['map-greece-zones','europe-vector-1942'],note='The broad Greek occupation zones are distinct from the independent Axis states. Athens had shared occupation arrangements; a point note identifies that exception.',uncertainty='Registered regional reference. Shared Athens administration, coastal strips and small islands cannot be resolved precisely at this source scale.')
change('greece-occupation','1941-06-01','Greece','Greece','Germany / Italy / Bulgaria','Greek government','Separate occupation zones','Greek sovereignty not erased',['greece-german','greece-italian','greece-bulgarian'],['map-greece-zones'],'Three occupation zones replace the 1939 Greek political background.',snapshot='1941-06-21')

# Dependencies and island administrations retain their distinct sovereignty.
for r in R:
    name=r['name']
    if name in ['Algeria','Morocco','Tunisia']:
        r['visualCategory']='dependency';r['militaryControl']='France';r['sovereigntyStatus']='French colonial Algeria' if name=='Algeria' else 'French protectorate; local sovereign institutions constrained'
        r['occupationAdministration']='French colonial / protectorate administration; Vichy authority on 1941 snapshots';r['politicalAlignment']='French-administered, not an independent Axis state';r['sourceIds']+=['map-north-africa'];r['note']='The later Axis occupation of Tunisia in November 1942 is not backdated.'
    if name in ['Malta','Cyprus','Gibraltar','Isle of Man','Guernsey','Jersey']:
        r['visualCategory']='dependency';r['militaryControl']='United Kingdom';r['sovereigntyStatus']='British colony' if name in ['Malta','Cyprus','Gibraltar'] else 'British Crown dependency'
        r['occupationAdministration']='British colonial administration' if name in ['Malta','Cyprus','Gibraltar'] else 'Local insular administration under the British Crown';r['politicalAlignment']='British dependency, not an independent state';r['sourceIds']+=['map-british-dependencies']
        if name in ['Guernsey','Jersey']:r['endDate']='1940-06-29'
    if name=='Iceland':
        r['sovereigntyStatus']='Independent kingdom in personal union with Denmark';r['occupationAdministration']='Icelandic civil government; British military presence in 1941';r['note']='British troops entered in May 1940. U.S. forces arrived July 7, 1941; sovereignty and military protection are distinct.';r['sourceIds']+=['map-iceland']
for name in ['Guernsey','Jersey']:
    state('occupied-'+name.lower(),name+' under German occupation',name.lower(),'Germany','german-military',start='1940-07-01',sovereignty='British Crown dependency under occupation',admin='German military occupation; local insular institutions',sources=['map-channel-islands'],note='German occupation in 1940 did not create German sovereignty.')
change('channel-islands-occupation','1940-07-01','Channel Islands','British Crown dependencies','Germany','Insular administration','Military occupation','British sovereignty / dependency status retained',['guernsey','jersey'],['map-channel-islands'],'The Channel Islands are shown under German military occupation.',snapshot='1941-06-21')

# Ensure all later records carry geographic labels and preserve existing IDs.
for r in R:
    if r['name']=='Slovak Republic':r['militaryControl']='Slovakia'
    if r['visualCategory']=='aligned' and r['name']=='Italy':r['sourceIds'].append('map-axis-alignment')
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
write(DATA/'europe-geometries.geojson',COLLECTION);write(ROOT/'src/data/territorial-states.json',R);write(ROOT/'src/data/territorial-changes.json',CHANGES)
print(f'Stage B: {len(G)} geometries, {len(R)} dated status records, {len(CHANGES)} political change records.')
