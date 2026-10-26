"""Local CGI props/timing for the five capture and puzzle scenes; no render calls."""
import math
import bpy
from mathutils import Matrix, Vector


def ease(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def ramp(t, start, end):
    return ease((t - start) / (end - start))


def press(t, start, down, release, end):
    return ramp(t, start, down) * (1.0 - ramp(t, release, end))


def pointer_pose(pointer, visible, clearance=0.0, offset=(0, 0, 0)):
    pointer.show(visible)
    if visible:
        pointer.approach(clearance)
        transform = pointer.root.matrix_world.copy()
        transform.translation += Vector(offset)
        pointer.root.matrix_world = transform


def visible(root, value):
    for obj in (root, *root.children_recursive):
        obj.hide_render = not value
        obj.hide_set(not value)


def native_rotation(obj, pivot_mm, axis, angle):
    pivot = Vector(pivot_mm) * .001
    obj.matrix_basis = (Matrix.Translation(pivot)
                        @ Matrix.Rotation(angle, 4, Vector(axis))
                        @ Matrix.Translation(-pivot))


def camera(stage, direction, margin=1.3, target=None, scale=1.0):
    stage.set_camera(direction=direction, margin=margin, target_mm=target)
    if scale != 1:
        if target is None:
            points = [obj.matrix_world @ Vector(corner) for obj in stage.objects.values()
                      if obj.get('native_role') != 'envelope' for corner in obj.bound_box]
            target_world = Vector(tuple((min(p[k] for p in points) + max(p[k] for p in points)) / 2
                                        for k in range(3)))
        else:
            target_world = stage.native(target)
        stage.camera.location = target_world + (stage.camera.location - target_world) * scale


def mix(a, b, fraction):
    return tuple(x + (y - x) * fraction for x, y in zip(a, b))


def native_center(stage, name):
    obj = stage.objects[name]
    points = [stage.asset.world_to_native(obj.matrix_world @ Vector(p)) for p in obj.bound_box]
    return tuple((min(p[k] for p in points) + max(p[k] for p in points)) / 2 for k in range(3))


def mesh(stage, name, vertices, faces, material, *, parent=None, origin=(0, 0, 0)):
    data = bpy.data.meshes.new(name)
    data.from_pydata([tuple(v * .001 for v in point) for point in vertices], [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    stage.scene.collection.objects.link(obj)
    data.materials.append(material)
    if parent is None:
        obj.location = stage.native(origin)
    else:
        obj.parent = parent
        obj.location = Vector(origin) * .001
    return obj


def box(stage, name, size, material, *, parent=None, origin=(0, 0, 0)):
    x, y, z = (v / 2 for v in size)
    vertices = [(-x,-y,-z),(x,-y,-z),(x,y,-z),(-x,y,-z),
                (-x,-y,z),(x,-y,z),(x,y,z),(-x,y,z)]
    faces = [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    return mesh(stage, name, vertices, faces, material, parent=parent, origin=origin)


def prop_root(stage, name, origin):
    root = stage.empty(name)
    root.location = stage.native(origin)
    root['illustrative_cgi_prop'] = True
    return root


def sphere(stage, name, radius, material, *, parent, origin=(0, 0, 0)):
    n, rings = 20, 10
    vertices = [(0, 0, radius)]
    for j in range(1, rings):
        angle = math.pi * j / rings
        for i in range(n):
            theta = 2 * math.pi * i / n
            vertices.append((radius * math.sin(angle) * math.cos(theta),
                             radius * math.sin(angle) * math.sin(theta), radius * math.cos(angle)))
    bottom = len(vertices)
    vertices.append((0, 0, -radius))
    faces = [(0, 1+i, 1+(i+1)%n) for i in range(n)]
    for j in range(rings-2):
        a, b = 1+j*n, 1+(j+1)*n
        faces += [(a+i,b+i,b+(i+1)%n,a+(i+1)%n) for i in range(n)]
    last = 1+(rings-2)*n
    faces += [(bottom,last+(i+1)%n,last+i) for i in range(n)]
    obj = mesh(stage,name,vertices,faces,material,parent=parent,origin=origin)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def cylinder(stage, name, radius, height, material, *, parent, origin=(0,0,0), cone=False):
    n = 24
    vertices = [(radius*math.cos(i*2*math.pi/n),radius*math.sin(i*2*math.pi/n),-height/2) for i in range(n)]
    if cone:
        vertices.append((0,0,height/2))
        faces = [(i,(i+1)%n,n) for i in range(n)] + [tuple(reversed(range(n)))]
    else:
        vertices += [(x,y,height/2) for x,y,_ in vertices[:n]]
        faces = [(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
        faces += [tuple(reversed(range(n))),tuple(range(n,2*n))]
    return mesh(stage,name,vertices,faces,material,parent=parent,origin=origin)


def still_life(stage, name, origin, scale=1):
    """An original solid wooden-shape subject, never a photograph or image plane."""
    root = prop_root(stage,name,origin)
    wood = stage.material(name+' wood','#c99c67',roughness=.6)
    red = stage.material(name+' coral','#b76246',roughness=.45)
    mint = stage.material(name+' sage','#6e9383',roughness=.5)
    gold = stage.material(name+' ochre','#d0a046',roughness=.5)
    box(stage,name+' block',(20,20,20),wood,parent=root,origin=(-12,0,10))
    sphere(stage,name+' ball',9,red,parent=root,origin=(-12,0,29))
    cylinder(stage,name+' cylinder',9,26,mint,parent=root,origin=(14,0,13))
    cylinder(stage,name+' cone',12,16,gold,parent=root,origin=(14,0,34),cone=True)
    root.scale = (scale,scale,scale)
    return root


def curve(stage, name, points, radius, material, *, parent=None):
    data = bpy.data.curves.new(name,'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 1
    data.bevel_depth = radius*.001
    data.bevel_resolution = 2
    spline = data.splines.new('POLY')
    spline.points.add(len(points)-1)
    for point, xyz in zip(spline.points,points):
        value = Vector(xyz)*.001 if parent else stage.native(xyz)
        point.co = (*value,1)
    obj = bpy.data.objects.new(name,data)
    stage.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    data.materials.append(material)
    return obj


def dry_leaf(stage,name,origin,width=34,length=56,preview=False):
    """A closed thin 3D dry leaf and raised veins, including its CGI display copy."""
    root = prop_root(stage,name,origin)
    leaf_mat = stage.material(name+' lamina','#977344',roughness=.72)
    vein_mat = stage.material(name+' veins','#543d24',roughness=.7)
    if preview:
        for material in (leaf_mat,vein_mat):
            shader = material.node_tree.nodes.get('Principled BSDF')
            if shader and 'Emission Strength' in shader.inputs:
                shader.inputs['Emission Color'].default_value = shader.inputs['Base Color'].default_value
                shader.inputs['Emission Strength'].default_value = .18
        root['illustrative_display_content'] = True
    n = 16
    top = []
    for j in range(n+1):
        f = j/n
        half = width*.5*math.sin(math.pi*f)**.72 + .08
        y = (f-.5)*length
        curl = .45*math.sin(3*math.pi*f)
        top += [(-half,y,curl),(0,y,curl+.55),(half,y,curl)]
    vertices = top + [(x,y,z-.4) for x,y,z in top]
    offset = len(top)
    faces = []
    for j in range(n):
        for k in range(2):
            a,b = j*3+k,(j+1)*3+k
            faces += [(a,a+1,b+1,b),(offset+a,offset+b,offset+b+1,offset+a+1)]
        for k in (0,2):
            a,b = j*3+k,(j+1)*3+k
            faces.append((a,b,offset+b,offset+a))
    faces += [(0,offset,offset+2,2),(n*3,n*3+2,offset+n*3+2,offset+n*3)]
    mesh(stage,name+' leaf surface',vertices,faces,leaf_mat,parent=root)
    curve(stage,name+' midrib',[(0,(j/n-.5)*length,.45*math.sin(3*math.pi*j/n)+.8) for j in range(n+1)],.22,vein_mat,parent=root)
    for f in (.2,.32,.44,.56,.68,.8):
        half = width*.48*math.sin(math.pi*f)**.72
        y = (f-.5)*length
        for sign in (-1,1):
            curve(stage,name+f' lateral vein {f} {sign}',[(0,y,.8),(sign*half*.55,y+length*.055,.75),(sign*half,y+length*.09,.55)],.11,vein_mat,parent=root)
    return root


class ElapsedDigits:
    """Small solid seven-segment CGI numerals on an existing native LCD only."""
    patterns = ['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg']

    def __init__(self,stage,origin):
        self.root = prop_root(stage,'Illustrative elapsed LCD',origin)
        self.root['illustrative_display_content'] = True
        material = stage.material('Elapsed LCD dark segments','#213c43',roughness=.5)
        self.segments = []
        for digit,x in enumerate((-10.5,-4.5,4.5,10.5)):
            group = {}
            positions = {'a':(0,3.5),'g':(0,0),'d':(0,-3.5),
                         'f':(-1.8,1.75),'b':(1.8,1.75),'e':(-1.8,-1.75),'c':(1.8,-1.75)}
            for label,(dx,dy) in positions.items():
                size = (3.2,.5,.08) if label in 'agd' else (.5,2.8,.08)
                group[label] = box(stage,f'Elapsed digit {digit} {label}',size,material,
                                   parent=self.root,origin=(x+dx,dy,0))
            self.segments.append(group)
        for y in (-1.4,1.4):
            box(stage,'Elapsed colon',(.65,.65,.08),material,parent=self.root,origin=(0,y,0))

    def show_seconds(self,seconds):
        seconds = max(0,min(5999,int(seconds)))
        digits = f'{seconds//60:02d}{seconds%60:02d}'
        for group,digit in zip(self.segments,digits):
            pattern = self.patterns[int(digit)]
            for label,obj in group.items():
                obj.hide_render = label not in pattern
                obj.hide_set(label not in pattern)


def wired_connection(stage,name,port,side=1):
    """A static adult-managed cable cutaway beat, not an insertion/grip claim."""
    root = prop_root(stage,name,port)
    metal = stage.material(name+' connector metal','#969c9c',roughness=.3)
    jacket = stage.material(name+' cable jacket','#29383b',roughness=.65)
    box(stage,name+' simple connector',(7,7,4.5),metal,parent=root,origin=(side*2.5,0,0))
    box(stage,name+' strain relief',(9,10,7),jacket,parent=root,origin=(side*9,0,0))
    curve(stage,name+' cable',[(side*13,0,0),(side*24,1,-1),(side*40,8,-7),(side*60,24,-12)],
          1.7,jacket,parent=root)
    root['connection_status'] = 'Illustrative connection at the native proposed wired aperture; no fit validation'
    return root


def audit_contact(stage):
    """CPU-only evaluated whole-hand/cuff solid-containment and framing check.

    Call after update(t). This inspects actual deformed vertices, not the finite
    fingertip calibration plane. Distances <=.05mm are treated as surface contact.
    No rendering, file writes, or native geometry modification occurs.
    """
    from mathutils.bvhtree import BVHTree
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    direction = Vector((1,.371,.197)).normalized()
    cache = getattr(stage,'_capture_audit_cache',{})
    stage._capture_audit_cache = cache

    def bounds(points):
        return ([min(p[k] for p in points) for k in range(3)],
                [max(p[k] for p in points) for k in range(3)])

    def inside(tree,point):
        point = point.copy()
        count = 0
        for _ in range(64):
            hit,normal,index,distance = tree.ray_cast(point,direction,10)
            if hit is None:
                break
            count += 1
            point = hit + direction*1e-7
        return count % 2 == 1

    table = bpy.data.objects.get('Studio tabletop')
    tabletop = max((table.matrix_world@Vector(c)).z for c in table.bound_box) if table else -.0005
    actors, allpoints = [], []
    for pointer in stage.pointers:
        if pointer.hand.skin.hide_render:
            continue
        for label,obj in [('skin',pointer.hand.skin),('cuff',pointer.hand.cuff)]:
            evaluated = obj.evaluated_get(depsgraph)
            data = evaluated.to_mesh()
            points = [evaluated.matrix_world@v.co for v in data.vertices]
            evaluated.to_mesh_clear()
            allpoints.extend(points)
            projected = [world_to_camera_view(stage.scene,stage.camera,p) for p in points]
            low,high = bounds(projected)
            actors.append({'part':pointer.part.name,'type':label,'vertices':len(points),
                'tableDepthMm':round(max(0,tabletop-min(p.z for p in points))*1000,3),
                'clipXY':[[round(low[k],3),round(high[k],3)] for k in range(2)],
                'outsidePercent':round(100*sum(p.x<0 or p.x>1 or p.y<0 or p.y>1 or p.z<=0
                                             for p in projected)/len(projected),2)})
    collisions = []
    for name,obj in stage.objects.items():
        if obj.get('native_role') == 'envelope' or obj.hide_render:
            continue
        low,high = bounds([obj.matrix_world@Vector(c) for c in obj.bound_box])
        candidates = [p for p in allpoints if all(low[k]-1e-7<=p[k]<=high[k]+1e-7 for k in range(3))]
        if not candidates:
            continue
        key = (name,tuple(v for row in obj.matrix_world for v in row))
        tree = cache.get(key)
        if tree is None:
            tree = BVHTree.FromPolygons([obj.matrix_world@v.co for v in obj.data.vertices],
                                        [tuple(face.vertices) for face in obj.data.polygons])
            cache[key] = tree
        depths = []
        for point in candidates:
            nearest = tree.find_nearest(point)
            if nearest[0] is not None and nearest[3]>.00005 and inside(tree,point):
                depths.append(nearest[3]*1000)
        if depths:
            collisions.append({'part':name,'vertices':len(depths),'maxDepthMm':round(max(depths),3)})
    return {'actors':actors,'collisions':collisions}
