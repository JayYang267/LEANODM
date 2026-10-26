"""Externally held passive guide; real rigid positioning and a neutral reader."""
import math
import bpy
from mathutils import Vector,Matrix
from concept_3d.demo_stage import smooth
from concept_3d.scenes._human_context import head_reference
from concept_3d.articulated_hand import pose_finger_chains,orient_hand,align_index_pad_to_control

SPEC={
    'slug':'readloop-acoustic-voice-guide-concept','duration':28,
    'captions':[(2,5,'Hold the grip.'),(9.7,13.3,'Keep both ends outside.'),
                (13.8,18.5,'Read in a gentle voice.'),(23,26.5,'Set down after reading.')],
    'foley':[(25,'click')],
    'audio_cues':[{'time':14,'text':'The calm clouds cross the sky.','kind':'speech','origin':'illustrative human reading, not device audio'}],
    'credits':'Modified Infinite 3D Head Scan by Lee Perry-Smith, CC BY 3.0; source three.js r173.',
    'limits':['Passive guide only: no amplification, electronics, scoring or therapeutic result.',
              'Neutral head and human reading soundtrack illustrate external posture, not validated fit/acoustics.']
}

def grasp_digit(hand,digit,target_world):
    """Close one independent native joint chain around the original shell."""
    names=(['thumb-metacarpal','thumb-phalanx-proximal','thumb-phalanx-distal','thumb-tip']
           if digit=='thumb' else [digit+'-finger-'+suffix for suffix in
               ('phalanx-proximal','phalanx-intermediate','phalanx-distal','tip')])
    bones=[hand.armature.pose.bones[n]for n in names]
    matrices=[b.matrix.copy()for b in bones]
    target=hand.armature.matrix_world.inverted()@Vector(target_world)
    for _ in range(100):
        for j in (2,1,0):
            pivot=matrices[j].translation
            a=matrices[-1].translation-pivot;b=target-pivot
            if a.length<1e-7 or b.length<1e-7:continue
            q=a.rotation_difference(b)
            angle=min(q.angle,.14)
            rotation=Matrix.Translation(pivot)@Matrix.Rotation(angle,4,q.axis)@Matrix.Translation(-pivot)
            for k in range(j,len(matrices)):matrices[k]=rotation@matrices[k]
    for bone,mat in zip(bones,matrices):bone.matrix=mat
    bpy.context.view_layer.update()

