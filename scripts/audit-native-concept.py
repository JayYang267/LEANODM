"""CPU-only native film contact evidence; no render or source alteration."""
import argparse,importlib.util,json,sys
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[1]
sys.path[:0]=[str(ROOT/'scripts'),str(ROOT)]
from concept_3d.demo_stage import Stage
from concept_3d.scenes._capture_puzzle import audit_contact
ap=argparse.ArgumentParser()
ap.add_argument('--slug',required=True)
ap.add_argument('--seconds',required=True)
args=ap.parse_args()
file=ROOT/'scripts/concept_3d/scenes'/f'{args.slug}.py'
spec=importlib.util.spec_from_file_location('contact_audit_scene',file)
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
stage=Stage(args.slug,width=1920,samples=32)
update=module.build(stage)
rows=[]
for t in map(float,args.seconds.split(',')):
    update(t);bpy.context.view_layer.update()
    rows.append({'seconds':t,**audit_contact(stage)})
report={'slug':args.slug,'scope':'Evaluated whole hand/cuff versus native closed parts and table; framing is diagnostic, intentional arm exit may be outside.','samples':rows}
out=ROOT/'work/concept-demos-3d/films'/args.slug/'contact-gate.json'
out.write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'slug':args.slug,'samples':len(rows),'collisions':[{'seconds':r['seconds'],'hits':r['collisions']} for r in rows if r['collisions']],'tablePenetrations':[{'seconds':r['seconds'],'actors':[a for a in r['actors'] if a['tableDepthMm']>.05]}for r in rows if any(a['tableDepthMm']>.05 for a in r['actors'])]}),flush=True)
