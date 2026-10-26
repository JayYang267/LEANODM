"""Quiet Foley and source-proposed device prompts, never explanatory narration."""
import argparse
import hashlib
import importlib.util
import json
import math
import subprocess
import sys
import wave
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
sys.path[:0]=[str(ROOT),str(ROOT/'scripts'),str(ROOT/'scripts/concept_3d')]
ap=argparse.ArgumentParser();ap.add_argument('--slug');args=ap.parse_args()
# Initialize the bundled mathutils before a standalone scene SPEC imports it.
import bpy
modules=sorted((ROOT/'scripts/concept_3d/scenes').glob('*.py'))
specs=[]
for file in modules:
    if file.name.startswith('_') or (args.slug and file.stem!=args.slug):continue
    sp=importlib.util.spec_from_file_location('audio_'+file.stem.replace('-','_'),file)
    module=importlib.util.module_from_spec(sp);sys.modules[sp.name]=module;sp.loader.exec_module(module)
    specs.append(module.SPEC)
cache=ROOT/'work/concept-demos-3d/audio-cache';cache.mkdir(parents=True,exist_ok=True)
entries={}
def normalize(cue):
    return cue if isinstance(cue,dict) else {'time':cue[0],'text':cue[1],'kind':'speech'}
def cue_key(cue,slug):
    text=cue.get('text','');phoneme=cue.get('phoneme')
    if slug.startswith('sound-steps') and text.strip().lower() in {'c','c.'}:phoneme='k'
    digest=hashlib.sha256((text+'|'+str(phoneme)).encode()).hexdigest()[:20]
    return digest,{'text':text,'phoneme':phoneme,'path':str(cache/(digest+'.wav'))}
for spec in specs:
    for raw in spec.get('audio_cues',[]):
        cue=normalize(raw)
        if cue.get('kind','speech') in {'speech','phoneme'} and cue.get('text'):
            key,entry=cue_key(cue,spec['slug']);entries[key]=entry
manifest=cache/'speech-manifest.json';manifest.write_text(json.dumps(list(entries.values()),ensure_ascii=False),encoding='utf8')
if entries:
    r=subprocess.run(['powershell','-NoProfile','-File',str(ROOT/'scripts/render-native-speech.ps1'),'-Manifest',str(manifest)],capture_output=True,text=True)
    if r.returncode:raise RuntimeError(r.stderr)
    print(r.stdout.strip())
