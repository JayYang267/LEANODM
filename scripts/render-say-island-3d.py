"""Render the original R01 product meshes with genuine articulated 3D input.

No product photo is used as scene geometry. Source dimensions remain millimetres
until import; the pressed state uses the original 0.8 mm illustrative CAD state.
"""
import argparse
import json
import math
import os
import time
from pathlib import Path

import bpy
import bmesh
from mathutils import Matrix, Vector

ap = argparse.ArgumentParser()
ap.add_argument('--frames', default='1,168,312,432,540,672')
ap.add_argument('--animate', action='store_true')
ap.add_argument('--engine', default='CYCLES', choices=['CYCLES', 'BLENDER_EEVEE_NEXT'])
ap.add_argument('--width', type=int, default=1920)
ap.add_argument('--samples', type=int, default=32)
ap.add_argument('--start', type=int, default=1)
ap.add_argument('--end', type=int, default=720)
ap.add_argument('--out', default='review')
args = ap.parse_args()
ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'work/concept-demos-3d/say-island'
OUT = WORK / args.out
OUT.mkdir(parents=True, exist_ok=True)
FPS = 24
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = args.engine
scene.render.resolution_x = args.width
scene.render.resolution_y = round(args.width * 9 / 16)
scene.render.resolution_percentage = 100
scene.render.fps = FPS
scene.frame_start, scene.frame_end = 1, 720
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.film_transparent = False
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = -.75
scene.world = bpy.data.worlds.new('Soft ivory studio')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.78, .82, .86, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .25
if args.engine == 'CYCLES':
    scene.cycles.samples = args.samples
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = 'OPTIX'
    scene.render.use_persistent_data = True
    scene.cycles.max_bounces = 6
    scene.cycles.diffuse_bounces = 3
    scene.cycles.glossy_bounces = 3
    pref = bpy.context.preferences.addons['cycles'].preferences
    pref.compute_device_type = 'OPTIX'
    pref.get_devices()
    for device in pref.devices:
        device.use = device.type == 'OPTIX'
    scene.cycles.device = 'GPU'

def srgb(v):
    return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4

def rgba(h):
    return tuple(srgb(int(h[i:i+2], 16) / 255) for i in (1, 3, 5)) + (1,)

def material(name, color, roughness=.32, skin=False, emission=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = rgba(color)
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Specular IOR Level'].default_value = .35
    if skin:
        p.inputs['Subsurface Weight'].default_value = .12
        p.inputs['Subsurface Radius'].default_value = (1, .42, .22)
        p.inputs['Subsurface Scale'].default_value = .012
    if emission:
        p.inputs['Emission Color'].default_value = rgba(color)
        p.inputs['Emission Strength'].default_value = emission
    noise = nt.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 1700 if skin else 2100
    noise.inputs['Detail'].default_value = 2
    bump = nt.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .12 if skin else .035
    bump.inputs['Distance'].default_value = .000035 if skin else .000015
    nt.links.new(noise.outputs['Fac'], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], p.inputs['Normal'])
    return m

def empty(name):
    o = bpy.data.objects.new(name, None)
    scene.collection.objects.link(o)
    return o

