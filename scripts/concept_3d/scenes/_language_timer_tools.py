"""Scene-local contact and existing-screen helpers for language/timer concepts.

No rendering or source-file edits. Additional control travel is an illustrative
actuation of an existing control, not a validated engineering specification.
"""
import math
import bpy
import numpy as np
from mathutils import Matrix, Vector

try:
    from scripts.concept_3d.articulated_hand import instantiate_hand, orient_hand, align_index_pad_to_control
except ModuleNotFoundError:
    from articulated_hand import instantiate_hand, orient_hand, align_index_pad_to_control


def smooth(start, end, t):
    u = max(0.0, min(1.0, (t - start) / (end - start)))
    return u * u * (3 - 2 * u)


def tap(t, at, hold=.25, release=.45):
    return smooth(at - .28, at, t) * (1 - smooth(at + hold, at + hold + release, t))


def native_points(stage, name):
    obj = stage.asset.objects[name]
    transform = stage.asset.base_matrices[name]
    return [transform @ vertex.co for vertex in obj.data.vertices]


def top_normal(stage, name, hint=(0, 0, 1)):
    points = np.array([tuple(v) for v in native_points(stage, name)])
    _, vectors = np.linalg.eigh(np.cov(points.T))
    normal = Vector(vectors[:, 0])
    if normal.dot(Vector(hint)) < 0:
        normal.negate()
    return tuple(normal.normalized())


def press_parts(stage, names, fraction, normal=(0, 0, 1), depth_mm=.8):
    """Source-shaped buttons remain source geometry; only illustrative travel."""
    translation = Matrix.Translation(-Vector(normal).normalized() * depth_mm * fraction / 1000)
    for name in names:
        obj = stage.asset.objects[name]
        obj.matrix_local = translation @ stage.asset.base_matrices[name]
    bpy.context.view_layer.update()


def pointer_cycle(pointer, t, enter, at, leave, fraction=0):
    visible = enter <= t <= leave
    pointer.show(visible)
    if not visible:
        return
    pointer.contact(fraction=fraction)
    distance = .10 * (1 - smooth(enter, at - .32, t)) + .10 * smooth(at + .85, leave, t)
    if distance:
        pointer.approach(distance)


class FrictionTurn:
    """Index-pad friction turn on an existing circular knob, not a fake grip."""
    def __init__(self, stage, part, axis, pivot_mm, wrist, dorsal,
                 follow_wrist_rotation=True):
        self.stage, self.obj = stage, stage.asset.objects[part]
        self.hand = instantiate_hand(name=part + " friction-turn hand")
        axis = Vector(axis).normalized()
        world_axis = stage.asset.root.matrix_world.to_3x3() @ axis
        pivot = stage.native(pivot_mm)
        points = [self.obj.matrix_world @ vertex.co for vertex in self.obj.data.vertices]
        plane = max(point.dot(world_axis) for point in points)
        center = pivot + world_axis * (plane - pivot.dot(world_axis))
        up = Vector((0, 0, 1)) - world_axis * world_axis.z
        up.normalize()
        radius = max(((point - center) - world_axis * (point - center).dot(world_axis)).length for point in points)
        contact = center + up * radius * .52
        inverse = self.obj.matrix_world.inverted()
        self.local_contact = inverse @ contact
        inverse_rotation = inverse.to_3x3()
        self.local_axis = inverse_rotation @ world_axis
        self.local_wrist = inverse_rotation @ Vector(wrist)
        self.local_dorsal = inverse_rotation @ Vector(dorsal)
        self.fixed_wrist = Vector(wrist).normalized()
        self.fixed_dorsal = Vector(dorsal).normalized()
        self.follow_wrist_rotation = follow_wrist_rotation
        self.contact_radius_mm = min(4.0, radius * 300)
        self.measurement = self.contact()
        stage.contact_evidence.append({"part": part, "interaction": "index-pad friction turn",
                                       **self.measurement})
        self.show(False)

    def show(self, visible):
        for obj in self.hand.root.children_recursive:
            obj.hide_render = not visible

    def contact(self, distance=0):
        rotation = self.obj.matrix_world.to_3x3()
        axis = (rotation @ self.local_axis).normalized()
        wrist = ((rotation @ self.local_wrist).normalized() if self.follow_wrist_rotation
                 else self.fixed_wrist)
        dorsal = rotation @ self.local_dorsal if self.follow_wrist_rotation else self.fixed_dorsal
        orient_hand(self.hand, wrist, dorsal)
        self.measurement = align_index_pad_to_control(self.hand, self.obj.matrix_world @ self.local_contact,
                                                      axis, radius_mm=self.contact_radius_mm)
        if distance:
            transform = self.hand.root.matrix_world.copy()
            transform.translation += (axis + wrist * .35).normalized() * distance
            self.hand.root.matrix_world = transform
        return self.measurement


class TimerDigits:
    """Proposed changing numerals occupy the original timer_digits plane only."""
    SEGMENTS = {"0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg",
                "4": "bcfg", "5": "acdfg", "6": "acdefg", "7": "abc",
                "8": "abcdefg", "9": "abcdfg"}

    def __init__(self, stage):
        self.stage, self.objects = stage, []
        source = stage.asset.objects["timer_digits"]
        points = native_points(stage, "timer_digits")
        normal = Vector(top_normal(stage, "timer_digits", (0, -1, .2)))
        u = Vector((1, 0, 0))
        v = normal.cross(u).normalized()
        xmin, xmax = min(p.dot(u) for p in points), max(p.dot(u) for p in points)
        ymin, ymax = min(p.dot(v) for p in points), max(p.dot(v) for p in points)
        plane = max(p.dot(normal) for p in points) + .00008
        width, height = xmax - xmin, ymax - ymin
        unit = width / 4.78
        base = u * xmin + v * ymin + normal * plane
        material = source.active_material.copy()
        source.hide_render = True
        layouts = {"a": (.5, .96, .72, .065), "b": (.91, .73, .065, .35),
                   "c": (.91, .27, .065, .35), "d": (.5, .04, .72, .065),
                   "e": (.09, .27, .065, .35), "f": (.09, .73, .065, .35),
                   "g": (.5, .5, .72, .065)}
        cursor = 0
        for index in range(5):
            if index == 2:
                for cy in (.34, .67):
                    self._quad(base, u, v, cursor + unit * .13, cy * height,
                               unit * .10, height * .075, material, index, ":")
                cursor += unit * .38
                continue
            for segment, (cx, cy, w, h) in layouts.items():
                self._quad(base, u, v, cursor + cx * unit, cy * height,
                           w * unit, h * height, material, index, segment)
            cursor += unit * 1.10

    def _quad(self, base, u, v, x, y, w, h, material, index, segment):
        vertices = [tuple(base + u * (x + dx) + v * (y + dy))
                    for dx, dy in ((-w/2, -h/2), (w/2, -h/2), (w/2, h/2), (-w/2, h/2))]
        mesh = bpy.data.meshes.new("Proposed LCD numeral")
        mesh.from_pydata(vertices, [], [(0, 1, 2, 3)])
        mesh.update()
        obj = bpy.data.objects.new("Concept timer numeral", mesh)
        self.stage.asset.collection.objects.link(obj)
        obj.parent = self.stage.asset.root
        obj.data.materials.append(material)
        self.objects.append((index, segment, obj))

    def set(self, seconds):
        seconds = max(0, int(seconds))
        text = f"{seconds // 60:02}:{seconds % 60:02}"
        for index, segment, obj in self.objects:
            obj.hide_render = segment != ":" and segment not in self.SEGMENTS[text[index]]
