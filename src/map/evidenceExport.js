// Retain full qualifications alongside the rendered image in a PNG iTXt chunk.
// The companion JSON is also offered as an accessible text export.
const encoder = new TextEncoder();
function crc32(bytes) { let crc=0xffffffff; for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0; }
export async function pngWithEvidence(blob,evidence) {
  const original=new Uint8Array(await blob.arrayBuffer());
  const text=encoder.encode('Ostkrieg evidence\0\0\0\0\0'+JSON.stringify(evidence));
  const type=encoder.encode('iTXt'),chunk=new Uint8Array(text.length+12),view=new DataView(chunk.buffer);
  view.setUint32(0,text.length);chunk.set(type,4);chunk.set(text,8);view.setUint32(chunk.length-4,crc32(chunk.slice(4,-4)));
  const output=new Uint8Array(original.length+chunk.length);output.set(original.slice(0,-12));output.set(chunk,original.length-12);output.set(original.slice(-12),original.length-12+chunk.length);
  return new Blob([output],{type:'image/png'});
}
export function downloadEvidence(evidence) {
  const blob=new Blob([JSON.stringify(evidence,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`ostkrieg-${evidence.date}-evidence.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
