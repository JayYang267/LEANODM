"""Reusable native STEP-mesh loading and source-authored motion for Blender.

Data directory: work/concept-demos-3d/native-portfolio/<slug>/
  mesh.json: [{name, color: '#rrggbb', opacity, role, v: [[x,y,z],...],
               t: [[i,j,k],...]}], in original native millimetres.
  metadata.json: original STEP/manifest paths and SHA256, mesh SHA256, selected
                 variant, native bounds, and source interaction-state path.
  action-state.json: the original source action, without repeated CAD audits.

Meshes are imported verbatim, with no remeshing, bevels, invented mechanisms,
photos, text panels, rendering, or release decisions. Mesh vertices become
metres, while a translated root centres X/Y and grounds the native minimum Z.
Source axes/pivots remain in native coordinates; apply_source_action(fraction)
always starts from the selected baseline, so calls do not accumulate drift.

Native part names are authoritative in objects[name] and obj['native_part_name'].
Blender may suffix duplicate display names when several concepts share a scene.
The source only declares diffuse CMF/opacity; the PBR roughness is a neutral
renderer setting, not a verified material/finish specification. Envelope parts
are retained but hidden from exterior rendering by default.

Example (inside the existing bpy Python environment; no rendering is invoked):
  asset = load_native_concept('picture-harbor-turning-picture-drum-concept')
  apply_source_action(asset, 0.5)
  camera = fit_camera(asset)

Motion values remain digital D/TBD poses, never physical validation. ReadLoop's
record omits its pivot: this module reads the literal original rotation from its
hash-verified source AST instead of guessing an origin or rebuilding its CAD.
"""
from __future__ import annotations

import ast
import hashlib
import json
import math
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

try:
    import bpy
    from mathutils import Matrix, Vector
except ImportError:
    bpy = None
    Matrix = Vector = None

MM = 0.001
DEFAULT_PORTFOLIO = Path(__file__).resolve().parents[2] / "work/concept-demos-3d/native-portfolio"


@dataclass(frozen=True)
class NativeMotion:
    part: str
    translation_mm: tuple[float, float, float] | None = None
    axis: tuple[float, float, float] | None = None
    pivot_mm: tuple[float, float, float] | None = None
    angle_deg: float | None = None
    authority: str = "Original concept interaction-state; D/TBD"


@dataclass
class NativeConcept:
    slug: str
    root: Any
    collection: Any
    objects: dict[str, Any]
    metadata: dict
    action: dict
    motions: tuple[NativeMotion, ...]
    origin_mm: tuple[float, float, float]
    base_matrices: dict[str, Any] = field(repr=False)

    def native_to_world(self, point_mm):
        """Native mm point -> the concept root's current world-space metres."""
        return self.root.matrix_world @ Vector(tuple(v * MM for v in point_mm))

    def world_to_native(self, point_m):
        """World-space metres -> original native mm coordinates."""
        point = self.root.matrix_world.inverted() @ Vector(point_m)
        return tuple(v / MM for v in point)


def _sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def _triple(value):
    result = tuple(float(v) for v in value)
    if len(result) != 3 or not all(math.isfinite(v) for v in result):
        raise ValueError(f"Invalid native XYZ value: {value!r}")
    return result


def _unit(value):
    vector = _triple(value)
    length = math.sqrt(sum(v * v for v in vector))
    if length == 0:
        raise ValueError("A source rotation/translation axis cannot be zero")
    return tuple(v / length for v in vector)


def _axis(value):
    """Parse exact source cardinal axes, optionally 'Y through (x,y,z)'."""
    if not isinstance(value, str):
        return _unit(value), None
    match = re.fullmatch(r"\s*([+-]?)([XYZ])(?:\s+through\s*\(([^)]+)\))?\s*", value)
    if not match:
        raise ValueError(f"Unsupported source axis; refusing to infer it: {value!r}")
    vector = [0.0, 0.0, 0.0]
    vector["XYZ".index(match.group(2))] = -1.0 if match.group(1) == "-" else 1.0
    pivot = _triple(match.group(3).split(",")) if match.group(3) else None
    return tuple(vector), pivot


