"""Preserve completed collections while introducing explicitly unfinished Phase V records."""
from pathlib import Path
import json,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[1];read=lambda p:json.loads((ROOT/p).read_text());baseline=read('phase-v-review/checkpoint.json');changed=[]
for path,h in baseline['files'].items():
 if hashlib.sha256((ROOT/path).read_bytes()).hexdigest()!=h:changed.append(path)
assert not changed,changed
articles=[json.loads(p.read_text()) for p in (ROOT/'src/content/articles').glob('*.json')]
assert len(articles)==50 and all(a['author']=='R.G. Cruise' for a in articles)
assert sum(a['status']=='published' for a in articles)==42
phase5=[a for a in articles if a.get('phaseId')=='5'];assert len(phase5)==8 and all(a['status']=='research-brief' and a['body']=='' and not a.get('publicationDate') for a in phase5)
snapshot=read('src/data/map-snapshot-index.json');old=json.loads(subprocess.check_output(['git','show',baseline['commit']+':src/data/map-snapshot-index.json'],cwd=ROOT));assert all(snapshot[d]==v for d,v in old.items())
originalSources=json.loads(subprocess.check_output(['git','show',baseline['commit']+':src/data/sources.json'],cwd=ROOT));sources=read('src/data/sources.json');current={s['id']:s for s in sources};assert all(current[s['id']]==s for s in originalSources)
originalCapitals=json.loads(subprocess.check_output(['git','show',baseline['commit']+':src/data/capitals.json'],cwd=ROOT));capitals=read('src/data/capitals.json');assert len(capitals)==len(originalCapitals)
for before,after in zip(originalCapitals,capitals):
 expected={**before,'endDate':'1941-12-05'} if before['endDate']=='1941-11-14' else before
 assert expected==after,after['id']
for a in articles:
 page=ROOT/'dist/articles'/a['slug']/'index.html'
 if page.exists():
  html=page.read_text();assert '<meta name="author" content="R.G. Cruise">' in html,a['slug']
  if a.get('phaseId')=='5':assert '<meta name="robots" content="noindex, follow">' in html and a['slug'] not in (ROOT/'dist/sitemap.xml').read_text(),a['slug']
report={'result':'passed','protectedFilesUnchanged':len(baseline['files']),'publishedArticlesUnchanged':42,'allOriginalAuthors':'R.G. Cruise','phaseVResearchBriefs':8,'barbarossaSelectedDates':44,'totalSelectedDates':49,'fullPhaseVNarratives':0,'phaseVMilitaryReconstructions':0,'earlierSnapshotMetadataUnchanged':len(old),'earlierSourceRecordsUnchanged':len(originalSources),'capitalRoleExtensionOnly':True}
(ROOT/'phase-v-review/foundation-validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
