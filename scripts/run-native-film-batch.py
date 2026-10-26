"""Sequential native film queue. One GPU renderer, durable progress and logs."""
import argparse
import ctypes
import importlib.util
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path[:0]=[str(ROOT),str(ROOT/'scripts'),str(ROOT/'scripts/concept_3d')]
ap=argparse.ArgumentParser()
ap.add_argument('--mode',choices=['review','production'],required=True)
ap.add_argument('--slugs',nargs='*')
ap.add_argument('--exclude',nargs='*',default=[])
ap.add_argument('--wait-pid',type=int)
ap.add_argument('--queue-name',help='Status/log directory name; defaults to queue-<mode>')
args=ap.parse_args()
if args.queue_name and not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]*',args.queue_name):
    ap.error('--queue-name must be a simple directory name')
index=json.loads((ROOT/'work/concept-demos-3d/native-portfolio/index.json').read_text(encoding='utf8'))
slugs=args.slugs or [p['slug']for p in index]
slugs=[s for s in slugs if s not in args.exclude]
queue_name=args.queue_name or ('queue-'+args.mode)
queue=ROOT/'work/concept-demos-3d'/queue_name
queue.mkdir(parents=True,exist_ok=True)
status={'mode':args.mode,'queueName':queue_name,'pid':os.getpid(),'waitPid':args.wait_pid,'slugs':slugs,'state':'waiting'if args.wait_pid else 'starting','startedAt':time.time(),'done':[],'failed':[]}
def save():
    (queue/'status.json').write_text(json.dumps(status,indent=2),encoding='utf8')
save()
if args.wait_pid:
    kernel=ctypes.windll.kernel32
    kernel.OpenProcess.restype=ctypes.c_void_p
    handle=kernel.OpenProcess(0x00100000,False,args.wait_pid)
    if handle:
        kernel.WaitForSingleObject(ctypes.c_void_p(handle),0xFFFFFFFF)
        kernel.CloseHandle(ctypes.c_void_p(handle))
# bpy initializes its bundled mathutils module. Scene specs may import
# mathutils before another scene has had a chance to import bpy.
import bpy
for slug in slugs:
    file=ROOT/'scripts/concept_3d/scenes'/f'{slug}.py'
    if not file.exists():
        status['failed'].append({'slug':slug,'reason':'scene module missing'});save();continue
    sp=importlib.util.spec_from_file_location('queue_'+slug.replace('-','_'),file)
    module=importlib.util.module_from_spec(sp);sys.modules[sp.name]=module;sp.loader.exec_module(module)
    spec=module.SPEC
    status.update({'current':slug,'state':'rendering','currentStartedAt':time.time()});save()
    command=[sys.executable,str(ROOT/'scripts/render-native-concept.py'),'--slug',slug]
    if args.mode=='review':
        events=sorted(float(e[0])for e in spec.get('foley',[]))
        ts=[0,events[0]+.08 if events else 6,events[len(events)//2]+.12 if events else 13,events[-1]+.12 if events else 21]
        command+=['--seconds',','.join(str(t)for t in sorted(set(ts))),'--width','960','--samples','24','--cpu']
    else:command+=['--animate']
    with (queue/(slug+'.log')).open('w',encoding='utf8')as log:
        r=subprocess.run(command,cwd=ROOT,stdout=log,stderr=subprocess.STDOUT)
    if r.returncode:
        status['failed'].append({'slug':slug,'reason':'render failed','log':str(queue/(slug+'.log'))});save();continue
    if args.mode=='production':
        status['state']='encoding';save()
        with (queue/(slug+'-encode.log')).open('w',encoding='utf8')as log:
            e=subprocess.run(['node',str(ROOT/'scripts/encode-native-concept.mjs'),'--slug',slug],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT)
        if e.returncode:
            status['failed'].append({'slug':slug,'reason':'encode failed'});save();continue
    status['done'].append(slug);save()
status.update({'state':'complete','finishedAt':time.time()});save()
print(json.dumps({'mode':args.mode,'done':len(status['done']),'failed':status['failed']}),flush=True)