def _source_rotation(metadata, action):
    """Resolve a missing rotation pivot from literal, hash-verified native code."""
    original = json.loads(Path(metadata["sourceInteractionState"]).read_text(encoding="utf-8"))
    bundle = Path(metadata["sourceManifest"]).parents[3]
    candidates = []
    for relative, expected_hash in original.get("sourceIdentity", {}).items():
        if not relative.replace("\\", "/").endswith("portfolio_motion.py"):
            continue
        source = bundle / relative.replace("\\", "/")
        if _sha(source) != expected_hash:
            raise ValueError(f"Original motion builder hash changed: {source}")
        tree = ast.parse(source.read_text(encoding="utf-8"))
        for branch in ast.walk(tree):
            if not isinstance(branch, ast.If):
                continue
            ids = {node.value for node in ast.walk(branch.test) if isinstance(node, ast.Constant)}
            if metadata["refId"] not in ids:
                continue
            for call in ast.walk(branch):
                if not (isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute)
                        and call.func.attr == "rotate" and len(call.args) >= 3):
                    continue
                try:
                    start, end = (_triple(ast.literal_eval(arg)) for arg in call.args[:2])
                    angle = float(ast.literal_eval(call.args[2]))
                except (ValueError, TypeError, SyntaxError):
                    continue
                if abs(angle - float(action["angle_deg"])) > 1e-9:
                    continue
                candidates.append((start, _unit(tuple(b - a for a, b in zip(start, end))),
                                   f"{source}:{call.lineno} sha256:{expected_hash}"))
    if len(candidates) != 1:
        raise ValueError("Rotation pivot is absent or ambiguous in original source; no inferred motion")
    return candidates[0]


def source_motions(metadata, action, part_names):
    """Normalise existing action records; unsupported/ambiguous motions fail closed."""
    names = set(part_names)
    result = []
    if "movedParts" in action:
        for record in action["movedParts"]:
            kind = record.get("kind")
            if kind in {"prismatic", "key_press"}:
                result.append(NativeMotion(record["name"], translation_mm=_triple(record["translation_mm"])))
            elif kind == "revolute":
                axis, inline_pivot = _axis(record["axis"])
                pivot = record.get("axisPoint_mm", inline_pivot)
                if pivot is None:
                    raise ValueError("A revolute source record requires its exact native pivot")
                result.append(NativeMotion(record["name"], axis=axis, pivot_mm=_triple(pivot),
                                           angle_deg=float(record["angle_deg"])))
            else:
                raise ValueError(f"Unsupported original motion kind: {kind!r}")
    else:
        axis, pivot = _axis(action["axis"])
        if "stroke_mm" in action:
            vector = tuple(v * float(action["stroke_mm"]) for v in axis)
            result = [NativeMotion(name, translation_mm=vector) for name in action["parts"]]
        elif "angle_deg" in action:
            authority = "Original concept interaction-state; D/TBD"
            if pivot is None:
                pivot, source_axis, authority = _source_rotation(metadata, action)
                if sum(a * b for a, b in zip(axis, source_axis)) < 1 - 1e-9:
                    raise ValueError("Native source and recorded rotation axes disagree")
            result = [NativeMotion(name, axis=axis, pivot_mm=pivot,
                                   angle_deg=float(action["angle_deg"]), authority=authority)
                      for name in action["parts"]]
        else:
            raise ValueError("Source record contains no supported motion")
    moving = [motion.part for motion in result]
    if len(set(moving)) != len(moving) or not set(moving) <= names:
        raise ValueError("Original motion references duplicate or missing native parts")
    if any(m.angle_deg is not None and not math.isfinite(m.angle_deg) for m in result):
        raise ValueError("Non-finite source angle")
    return tuple(result)


def read_native_data(slug, portfolio=DEFAULT_PORTFOLIO, *, verify_source=True):
    """Read/verify existing assets only; this function also works outside Blender."""
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError("Expected an existing concept slug, not a filesystem path")
    folder = Path(portfolio) / slug
    metadata = json.loads((folder / "metadata.json").read_text(encoding="utf-8"))
    mesh_path = folder / "mesh.json"
    if metadata["slug"] != slug or _sha(mesh_path) != metadata["meshSha256"]:
        raise ValueError("Exported mesh identity/hash mismatch")
    parts = json.loads(mesh_path.read_text(encoding="utf-8"))
    names = [part["name"] for part in parts]
    if names != metadata["partNames"] or len(set(names)) != len(names):
        raise ValueError("Exported native part names/order changed")
    action = json.loads((folder / "action-state.json").read_text(encoding="utf-8"))
    if verify_source:
        for path_key, hash_key in [("sourceStep", "sourceStepSha256"),
                                   ("sourceManifest", "sourceManifestSha256")]:
            if _sha(metadata[path_key]) != metadata[hash_key]:
                raise ValueError(f"Original native source hash mismatch: {metadata[path_key]}")
        original = json.loads(Path(metadata["sourceInteractionState"]).read_text(encoding="utf-8"))
        stripped = {k: v for k, v in original.items() if k not in {"model", "render", "sourceIdentity"}}
        if action != stripped:
            raise ValueError("Exported interaction record differs from its original source")
    motions = source_motions(metadata, action, names)
    return parts, metadata, action, motions