RATE=48000
def read_audio(file):
    with wave.open(str(file),'rb')as w:
        a=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float64)/32768
        if w.getnchannels()>1:a=a.reshape(-1,w.getnchannels()).mean(axis=1)
        sr=w.getframerate()
    if sr!=RATE:
        # Windows NumPy 1.x defaults arange to int32. Multiplying by sr before
        # division overflows after ~1.864 s at 24 kHz and repeats/cuts speech.
        a=np.interp(np.arange(round(len(a)*RATE/sr),dtype=np.float64)*(sr/RATE),
                    np.arange(len(a),dtype=np.float64),a)
    # Remove long SAPI boundary silence so an input has an immediate response.
    active=np.flatnonzero(np.abs(a)>.002)
    if len(active):a=a[max(0,active[0]-240):min(len(a),active[-1]+960)]
    if len(a)<RATE*.02:raise ValueError('Empty speech cue '+str(file))
    a*=.23/max(np.max(np.abs(a)),.01)
    fade=min(240,len(a)//4);a[:fade]*=np.linspace(0,1,fade);a[-fade:]*=np.linspace(1,0,fade)
    return a
def tone(seconds,hz,gain=.085):
    n=round(seconds*RATE);t=np.arange(n)/RATE
    a=gain*(np.sin(math.tau*hz*t)+.18*np.sin(math.tau*hz*2*t))/1.18
    f=min(round(.015*RATE),n//3);a[:f]*=np.linspace(0,1,f);a[-f:]*=np.linspace(1,0,f)
    return a
def stamp(t):
    ms=round(t*1000);return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d}.{ms%1000:03d}'
for spec in specs:
    slug=spec['slug'];duration=float(spec.get('duration',28));mix=np.zeros((round(duration*RATE),2),dtype=np.float64)
    events=[]
    def add(t,a,kind):
        start=round(float(t)*RATE)
        if start+len(a)>len(mix):raise ValueError(f'{slug}: {kind} exceeds clip end')
        mix[start:start+len(a)]+=a[:,None]
        events.append({'time':float(t),'duration':len(a)/RATE,'kind':kind})
    rng=np.random.default_rng(173)
    for t,kind in spec.get('foley',[]):
        n=round(.035*RATE);x=rng.standard_normal(n);x=np.convolve(x,[.25,.5,.25],mode='same')
        x*=np.exp(-np.arange(n)/(RATE*.008))*np.minimum(1,np.arange(n)/40)
        x*=.05/max(np.max(np.abs(x)),.001);add(t,x,'original mechanical Foley')
    for t,seconds,hz in spec.get('tones',[]):add(t,tone(seconds,hz),'illustrative proposed device tone')
    for raw in spec.get('audio_cues',[]):
        cue=normalize(raw);kind=cue.get('kind','speech');t=cue['time']
        if kind=='melody':
            seconds=float(cue.get('duration',4));a=np.zeros(round(seconds*RATE))
            notes=[261.63,329.63,392.00,440.00,392.00,329.63,293.66,261.63]
            for i in range(math.ceil(seconds/.5)):
                start=round(i*.5*RATE);note=tone(min(.44,seconds-i*.5),notes[i%len(notes)],cue.get('gain',.075))
                a[start:start+len(note)]+=note
            envelope=cue.get('gain_envelope')
            if envelope:
                # Relative cue seconds and amplitude multipliers preserve one
                # continuous melody while a physical volume control changes it.
                points=np.asarray(envelope,dtype=np.float64)
                if (points.ndim!=2 or points.shape[1]!=2 or not np.isfinite(points).all()
                    or np.any(points[:,0]<0) or np.any(points[:,0]>seconds)
                    or np.any(np.diff(points[:,0])<=0) or np.any(points[:,1]<0)):
                    raise ValueError(f'{slug}: invalid melody gain envelope')
                a*=np.interp(np.arange(len(a))/RATE,points[:,0],points[:,1])
            add(t,a,'original synthesized playback sample')
            if envelope:
                events[-1].update({'baseGain':cue.get('gain',.075),'gainEnvelope':envelope,
                                  'gainEnvelopeTimebase':'seconds from this continuous cue onset'})
        elif kind in {'speech','phoneme'}:
            key,_=cue_key(cue,slug);add(t,read_audio(cache/(key+'.wav')),cue.get('origin','synthetic proposed stored prompt')+': '+cue.get('text',''))
    peak=float(np.max(np.abs(mix)))
    if peak>.85:mix*=.85/peak
    out=ROOT/'work/concept-demos-3d/films'/slug/'audio';out.mkdir(parents=True,exist_ok=True)
    with wave.open(str(out/'final-mix.wav'),'wb')as w:
        w.setparams((2,2,RATE,len(mix),'NONE','not compressed'));w.writeframes((mix*32767).astype('<i2').tobytes())
    cues=['WEBVTT','']
    for i,(start,end,text)in enumerate(spec.get('captions',[]),1):
        if len(text)>95 or '\n'in text:raise ValueError('Caption must remain a short line')
        cues +=[str(i),stamp(start)+' --> '+stamp(end),text,'']
    (out/'captions.vtt').write_text('\n'.join(cues),encoding='utf8')
    (out/'audio-provenance.json').write_text(json.dumps({'durationSeconds':duration,'rate':RATE,'channels':2,'events':events,'origin':'Illustrative synthetic concept soundtrack; no real product recording or narration','speechVoice':'Microsoft Zira Desktop','peak':float(np.max(np.abs(mix)))},indent=2),encoding='utf8')
    print('AUDIO_READY '+json.dumps({'slug':slug,'seconds':duration,'events':len(events),'captions':len(spec.get('captions',[]))}))
spec_path=ROOT/'work/concept-demos-3d/scene-specs.json'
if args.slug and spec_path.exists():
    # A targeted refresh must leave the other prepared film records intact.
    existing=json.loads(spec_path.read_text(encoding='utf8'))
    by_slug={item['slug']:item for item in existing}
    by_slug.update({item['slug']:item for item in specs})
    specs=list(by_slug.values())
spec_path.write_text(json.dumps(specs,indent=2),encoding='utf8')
