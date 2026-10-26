"""Interaction helpers owned by the four tabletop-game concept scenes.

Native geometry is retained. Reused -0.8 mm travel and electronic content are
illustrative proposed behavior, not physical validation or production claims.
"""
import math

import bpy


def smooth(start, end, t):
    if end <= start:
        return float(t >= end)
    u = max(0.0, min(1.0, (t-start)/(end-start)))
    return u*u*(3.0-2.0*u)


def pulse(t, start, end, edge=.12):
    return smooth(start, start+edge, t)*(1.0-smooth(end-edge, end, t))


class KeySequence:
    """One pointing hand per existing control, with offscreen approach/exit.

    Events are (key, begin, fully_down, hold_end, release_end, exit_end).
    Stage applies the native travel before the pointer solves the CURRENT cap.
    """
    def __init__(self, stage, pairs, events, *, radii=None,
                 wrist=(.85, -1.1, .8), retreat=.27, extra_clearance_mm=None):
        self.stage = stage
        self.pairs = pairs
        self.events = events
        self.retreat = retreat
        self.extra_clearance_mm = extra_clearance_mm or {}
        self.rigs = {}
        radii = radii or {}
        for key in dict.fromkeys(event[0] for event in events):
            direction = wrist[key] if isinstance(wrist, dict) else wrist
            self.rigs[key] = stage.pointer(pairs[key][0], normal=(0, 0, 1),
                                           wrist=direction, radius_mm=radii.get(key))
            self.rigs[key].show(False)
        self.parts = list(dict.fromkeys(name for pair in pairs.values() for name in pair))

    def update(self, t):
        self.stage.source(0.0, parts=self.parts)
        for rig in self.rigs.values():
            rig.show(False)
        amounts = {key: 0.0 for key in self.pairs}
        for key, begin, down, hold, release, end in self.events:
            if not begin <= t <= end:
                continue
            amount = smooth(down-.25, down, t)*(1.0-smooth(hold, release, t))
            self.stage.source(amount, parts=self.pairs[key])
            rig = self.rigs[key]
            rig.show(True)
            rig.contact(fraction=amount)
            distance = self.retreat*max(1.0-smooth(begin, down-.38, t),
                                        smooth(release+.08, end, t))
            rig.approach(distance)
            # Some original concept graphics are raised above the cap face.
            # Keep the real pad above that native relief rather than clipping it.
            if self.extra_clearance_mm.get(key):
                transform = rig.root.matrix_world.copy()
                transform.translation += rig.normal*(self.extra_clearance_mm[key]*.001)
                rig.root.matrix_world = transform
            amounts[key] = amount
        return amounts


class ExistingLight:
    """Cue the material of an existing light/cue-cap, without new hardware."""
    def __init__(self, stage, part_name, strength=1.35):
        self.object = stage.objects[part_name]
        self.strength = strength
        if not self.object.data.materials:
            self.object.data.materials.append(stage.material('Existing cue surface', '#A2A891'))
        material = self.object.data.materials[0].copy()
        material.name = part_name+' · illustrative local cue'
        material.use_nodes = True
        self.object.data.materials[0] = material
        self.shader = next(node for node in material.node_tree.nodes if node.type == 'BSDF_PRINCIPLED')
        base = self.shader.inputs['Base Color'].default_value
        self.color = tuple(base)
        self.shader.inputs['Emission Color'].default_value = self.color
        self.set(0)

    def set(self, amount):
        amount = max(0.0, min(1.0, float(amount)))
        self.shader.inputs['Emission Strength'].default_value = self.strength*amount


class NativeLCD:
    """Flat seven-segment CONTENT inside an existing reflective native LCD.

    The face, aperture and housing are untouched. Source raised digit artwork
    is hidden only while the replacement illustrative numeric content is used.
    """
    DIGITS = {
        '0': 'ab cdef'.replace(' ', ''), '1': 'bc', '2': 'abdeg',
        '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg',
        '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', ' ': ''
    }

    def __init__(self, stage, face_name, original_segments, digits=4):
        self.original = stage.objects[original_segments]
        face = stage.objects[face_name]
        points = [stage.asset.world_to_native(face.matrix_world @ vertex.co) for vertex in face.data.vertices]
        low = [min(point[axis] for point in points) for axis in range(3)]
        high = [max(point[axis] for point in points) for axis in range(3)]
        width, height = high[0]-low[0], high[1]-low[1]
        digit_h = height*.64
        digit_w = min(digit_h*.48, width/(digits*1.34))
        pitch = digit_w*1.30
        left = (low[0]+high[0])/2-(digits-1)*pitch/2
        cy = (low[1]+high[1])/2
        z = high[2]+.035
        thickness = digit_h*.072
        material = self.original.data.materials[0] if self.original.data.materials else stage.material('Reflective LCD ink', '#152A2D')
        self.segments = []
        horizontal = {'a': digit_h/2, 'g': 0.0, 'd': -digit_h/2}
        vertical = {'f': (-digit_w/2, digit_h/4), 'b': (digit_w/2, digit_h/4),
                    'e': (-digit_w/2, -digit_h/4), 'c': (digit_w/2, -digit_h/4)}
        for digit in range(digits):
            group = {}
            cx = left+digit*pitch
            for name in 'abcdefg':
                if name in horizontal:
                    x, y, w, h = cx, cy+horizontal[name], digit_w, thickness
                else:
                    dx, dy = vertical[name]
                    x, y, w, h = cx+dx, cy+dy, thickness, digit_h/2-thickness*.65
                coords = [(x-w/2, y-h/2, z), (x+w/2, y-h/2, z),
                          (x+w/2, y+h/2, z), (x-w/2, y+h/2, z)]
                mesh = bpy.data.meshes.new('LCD content segment')
                mesh.from_pydata([tuple(value*.001 for value in point) for point in coords], [], [(0, 1, 2, 3)])
                mesh.update()
                obj = bpy.data.objects.new('Illustrative LCD content · %d%s' % (digit, name), mesh)
                stage.asset.collection.objects.link(obj)
                obj.parent = stage.asset.root
                obj.data.materials.append(material)
                group[name] = obj
            self.segments.append(group)
        self.set('0012')

    def set(self, value):
        self.original.hide_render = True
        text = str(value).rjust(len(self.segments), '0')[-len(self.segments):]
        for digit, character in enumerate(text):
            visible = self.DIGITS.get(character, '')
            for name, obj in self.segments[digit].items():
                obj.hide_render = name not in visible


def key_pairs(prefix, names):
    return {name: (prefix+name+'_keycap', prefix+name+'_own_legend') for name in names}


def camera_dolly(stage, t, direction, *, wide=1.42, close=1.26, begin=1.0, end=4.0):
    stage.set_camera(direction=direction, margin=wide+(close-wide)*smooth(begin, end, t))