root = empty('Say Island · original R01 fixed wedge')
parts = {}
source = json.loads((WORK / 'source/B_mesh.json').read_text(encoding='utf8'))
pressed = {p['name']: p for p in json.loads((WORK / 'source/B_KEY_RIGHT_DEPRESSED_mesh.json').read_text(encoding='utf8'))}
visible_names = {'shell', 'face_bezel', 'display', 'prompt_original', 'key_skip', 'key_correct', 'bottom_chassis', 'battery_hatch', 'key_graphic_0', 'key_graphic_1'}
for part in source:
    if part['name'] not in visible_names:
        continue
    vertices = [(v[0] / 1000, (v[1] - 46) / 1000, v[2] / 1000) for v in part['v']]
    triangles = part['t']
    if part['name'] == 'prompt_original':
        # The CAD source used shallow solids to illustrate screen artwork.
        # Keep its exact front silhouette, render it as pixels on the display.
        a = math.radians(12.94)
        display_normal = Vector((0, -math.cos(a), math.sin(a)))
        flat_triangles = []
        for triangle in triangles:
            p, q, r = (Vector(vertices[i]) for i in triangle)
            cross = (q-p).cross(r-p)
            if cross.length > 1e-12 and cross.normalized().dot(display_normal) > .95:
                flat_triangles.append(triangle)
        assert flat_triangles, 'Original screen artwork must retain its source front faces'
        triangles = flat_triangles
        plane_distance = Vector((0, -.010, .0766)).dot(display_normal) + .000415
        vertices = [tuple(Vector(v) + display_normal*(plane_distance-Vector(v).dot(display_normal))) for v in vertices]
    mesh = bpy.data.meshes.new(part['name'] + ' · source CAD tessellation')
    mesh.from_pydata(vertices, [], triangles)
    mesh.update()
    obj = bpy.data.objects.new(part['name'], mesh)
    scene.collection.objects.link(obj)
    obj.parent = root
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=.0000001)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    for edge in bm.edges:
        if edge.is_manifold:
            edge.smooth = edge.calc_face_angle() < math.radians(35)
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True
    normal = obj.modifiers.new('Preserve planar CAD surfaces', 'WEIGHTED_NORMAL')
    normal.keep_sharp = True
    normal.weight = 35
    is_screen = part['name'] in {'display', 'prompt_original'}
    obj.data.materials.append(material(part['name'] + ' finish', part['color'], .25 if is_screen else .34, emission=.2 if is_screen else 0))
    if part['name'] == 'prompt_original':
        obj.visible_shadow = False
    parts[part['name']] = obj

# Preserve the exact native press displacement and move the printed symbol with it.
original_correct = next(p for p in source if p['name'] == 'key_correct')
press_delta = Vector(tuple((pressed['key_correct']['v'][0][i] - original_correct['v'][0][i]) / 1000 for i in range(3)))
normal_key = -press_delta.normalized()
contact = Vector((.037, -.031, .030)) + normal_key * .003

# New pictures occupy the same real screen plane as the source umbrella.
screen_angle = math.radians(12.94)
screen_center = Vector((0, -.0109, .079))
screen_u = Vector((1, 0, 0))
screen_v = Vector((0, math.sin(screen_angle), math.cos(screen_angle)))
screen_n = Vector((0, -math.cos(screen_angle), math.sin(screen_angle)))
art_distance = Vector((0, -.010, .0766)).dot(screen_n) + .000415
screen_center += screen_n * (art_distance-screen_center.dot(screen_n))
white = material('Picture ink · warm white', '#F2E9D5', .4, emission=.25)
gold = material('Picture ink · original gold', '#E5B65B', .4, emission=.25)
ink = material('Picture ink · dark teal', '#152E37', .4)

def picture_mesh(name, coords, mat, parent):
    mesh = bpy.data.meshes.new(name)
    vs = [tuple(screen_center + x * screen_u + y * screen_v) for x, y in coords]
    mesh.from_pydata(vs, [], [tuple(range(len(vs)))])
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj.parent = parent
    obj.visible_shadow = False
    return obj

ball_root, sun_root = empty('Picture 02 · ball'), empty('Picture 03 · sun')
ball_root.parent = sun_root.parent = root
r = .014
picture_mesh('Ball silhouette', [(math.cos(a*math.tau/96)*r, math.sin(a*math.tau/96)*r-.003) for a in range(96)], gold, ball_root)
# Wide, curved ink strips make a recognisable toy ball without a word on screen.
for direction in (-1, 1):
    points = []
    for i in range(41):
        y = -.0135 + i/40*.027
        x = direction * (.003 + .004 * math.cos((y/.014)*math.pi/2))
        points.append((x-.00065, y-.003))
    for i in reversed(range(41)):
        y = -.0135 + i/40*.027
        x = direction * (.003 + .004 * math.cos((y/.014)*math.pi/2))
        points.append((x+.00065, y-.003))
    obj = picture_mesh('Ball curved panel', points, white, ball_root)
    obj.location = screen_n * .00008
picture_mesh('Sun disc', [(math.cos(a*math.tau/80)*.0095, math.sin(a*math.tau/80)*.0095-.003) for a in range(80)], gold, sun_root)
for i in range(8):
    a = math.tau * i/8
    d = Vector((math.cos(a), math.sin(a)))
    side = Vector((-math.sin(a), math.cos(a)))
    points = [d*.012+side*.0008, d*.017+side*.0008, d*.017-side*.0008, d*.012-side*.0008]
    picture_mesh('Sun ray ' + str(i), [(p.x, p.y-.003) for p in points], gold, sun_root)

