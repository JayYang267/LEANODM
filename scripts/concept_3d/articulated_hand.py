"""Native WebXR right hand for pointing/button contact, not a validated grip.

Run CPU-only validation with the managed bpy interpreter:
  work/concept-demos-3d/.venv/Scripts/python.exe \
    scripts/concept_3d/articulated_hand.py --validate

Units are metres internally; public contact dimensions are explicitly mm.
The canonical palm lies in YZ, +X is dorsal, +Z points toward the forearm,
and positive local-Y rotations curl the independent WebXR finger joints.
No render, GPU setup, scene save, page edit or approval-list change occurs here.
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
import hashlib
import json
import math
from pathlib import Path
from typing import Iterable, Mapping

import bpy
from mathutils import Matrix, Vector


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ASSET = REPO_ROOT / "work/concept-demos-3d/node_modules/@webxr-input-profiles/assets/dist/profiles/generic-hand/right.glb"
PINNED_SHA256 = "291790c14f7f88a7f9bd35330c47392ed8e8d395ae6728f4bb7089f1bc1f2b96"
ASSET_PROVENANCE = {
    "package": "@webxr-input-profiles/assets", "version": "1.0.20",
    "asset": "dist/profiles/generic-hand/right.glb", "handedness": "right",
    "sha256": PINNED_SHA256,
    "source": "https://github.com/immersive-web/webxr-input-profiles",
    "license": "MIT; Copyright (c) 2019 Amazon",
    "licenseSource": "https://github.com/immersive-web/webxr-input-profiles/blob/main/packages/assets/LICENSE.md",
    "adaptation": "Independent bind-joint curls, attached procedural cuff and evaluated-skin contact alignment.",
    "validatedScope": "Pointing/index-pad contact with finite circular control top; not generic gripping, fit or full-hand collision validation.",
}
ASSET_NOTICE = """MIT License
Copyright (c) 2019 Amazon

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""
POINTING_CURLS = {
    "index": (.10, .12, .12), "middle": (.9, 1.1, .7),
    "ring": (.9, 1.1, .7), "pinky": (.9, 1.1, .7),
}


@dataclass
class ArticulatedRightHand:
    root: object
    armature: object
    skin: object
    cuff: object
    provenance: dict


def _material(name: str, rgba: tuple, roughness: float):
    material = bpy.data.materials.new(name)
    material.diffuse_color = rgba
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = rgba
    shader.inputs["Roughness"].default_value = roughness
    return material


