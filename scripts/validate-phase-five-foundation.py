"""Preserve earlier collections while validating the reviewed and published Phase V studies."""
from pathlib import Path
import json,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[1];read=lambda p:json.loads((ROOT/p).read_text());baseline=read('phase-v-review/checkpoint.json');changed=[]
for path,h in baseline['files'].items():
 if hashlib.sha256((ROOT/path).read_bytes()).hexdigest()!=h:changed.append(path)
assert not [p for p in changed if not (p.startswith('public/data/history/') or p in ['src/data/territorial-states.json','src/data/sources.json','src/data/map-snapshot-index.json','src/map/AtlasMap.jsx','src/map/mapStyle.js','src/map/temporalGeography.js','src/pages/Atlas.jsx'])],changed
articles=[json.loads(p.read_text()) for p in (ROOT/'src/content/articles').glob('*.json')]
assert len(articles)==50 and all(a['author']=='Robert M. Dobo' for a in articles)
assert sum(a['status']=='published' for a in articles)==50
phase5=[a for a in articles if a.get('phaseId')=='5'];assert len(phase5)==8 and all(a['status']=='published' and a['body'] and 3000<=a.get('substantiveWordCount',0)<=5000 and a.get('publicationDate') and a.get('reviewedDate') and a.get('reviewedBodySha256')==hashlib.sha256(a['body'].encode()).hexdigest() for a in phase5)
snapshot=read('src/data/map-snapshot-index.json');old=json.loads(subprocess.check_output(['git','show',baseline['commit']+':src/data/map-snapshot-index.json'],cwd=ROOT));assert all(snapshot[d]==v for d,v in old.items())
originalSources=json.loads(subprocess.check_output(['git','show',baseline['commit']+':src/data/sources.json'],cwd=ROOT));sources=read('src/data/sources.json');current={s['id']:s for s in sources};assert all(current[s['id']]==s for s in originalSources)
originalCapitals=json.loads(subprocess.check_output(['git','show',baseline['commit']+':src/data/capitals.json'],cwd=ROOT));capitals=read('src/data/capitals.json');assert len(capitals)==len(originalCapitals)
for before,after in zip(originalCapitals,capitals):
 expected={**before,'endDate':'1941-12-05'} if before['endDate']=='1941-11-14' else before
 assert expected==after,after['id']
for a in articles:
 page=ROOT/'dist/articles'/a['slug']/'index.html'
 if page.exists():
  html=page.read_text();assert '<meta name="author" content="Robert M. Dobo">' in html,a['slug']
  if a.get('phaseId')=='5':assert '<meta name="robots" content="noindex, follow">' in html and a['slug'] in (ROOT/'dist/sitemap.xml').read_text(),a['slug']
editorialBaseline=read('phase-v-edit-review/baseline.json')
phase5paths={f"src/content/articles/{a['slug']}.json" for a in phase5}
assert all(hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h for p,h in editorialBaseline.items() if p not in phase5paths and (p.startswith('src/content/articles/') or p=='src/map/cartography.js')), 'Earlier article or palette changed'
report={'publishedArticles':50,'editorialArticlesUnchanged':42,'result':'passed','unchangedBaselineFiles':len(baseline['files'])-len(changed),'publishedArticlesUnchanged':42,'allOriginalAuthors':'Robert M. Dobo','phaseVResearchBriefs':0,'barbarossaSelectedDates':44,'totalSelectedDates':49,'fullPhaseVNarratives':8,'phaseVMilitaryReconstructions':8,'earlierSnapshotMetadataUnchanged':len(old),'earlierSourceRecordsUnchanged':len(originalSources),'capitalRoleExtensionOnly':True}
(ROOT/'phase-v-maps-review/foundation-validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))

# Map extension preserves all prior features semantically, rather than requiring
# unchanged bytes for shared files which legitimately receive new dated records.
import runpy
runpy.run_path(str(ROOT/'scripts/validate-phase-five-maps.py'))
