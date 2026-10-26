"""Native 1080p / 24 fps concept-film production and revision-bound review."""
import argparse
import hashlib
import importlib.util
import json
import math
import os
import re
import shutil
import sys
import time
from pathlib import Path
import bpy
from concept_3d.demo_stage import Stage
from concept_3d.visibility_gate import inspect_hand_visibility

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
sys.path.insert(0,str(ROOT/'scripts/concept_3d'))
ap=argparse.ArgumentParser()
ap.add_argument('--slug',required=True)
ap.add_argument('--seconds',default='0,5,8,12,18,23')
ap.add_argument('--animate',action='store_true')
ap.add_argument('--check',action='store_true')
ap.add_argument('--width',type=int,default=1920)
ap.add_argument('--samples',type=int,default=32)
ap.add_argument('--force',action='store_true')
ap.add_argument('--cpu',action='store_true')
ap.add_argument('--exact-cache',help='Validated exact-state cache exported from a baked production scene')
ap.add_argument('--bake-check',action='store_true',help='Build and verify the editable native animation without rendering')
args=ap.parse_args()
if not re.fullmatch(r'[a-z0-9-]+',args.slug):
    raise ValueError('Invalid concept slug')
module_file=ROOT/'scripts/concept_3d/scenes'/f'{args.slug}.py'
spec=importlib.util.spec_from_file_location('native_film_'+args.slug.replace('-','_'),module_file)
module=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=module
spec.loader.exec_module(module)
info=module.SPEC
duration=float(info.get('duration',info.get('durationSeconds',28)))
total=round(duration*24)
work=ROOT/'work/concept-demos-3d/films'/args.slug
work.mkdir(parents=True,exist_ok=True)
stage=Stage(args.slug,width=args.width,samples=args.samples)
update=module.build(stage)
scene=stage.scene
if args.cpu:
    scene.cycles.device='CPU'
    scene.render.threads_mode='FIXED'
    scene.render.threads=6
    scene.cycles.denoiser='OPENIMAGEDENOISE'
scene.frame_start,scene.frame_end=1,total

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
sources={str(p.relative_to(ROOT)):sha(p) for p in [Path(__file__),module_file,*sorted((ROOT/'scripts/concept_3d').glob('*.py')),*sorted((ROOT/'scripts/concept_3d/scenes').glob('_*.py'))]}
revision=hashlib.sha256(json.dumps(sources,sort_keys=True).encode()).hexdigest()[:12]
out=work/('frames-'+revision if args.animate else 'review')
out.mkdir(parents=True,exist_ok=True)
snapshot=work/('source-'+revision)
for relative in sources:
    target=snapshot/relative
    target.parent.mkdir(parents=True,exist_ok=True)
    if not target.exists():shutil.copyfile(ROOT/relative,target)
report={'slug':args.slug,'durationSeconds':duration,'frameRate':24,'nativeFrames':total,
    'width':args.width,'height':round(args.width*9/16),'samples':args.samples,
    'revision':revision,'sourceHashes':sources,'spec':info,
    'nativeMeshSha256':stage.asset.metadata['meshSha256'],
    'contactCalibration':stage.contact_evidence,'frameFolder':str(out),'editableBlend':str(work/'scene.blend')}

def state_signature():
    states=[]
    for obj in sorted(bpy.data.objects,key=lambda o:o.name):
        if obj.hide_render or obj.type not in {'MESH','CURVE','FONT','LIGHT','CAMERA','ARMATURE'}:
            continue
        row=[obj.name,obj.type,[round(v,8) for r in obj.matrix_world for v in r]]
        if obj.type=='ARMATURE':
            row.append([[b.name,*[round(v,7)for r in b.matrix for v in r]] for b in obj.pose.bones])
        elif obj.type=='CAMERA':
            row.append([obj.data.type,round(obj.data.lens,6),round(obj.data.ortho_scale,6)])
        elif obj.type=='LIGHT':
            row.append([obj.data.type,round(obj.data.energy,7),[round(c,7)for c in obj.data.color]])
        if hasattr(obj.data,'materials'):
            mats=[]
            for mat in obj.data.materials:
                if not mat or not mat.use_nodes:continue
                sockets=[]
                for node in mat.node_tree.nodes:
                    for name in ('Base Color','Emission Color','Emission Strength','Alpha','Color','Strength'):
                        socket=node.inputs.get(name)
                        if socket is None or not hasattr(socket,'default_value'):continue
                        value=socket.default_value
                        try:value=[round(x,7)for x in value]
                        except TypeError:
                            if isinstance(value,(float,int)):value=round(value,7)
                            else:continue
                        sockets.append([node.name,name,value])
                mats.append(sockets)
            row.append([[m.name if m else None for m in obj.data.materials],mats])
        states.append(row)
    return hashlib.sha256(json.dumps([revision,states],separators=(',',':')).encode()).hexdigest()