# Neutral photographic table, with subtle grain at a physically plausible scale.
tablemat = material('Warm pale ash table', '#DCD6C8', .6)
nt = tablemat.node_tree
tex = nt.nodes.new('ShaderNodeTexNoise')
tex.inputs['Scale'].default_value = 55
tex.inputs['Detail'].default_value = 3
mapping = nt.nodes.new('ShaderNodeVectorMath')
mapping.operation = 'MULTIPLY'
mapping.inputs[1].default_value = (2, 90, 7)
coord = nt.nodes.new('ShaderNodeTexCoord')
nt.links.new(coord.outputs['Generated'], mapping.inputs[0])
nt.links.new(mapping.outputs['Vector'], tex.inputs['Vector'])
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = .15
ramp.color_ramp.elements[0].color = rgba('#C7BDA8')
ramp.color_ramp.elements[1].position = .85
ramp.color_ramp.elements[1].color = rgba('#E9E3D8')
nt.links.new(tex.outputs['Fac'], ramp.inputs[0])
nt.links.new(ramp.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -.018))
table = bpy.context.object
table.name = 'Continuous tabletop'
table.dimensions = (5, 5, .035)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
table.data.materials.append(tablemat)

def area(name, pos, power, size, color):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy, data.shape, data.size, data.color = power, 'DISK', size, color
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = pos
    obj.rotation_euler = (Vector((0, 0, .06))-obj.location).to_track_quat('-Z', 'Y').to_euler()
    return obj
area('Large window · key', (-.28, -.3, .55), 8, .4, (1, .94, .86))
area('Soft fill', (.35, -.05, .3), 3, .3, (.85, .93, 1))
area('Back edge reflection', (.05, .35, .45), 6, .25, (1, .98, .92))

# The hand is a real skinned glTF mesh, never a 2D arrow or a composited photo.
hand_base = ROOT / 'work/concept-demos-3d/node_modules/@webxr-input-profiles/assets/dist/profiles/generic-hand'
hand_path = hand_base / 'right.glb'
if not hand_path.exists():
    raise RuntimeError('The pinned right-hand mesh is required; never silently mirror a different rig.')
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(hand_path))
imported = set(bpy.data.objects) - before
armature = next(o for o in imported if o.type == 'ARMATURE')
hand_mesh = next(o for o in imported if o.type == 'MESH' and 'handMesh' in o.name)
hand_mesh.name = 'Articulated hand · source WebXR mesh'
skin = material('Natural warm skin', '#D49A78', .43, skin=True)
hand_mesh.data.materials.clear()
hand_mesh.data.materials.append(skin)
for p in hand_mesh.data.polygons:
    p.use_smooth = True
sub = hand_mesh.modifiers.new('Smooth anatomical hand surface', 'SUBSURF')
sub.levels = 2
sub.render_levels = 2
for o in imported:
    if o.type == 'MESH' and o != hand_mesh:
        o.hide_render = True

# WebXR joints have independent bind matrices. Pose every weighted joint with
# cumulative rotations about the original physical knuckle locations.
def curl_finger(prefix, angles):
    names = [prefix+'-finger-phalanx-proximal', prefix+'-finger-phalanx-intermediate', prefix+'-finger-phalanx-distal', prefix+'-finger-tip']
    transform = Matrix.Identity(4)
    for i, name in enumerate(names):
        bone = armature.data.bones.get(name)
        if not bone:
            continue
        if i < 3:
            pivot = transform @ bone.head_local
            rot = Matrix.Rotation(angles[i], 4, 'Y')
            transform = Matrix.Translation(pivot) @ rot @ Matrix.Translation(-pivot) @ transform
        armature.pose.bones[name].matrix = transform @ bone.matrix_local
for digit in ('middle', 'ring', 'pinky'):
    curl_finger(digit, (.9, 1.1, .7))
curl_finger('index', (.10, .12, .12))
bpy.context.view_layer.update()
tip = armature.pose.bones['index-finger-tip'].matrix.translation.copy()

