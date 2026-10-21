import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const review=read('barbarossa-part-iii-review.json');
const notes=review.coverage.filter(x=>x.kind==='note'),asides=review.coverage.filter(x=>x.kind==='aside');
assert.equal(notes.length,139);assert.equal(asides.length,18);assert.deepEqual(review.chapterRange,[14,22]);
assert.equal(new Set(notes.map(n=>n.manuscriptNoteId)).size,139);
const expected=[13,14,15,14,17,19,17,13,17];
for(let i=0;i<9;i++)assert.equal(notes.filter(n=>n.chapter===14+i).length,expected[i]);
const slugs=[...new Set(notes.map(n=>n.slug))];assert.equal(slugs.length,9);
for(const slug of slugs){
  const a=read(`src/content/articles/${slug}.json`),ids=[...a.body.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(ids.length,new Set(ids).size,`${slug}: duplicate IDs`);assert.equal(hash(a.body),a.reviewedBodySha256);
  assert.equal((a.body.match(/<aside\b/g)||[]).length,2);
  for(const row of notes.filter(x=>x.slug===slug)){
    const note=a.evidenceNotes.find(n=>n.id===row.anchor);
    assert(note&&ids.includes(row.passageAnchor),'Missing note or passage');assert.equal(hash(note.text),row.textSha256,'Native note text changed');
    assert(note.sourceIds.length&&note.sourceIds.every(id=>a.sourceIds.includes(id)),'Missing note source');
    assert(a.body.includes(`href="#${note.id}"`),'Missing note link');
  }
  for(const row of asides.filter(x=>x.slug===slug))assert(ids.includes(row.anchor)&&a.sections.some(s=>s.asides?.some(x=>x.id===row.anchor)),'Aside is absent from contents');
  for(const m of a.body.matchAll(/href="#([^\"]+)"/g))assert(ids.includes(m[1])||a.sourceIds.some(id=>m[1]===`source-${id}`)||a.evidenceNotes.some(n=>m[1]===n.id),'Unresolved fragment '+m[1]);
  assert(!/\b(?:chapter \d+|this volume)\b/i.test(a.body.replace(/<[^>]*>/g,' ')),'Print framing remains');
}
console.log('Validated nine Part III studies, 18 navigable asides, 139 unchanged native notes, source links, passage anchors and reviewed text hashes.');
