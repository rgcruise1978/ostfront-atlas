import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8'));
const report = read('barbarossa-part-iv-review.json');
const timeline = read('src/data/barbarossa-phase-iii-timeline.json');
let notes=0,asides=0;
for(const study of report.studies){
  const article=read(`src/content/articles/${study.slug}.json`);
  assert.equal(createHash('sha256').update(article.body).digest('hex'),article.reviewedBodySha256);
  assert.equal(article.historicalDate,study.date);
  assert(timeline.some(event=>event.date===study.date&&event.articleSlug===study.slug));
  assert.equal(article.evidenceNotes.length,study.notes);
  const actualAsides=(article.body.match(/<aside\b/g)||[]).length;
  assert.equal(actualAsides,study.asides);
  for(const entry of report.coverage.filter(item=>item.slug===study.slug)){
    if(entry.kind==='note'){
      const note=article.evidenceNotes.find(item=>item.manuscriptNoteId===entry.manuscriptNoteId);
      assert(note,`${study.slug}: missing native note ${entry.manuscriptNoteId}`);
      assert.equal(createHash('sha256').update(note.text).digest('hex'),entry.textSha256);
      assert(article.body.includes(`id="${entry.passageAnchor}"`));
      assert(article.body.includes(`href="#${entry.anchor}"`));
      assert.deepEqual(note.sourceIds,entry.sourceIds);
      assert(note.sourceIds.every(id=>article.sourceIds.includes(id)));
      notes++;
    }else{
      assert(article.body.includes(`id="${entry.anchor}"`));
      assert(article.sections.some(section=>section.asides?.some(aside=>aside.id===entry.anchor)));
      asides++;
    }
  }
}
assert.equal(report.studies.length,9);
assert.equal(notes,132);
assert.equal(asides,19);
const nativeIds=report.coverage.filter(item=>item.kind==='note').map(item=>item.manuscriptNoteId).sort((a,b)=>a-b);
assert.deepEqual(nativeIds,Array.from({length:132},(_,i)=>i+382));
console.log('Validated Part IV: nine existing Phase III studies, all 19 asides and 132 exact native notes, dated study identities and linked passage/source targets.');