def build(stage):
    # The carried forearm extends beyond the native product's studio volume.
    # Keep its visible sleeve in front of the one-sided fill emitter instead
    # of cutting through that light plane. Angular size and radiant density
    # at the original studio focus stay unchanged.
    fill = stage.scene.objects['Soft fill']
    fill_distance_factor = 4.0
    fill.location = stage.focus + (fill.location-stage.focus)*fill_distance_factor
    fill.data.size *= fill_distance_factor
    fill.data.energy *= fill_distance_factor**2
    head,meshes=head_reference(stage,width=.150,height=None,top=.26,location=(-.10,.04,0))
    floor=min(v.co.z for o in meshes for v in o.data.vertices)
    head.location.z-=floor
    bpy.context.view_layer.update()
    def anchors():
        return (head.matrix_world@Vector(head['mouth_local']),head.matrix_world@Vector(head['ear_local']))
    mouth,ear=anchors()
    # Preserve the product's original104mm opening-centre separation. Scale only
    # the explicitly illustrative reference head, never the product geometry.
    for _ in range(3):
        target_mouth=mouth+Vector((.008,-.022,0))
        target_ear=ear+Vector((.022,0,0))
        factor=.104/(target_ear-target_mouth).length
        head.scale*=factor
        bpy.context.view_layer.update();mouth,ear=anchors()
    head.location.z=-floor*head.scale.z
    head.rotation_euler.x=math.radians(30)
    bpy.context.view_layer.update()
    minimum=min((o.matrix_world@v.co).z for o in meshes for v in o.data.vertices)
    head.location.z-=minimum
    bpy.context.view_layer.update();mouth,ear=anchors()
    context_rotation=head.matrix_world.to_quaternion()
    target_mouth=mouth+context_rotation@Vector((.008,-.022,0))
    target_ear=ear+context_rotation@Vector((.022,0,0))
    z=(target_ear-target_mouth).normalized()
    # Roll the C profile outward about its opening-to-opening axis.
    # Both ends retain their external positions; the grip hangs in front of
    # the cheek. Keep the backbone beside the face, away from the neck.
    x=Vector((1,-.3,-.25));x-=z*x.dot(z);x.normalize()
    y=z.cross(x).normalized();basis=Matrix((x,y,z)).transposed()
    end_rotation=basis.to_quaternion()
    end_location=target_mouth-basis@Vector((0,0,.011))
    start_location=Vector((.12,-.10,0))
    stage.asset.root.location=start_location
    bpy.context.view_layer.update()
    grip=stage.pointer('grip_zone',normal=(1,0,0),wrist=(0,0,1),radius_mm=4,center_mm=(84,0,63))
    grip.show(True)
    pose_finger_chains(grip.hand,{'index':(.8,1.2,.6),'middle':(.9,1.1,.7),
                                  'ring':(.9,1.1,.7),'pinky':(.9,1.1,.7)})
    # Put the palm outside the curved backbone before closing both sides.
    # A pointing-pad translation cannot locate a genuine opposed grasp.
    wrist_world=grip.hand.armature.matrix_world@grip.hand.armature.pose.bones['wrist'].matrix.translation
    grip.root.location+=stage.native((130,0,120))-wrist_world
    bpy.context.view_layer.update()
    targets=(('index',(79,-27,63)),('middle',(77,-29.5,51)),
                         ('ring',(73,-27,40)),('pinky',(68,-27,31)),
                         ('thumb',(79,24,63)))
    for digit,target in targets:
        grasp_digit(grip.hand,digit,stage.native(target))
    closed_pose={bone.name:bone.matrix_basis.copy() for bone in grip.hand.armature.pose.bones}
    for digit,target in targets:
        grasp_digit(grip.hand,digit,stage.native((target[0],40 if digit=='thumb' else -45,target[2])))
    open_pose={bone.name:bone.matrix_basis.copy() for bone in grip.hand.armature.pose.bones}
    for bone in grip.hand.armature.pose.bones:
        bone.matrix_basis=closed_pose[bone.name]
    bpy.context.view_layer.update()
    stage.contact_evidence[-1]={'part':'grip_zone','nativeBodyDepthMm':34,
        'scope':'Scene-local opposed index/thumb grasp with four independently closed finger chains; whole-skin validation is recorded separately.',
        'digitTargetsNativeMm':dict(targets)}
    grip.rest=grip.root.matrix_world.copy()
    # Continue the sleeve beyond the wide shot; its open far end must never
    # face the viewer as a floating black tube.
    wrist_z=grip.hand.armature.data.bones['wrist'].head_local.z
    for vertex in grip.hand.cuff.data.vertices:
        depth=vertex.co.z-wrist_z
        if depth>.105:
            vertex.co.z=wrist_z+.105+(depth-.105)*6
    stage.camera.data.lens=58
    camera_target=Vector((.005,-.015,.125))
    stage.camera.location=camera_target+Vector((.48,-.58,.22))
    stage.camera.rotation_euler=(camera_target-stage.camera.location).to_track_quat('-Z','Y').to_euler()
    bpy.data.objects['Studio tabletop'].dimensions=(200,200,.035)
    # An ordinary printed reading prop makes the passive task visible without
    # explanatory overlays or an invented device screen.
    cover=stage.material('Reading book cover','#446F72',.8)
    paper=stage.material('Reading book paper','#EDE9DA',.9)
    ink=stage.material('Reading book printed ink','#313E43',.9)
    for name,location,size,material in (
        ('Reading book cover',(-.105,-.145,.005),(.135,.085,.008),cover),
        ('Open cream pages',(-.105,-.145,.010),(.130,.080,.003),paper)):
        bpy.ops.mesh.primitive_cube_add(size=1,location=location)
        obj=bpy.context.object;obj.name=name;obj.dimensions=size
        obj.data.materials.append(material)
    text=bpy.data.curves.new('Printed reading sentence','FONT')
    text.body='The calm clouds\ncross the sky.'
    text.size=.007;text.space_line=1.3;text.extrude=0
    label=bpy.data.objects.new('Printed reading sentence',text)
    stage.scene.collection.objects.link(label)
    label.location=(-.162,-.130,.0116)
    text.materials.append(ink)
    def update(t):
        carry=smooth(5,10,t)*(1-smooth(20.5,25,t))
        stage.camera.data.lens=52+6*carry
        target=Vector((.03,-.04,.105)).lerp(camera_target,carry)
        offset=Vector((.70,-.85,.45)).lerp(Vector((.55,-.67,.25)),carry)
        stage.camera.location=target+offset
        stage.camera.rotation_euler=(target-stage.camera.location).to_track_quat('-Z','Y').to_euler()
        stage.asset.root.location=start_location.lerp(end_location,carry)
        stage.asset.root.rotation_mode='QUATERNION'
        stage.asset.root.rotation_quaternion=Matrix.Identity(3).to_quaternion().slerp(end_rotation,carry)
        stage.source(smooth(11,13,t)*(1-smooth(18.7,20.2,t)))
        closure=smooth(4.5,4.8,t)*(1-smooth(25.3,25.7,t))
        for bone in grip.hand.armature.pose.bones:
            closed,opened=closed_pose[bone.name],open_pose[bone.name]
            if closure==1:
                bone.matrix_basis=closed
            elif closure==0:
                bone.matrix_basis=opened
            else:
                a,qa,sa=opened.decompose();b,qb,sb=closed.decompose()
                bone.matrix_basis=Matrix.LocRotScale(a.lerp(b,closure),qa.slerp(qb,closure),sa.lerp(sb,closure))
        grip.show(2<=t<=26.7)
        distance=.55*(1-smooth(2,4.8,t))+.55*smooth(25.3,26.7,t)
        delta=grip.part.matrix_world@grip.part_rest.inverted()
        # Preserve the calibrated grasp in the guide's local frame throughout
        # carrying and the source fifteen-degree adjustment.
        transform=delta@grip.rest
        wrist=(transform.to_3x3()@Vector((0,0,1))).normalized()
        transform.translation+=wrist*distance
        grip.root.matrix_world=transform
    update(0)
    return update