def _attached_cuff(root, armature, skin, collection, material):
    """Fit the sleeve around the evaluated, inverse-bind-correct wrist skin.

    The canonical sleeve axis remains +Z and its length is unchanged. A bone
    head alone does not describe the asymmetric wrist section: the original
    hand skin extends several millimetres beyond that joint-centred ellipse.
    Fit one enclosing ellipse to the complete covered wrist segment, then add
    enough clearance for Catmull-Clark shrinkage and the visible cotton layer.
    """
    bpy.context.view_layer.update()
    graph = bpy.context.evaluated_depsgraph_get()
    evaluated = skin.evaluated_get(graph)
    evaluated_mesh = evaluated.to_mesh()
    root_inverse = root.matrix_world.inverted()
    to_root = root_inverse @ evaluated.matrix_world
    wrist = root_inverse @ armature.matrix_world @ armature.pose.bones['wrist'].head
    front_z = wrist.z - .010
    try:
        # These are posed, subdivided skin positions in the controller frame,
        # never raw glTF positions before its inverse-bind armature modifier.
        covered = [to_root @ vertex.co for vertex in evaluated_mesh.vertices
                   if (to_root @ vertex.co).z >= front_z - .003]
    finally:
        evaluated.to_mesh_clear()
    if len(covered) < 32:
        raise ValueError('Evaluated right wrist has insufficient sleeve-fit samples')
    low_x, high_x = min(p.x for p in covered), max(p.x for p in covered)
    low_y, high_y = min(p.y for p in covered), max(p.y for p in covered)
    cx, cy = (low_x+high_x)/2, (low_y+high_y)/2
    base_rx, base_ry = (high_x-low_x)/2, (high_y-low_y)/2
    if min(base_rx, base_ry) <= 0:
        raise ValueError('Evaluated right wrist ellipse is degenerate')
    envelope = max(math.hypot((p.x-cx)/base_rx, (p.y-cy)/base_ry)
                   for p in covered)
    clearance = .0025
    rx = max(.020, base_rx*envelope+clearance)
    ry = max(.030, base_ry*envelope+clearance)
    # Repeated fitted rings hold the entire skin-covered segment inside the
    # sleeve; only the unoccupied forearm section gradually widens afterwards.
    rings = [(front_z,rx,ry),(front_z+.003,rx,ry),
             (wrist.z+.006,rx,ry),(wrist.z+.032,rx,ry),
             (wrist.z+.105,max(rx+.003,.025),max(ry+.003,.036)),
             (wrist.z+.285,max(rx+.007,.031),max(ry+.009,.042))]
    vertices = [(cx + rx * math.cos(math.tau * i / 48),
                 cy + ry * math.sin(math.tau * i / 48), z)
                for z, rx, ry in rings for i in range(48)]
    faces = [(ring * 48 + i, ring * 48 + (i + 1) % 48,
              (ring + 1) * 48 + (i + 1) % 48, (ring + 1) * 48 + i)
             for ring in range(len(rings) - 1) for i in range(48)]
    mesh = bpy.data.meshes.new(root.name + " cuff mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    cuff = bpy.data.objects.new(root.name + " attached cuff", mesh)
    collection.objects.link(cuff)
    cuff.parent = root
    cuff.data.materials.append(material)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    modifier = cuff.modifiers.new("Soft cuff", "SUBSURF")
    modifier.levels = modifier.render_levels = 2
    cuff["wrist_overlap_mm"] = 10.0
    cuff["wrist_fit_source"] = 'Armature-evaluated subdivided skin in controller space'
    cuff["wrist_fit_samples"] = len(covered)
    cuff["wrist_fit_ellipse_mm"] = [cx*1000,cy*1000,rx*1000,ry*1000]
    cuff["wrist_fit_clearance_mm"] = clearance*1000
    return cuff


def instantiate_hand(asset_path=None, *, name="Pointing right hand", scale=.82,
                     subdivisions=2, collection=None, skin_material=None,
                     cuff_material=None) -> ArticulatedRightHand:
    """Import the pinned right rig, its native skin and an attached cuff.

    Importing creates new objects only. It does not reset the caller's scene.
    No mirroring or fallback hand is permitted. Root scale is uniform.
    """
    path = Path(asset_path or DEFAULT_ASSET)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != PINNED_SHA256:
        raise ValueError("Right-hand asset differs from pinned WebXR 1.0.20 source")
    if scale <= 0 or subdivisions < 0:
        raise ValueError("Scale must be positive and subdivisions nonnegative")
    collection = collection or bpy.context.scene.collection
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    imported = set(bpy.data.objects) - before
    armature = next(o for o in imported if o.type == "ARMATURE")
    skin = next(o for o in imported if o.type == "MESH" and "handMesh" in o.name)
    # Preserve the skin-to-rig relation while defining one canonical rig frame.
    skin_to_rig = armature.matrix_world.inverted() @ skin.matrix_world
    root = bpy.data.objects.new(name + " controller", None)
    collection.objects.link(root)
    armature.parent = root
    armature.matrix_parent_inverse = Matrix.Identity(4)
    armature.matrix_basis = Matrix.Identity(4)
    skin.parent = armature
    skin.matrix_parent_inverse = Matrix.Identity(4)
    skin.matrix_basis = skin_to_rig
    root.scale = (scale, scale, scale)
    skin.name = name + " evaluated skin"
    skin.data.materials.clear()
    skin.data.materials.append(skin_material or _material(name + " skin", (.59, .32, .19, 1), .43))
    for polygon in skin.data.polygons:
        polygon.use_smooth = True
    subdivision = skin.modifiers.new("Anatomical surface", "SUBSURF")
    subdivision.levels = subdivision.render_levels = subdivisions
    for obj in imported:
        if obj.type == "MESH" and obj != skin:
            obj.hide_render = obj.hide_viewport = True
    cuff = _attached_cuff(root, armature, skin, collection,
                          cuff_material or _material(name + " cotton", (.68, .69, .66, 1), .82))
    provenance = {**ASSET_PROVENANCE, "resolvedAsset": str(path), "sha256": digest}
    root["asset_provenance"] = json.dumps(provenance)
    hand = ArticulatedRightHand(root, armature, skin, cuff, provenance)
    pose_finger_chains(hand)
    return hand


def pose_finger_chains(hand: ArticulatedRightHand,
                       curls: Mapping[str, Iterable[float]] | None = None):
    """Pose independent WebXR bind joints with cumulative positive-Y curls.

    Angles are radians (proximal, intermediate, distal); tip inherits all three.
    Repeated calls reset to bind pose first. Unspecified fingers remain at rest.
    Thumb/grasp biomechanics are deliberately outside this helper's scope.
    """
    for bone in hand.armature.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)
    for digit, values in (POINTING_CURLS if curls is None else curls).items():
        angles = tuple(values)
        if digit not in {"index", "middle", "ring", "pinky"} or len(angles) != 3:
            raise ValueError("Expected three curl angles for an index/middle/ring/pinky chain")
        transform = Matrix.Identity(4)
        for i, suffix in enumerate(("phalanx-proximal", "phalanx-intermediate", "phalanx-distal", "tip")):
            name = f"{digit}-finger-{suffix}"
            bone = hand.armature.data.bones.get(name)
            if bone is None:
                raise ValueError("Missing pinned rig joint: " + name)
            if i < 3:
                pivot = transform @ bone.head_local
                rotation = Matrix.Rotation(angles[i], 4, "Y")
                transform = Matrix.Translation(pivot) @ rotation @ Matrix.Translation(-pivot) @ transform
            hand.armature.pose.bones[name].matrix = transform @ bone.matrix_local
    bpy.context.view_layer.update()


