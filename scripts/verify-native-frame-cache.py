"""CPU setup and exact-state matching diagnostic, without rendering."""
import argparse,importlib.util,json,sys
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[1]
sys.path[:0]=[str(ROOT/'scripts'),str(ROOT)]
from concept_3d.demo_stage import Stage
from concept_3d.scene_cache import immutable_digest,frame_digest
ap=argparse.ArgumentParser();ap.add_argument('--slug',required=True);args=ap.parse_args()
file=ROOT/'scripts/concept_3d/scenes'/f'{args.slug}.py'
spec=importlib.util.spec_from_file_location('cache_verification_scene',file)
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
stage=Stage(args.slug,width=1920,samples=32);update=module.build(stage)
work=ROOT/'work/concept-demos-3d/films'/args.slug
previous=json.loads((work/'exact-frame-cache.json').read_text(encoding='utf8'))
immutable=immutable_digest(stage.scene)
rows=[]
for t in (0,3,8,12,13.5,14.8,16.5,18,22,27.5):
    update(t);bpy.context.view_layer.update()
    rows.append({'time':t,'previousPixelState':frame_digest(stage.scene,immutable)in previous['states']})
components=immutable_digest(stage.scene,details=True)
print(json.dumps({'immutableMatch':immutable==previous['immutableDigest'],'changedComponents':[name for name,h in components.items()if previous.get('immutableComponents',{}).get(name)!=h],'samples':rows}),flush=True)
