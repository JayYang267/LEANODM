"""CPU proof that hand visibility switches occur outside the render frustum.

Clip evaluated render triangles, not just projected vertices or bounding boxes.
The routine is read-only apart from selecting the already-baked frame.
"""
import bpy
import numpy as np
from mathutils import Vector


def projected_render_geometry(obj, scene):
    for modifier in obj.modifiers:
        if modifier.show_render != modifier.show_viewport:
            raise ValueError(f'{obj.name}: viewport/render modifier mismatch')
        if modifier.type == 'SUBSURF' and modifier.levels != modifier.render_levels:
            raise ValueError(f'{obj.name}: render subdivision differs from evaluated audit')
    graph = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(graph)
    mesh = evaluated.to_mesh()
    try:
        mesh.calc_loop_triangles()
        if not mesh.loop_triangles:
            return 0, 0
        transform = scene.camera.matrix_world.inverted() @ evaluated.matrix_world
        points = np.array([tuple(transform @ v.co) for v in mesh.vertices], dtype=np.float64)
        corners = list(scene.camera.data.view_frame(scene=scene))
        normals = []
        for i in range(4):
            normal = corners[i].cross(corners[(i + 1) % 4]).normalized()
            if normal.dot(Vector((0, 0, -1))) < 0:
                normal = -normal
            normals.append(tuple(normal))
        normals += [(0, 0, -1), (0, 0, 1)]
        offsets = np.array([0, 0, 0, 0, -scene.camera.data.clip_start, scene.camera.data.clip_end], dtype=np.float64)
        normals = np.array(normals, dtype=np.float64)
        distances = points @ normals.T + offsets
        vertices = int(np.all(distances >= -1e-9, axis=1).sum())
        triangles = np.array([tuple(t.vertices) for t in mesh.loop_triangles], dtype=np.int32)
        d = distances[triangles]
        possible = ~np.any(np.all(d < -1e-9, axis=1), axis=1)
        inside = np.all(d >= 0, axis=(1, 2))
        count = int(inside.sum())
        for triangle in triangles[possible & ~inside]:
            polygon = [points[i] for i in triangle]
            for normal, offset in zip(normals, offsets):
                clipped = []
                for a, b in zip(polygon, polygon[1:] + polygon[:1]):
                    da, db = float(a @ normal + offset), float(b @ normal + offset)
                    if da >= 0:
                        clipped.append(a)
                    if (da >= 0) != (db >= 0):
                        clipped.append(a + (b - a) * (da / (da - db)))
                polygon = clipped
                if not polygon:
                    break
            if len(polygon) >= 3:
                count += 1
        return vertices, count
    finally:
        evaluated.to_mesh_clear()


def inspect_hand_visibility(scene, hands, frame_count):
    meshes = {obj.name: obj for hand in hands for obj in (hand.skin, hand.cuff)}
    previous, events = {}, []
    for frame in range(1, frame_count + 1):
        scene.frame_set(frame)
        for name, obj in meshes.items():
            visible = not obj.hide_render
            if name in previous and visible != previous[name]:
                events.append((frame, name, visible))
            previous[name] = visible
    rows = []
    for switch_frame, name, visible_after in events:
        check_frame = switch_frame if visible_after else switch_frame - 1
        scene.frame_set(check_frame)
        bpy.context.view_layer.update()
        vertices, triangles = projected_render_geometry(meshes[name], scene)
        rows.append({'switchFrame': switch_frame, 'switchTime': (switch_frame - 1) / 24,
                     'checkVisibleFrame': check_frame, 'mesh': name,
                     'visibleAfter': visible_after, 'projectedVertices': vertices,
                     'projectedRenderTriangles': triangles})
    blocked = [row for row in rows if row['projectedRenderTriangles'] > 0]
    return {'status': 'BLOCKED' if blocked else 'PASS', 'framesChecked': frame_count,
            'method': 'Evaluated render triangles clipped against all six camera planes at every first-visible/last-visible hand and cuff frame.',
            'switches': rows, 'blockingSwitches': blocked}