def orient_hand(hand: ArticulatedRightHand, wrist_direction, dorsal_hint=(0, 0, 1)):
    """Map local +Z toward forearm/wrist and local +X toward the dorsal hint."""
    z = Vector(wrist_direction)
    if z.length < 1e-8:
        raise ValueError("Wrist direction must be nonzero")
    z.normalize()
    x = Vector(dorsal_hint) - z * Vector(dorsal_hint).dot(z)
    if x.length < 1e-8:
        raise ValueError("Dorsal hint must not be parallel to wrist direction")
    x.normalize()
    y = z.cross(x).normalized()
    hand.root.rotation_mode = "QUATERNION"
    hand.root.rotation_quaternion = Matrix((x, y, z)).transposed().to_quaternion()
    bpy.context.view_layer.update()
    return hand.root.matrix_world.copy()


def _index_skin_vertices(hand, weight_threshold=.5):
    group = hand.skin.vertex_groups.get("index-finger-phalanx-distal")
    if group is None:
        raise ValueError("Pinned skin lacks index distal weights")
    bpy.context.view_layer.update()
    graph = bpy.context.evaluated_depsgraph_get()
    evaluated = hand.skin.evaluated_get(graph)
    mesh = evaluated.to_mesh(preserve_all_data_layers=True, depsgraph=graph)
    try:
        points = []
        for vertex in mesh.vertices:
            weight = sum(g.weight for g in vertex.groups if g.group == group.index)
            if weight > weight_threshold:
                points.append((vertex.index, evaluated.matrix_world @ vertex.co, weight))
        if not points:
            raise ValueError("No evaluated distal-weighted skin vertices; check modifiers/weights")
        return points
    finally:
        evaluated.to_mesh_clear()


def measure_index_pad_to_control(hand, center, normal, *, radius_mm=12.0,
                                 weight_threshold=.5):
    """Measure signed skin gap over the finite disk, not the infinite plane.

    Outward normal points from the top toward the hand. Only vertices whose
    projection is inside the circular top can penetrate that top. This does not
    certify side-wall, other-finger, cuff, product-shell or table collisions.
    """
    center, normal = Vector(center), Vector(normal)
    if normal.length < 1e-8 or radius_mm <= 0 or not 0 <= weight_threshold < 1:
        raise ValueError("Need a nonzero normal, positive disk radius and valid weight threshold")
    normal.normalize()
    radius = radius_mm / 1000
    points = _index_skin_vertices(hand, weight_threshold)
    inside, nearest = [], math.inf
    outside_below = 0
    for index, point, weight in points:
        offset = point - center
        gap = offset.dot(normal)
        radial = (offset - normal * gap).length
        nearest = min(nearest, math.hypot(gap, max(0, radial - radius)))
        if radial <= radius + 1e-9:
            inside.append((gap, radial, index, point, weight))
        elif gap < 0:
            outside_below += 1
    if not inside:
        raise ValueError("Index pad does not overlap the finite circular control top")
    gap, radial, index, point, weight = min(inside, key=lambda entry: entry[0])
    return {"gapMm": gap * 1000, "maxTopPenetrationMm": max(0, -gap * 1000),
            "closestDiskDistanceMm": nearest * 1000, "radiusMm": radius_mm,
            "contactRadialMm": radial * 1000, "skinPointWorld": list(point),
            "vertexIndex": index, "distalWeight": weight,
            "evaluatedDistalVertices": len(points), "overDiskVertices": len(inside),
            "outsideDiskBelowPlaneVertices": outside_below}


def _translate_world(root, delta):
    transform = root.matrix_world.copy()
    transform.translation += delta
    root.matrix_world = transform
    bpy.context.view_layer.update()


