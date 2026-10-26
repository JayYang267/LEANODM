// Derived review artifacts only; source video and production frames stay intact.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
const slug=process.argv[process.argv.indexOf('--slug')+1];
if(!/^[a-z0-9-]+$/.test(slug))throw Error('Invalid slug');
const root=process.cwd(),work=path.join(root,'work/concept-demos-3d/films',slug);
const report=JSON.parse(fs.readFileSync(path.join(work,'encoded-report.json'),'utf8'));
const video=path.join(root,'public/media/concept-demos/3d',slug+'.mp4');
const hash=crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex');
const out=path.join(work,'final-review',hash.slice(0,12));fs.mkdirSync(out,{recursive:true});
const ffmpeg=process.env.FFMPEG_PATH||'C:/Users/Defineless/AppData/Local/Programs/Python/Python312/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const production=JSON.parse(fs.readFileSync(path.join(work,'production-render.json'),'utf8'));
const spec=production.spec;
const planFile=path.join(root,'work/concept-demos-3d/qa-assigned-seven/plan.json');
const critical=fs.existsSync(planFile)?JSON.parse(fs.readFileSync(planFile,'utf8')).films.find(film=>film.slug===slug)?.criticalTimes||[]:[];
const times=[0,...Array.from({length:Math.floor(report.durationSeconds/2)},(_,i)=>i*2+1),
    ...(spec.foley||[]).map(e=>e[0]+.08),
    ...(spec.tones||[]).map(e=>e[0]+e[1]/2),
    ...(spec.audio_cues||[]).map(e=>(Array.isArray(e)?e[0]:e.time)+.15),
    ...critical.flatMap(t=>[t-1/24,t,t+1/24])].filter(t=>Number.isFinite(t)&&t>=0&&t<report.durationSeconds);
const unique=[...new Set(times.map(t=>Number(t.toFixed(3))))].sort((a,b)=>a-b);
const composites=[];
for(let i=0;i<unique.length;i++){
  const t=unique[i],file=path.join(out,`frame-${t.toFixed(3)}.jpg`);
  if(!fs.existsSync(file)){
    const r=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-ss',String(t),'-i',video,'-frames:v','1','-q:v','2','-y',file],{encoding:'utf8'});
    if(r.status)throw Error(r.stderr);
  }
  const thumbnail=await sharp(file).resize(480,270).composite([{input:Buffer.from(`<svg width="480" height="26"><rect width="480" height="26" fill="#fff"/><text x="8" y="19" font-family="Arial" font-size="17">${slug} · ${t}s</text></svg>`),top:0,left:0}]).jpeg({quality:90}).toBuffer();
  composites.push({input:thumbnail,left:(i%4)*480,top:Math.floor(i/4)*270});
}
const sheet=path.join(out,'contact-sheet.jpg');
await sharp({create:{width:1920,height:Math.ceil(unique.length/4)*270,channels:3,background:'#fff'}}).composite(composites).jpeg({quality:92}).toFile(sheet);
// Decode transition pairs by exact zero-based frame number. Rounded seeking
// timestamps can otherwise select the following24fps frame and miss a pop.
const transitionFrames=[...new Set((production.visibilityGate?.switches||[])
  .flatMap(item=>[item.switchFrame-1,item.switchFrame]))]
  .filter(frame=>Number.isInteger(frame)&&frame>=1&&frame<=report.nativeFrames).sort((a,b)=>a-b);
const visibilitySamples=[];let visibilitySheet;
if(transitionFrames.length){
  const folder=path.join(out,'visibility-boundaries');fs.mkdirSync(folder,{recursive:true});
  const select=transitionFrames.map(frame=>`eq(n\\,${frame-1})`).join('+');
  const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-i',video,'-vf',`select=${select}`,'-vsync','0','-q:v','2','-y',path.join(folder,'frame-%04d.jpg')],{encoding:'utf8'});
  if(result.status)throw Error(result.stderr);
  const boundaryComposites=[];
  for(let i=0;i<transitionFrames.length;i++){
    const frameNumber=transitionFrames[i],seconds=(frameNumber-1)/24;
    const file=path.join(folder,`frame-${String(i+1).padStart(4,'0')}.jpg`);
    visibilitySamples.push({frameNumber,seconds,file});
    const thumbnail=await sharp(file).resize(480,270).composite([{input:Buffer.from(`<svg width="480" height="26"><rect width="480" height="26" fill="#fff"/><text x="8" y="19" font-family="Arial" font-size="17">${slug} · frame${frameNumber} · ${seconds.toFixed(3)}s</text></svg>`),top:0,left:0}]).jpeg({quality:90}).toBuffer();
    boundaryComposites.push({input:thumbnail,left:(i%4)*480,top:Math.floor(i/4)*270});
  }
  visibilitySheet=path.join(out,'visibility-contact-sheet.jpg');
  await sharp({create:{width:1920,height:Math.ceil(transitionFrames.length/4)*270,channels:3,background:'#fff'}}).composite(boundaryComposites).jpeg({quality:92}).toFile(visibilitySheet);
}
fs.writeFileSync(path.join(work,'final-review','index.json'),JSON.stringify({slug,revision:report.revision,videoSha256:hash,reviewSamplingVersion:2,reviewFolder:out,contactSheet:sheet,times:unique,visibilityContactSheet:visibilitySheet,visibilitySamples},null,2));
console.log(JSON.stringify({slug,sha256:hash,frames:unique.length,exactVisibilityFrames:visibilitySamples.length,contactSheet:sheet,visibilityContactSheet:visibilitySheet}));