def transform_native_point(point_mm, motion, fraction):
    """Pure-CPU Rodrigues transform, useful for independently checking native poses."""
    fraction = _fraction(fraction)
    point = _triple(point_mm)
    if motion is None:
        return point
    if motion.translation_mm is not None:
        return tuple(a + fraction * b for a, b in zip(point, motion.translation_mm))
    axis, pivot = motion.axis, motion.pivot_mm
    value = tuple(a - b for a, b in zip(point, pivot))
    theta = math.radians(motion.angle_deg) * fraction
    cosine, sine = math.cos(theta), math.sin(theta)
    dot = sum(a * b for a, b in zip(axis, value))
    cross = (axis[1] * value[2] - axis[2] * value[1],
             axis[2] * value[0] - axis[0] * value[2],
             axis[0] * value[1] - axis[1] * value[0])
    return tuple(pivot[i] + value[i] * cosine + cross[i] * sine + axis[i] * dot * (1 - cosine)
                 for i in range(3))


def _fraction(value):
    value = float(value)
    if not math.isfinite(value) or not 0 <= value <= 1:
        raise ValueError("A native action fraction must be finite and between 0 and 1")
    return value


def _require_bpy():
    if bpy is None:
        raise RuntimeError("Use the existing Blender bpy Python environment for scene operations")


def _linear(channel):
    return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4


def native_material(part, *, roughness=0.38):
    """Source CMF/alpha with neutral non-metallic PBR shading; no finish claim."""
    _require_bpy()
    rgba = tuple(_linear(int(part["color"][i:i + 2], 16) / 255) for i in (1, 3, 5))
    alpha = float(part.get("opacity", 1))
    material = bpy.data.materials.new(f"native:{part['name']}")
    material.use_nodes = True
    material.diffuse_color = (*rgba, alpha)
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*rgba, 1)
    shader.inputs["Metallic"].default_value = 0
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Alpha"].default_value = alpha
    if alpha < 1:
        if hasattr(material, "surface_render_method"):
            material.surface_render_method = "DITHERED"
        elif hasattr(material, "blend_method"):
            material.blend_method = "HASHED"
    material["native_srgb"] = part["color"]
    material["native_opacity"] = alpha
    return material


def load_native_concept(slug, portfolio=DEFAULT_PORTFOLIO, *, collection=None,
                        hide_envelopes=True, weighted_normals=True, verify_source=True):
    """Create separate editable Blender objects from actual selected STEP meshes."""
    _require_bpy()
    parts, metadata, action, motions = read_native_data(slug, portfolio, verify_source=verify_source)
    if collection is None:
        collection = bpy.data.collections.new(f"Native concept: {slug}")
        bpy.context.scene.collection.children.link(collection)
    root = bpy.data.objects.new(f"Native root: {slug}", None)
    collection.objects.link(root)
    low, high = metadata["bboxMinMm"], metadata["bboxMaxMm"]
    origin = ((low[0] + high[0]) / 2, (low[1] + high[1]) / 2, low[2])
    root.location = tuple(-value * MM for value in origin)
    for key in ["sourceStep", "sourceStepSha256", "sourceManifest", "sourceManifestSha256",
                "meshSha256", "sourceInteractionState", "selected", "maturity"]:
        root[key] = metadata[key]
    root["native_units"] = "mm"
    root["scene_units"] = "m"
    root["native_origin_mm"] = list(origin)
    root["source_interaction_sha256"] = _sha(metadata["sourceInteractionState"])
    root["export_action_sha256"] = _sha(Path(portfolio) / slug / "action-state.json")
    root["motion_authorities"] = json.dumps(sorted({motion.authority for motion in motions}))
    objects, bases = {}, {}
    for part in parts:
        mesh = bpy.data.meshes.new(f"native mesh: {part['name']}")
        mesh.from_pydata([tuple(value * MM for value in vertex) for vertex in part["v"]], [], part["t"])
        mesh.update(calc_edges=True)
        obj = bpy.data.objects.new(part["name"], mesh)
        collection.objects.link(obj)
        obj.parent = root
        obj.rotation_mode = "QUATERNION"
        obj["native_part_name"] = part["name"]
        obj["native_role"] = part.get("role", "housing")
        obj["native_srgb"] = part["color"]
        obj["native_opacity"] = float(part.get("opacity", 1))
        mesh.materials.append(native_material(part))
        for polygon in mesh.polygons:
            polygon.use_smooth = True
        if weighted_normals:
            modifier = obj.modifiers.new("Native weighted normals", "WEIGHTED_NORMAL")
            modifier.keep_sharp = True
        if hide_envelopes and part.get("role") == "envelope":
            obj.hide_render = True
            obj.hide_set(True)
        objects[part["name"]] = obj
        bases[part["name"]] = obj.matrix_basis.copy()
    bpy.context.view_layer.update()
    return NativeConcept(slug, root, collection, objects, metadata, action, motions, origin, bases)