def key_object(obj,frame):
    for prop in ('location','rotation_quaternion' if obj.rotation_mode=='QUATERNION' else 'rotation_euler','scale','hide_render'):
        obj.keyframe_insert(prop,frame=frame)
    if obj.type=='CAMERA':
        for prop in ('lens','ortho_scale'):obj.data.keyframe_insert(prop,frame=frame)
    elif obj.type=='LIGHT':
        for prop in ('energy','color'):obj.data.keyframe_insert(prop,frame=frame)

def object_key_state(obj):
    state=tuple(round(v,8)for r in obj.matrix_basis for v in r)+(obj.hide_render,)
    if obj.type=='CAMERA':state+=(obj.data.lens,obj.data.ortho_scale)
    elif obj.type=='LIGHT':state+=(obj.data.energy,*obj.data.color)
    return state

def action_curves(action):
    # Blender4.5 stores Camera/Light/NodeTree channels in layered action slots;
    # legacy action.fcurves can expose only the first slot, or an empty list.
    curves={curve.as_pointer():curve for curve in action.fcurves}
    for layer in action.layers:
        for strip in layer.strips:
            for bag in getattr(strip,'channelbags',[]):
                for curve in bag.fcurves:curves[curve.as_pointer()]=curve
    return curves.values()

if args.check:
    samples=[]
    for t in (0,duration*.16,duration*.32,duration*.5,duration*.72,duration-.01):
        update(t);bpy.context.view_layer.update()
        samples.append({'time':t,'signature':state_signature()})
    report['cpuSamples']=samples
    (work/'setup-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    print('SETUP_OK '+json.dumps({'slug':args.slug,'pointers':len(stage.pointers),'duration':duration}),flush=True)
    sys.exit(0)

if args.animate or args.bake_check:
    # Sample the complete procedural animation before creating any f-curves.
    # Incremental key creation can otherwise evaluate an incomplete action
    # during update(), silently replacing a later pose with an earlier one.
    last_objects={};last_sockets={};last_bones={}
    object_records=[];bone_records=[];socket_records=[];expected=[];expected_sockets=[]
    for f in range(1,total+1):
        t=(f-1)/24
        update(t);bpy.context.view_layer.update()
        frame_expectation=[]
        for obj in bpy.data.objects:
            state=object_key_state(obj)
            if last_objects.get(obj.name)!=state:
                object_records.append((obj,f,obj.matrix_basis.copy(),obj.hide_render,
                    (obj.data.lens,obj.data.ortho_scale)if obj.type=='CAMERA'else None,
                    (obj.data.energy,tuple(obj.data.color))if obj.type=='LIGHT'else None))
                last_objects[obj.name]=state
            frame_expectation.append((obj,list(v for r in obj.matrix_world for v in r),obj.hide_render,
                (obj.data.lens,obj.data.ortho_scale)if obj.type=='CAMERA'else None,
                [(b,list(v for r in b.matrix for v in r))for b in obj.pose.bones]if obj.type=='ARMATURE'else [],
                (obj.data.energy,tuple(obj.data.color))if obj.type=='LIGHT'else None,
                tuple(m.name if m else None for m in obj.data.materials)if hasattr(obj.data,'materials')else None))
            if obj.type=='ARMATURE':
                for bone in obj.pose.bones:
                    bs=tuple(round(v,8)for r in bone.matrix_basis for v in r)
                    k=(obj.name,bone.name)
                    if last_bones.get(k)!=bs:
                        bone_records.append((bone,f,bone.matrix_basis.copy()))
                        last_bones[k]=bs
        expected.append(frame_expectation)
        frame_sockets=[]
        for mat in bpy.data.materials:
            if not mat.use_nodes:continue
            for node in mat.node_tree.nodes:
                for name in ('Base Color','Emission Color','Emission Strength','Alpha'):
                    socket=node.inputs.get(name)
                    if socket is None or not hasattr(socket,'default_value'):continue
                    value=socket.default_value
                    try:value=tuple(round(v,8)for v in value)
                    except TypeError:
                        if isinstance(value,(float,int)):value=round(value,8)
                        else:continue
                    k=(mat.name,node.name,name)
                    frame_sockets.append((socket,value))
                    if last_sockets.get(k)!=value:
                        socket_records.append((socket,f,value));last_sockets[k]=value
        expected_sockets.append(frame_sockets)
    for obj,f,matrix,hidden,camera_data,light_data in object_records:
        obj.matrix_basis=matrix;obj.hide_render=hidden
        if camera_data:obj.data.lens,obj.data.ortho_scale=camera_data
        if light_data:obj.data.energy,obj.data.color=light_data
        key_object(obj,f)
    for bone,f,matrix in bone_records:
        bone.matrix_basis=matrix
        for prop in ('location','rotation_quaternion' if bone.rotation_mode=='QUATERNION' else 'rotation_euler','scale'):
            bone.keyframe_insert(prop,frame=f)
    for socket,f,value in socket_records:
        socket.default_value=value;socket.keyframe_insert('default_value',frame=f)
    for action in bpy.data.actions:
        for curve in action_curves(action):
            for key in curve.keyframe_points:key.interpolation='CONSTANT'
    max_matrix_error=0.;max_bone_error=0.;max_camera_error=0.;max_light_error=0.;max_shader_error=0.;visibility_errors=0;material_slot_errors=0;camera_diagnostics=[]
    for f,frame_expectation in enumerate(expected,1):
        scene.frame_set(f);bpy.context.view_layer.update()
        for obj,matrix,hidden,camera_data,bones,light_data,material_slots in frame_expectation:
            max_matrix_error=max(max_matrix_error,max(abs(a-b)for a,b in zip(matrix,(v for r in obj.matrix_world for v in r))))
            visibility_errors+=obj.hide_render!=hidden
            if camera_data:
                max_camera_error=max(max_camera_error,abs(obj.data.lens-camera_data[0]),abs(obj.data.ortho_scale-camera_data[1]))
                if abs(obj.data.lens-camera_data[0])>1e-6 and len(camera_diagnostics)<8:
                    camera_diagnostics.append({'frame':f,'expectedLens':camera_data[0],'actualLens':obj.data.lens})
            for bone,matrix in bones:
                max_bone_error=max(max_bone_error,max(abs(a-b)for a,b in zip(matrix,(v for r in bone.matrix for v in r))))
            if light_data:
                max_light_error=max(max_light_error,abs(obj.data.energy-light_data[0]),max(abs(a-b)for a,b in zip(obj.data.color,light_data[1])))
            if material_slots is not None:
                material_slot_errors+=tuple(m.name if m else None for m in obj.data.materials)!=material_slots
        for socket,wanted in expected_sockets[f-1]:
            actual=socket.default_value
            if isinstance(wanted,tuple):error=max(abs(a-b)for a,b in zip(actual,wanted))
            else:error=abs(actual-wanted)
            max_shader_error=max(max_shader_error,error)
    report['bakeGate']={'framesChecked':total,'maxWorldMatrixElementError':max_matrix_error,'maxBoneMatrixElementError':max_bone_error,'maxCameraParameterError':max_camera_error,'maxLightParameterError':max_light_error,'maxShaderParameterError':max_shader_error,'visibilityErrors':visibility_errors,'materialSlotErrors':material_slot_errors}
    if max(max_matrix_error,max_bone_error,max_camera_error,max_light_error,max_shader_error)>1e-6 or visibility_errors or material_slot_errors:
        report['bakeGate']['cameraDiagnostics']=camera_diagnostics
        report['bakeGate']['cameraCurves']=[{'action':a.name,'path':curve.data_path,'keys':[(k.co.x,k.co.y,k.interpolation)for k in curve.keyframe_points][:12]}for a in bpy.data.actions for curve in action_curves(a) if curve.data_path in {'lens','ortho_scale'}]
        (work/'failed-bake-gate.json').write_text(json.dumps(report['bakeGate'],indent=2),encoding='utf8')
        raise ValueError('Baked animation differs from the procedural scene')
    report['visibilityGate']=inspect_hand_visibility(scene,[p.hand for p in stage.pointers],total)
    if report['visibilityGate']['status']!='PASS':
        (work/'failed-visibility-gate.json').write_text(json.dumps({'slug':args.slug,'revision':revision,'sourceHashes':sources,**report['visibilityGate']},indent=2),encoding='utf8')
        raise ValueError('Hand visibility switch intersects the render frustum; repair entry/exit before GPU rendering')
    scene.frame_set(1);bpy.context.view_layer.update()
    bpy.ops.wm.save_as_mainfile(filepath=str(work/'scene.blend'))
    if args.bake_check:
        (work/'bake-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
        print('BAKE_CHECK_OK '+json.dumps(report['bakeGate']),flush=True)
        sys.exit(0)

frames=range(1,total+1) if args.animate else sorted(set(max(1,min(total,round(float(t)*24)+1))for t in args.seconds.split(',')))
exact_states={};exact_reused=0
if args.exact_cache:
    from concept_3d.scene_cache import immutable_digest,frame_digest
    previous=json.loads(Path(args.exact_cache).read_text(encoding='utf8'))
    scene.frame_set(1);update(0);bpy.context.view_layer.update()
    immutable=immutable_digest(scene)
    if immutable!=previous['immutableDigest']:
        raise ValueError('Exact-state reuse rejected: immutable scene/render configuration changed')
    exact_states=previous['states']
    report['exactStateSourceRevision']=previous['sourceRevision']
cache={};rendered=0;reused=0;started=time.time()
signature_file=out/'signatures.json'
existing=json.loads(signature_file.read_text()) if signature_file.exists() else {}
for frame in frames:
    t=(frame-1)/24
    scene.frame_set(frame);update(t);bpy.context.view_layer.update()
    signature=state_signature()
    dest=out/f'{frame:04d}.png'
    if dest.exists() and existing.get(str(frame))==signature and not args.force:
        cache[signature]=dest
        continue
    if dest.exists():dest.unlink()
    exact_path=exact_states.get(frame_digest(scene,immutable)) if exact_states else None
    if exact_path and Path(exact_path).exists():
        try:os.link(exact_path,dest)
        except OSError:shutil.copyfile(exact_path,dest)
        reused+=1;exact_reused+=1
    elif args.animate and signature in cache:
        try:os.link(cache[signature],dest)
        except OSError:shutil.copyfile(cache[signature],dest)
        reused+=1
    else:
        scene.render.filepath=str(dest)
        bpy.ops.render.render(write_still=True)
        cache[signature]=dest;rendered+=1
    existing[str(frame)]=signature
    if frame%24==0 or not args.animate:
        signature_file.write_text(json.dumps(existing),encoding='utf8')
        print('FRAME_PROGRESS '+json.dumps({'slug':args.slug,'frame':frame,'total':total,'rendered':rendered,'identicalStateReused':reused}),flush=True)
signature_file.write_text(json.dumps(existing),encoding='utf8')
report.update({'renderedUniqueStates':rendered,'identicalStateReused':reused,'exactPreviousStateReused':exact_reused,'elapsedSeconds':round(time.time()-started,2)})
(work/('production-render.json' if args.animate else 'review-render.json')).write_text(json.dumps(report,indent=2),encoding='utf8')
print('FILM_RENDER_DONE '+json.dumps({'slug':args.slug,'output':str(out),'seconds':round(time.time()-started,2),'rendered':rendered,'reused':reused}),flush=True)