hand_root = empty('Hand · accurate contact controller')
armature.parent = hand_root
armature.matrix_parent_inverse = Matrix.Identity(4)
hand_scale = .82
hand_root.scale = (hand_scale, hand_scale, hand_scale)
z_axis = Vector((.28, -.87, .40)).normalized()
x_axis = (Vector((0, 0, 1)) - z_axis * z_axis.z).normalized()
y_axis = z_axis.cross(x_axis).normalized()
hand_basis = Matrix((x_axis, y_axis, z_axis)).transposed()
hand_root.rotation_euler = hand_basis.to_euler()
tip_offset = hand_basis @ (tip * hand_scale)
hand_visuals = [hand_mesh]
# A restrained nail surface makes the active fingertip readable at close range.
distal = armature.pose.bones['index-finger-phalanx-distal'].matrix.translation.copy()
nail_center = distal.lerp(tip, .56)
nail_rotation = Matrix.Rotation(.34, 4, 'Y').to_3x3()
nail_center += nail_rotation @ Vector((.0052, 0, 0))
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1)
nail = bpy.context.object
nail.name = 'Index fingernail · follows articulated finger'
nail.parent = hand_root
nail.location = nail_center
nail.rotation_euler = nail_rotation.to_euler()
nail.scale = (.00035, .0031, .0045)
nail.data.materials.append(material('Natural translucent nail', '#DCB5A0', .26))
for poly in nail.data.polygons:
    poly.use_smooth = True
hand_visuals.append(nail)
# Continue the wrist out of frame in a soft shirt sleeve; no cut-off floating hand.
sleeve_vertices, sleeve_faces = [], []
wrist_center = armature.data.bones['wrist'].head_local
for z, rx, ry in ((.069, .017, .027), (.076, .018, .028), (.088, .019, .030), (.16, .024, .035), (.34, .030, .041)):
    for i in range(48):
        a = math.tau*i/48
        sleeve_vertices.append((wrist_center.x+rx*math.cos(a), wrist_center.y+ry*math.sin(a), z))
for ring in range(4):
    for i in range(48):
        j = (i+1)%48
        sleeve_faces.append((ring*48+i, ring*48+j, (ring+1)*48+j, (ring+1)*48+i))
sleeve_faces.append(tuple(reversed(range(48))))
sleeve_mesh = bpy.data.meshes.new('Soft sleeve continuation')
sleeve_mesh.from_pydata(sleeve_vertices, [], sleeve_faces)
sleeve_mesh.update()
sleeve = bpy.data.objects.new('Cotton sleeve · wrist continuation', sleeve_mesh)
scene.collection.objects.link(sleeve)
sleeve.parent = hand_root
sleeve.data.materials.append(material('Warm grey cotton', '#D7D8D4', .82))
for poly in sleeve_mesh.polygons:
    poly.use_smooth = True
sm = sleeve.modifiers.new('Soft fabric edges', 'SUBSURF')
sm.levels = sm.render_levels = 2
hand_visuals.append(sleeve)

bpy.ops.object.camera_add()
camera = bpy.context.object
camera.name = 'Camera · continuous product interaction'
camera.data.lens = 52
camera.data.sensor_width = 36
camera.data.clip_start, camera.data.clip_end = .001, 100
scene.camera = camera

def smooth(a, b, t):
    if a == b:
        return float(t >= b)
    u = max(0, min(1, (t-a)/(b-a)))
    return u*u*(3-2*u)

def mix(a, b, u):
    return Vector(a).lerp(Vector(b), u)

def press(t, begin, hold, release):
    return smooth(begin, hold, t) * (1-smooth(hold+.18, release, t))

def hand_path_at(t, begin, contact_t, release_t, x):
    target = contact.copy()
    target.x = x
    amount = press(t, contact_t-.23, contact_t, contact_t+.7)
    touch = target + normal_key * (.00781-.0008*amount)
    # Approach stays outside the front face; only the finger pad contacts a key.
    approach = touch + Vector((.160, -.150, .100))
    entry = smooth(begin, contact_t-.28, t)
    leave = smooth(contact_t+.78, release_t, t)
    p = mix(approach, touch, entry)
    p = p.lerp(approach + Vector((.05, -.03, .02)), leave)
    return p - tip_offset, amount

