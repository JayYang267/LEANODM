// Register a finished native film only after its SHA-bound visual review.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd();
const slugs=process.argv.slice(process.argv.indexOf('--slugs')+1);
if(!process.argv.includes('--slugs')||!slugs.length)throw Error('Provide --slugs');
const file=path.join(root,'src/data/products/concept-demo-3d-ready.json');
const ready=JSON.parse(fs.readFileSync(file,'utf8'));
for(const slug of slugs){
  if(!/^[a-z0-9-]+$/.test(slug))throw Error('Invalid slug');
  const work=path.join(root,'work/concept-demos-3d/films',slug);
  const read=name=>JSON.parse(fs.readFileSync(path.join(work,name),'utf8'));
  const film=read('encoded-report.json'),production=read('production-render.json'),gate=read('final-gate.json');
  const video=path.join(root,'public/media/concept-demos/3d',slug+'.mp4');
  const hash=crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex');
  if(gate.status!=='PASS'||gate.videoSha256!==hash||gate.revision!==film.revision)throw Error(`${slug}: finished-clip review does not match the actual video`);
  if(film.revision!==production.revision||!film.decodedWithoutErrors||film.nativeFrames!==production.nativeFrames)throw Error(`${slug}: encoded render provenance mismatch`);
  const bake=production.bakeGate;
  if(!bake||bake.framesChecked!==film.nativeFrames||Object.entries(bake).some(([k,v])=>/Error|Errors$/.test(k)&&typeof v==='number'&&v>1e-6))throw Error(`${slug}: native animation gate missing or failed`);
  if(production.visibilityGate?.status!=='PASS'||production.visibilityGate.framesChecked!==film.nativeFrames||production.visibilityGate.blockingSwitches?.length)throw Error(`${slug}: hand entry/exit continuity gate missing or failed`);
  for(const asset of film.files){
    const content=fs.readFileSync(path.join(root,asset.file));
    if(content.length!==asset.bytes||crypto.createHash('sha256').update(content).digest('hex')!==asset.sha256)throw Error(`${slug}: asset changed after encoding`);
  }
  const record=Object.fromEntries(['slug','durationSeconds','width','height','posterWidth','posterHeight','createdAt','creditsHref'].filter(k=>film[k]!==undefined).map(k=>[k,film[k]]));
  const i=ready.findIndex(d=>d.slug===slug);
  if(i<0)ready.push(record);else ready[i]=record;
}
fs.writeFileSync(file,JSON.stringify(ready,null,2)+'\n');
console.log(JSON.stringify({registered:slugs,totalReady:ready.length}));
