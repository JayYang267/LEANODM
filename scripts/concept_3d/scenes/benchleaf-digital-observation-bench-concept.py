"""Dry 3D leaf, native focus carriage, manual wheel and illustrative LCD detail."""
import math
import bpy
try:
    from concept_3d.scenes._capture_puzzle import ramp,pointer_pose,camera,mix,dry_leaf,visible,native_rotation
except ModuleNotFoundError:
    from scripts.concept_3d.scenes._capture_puzzle import ramp,pointer_pose,camera,mix,dry_leaf,visible,native_rotation

SPEC = {
    'slug':'benchleaf-digital-observation-bench-concept','duration':28,
    'captions':[(0,5,'Place a dry leaf on the stage.'),
                (5,14,'Turn the manual focus control.'),
                (14,23,'Illustrative detail on the proposed screen.'),
                (23,28,'Observe and discuss together.')],
    'foley':[],
}


def build(stage):
    dry_leaf(stage,'BenchLeaf actual dry CGI sample',(0,68,36.7),width=34,length=56)
    preview = dry_leaf(stage,'BenchLeaf illustrative 3D leaf detail',(0,129.95,212.6),
                       width=34,length=56,preview=True)
    preview.scale = (33/56,33/56,.12)
    preview.rotation_euler.x = math.radians(70)
    visible(preview,False)
    wheel = stage.objects['A_manual_side_focus_wheel']
    wheel['illustrative_functional_turn'] = 'Manual focus wheel; angle is choreography, not a tested drive ratio'
    finger = stage.pointer('A_manual_side_focus_wheel',normal=(1,0,0),wrist=(1,-.45,.3),
                           radius_mm=4,center_mm=(36,68,120))
    # Keep the actor's far sleeve end outside the wider microscope shot. This
    # extends only the last procedural cloth ring; the approved wrist overlap,
    # skin, contact calibration and native product geometry stay unchanged.
    sleeve = finger.hand.cuff
    far = max(vertex.co.z for vertex in sleeve.data.vertices)
    for vertex in sleeve.data.vertices:
        if abs(vertex.co.z-far)<1e-7:
            vertex.co.z += .26
    sleeve.data.update()
    sleeve['scene_forearm_extension_m'] = .26
    finger.show(False)
    # The soft point source accompanies the eight native reflected-light LEDs;
    # it does not add a new lamp or a declared illumination performance value.
    light_data = bpy.data.lights.new('BenchLeaf reflected-light illustration','POINT')
    light_data.color = (1,.93,.81)
    light_data.shadow_soft_size = .008
    light = bpy.data.objects.new(light_data.name,light_data)
    stage.scene.collection.objects.link(light)

    def update(t):
        focus = ramp(t,7,12)
        stage.source(focus)
        native_rotation(wheel,(32,68,110),(1,0,0),math.radians(36)*focus)
        bpy.context.view_layer.update()
        phase=1-ramp(t,4.5,6.8)+ramp(t,13.1,15)
        pointer_pose(finger,4.5<=t<15,.085*phase,offset=(.4*phase,.3*phase,0))
        light.location = stage.native((0,68,74+12*focus))
        light_data.energy = .035*ramp(t,3.5,5)
        visible(preview,t>=12.5)
        detail = ramp(t,13,17)*(1-ramp(t,23,27))
        # Widen the hand-free detail shot enough to retain the native stage/base.
        # The additional framing starts after the actor has fully left the shot.
        camera(stage,mix((3.5,-4,2.7),(1.9,-4,2),detail),margin=1.35,
               target=mix((0,82,125),(0,128,207),detail),
               scale=1-.32*detail+.14*detail*ramp(t,15,16))
    return update
