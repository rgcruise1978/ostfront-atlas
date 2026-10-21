import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const review=read('barbarossa-part-ii-review.json');
assert.equal(review.coverage.filter(x=>x.kind==='note').length,126);
assert.equal(review.coverage.filter(x=>x.kind==='aside').length,18);
assert.deepEqual(review.chapterRange,[6,13]);
const slugs=[...new Set(review.coverage.map(x=>x.slug))];
assert.equal(slugs.length,8);
for(const slug of slugs){
 const article=read(`src/content/articles/${slug}.json`);
 const ids=[...article.body.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size,`${slug}: duplicate IDs`);
 assert.equal(crypto.createHash('sha256').update(article.body).digest('hex'),article.reviewedBodySha256);
 for(const item of review.coverage.filter(x=>x.slug===slug)){
  if(item.kind==='aside'){
   assert(ids.includes(item.anchor),`${slug}: missing aside ${item.anchor}`);
   assert(article.sections.some(s=>s.asides?.some(a=>a.id===item.anchor)),'Aside absent from contents');
  }else{
   assert(ids.includes(item.passageAnchor),'Missing note reference');
   const note=article.evidenceNotes.find(n=>n.id===item.anchor);
   assert(note?.text&&note.sourceIds.length,'Missing note text or sources');
   for(const id of note.sourceIds)assert(article.sourceIds.includes(id),'Unregistered note source');
  }
 }
 assert.equal(article.evidenceNotes.length,review.coverage.filter(x=>x.slug===slug&&x.kind==='note').length);
 for(const match of article.body.matchAll(/href="#([^\"]+)"/g))assert(ids.includes(match[1])||article.sourceIds.some(id=>match[1]===`source-${id}`)||article.evidenceNotes.some(note=>note.id===match[1]),`${slug}: unresolved ${match[1]}`);
 assert(!/\b(?:chapter \d+|this volume)\b/i.test(article.body),'Print-specific narrative reference');
}
console.log('Validated all eight Part II studies, 18 navigable asides, 126 evidence notes, source links, return anchors and reviewed body hashes.');
