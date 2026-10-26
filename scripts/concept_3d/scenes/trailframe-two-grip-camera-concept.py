"""Native two-grip camera: shutter, existing rear display and wired review."""
from mathutils import Matrix
try:
    from concept_3d.scenes._capture_puzzle import ramp,press,pointer_pose,camera,mix,still_life,wired_connection,visible
except ModuleNotFoundError:
    from scripts.concept_3d.scenes._capture_puzzle import ramp,press,pointer_pose,camera,mix,still_life,wired_connection,visible

SPEC = {
    'slug':'trailframe-two-grip-camera-concept','duration':28,
    'captions':[(0,5,'Aim at the solid three-dimensional subject.'),
                (5,11,'Press the large physical shutter.'),
                (11,21,'Inspect the illustrative rear preview.'),
                (21,28,'Keep file export adult-managed and wired.')],
    'foley':[(8.6,'click')],
}


def build(stage):
    subject = still_life(stage,'TrailFrame solid still life',(0,-155,0),2.2)
    # A shallow copy of the same solid CGI still life, on the existing rear
    # active area. No photograph, image texture, new display, or wireless UI.
    preview = still_life(stage,'TrailFrame illustrative captured geometry',(0,48.25,39.25))
    preview.scale = (.75,.015,.75)
    preview['illustrative_display_content'] = True
    visible(preview,False)
    cable = wired_connection(stage,'TrailFrame adult wired connection',(-76,27,18),-1)
    wire = next(child for child in cable.children if child.type=='CURVE')
    spline = wire.data.splines[0]
    old_count = len(spline.points)
    spline.points.add(3)
    for point,xyz in zip(list(spline.points)[old_count:],[(-120,55,-16),(-220,105,-16),(-400,180,-16)]):
        point.co = (*(value*.001 for value in xyz),1)
    visible(cable,False)
    finger = stage.pointer('A_right_top_shutter',normal=(0,0,1),wrist=(1,.2,.4),radius_mm=9)
    finger.show(False)
    rear_keys = [stage.objects[name] for name in ('A_rear_review_key','A_rear_back_key')]
    for key in rear_keys:
        key['render_surface_bias_mm'] = .08

    def update(t):
        stage.source(press(t,8.2,8.6,9.1,9.7))
        for key in rear_keys:
            key.matrix_basis = Matrix.Translation((0,.00008,0)) @ stage.asset.base_matrices[key['native_part_name']]
        # Static native camera already faces the CGI subject; the presentation
        # orbit is a film-camera move, not a proposed motorised aiming feature.
        phase=1-ramp(t,5.5,8)+ramp(t,9.8,11.5)
        pointer_pose(finger,5.5<=t<11.5,.075*phase,offset=(.4*phase,.3*phase,0))
        visible(subject,t<21)
        visible(preview,t>=10.5)
        visible(cable,t>=21)
        if t<11:
            camera(stage,(3,-4,2.5),margin=1.8,target=(0,-38,47))
        elif t<17:
            f=ramp(t,11,17)
            camera(stage,mix((3,-4,2.5),(2.5,4,2),f),margin=1.8-.3*f,
                   target=mix((0,-38,47),(0,27,55),f))
        elif t<21:
            f=ramp(t,17,19.3)
            camera(stage,mix((2.5,4,2),(2,4,1.7),f),margin=1.5-.15*f,
                   target=mix((0,27,55),(0,32,55),f),scale=1-.1*f)
        else:
            f=ramp(t,21,23.5)
            camera(stage,mix((2,4,1.7),(-3,4,2),f),margin=1.35+.35*f,
                   target=mix((0,32,55),(-20,27,45),f),scale=.9+.1*f)
    return update
