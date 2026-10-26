// Objective measurements from the actual encoded AAC; never grants a film PASS.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const slug=process.argv[process.argv.indexOf('--slug')+1];
if(!/^[a-z0-9-]+$/.test(slug))throw Error('Invalid slug');
const root=process.cwd(),work=path.join(root,'work/concept-demos-3d/films',slug);
const report=JSON.parse(fs.readFileSync(path.join(work,'encoded-report.json'),'utf8'));
const production=JSON.parse(fs.readFileSync(path.join(work,'production-render.json'),'utf8'));
const provenance=JSON.parse(fs.readFileSync(path.join(work,'audio/audio-provenance.json'),'utf8'));
const video=path.join(root,'public/media/concept-demos/3d',slug+'.mp4');
const hash=crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex');
const out=path.join(work,'final-review',hash.slice(0,12));fs.mkdirSync(out,{recursive:true});
const ffmpeg=process.env.FFMPEG_PATH||'C:/Users/Defineless/AppData/Local/Programs/Python/Python312/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const decode=spawnSync(ffmpeg,['-v','error','-i',video,'-map','0:a:0','-vn','-ac','1','-ar','48000','-f','f32le','pipe:1'],{maxBuffer:32*1024*1024});
if(decode.status!==0)throw Error(decode.stderr.toString());
const sampleRate=48000,count=decode.stdout.length/4,samples=new Float32Array(count);
let peak=0;for(let i=0;i<count;i++){samples[i]=decode.stdout.readFloatLE(i*4);peak=Math.max(peak,Math.abs(samples[i]));}
const threshold=.0005,binSize=480,bins=[];
for(let begin=0;begin<count;begin+=binSize){let energy=0,n=Math.min(binSize,count-begin);for(let j=0;j<n;j++)energy+=samples[begin+j]**2;bins.push(Math.sqrt(energy/n));}
const activeIntervals=[];let begin=null;
for(let i=0;i<=bins.length;i++){
  const active=i<bins.length&&bins[i]>threshold;
  if(active&&begin===null)begin=i*.01;
  if(!active&&begin!==null){activeIntervals.push([+begin.toFixed(2),+(i*.01).toFixed(2)]);begin=null;}
}
function rms(start,duration){const a=Math.max(0,Math.round(start*sampleRate)),b=Math.min(count,Math.round((start+duration)*sampleRate));let e=0;for(let i=a;i<b;i++)e+=samples[i]**2;return b>a?Math.sqrt(e/(b-a)):0;}
const expectedEvents=provenance.events.map(event=>{
  const hits=activeIntervals.filter(([a,b])=>b>event.time-.02&&a<event.time+event.duration+.03);
  const first=hits.length?Math.max(event.time-.02,hits[0][0]):null;
  return {...event,measuredOnsetSeconds:first,onsetErrorSeconds:first===null?null:+(first-event.time).toFixed(3),rms:+rms(event.time,event.duration).toFixed(6)};
});
const sourceMix=path.join(work,'audio/final-mix.wav');
const sourceMixSha256=crypto.createHash('sha256').update(fs.readFileSync(sourceMix)).digest('hex');
if(expectedEvents.some(event=>/prompt|speech|phoneme/i.test(event.kind))){
  const source=spawnSync(ffmpeg,['-v','error','-i',sourceMix,'-ac','1','-ar','48000','-f','f32le','pipe:1'],{maxBuffer:32*1024*1024});
  if(source.status!==0)throw Error(source.stderr.toString());
  for(const event of expectedEvents.filter(event=>/prompt|speech|phoneme/i.test(event.kind))){
    const end=Math.round((event.time+event.duration)*sampleRate);
    const n=Math.max(32,Math.round(Math.min(.35,event.duration*.4)*sampleRate)),start=end-n;
    if(start<0||end>count||end*4>source.stdout.length){event.sourceTailCorrelation=null;continue;}
    let sx=0,sy=0,xx=0,yy=0,xy=0;
    for(let i=start;i<end;i++){
      const x=source.stdout.readFloatLE(i*4),y=samples[i];sx+=x;sy+=y;xx+=x*x;yy+=y*y;xy+=x*y;
    }
    const denominator=Math.sqrt((xx-sx*sx/n)*(yy-sy*sy/n));
    event.sourceTailCorrelation=denominator>0?+(Math.max(-1,Math.min(1,(xy-sx*sy/n)/denominator))).toFixed(9):null;
    event.sourceTailComparedSeconds=n/sampleRate;
  }
}
const toneMeasurements=(production.spec.tones||[]).map(([time,duration,expectedHz])=>{
  const start=Math.round((time+.025)*sampleRate),length=Math.min(Math.round(Math.max(.04,duration-.05)*sampleRate),count-start);
  let bestHz=null,bestPower=-1;
  for(let frequency=Math.floor(expectedHz)-8;frequency<=Math.ceil(expectedHz)+8;frequency++){
    const coefficient=2*Math.cos(2*Math.PI*frequency/sampleRate);let q1=0,q2=0;
    for(let j=0;j<length;j++){const q=samples[start+j]+coefficient*q1-q2;q2=q1;q1=q;}
    const power=q1*q1+q2*q2-coefficient*q1*q2;if(power>bestPower){bestPower=power;bestHz=frequency;}
  }
  return {time,duration,expectedHz,measuredDominantHz:bestHz,rms:+rms(time,duration).toFixed(6)};
});
const result={slug,videoSha256:hash,revision:report.revision,checkedAt:new Date().toISOString(),
  scope:'Decoded waveform timing and tone-frequency measurements; speech identity and visual cause/effect require human review.',
  decodedWithoutErrors:true,sampleRate,decodedDurationSeconds:count/sampleRate,expectedDurationSeconds:report.durationSeconds,
  peak:+peak.toFixed(6),sourceMixSha256,activeThresholdRms:threshold,timeBinSeconds:.01,activeIntervals,expectedEvents,toneMeasurements,
  provenanceSource:path.join(work,'audio/audio-provenance.json')};
const file=path.join(out,'audio-measurements.json');fs.writeFileSync(file,JSON.stringify(result,null,2));
console.log(JSON.stringify({slug,report:file,events:expectedEvents.length,peak:result.peak,missingEvents:expectedEvents.filter(e=>e.measuredOnsetSeconds===null).length}));