def set_frame(frame):
    t = (frame-1)/FPS
    # Wide three-quarter establishes a solid object, then gives screen and key
    # a shared close view so cause and effect remain visible in one shot.
    if t < 1.8:
        u = smooth(0, 1.8, t)
        pos = mix((.285, -.420, .235), (.15, -.435, .200), u)
        target = Vector((0, -.008, .057))
        camera.data.lens = 52
    elif t < 3.8:
        u = smooth(1.8, 3.8, t)
        pos = mix((.27, .46, .205), (.15, .475, .195), u)
        target = Vector((0, .008, .057))
        camera.data.lens = 52
    elif t < 6.2:
        u = smooth(3.8, 6.2, t)
        pos = mix((.08, -.365, .19), (-.13, -.365, .225), u)
        target = Vector((0, -.010, .061))
        camera.data.lens = 52
    elif t < 17.2:
        u = smooth(6.2, 8.2, t)
        pos = mix((-.13, -.365, .225), (-.155, -.335, .240), u)
        target = Vector((.006, -.013, .058))
        camera.data.lens = 50
    elif t < 20.4:
        u = smooth(17.2, 20.4, t)
        pos = mix((.12, -.39, .21), (.03, -.37, .19), u)
        target = Vector((0, -.01, .061))
        camera.data.lens = 52
    elif t < 25.7:
        u = smooth(20.4, 22, t)
        pos = mix((-.13, -.365, .225), (-.155, -.335, .240), u)
        target = Vector((.006, -.013, .058))
        camera.data.lens = 50
    else:
        u = smooth(25.7, 29.7, t)
        pos = mix((-.25, -.39, .225), (.24, -.40, .235), u)
        target = Vector((0, -.005, .058))
        camera.data.lens = 50
    camera.location = pos
    camera.rotation_euler = (target-pos).to_track_quat('-Z', 'Y').to_euler()
    camera.data.dof.use_dof = False
    active = (6.2 <= t <= 11.3) or (12.0 <= t <= 17.2) or (20.4 <= t <= 25.7)
    if t < 11.5:
        hand_root.location, key_amount = hand_path_at(t, 6.2, 8.8, 11.3, .037)
        other_amount = 0
    elif t < 19:
        hand_root.location, other_amount = hand_path_at(t, 12.0, 14.7, 17.2, -.037)
        key_amount = 0
    else:
        hand_root.location, key_amount = hand_path_at(t, 20.4, 23.2, 25.7, .037)
        other_amount = 0
    for obj in hand_visuals:
        obj.hide_render = not active
    for name in ('key_correct', 'key_graphic_1'):
        parts[name].location = press_delta * key_amount
    for name in ('key_skip', 'key_graphic_0'):
        parts[name].location = press_delta * other_amount
    picture = 0 if t < 9.0 else 1 if t < 14.9 else 2 if t < 23.4 else 0
    parts['prompt_original'].hide_render = picture != 0
    for obj in ball_root.children:
        obj.hide_render = picture != 1
    for obj in sun_root.children:
        obj.hide_render = picture != 2
    return t

# Save an editable animation, including every camera, contact and visibility state.
for f in range(1, 721):
    set_frame(f)
    for obj in (camera, hand_root, parts['key_correct'], parts['key_graphic_1'], parts['key_skip'], parts['key_graphic_0']):
        obj.keyframe_insert('location', frame=f)
        obj.keyframe_insert('rotation_euler', frame=f)
    camera.data.keyframe_insert('lens', frame=f)
    for obj in (*hand_visuals, parts['prompt_original'], *ball_root.children, *sun_root.children):
        obj.keyframe_insert('hide_render', frame=f)
for obj in bpy.data.objects:
    if obj.animation_data and obj.animation_data.action:
        for curve in obj.animation_data.action.fcurves:
            for k in curve.keyframe_points:
                k.interpolation = 'CONSTANT' if curve.data_path == 'hide_render' else 'LINEAR'
scene.frame_set(1)
set_frame(1)
bpy.ops.wm.save_as_mainfile(filepath=str(WORK / 'say-island-interaction.blend'))
frames = range(args.start, args.end+1) if args.animate else [int(f) for f in args.frames.split(',')]
started = time.time()
for frame in frames:
    dest = OUT / f'{frame:04d}.png'
    if args.animate and dest.exists():
        continue
    scene.frame_set(frame)
    set_frame(frame)
    scene.render.filepath = str(dest)
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f'FRAME_DONE {frame} {time.time()-t0:.2f}s', flush=True)
print('RENDER_DONE ' + json.dumps({'engine': args.engine, 'width': args.width, 'seconds': round(time.time()-started, 2), 'output': str(OUT)}), flush=True)
