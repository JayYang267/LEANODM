"""Screen-free native camera, solid CGI subject, actual shutter and wired review."""
from mathutils import Matrix
try:
    from concept_3d.scenes._capture_puzzle import ramp,press,pointer_pose,camera,mix,still_life,wired_connection,visible
except ModuleNotFoundError:
    from scripts.concept_3d.scenes._capture_puzzle import ramp,press,pointer_pose,camera,mix,still_life,wired_connection,visible

SPEC = {
    'slug':'pocketarc-screen-free-camera-concept','duration':26,
    'captions':[(0,5,'Frame a three-dimensional subject.'),
                (5,11,'Press the physical capture control.'),
                (11,17,'Wait for the proposed save indicator.'),
                (17,26,'An adult reviews files by cable.')],
    'foley':[(9.2,'click')],
}


def build(stage):
    subject = still_life(stage,'PocketArc solid still life',(-20,-108,0))
    cable = wired_connection(stage,'PocketArc adult wired connection',(40,18,14),1)
    # Continue the wire toward an off-shot adult-managed host instead of
    # showing a short, visibly cut-off pigtail as though it were an export lead.
    wire = next(child for child in cable.children if child.type=='CURVE')
    spline = wire.data.splines[0]
    old_count = len(spline.points)
    spline.points.add(3)
    for point,xyz in zip(list(spline.points)[old_count:],[(120,55,-12),(220,105,-12),(400,180,-12)]):
        point.co = (*(value*.001 for value in xyz),1)
    visible(cable,False)
    finger = stage.pointer('A_single_capture_power_control',normal=(0,0,1),
                           wrist=(1,-.2,.4),radius_mm=8)
    finger.show(False)
    indicator = stage.objects['A_explicit_save_status_indicator']
    status_material = indicator.data.materials[0].copy()
    status_material.name = 'PocketArc socket-animated status indication'
    indicator.data.materials[0] = status_material
    shader = status_material.node_tree.nodes.get('Principled BSDF')
    idle_color = tuple(shader.inputs['Base Color'].default_value)
    idle_emission = tuple(shader.inputs['Emission Color'].default_value)
    idle_strength = shader.inputs['Emission Strength'].default_value

    def rgba(value):
        channels = [int(value[i:i+2],16)/255 for i in (1,3,5)]
        return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in channels)+(1,)

    amber,green = rgba('#c29536'),rgba('#779d81')
    indicator['render_surface_bias_mm'] = .08

    def update(t):
        stage.source(press(t,8.8,9.2,9.6,10.2))
        # The original status surface is exactly coplanar with the rear shell.
        # A sub-tessellation rendering offset exposes this existing feature.
        indicator.matrix_basis = Matrix.Translation((0,.00008,0)) @ stage.asset.base_matrices[indicator['native_part_name']]
        # The native lens is already aimed at the solid subject. Only the film
        # camera moves; no autonomous camera aiming/tracking feature is implied.
        shown = 6 <= t < 12
        clearance = .065*(1-ramp(t,6,8.6)) + .065*ramp(t,10.4,12)
        pointer_pose(finger,shown,clearance,
                     offset=(.4*clearance/.065,.3*clearance/.065,0))
        color = amber if 9.2 <= t < 11 else green if 11 <= t < 17 else None
        shader.inputs['Base Color'].default_value = color if color else idle_color
        shader.inputs['Emission Color'].default_value = color if color else idle_emission
        shader.inputs['Emission Strength'].default_value = .7 if color else idle_strength
        visible(subject,t<17)
        visible(cable,t>=17)
        if t<12:
            contact_view = ramp(t,5.5,7)
            camera(stage,(3,-4,2.6),margin=1.75+.35*contact_view,
                   target=mix((-8,-28,30),(15,-15,38),contact_view))
        elif t<17:
            f=ramp(t,12,16)
            camera(stage,mix((3,-4,2.6),(3,4,2.1),f),margin=2.1-.55*f,
                   target=mix((15,-15,38),(0,20,34),f))
        else:
            f=ramp(t,17,19.5)
            camera(stage,mix((3,4,2.1),(4,2,2),f),margin=1.55+.15*f,
                   target=mix((0,20,34),(20,18,27),f))
    return update
