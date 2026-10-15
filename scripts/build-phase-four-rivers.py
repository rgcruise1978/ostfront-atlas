"""Convert retrieved OSM relation members to a separately attributed river layer.
Input paths are supplied explicitly; network access is a separate research step.
"""
from pathlib import Path
import json,sys
from shapely.geometry import LineString,mapping
from shapely.ops import unary_union,linemerge
ROOT=Path(__file__).resolve().parents[1];features=[];manifest=[]
for name in ['Moskva','Protva','Zusha','Lama','Upa']:
 path=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp')/('phase4-'+name+'-osm.json');d=json.loads(path.read_text());elements=d['elements'];nodes={e['id']:(e['lon'],e['lat']) for e in elements if e['type']=='node'};relations=[e for e in elements if e['type']=='relation' and e.get('tags',{}).get('name') in ['Москва','Протва','Зуша','Лама','Упа']];assert relations,(name,'wrong relation')
 r=relations[0];memberIds={e['ref'] for e in r['members'] if e['type']=='way' and e.get('role') not in ['tributary','side_stream']};ways=[e for e in elements if e['type']=='way' and e['id'] in memberIds and e.get('tags',{}).get('waterway') in ['river','stream']]
 lines=[LineString([nodes[n] for n in w['nodes'] if n in nodes]) for w in ways if len(w['nodes'])>1];assert lines,name
 g=unary_union(lines);g=linemerge(g) if g.geom_type=='MultiLineString' else g;g=g.simplify(.0008,preserve_topology=True);assert g.is_valid
 features.append(dict(type='Feature',geometry=mapping(g),properties=dict(id='p4-river-'+name.lower(),name=name,referenceOnly=True,referencePeriod='Modern natural-course orientation',sourceIds=['p4-osm-rivers'],osmRelation=r['id'],accuracy='Modern natural-course orientation, simplified from OSM; not a 1941 water-level reconstruction',note='Natural watercourse supports geographic orientation. Reservoir extent, engineering changes and daily water levels are not asserted for 1941.')))
 manifest.append(dict(name=name,relation=r['id'],url=f'https://api.openstreetmap.org/api/0.6/relation/{r["id"]}/full.json',relationVersion=r['version'],ways=len(ways),nodes=len(nodes),license='ODbL 1.0; © OpenStreetMap contributors',retrieved='2026-10-15'))
p=ROOT/'public/data/geography/phase-iv-natural-rivers.geojson';p.write_text(json.dumps(dict(type='FeatureCollection',features=features),ensure_ascii=False,separators=(',',':'))+'\n');(ROOT/'phase-iv-maps-review/river-provenance.json').write_text(json.dumps(manifest,indent=2)+'\n')
sources=json.loads((ROOT/'src/data/sources.json').read_text());sources=[s for s in sources if s['id']!='p4-osm-rivers'];sources.append(dict(id='p4-osm-rivers',institution='OpenStreetMap contributors',title='Moskva, Protva, Zusha, Lama and Upa river courses',date='2026-10-15',url='https://www.openstreetmap.org/relation/389341',type='Natural-waterway geometry dataset',relevance='Adds named physical barriers around Moscow, Serpukhov, Tula and Mtsensk. Relation IDs and versions are recorded in the review provenance file.',supports=['1941-09-30','1941-10-02','1941-10-07','1941-10-13','1941-10-16','1941-10-19','1941-10-24','1941-11-02','1941-11-09','1941-11-14'],notes='OSM full relation, member ways and nodes inspected. Simplified modern natural-course orientation; no exact 1941 water levels, reservoir boundaries or engineered channel configuration are claimed.',reuseRights='© OpenStreetMap contributors, ODbL 1.0. Attribution retained in the map and exported images; geometry supplied as a separate attributed dataset.'))
(ROOT/'src/data/sources.json').write_text(json.dumps(sources,ensure_ascii=False,separators=(',',':'))+'\n');print('Saved five attributed watercourses')
