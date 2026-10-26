// Prepare derived review artifacts as the serial production queue finishes.
// A READY_FOR_VISUAL_REVIEW record is not a final gate or release approval.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),work=path.join(root,'work/concept-demos-3d');
const slugs=['benchleaf-digital-observation-bench-concept','pocketarc-screen-free-camera-concept',
  'trailframe-two-grip-camera-concept','grid-grove','logic-harbor','echo-trail',
  'quiz-compass-audio-quiz-game-concept'];
const out=path.join(work,'qa-assigned-seven');fs.mkdirSync(out,{recursive:true});
const ready=new Map();
const command=script=>spawnSync(process.execPath,[path.join(root,'scripts',script),'--slug',current],{cwd:root,encoding:'utf8',maxBuffer:2*1024*1024});
let current='';
for(;;){
  const errors=[];
  for(const slug of slugs){
    const film=path.join(work,'films',slug),file=path.join(film,'encoded-report.json');
    if(!fs.existsSync(file))continue;
    try{
      const encoded=JSON.parse(fs.readFileSync(file,'utf8'));
      const production=JSON.parse(fs.readFileSync(path.join(film,'production-render.json'),'utf8'));
      if(encoded.revision!==production.revision||!encoded.decodedWithoutErrors||!production.bakeGate)continue;
      const declaredHash=encoded.files.find(item=>item.file.endsWith('.mp4'))?.sha256;
      const previous=ready.get(slug);
      if(previous?.revision===encoded.revision&&previous.videoSha256===declaredHash)continue;
      current=slug;
      for(const script of ['review-native-film.mjs','review-native-film-audio.mjs']){
        const result=command(script);if(result.status!==0)throw Error(result.stderr||result.stdout);
      }
      const review=JSON.parse(fs.readFileSync(path.join(film,'final-review/index.json'),'utf8'));
      const record={slug,state:'READY_FOR_VISUAL_REVIEW',revision:encoded.revision,
        videoSha256:review.videoSha256,reviewFolder:review.reviewFolder,
        contactSheet:review.contactSheet,preparedAt:new Date().toISOString()};
      ready.set(slug,record);console.log(JSON.stringify(record));
    }catch(error){errors.push({slug,error:String(error.message)});}
  }
  const passed=slugs.filter(slug=>{
    try{
      const gate=JSON.parse(fs.readFileSync(path.join(work,'films',slug,'final-gate.json'),'utf8'));
      const record=ready.get(slug);
      return gate.status==='PASS'&&record&&gate.revision===record.revision&&gate.videoSha256===record.videoSha256;
    }catch{return false;}
  });
  const state={pid:process.pid,updatedAt:new Date().toISOString(),
    state:passed.length===slugs.length?'ALL_FINAL_GATES_PASS':ready.size===slugs.length?'WAITING_FOR_FINAL_VISUAL_REVIEW':'WAITING_FOR_ENCODING',
    pending:slugs.filter(slug=>!ready.has(slug)),ready:[...ready.values()],passed,errors};
  fs.writeFileSync(path.join(out,'status.json'),JSON.stringify(state,null,2));
  if(passed.length===slugs.length||process.argv.includes('--once'))break;
  await new Promise(resolve=>setTimeout(resolve,10000));
}
