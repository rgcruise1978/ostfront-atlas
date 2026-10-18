"""Publication checks against the verified pre-release commit, without changing maps."""
from pathlib import Path
import json,subprocess,hashlib,re
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1];BASE='6a493db06d6a8a078000e4912c3284e017ae3a7c'
def old(p):return json.loads(subprocess.check_output(['git','show',BASE+':'+str(p)],cwd=R))
def read(p):return json.loads((R/p).read_text())
source={s['id']:s for s in read('src/data/sources.json')}
for s in old('src/data/sources.json'):
 for k in ['id','title','url','institution','reuseRights']:
  assert source[s['id']].get(k)==s.get(k),(s['id'],k)
features={};total=0
for p in (R/'public/data').rglob('*.geojson'):
 rel=p.relative_to(R);before=old(rel);after=json.loads(p.read_text())
 assert len(before['features'])==len(after['features']),str(rel)
 for a,b in zip(before['features'],after['features']):
  assert a['geometry']==b['geometry'],(rel,'geometry')
  for k in ['id','sourceIds','sourceLocators','snapshots','startDate','endDate','observationDate','movementStart','movementEnd','actor','echelon','militaryControl']:
   assert a['properties'].get(k)==b['properties'].get(k),(rel,k)
  if b['properties'].get('id'):features[b['properties']['id']]=b
  total+=1
assert (R/'src/map/cartography.js').read_bytes()==subprocess.check_output(['git','show',BASE+':src/map/cartography.js'],cwd=R)
articles={a['slug']:a for a in (json.loads(p.read_text()) for p in (R/'src/content/articles').glob('*.json'))}
assert len(articles)==50
class Paragraphs(HTMLParser):
 def __init__(self):super().__init__();self.rows=[];self.buf=[];self.active=False;self.skip=0
 def handle_starttag(self,t,a):
  if t=='p':self.active=True;self.buf=[]
  if t=='sup':self.skip+=1
 def handle_data(self,s):
  if self.active and not self.skip:self.buf.append(s)
 def handle_endtag(self,t):
  if t=='sup':self.skip=max(0,self.skip-1)
  if t=='p':
   if self.active and ''.join(self.buf).strip():self.rows.append(''.join(self.buf).strip())
   self.active=False
count=0
for phase in ['iv','v']:
 for d,c in read(f'public/data/history/phase-{phase}-study-context.json').items():
  a=articles[c['articleSlug']];parser=Paragraphs();parser.feed(a['body'])
  assert parser.rows==[r['text'] for r in c['paragraphs']],(d,'stale text')
  assert c['sections']==a['sections'],(d,'sections')
  for row in c['paragraphs']:
   assert all(s in source for s in row['sourceIds'])
   for fid in row['featureIds']:
    assert fid in features and d in features[fid]['properties']['snapshots'],(d,fid)
  count+=len(parser.rows)
for a in articles.values():
 assert a['status']=='published' and a['author']=='Robert M. Dobo'
 assert a['reviewedBodySha256']==hashlib.sha256(a['body'].encode()).hexdigest()
 assert not re.search(r'\bOst Krieg\b|\bOST KRIEG\b',a['body'])
for p in (R/'src').rglob('*.jsx'):
 assert not re.search(r'\bOst Krieg\b|\bOST KRIEG\b',p.read_text()),p
print(json.dumps(dict(result='passed',studies=50,sources=len(source),mapFeaturesPreserved=total,contextPassages=count,palette='unchanged',sourceTitlesAndLocators='preserved'),indent=2))