def align_index_pad_to_control(hand, center, normal, *, radius_mm=12.0,
                               skin_gap_mm=.05, center_pad=True,
                               weight_threshold=.5, tolerance_mm=.003):
    """Place evaluated index skin 0.05 mm above a finite circular control top.

    First align the low-skin patch tangentially to the requested disk centre,
    then solve normal translation from evaluated distal-weighted skin samples.
    There is no tip-bone offset or product-specific clearance constant. For a
    moving button, call again with its displaced top centre, or keyframe both
    controller and button by their shared source displacement after calibration.
    """
    center, normal = Vector(center), Vector(normal)
    if normal.length < 1e-8 or radius_mm <= 0 or skin_gap_mm < 0 or tolerance_mm <= 0:
        raise ValueError("Invalid finite-disk contact dimensions")
    normal.normalize()
    before = hand.root.matrix_world.copy()
    try:
        if center_pad:
            points = _index_skin_vertices(hand, weight_threshold)
            lowest = min(point.dot(normal) for _, point, _ in points)
            patch = [(point, weight) for _, point, weight in points
                     if point.dot(normal) <= lowest + .00025]
            anchor = sum((point * weight for point, weight in patch), Vector()) / sum(weight for _, weight in patch)
            delta = center - anchor
            _translate_world(hand.root, delta - normal * delta.dot(normal))
        for _ in range(3):
            measurement = measure_index_pad_to_control(hand, center, normal, radius_mm=radius_mm,
                                                       weight_threshold=weight_threshold)
            error_mm = skin_gap_mm - measurement["gapMm"]
            if abs(error_mm) <= tolerance_mm:
                break
            _translate_world(hand.root, normal * (error_mm / 1000))
        result = measure_index_pad_to_control(hand, center, normal, radius_mm=radius_mm,
                                              weight_threshold=weight_threshold)
        if abs(result["gapMm"] - skin_gap_mm) > tolerance_mm:
            raise RuntimeError("Evaluated finite-disk skin gap did not converge")
        result.update({"requestedGapMm": skin_gap_mm,
                       "controllerWorld": list(hand.root.matrix_world.translation),
                       "scope": "Index distal skin versus finite circular top only; generic gripping not validated."})
        return result
    except Exception:
        hand.root.matrix_world = before
        bpy.context.view_layer.update()
        raise


def validate_say_island():
    """CPU geometry only: native 24 mm diameter keys, same pointing curls/basis."""
    source = REPO_ROOT / "work/concept-demos-3d/say-island/source"
    rest = json.loads((source / "B_mesh.json").read_text(encoding="utf-8"))
    pressed = json.loads((source / "B_KEY_RIGHT_DEPRESSED_mesh.json").read_text(encoding="utf-8"))
    right = next(p for p in rest if p["name"] == "key_correct")
    down = next(p for p in pressed if p["name"] == "key_correct")
    press_delta = Vector([(down["v"][0][i] - right["v"][0][i]) / 1000 for i in range(3)])
    normal = -press_delta.normalized()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    hand = instantiate_hand()
    orient_hand(hand, (.28, -.87, .40), (0, 0, 1))
    reports = []
    for key_name in ("key_correct", "key_skip"):
        key = next(p for p in rest if p["name"] == key_name)
        vertices = [Vector((v[0] / 1000, (v[1] - 46) / 1000, v[2] / 1000)) for v in key["v"]]
        top = max(v.dot(normal) for v in vertices)
        top_vertices = [v for v in vertices if abs(v.dot(normal) - top) < 1e-7]
        u = Vector((1, 0, 0))
        v_axis = normal.cross(u).normalized()
        center = (normal * top + u * ((min(v.dot(u) for v in top_vertices) + max(v.dot(u) for v in top_vertices)) / 2)
                  + v_axis * ((min(v.dot(v_axis) for v in top_vertices) + max(v.dot(v_axis) for v in top_vertices)) / 2))
        # The native 24 mm outer diameter includes a 0.7 mm edge bevel.
        # The flat top is smaller; report it separately instead of confusing it
        # with the source key_diameter parameter.
        radius_mm = max(((v - center) - normal * (v - center).dot(normal)).length for v in vertices) * 1000
        flat_radius_mm = max(((v - center) - normal * (v - center).dot(normal)).length for v in top_vertices) * 1000
        if abs(radius_mm - 12) > .01:
            raise AssertionError("Native key is expected to have 24 mm diameter")
        for state, displacement in (("rest", Vector()), ("pressed", press_delta)):
            contact = align_index_pad_to_control(hand, center + displacement, normal, radius_mm=radius_mm)
            assert abs(contact["gapMm"] - .05) <= .003
            assert contact["maxTopPenetrationMm"] == 0
            assert contact["contactRadialMm"] <= radius_mm
            assert contact["contactRadialMm"] <= flat_radius_mm
            reports.append({"key": key_name, "state": state,
                            "nativeFlatTopRadiusMm": flat_radius_mm, **contact})
    return {"status": "PASS", "renderInvoked": False, "normal": list(normal),
            "sourcePressMm": press_delta.length * 1000, "poses": POINTING_CURLS,
            "asset": hand.provenance, "contacts": reports,
            "limits": "Pointing contact only. Full-hand/product collisions, general grip and physical usability are not validated."}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()
    if args.validate:
        print("HAND_CPU_VALIDATION " + json.dumps(validate_say_island()))
    else:
        parser.print_help()
