"""Build exact-state cache from the saved, baked native production scene."""
import argparse,json,sys
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from concept_3d.scene_cache import immutable_digest,frame_digest
ap=argparse.ArgumentParser();ap.add_argument('--slug',required=True);args=ap.parse_args()
work=ROOT/'work/concept-demos-3d/films'/args.slug
report=json.loads((work/'production-render.json').read_text(encoding='utf8'))
if (report['width'],report['height'],report['samples'],report['frameRate'])!=(1920,1080,32,24):raise ValueError('Source render does not match production quality')
bpy.ops.wm.open_mainfile(filepath=report['editableBlend'])
scene=bpy.context.scene
scene.frame_set(1);bpy.context.view_layer.update()
immutable=immutable_digest(scene)
mapping={}
for f in range(1,report['nativeFrames']+1):
    scene.frame_set(f);bpy.context.view_layer.update()
    path=Path(report['frameFolder'])/f'{f:04d}.png'
    if path.exists():mapping[frame_digest(scene,immutable)]=str(path)
out=work/'exact-frame-cache.json'
out.write_text(json.dumps({'sourceRevision':report['revision'],'immutableDigest':immutable,'immutableComponents':immutable_digest(scene,details=True),'states':mapping},indent=2),encoding='utf8')
print('EXACT_CACHE_READY '+json.dumps({'slug':args.slug,'uniqueStates':len(mapping),'file':str(out)}),flush=True)