def apply_source_action(asset, fraction, *, frame=None):
    """Apply only the original authored motion; 0=selected, 1=interaction-state.

    Optional frame inserts this exact sampled pose as location/quaternion/scale
    keys. This function imposes no narrative, timing, ease curve or new action.
    """
    _require_bpy()
    fraction = _fraction(fraction)
    asset.root["source_action_fraction"] = fraction
    if frame is not None:
        if not isinstance(frame, int):
            raise ValueError("A sampled native keyframe requires an integer frame")
        bpy.context.scene.frame_set(frame)
    for name, obj in asset.objects.items():
        obj.matrix_basis = asset.base_matrices[name].copy()
    for motion in asset.motions:
        if motion.translation_mm is not None:
            matrix = Matrix.Translation(Vector(motion.translation_mm) * (MM * fraction))
        else:
            pivot = Vector(motion.pivot_mm) * MM
            matrix = (Matrix.Translation(pivot)
                      @ Matrix.Rotation(math.radians(motion.angle_deg) * fraction, 4, Vector(motion.axis))
                      @ Matrix.Translation(-pivot))
        obj = asset.objects[motion.part]
        obj.matrix_basis = matrix @ asset.base_matrices[motion.part]
        if frame is not None:
            for data_path in ("location", "rotation_quaternion", "scale"):
                obj.keyframe_insert(data_path=data_path, frame=frame)
    bpy.context.view_layer.update()
    return asset


def world_bounds(asset, *, include_envelopes=False):
    """Current pose bounds in world metres, using the unchanged native geometry."""
    _require_bpy()
    points = [obj.matrix_world @ Vector(corner) for obj in asset.objects.values()
              if include_envelopes or obj.get("native_role") != "envelope"
              for corner in obj.bound_box]
    if not points:
        raise ValueError("No native objects available for bounds")
    return (Vector(tuple(min(point[i] for point in points) for i in range(3))),
            Vector(tuple(max(point[i] for point in points) for i in range(3))))


def fit_camera(asset, camera=None, *, direction=(3, -4, 2.5), margin=1.15, scene=None):
    """Fit a stable Z-up orthographic camera to the current visible native bounds."""
    _require_bpy()
    if not math.isfinite(margin) or margin < 1:
        raise ValueError("Camera margin must be at least 1")
    scene = scene or bpy.context.scene
    if camera is None:
        camera = bpy.data.objects.new(f"Native camera: {asset.slug}", bpy.data.cameras.new("Native camera"))
        scene.collection.objects.link(camera)
    low, high = world_bounds(asset)
    centre, diagonal = (low + high) / 2, max((high - low).length, 0.001)
    camera.location = centre + Vector(_unit(direction)) * (diagonal * 2.5)
    camera.rotation_euler = (centre - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 1
    bpy.context.view_layer.update()
    view = camera.matrix_world.inverted()
    corners = [view @ Vector((x, y, z)) for x in (low.x, high.x)
               for y in (low.y, high.y) for z in (low.z, high.z)]
    frame = camera.data.view_frame(scene=scene)
    frame_width = max(v.x for v in frame) - min(v.x for v in frame)
    frame_height = max(v.y for v in frame) - min(v.y for v in frame)
    camera.data.ortho_scale = margin * max(
        (max(v.x for v in corners) - min(v.x for v in corners)) / frame_width,
        (max(v.y for v in corners) - min(v.y for v in corners)) / frame_height,
    )
    camera.data.clip_start = max(0.0001, diagonal / 1000)
    camera.data.clip_end = diagonal * 20
    scene.camera = camera
    return camera
