"""Wear-context, deliberate playback and volume on the actual native headset."""
import math
import bpy
import bmesh
from mathutils import Vector
from concept_3d.demo_stage import smooth,pulse
from concept_3d.scenes._human_context import head_reference

SPEC={
    'slug':'listennest-open-cup-headphone-concept','duration':28,
    'captions':[(.5,3.2,'Place over the ears.'),(4.7,7.0,'Press to play.'),
                (12.7,15.5,'Press to pause.'),(16.5,18.8,'Resume playback.'),
                (19.2,22.5,'Adjust with the side controls.')],
    'foley':[(5.5,'click'),(6.1,'click'),(13.5,'click'),(14.1,'click'),
             (17.25,'click'),(17.85,'click'),(20.1,'click'),(20.7,'click')],
    'audio_cues':[{'time':6.0,'kind':'melody','duration':7.5},
                  {'time':17.85,'kind':'melody','duration':7.35,'gain':.075,
                   'gain_envelope':[(0,1),(2.85,1),(2.95,1.4666666667),(7.35,1.4666666667)]}],
    'credits':'Modified Infinite 3D Head Scan by Lee Perry-Smith, CC BY 3.0; source three.js r173.',
    'limits':['Neutral head is illustrative use context, not a fit or sound-exposure validation.',
              'Playback and volume soundtrack are proposed module behavior, not recorded device audio.']
}

def build(stage):
    import bpy
    # The original concept massing places the three existing caps flush with
    # a solid cup wall. A non-destructive renderer-only swept clearance makes
    # their proposed0.5mm travel visible; original STEP/cap geometry is retained.
    cup=stage.objects['right_cup_shell']
    original_cup=cup.data
    original_cup.use_fake_user=True
    cup.data=original_cup.copy()
    cup.data.name='Render-only cup with existing-control clearance'
    cup.modifiers.clear()
    for key_name in ('tactile_key_0','tactile_key_1','tactile_key_2'):
        cap=stage.objects[key_name]
        cutter_mesh=cap.data.copy()
        points=[v.co.copy()for v in cutter_mesh.vertices]
        low=Vector(tuple(min(p[k]for p in points)for k in range(3)))
        high=Vector(tuple(max(p[k]for p in points)for k in range(3)))
        centre=(low+high)/2
        for v in cutter_mesh.vertices:
            u=(v.co.x-low.x)/(high.x-low.x)
            v.co.x=low.x-.00055+u*(high.x-low.x+.00065)
            for axis in (1,2):
                v.co[axis]=centre[axis]+(v.co[axis]-centre[axis])*(1+.0001/(high[axis]-low[axis]))
        cutter=bpy.data.objects.new('Render clearance only · '+key_name,cutter_mesh)
        stage.scene.collection.objects.link(cutter)
        cutter.parent=stage.asset.root
        cutter.hide_render=True
        cutter.hide_set(True)
        boolean=cup.modifiers.new('Illustrative control clearance · '+key_name,'BOOLEAN')
        boolean.operation='DIFFERENCE';boolean.solver='EXACT';boolean.object=cutter
        bpy.context.view_layer.objects.active=cup
        cup.select_set(True)
        bpy.ops.object.modifier_apply(modifier=boolean.name)
    bm=bmesh.new();bm.from_mesh(cup.data)
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.0000001)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    for edge in bm.edges:
        if edge.is_manifold:edge.smooth=edge.calc_face_angle()<math.radians(35)
    bm.to_mesh(cup.data);bm.free()
    for polygon in cup.data.polygons:polygon.use_smooth=True
    normal=cup.modifiers.new('Cup normals after render-only clearance','WEIGHTED_NORMAL')
    normal.keep_sharp=True;normal.weight=50
    cup['render_only_repair']='Existing control swept pockets,0.05mm perimeter allowance; not production geometry'
    # The geometry and headband never flex to manufacture a fit claim.
    initial_root=stage.asset.root.location.copy()
    stage.asset.root.location.z+=.061
    bpy.context.view_layer.update()
    head,head_meshes=head_reference(stage,width=.108,height=None,top=.212,location=(0,.006,0))
    ear=Vector(head['ear_local'])
    head.location.z+=.103-(ear.z+head.location.z)
    bpy.data.objects['Studio tabletop'].dimensions=(200,200,.035)
    play=stage.pointer('tactile_key_0',normal=(1,0,0),wrist=(1,-.65,.28),radius_mm=3)
    volume=stage.pointer('tactile_key_1',normal=(1,0,0),wrist=(1,-.65,.28),radius_mm=3)
    macro_target=stage.native((75,-5,48))
    def update(t):
        wearing=3<=t<24.8
        stage.asset.root.location=initial_root+Vector((0,0,.061 if wearing else 0))
        for mesh in head_meshes:mesh.hide_render=not wearing
        if wearing:
            stage.camera.data.lens=78
            stage.camera.location=macro_target+Vector((.24,-.27,.125))
            stage.camera.rotation_euler=(macro_target-stage.camera.location).to_track_quat('-Z','Y').to_euler()
        else:
            stage.camera.data.lens=52
            if t>=24.8:
                # The ending hero follows the raised wearing pose. Refresh the
                # restored root before fitting, rather than its stale world bounds.
                bpy.context.view_layer.update()
            stage.set_camera(direction=(3.4,-4.5,2.2),margin=1.3)
        a=max(pulse(t,5.25,5.5,5.7,6.1),pulse(t,13.25,13.5,13.7,14.1),
              pulse(t,17.0,17.25,17.45,17.85))
        b=pulse(t,19.85,20.1,20.3,20.7)
        stage.source(0)
        stage.source(a,parts=['tactile_key_0'])
        stage.source(b,parts=['tactile_key_1'])
        for pointer,start,contact,end in ((play,3.8,5.5,8.0),(play,11.8,13.5,16.0),
                                         (play,16.15,17.25,18.75),(volume,18.9,20.1,23.0)):
            if start<=t<=end:
                pointer.show(True)
                distance=.16*(1-smooth(start,contact-.35,t))+.16*smooth(contact+.85,end,t)
                pointer.approach(distance)
        play.show(3.8<=t<=8 or 11.8<=t<=16 or 16.15<=t<=18.75)
        volume.show(18.9<=t<=23)
    update(0)
    return update
