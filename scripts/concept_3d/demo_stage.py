"""Shared photographic stage and exact skin-contact actors for concept films."""
from __future__ import annotations
import math
from pathlib import Path
import bpy
import bmesh
from mathutils import Matrix, Vector
from bpy_extras.object_utils import world_to_camera_view
from .native_scene import load_native_concept, world_bounds, apply_source_action
from .articulated_hand import instantiate_hand, orient_hand, align_index_pad_to_control

ROOT = Path(__file__).resolve().parents[2]

def smooth(a, b, t):
    if a == b:
        return float(t >= b)
    u = min(1., max(0., (t-a)/(b-a)))
    return u*u*(3-2*u)

def pulse(t, start, down, up, end):
    return smooth(start, down, t)*(1-smooth(up, end, t))

def linear(v):
    return v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4

def material(name, color, roughness=.34, *, emission=0, skin=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    rgba = tuple(linear(int(color[i:i+2],16)/255) for i in (1,3,5))+(1,)
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = rgba
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Specular IOR Level'].default_value = .35
    if emission:
        p.inputs['Emission Color'].default_value = rgba
        p.inputs['Emission Strength'].default_value = emission
    if skin:
        p.inputs['Subsurface Weight'].default_value = .12
        p.inputs['Subsurface Radius'].default_value = (1,.42,.22)
        p.inputs['Subsurface Scale'].default_value = .012
    return m

def empty(name):
    o = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(o)
    return o

class Pointer:
    """One real skinned finger, calibrated against the operated native face."""
    def __init__(self, stage, part_name, normal=(0,0,1), wrist=None,
                 radius_mm=None, center_mm=None, name=None):
        self.stage = stage
        self.part = stage.objects[part_name]
        self.hand = instantiate_hand(name=name or (part_name+' operator'),
            skin_material=material('Skin · '+part_name,'#D49A78',.43,skin=True),
            cuff_material=material('Cotton · '+part_name,'#D7D8D4',.82))
        self.root = self.hand.root
        self.normal = (stage.asset.root.matrix_world.to_3x3() @ Vector(normal)).normalized()
        if wrist is None:
            tangent = Vector((0,-1,0))
            tangent -= self.normal*tangent.dot(self.normal)
            if tangent.length < .1:
                tangent = Vector((1,0,.3))
                tangent -= self.normal*tangent.dot(self.normal)
            self.wrist = (self.normal*.5+tangent.normalized()*.85).normalized()
        else:
            self.wrist = (stage.asset.root.matrix_world.to_3x3() @ Vector(wrist)).normalized()
        orient_hand(self.hand, self.wrist, self.normal)
        vertices = [self.part.matrix_world@v.co for v in self.part.data.vertices]
        if center_mm is not None:
            center = stage.native(center_mm)
        else:
            top = max(v.dot(self.normal) for v in vertices)
            face = [v for v in vertices if top-v.dot(self.normal)<.0003]
            center = sum(face, Vector())/len(face)
            center += self.normal*(top-center.dot(self.normal))
        if radius_mm is None:
            tangent = self.wrist-self.normal*self.wrist.dot(self.normal)
            tangent.normalize()
            tangent2 = self.normal.cross(tangent).normalized()
            spans = [max(v.dot(a) for v in vertices)-min(v.dot(a) for v in vertices)
                     for a in (tangent,tangent2)]
            radius_mm = max(1.0,min(spans)*500*.80)
        self.radius_mm = radius_mm
        self.measurement = align_index_pad_to_control(self.hand,center,self.normal,
            radius_mm=radius_mm,skin_gap_mm=.05)
        self.rest = self.root.matrix_world.copy()
        self.part_rest = self.part.matrix_world.copy()
        self.center = center
        self.stage.contact_evidence.append({'part':part_name,**self.measurement})
        self.show(False)

    def current(self):
        return self.part.matrix_world@self.part_rest.inverted()@self.rest

    def contact(self, fraction=0, offset=(0,0,0)):
        transform = self.current()
        transform.translation += Vector(offset)
        self.root.matrix_world = transform
        return self.root.matrix_world.copy()

    def approach(self, distance_metres):
        direction = (self.wrist+self.normal*.6).normalized()
        return self.contact(offset=direction*distance_metres)

    def show(self, visible):
        self.hand.skin.hide_render = not visible
        self.hand.cuff.hide_render = not visible

class Stage:
    def __init__(self, slug, width=1920, samples=32):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        self.rootpath = ROOT
        self.scene = s = bpy.context.scene
        s.render.engine = 'CYCLES'
        s.cycles.samples = samples
        s.cycles.use_denoising = True
        s.cycles.denoiser = 'OPTIX'
        s.cycles.use_animated_seed = False
        s.render.use_persistent_data = True
        s.cycles.max_bounces = 6
        s.cycles.diffuse_bounces = s.cycles.glossy_bounces = 3
        p = bpy.context.preferences.addons['cycles'].preferences
        p.compute_device_type = 'OPTIX'
        p.get_devices()
        for d in p.devices:
            d.use = d.type == 'OPTIX'
        s.cycles.device = 'GPU'
        s.render.resolution_x = width
        s.render.resolution_y = round(width*9/16)
        s.render.resolution_percentage = 100
        s.render.fps = 24
        s.render.image_settings.file_format = 'PNG'
        s.render.image_settings.color_mode = 'RGB'
        s.render.image_settings.compression = 25
        s.view_settings.view_transform = 'AgX'
        s.view_settings.look = 'AgX - Medium High Contrast'
        s.view_settings.exposure = -.75
        s.world = bpy.data.worlds.new('Soft ivory studio')
        s.world.use_nodes = True
        s.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.78,.82,.86,1)
        s.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .25
        self.asset = load_native_concept(slug)
        self.objects = self.asset.objects
        self.contact_evidence = []
        self.pointers = []
        for o in self.objects.values():
            bm = bmesh.new();bm.from_mesh(o.data)
            bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.0000001)
            bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
            for e in bm.edges:
                if e.is_manifold:
                    e.smooth = e.calc_face_angle()<math.radians(35)
            bm.to_mesh(o.data);bm.free()
        low, high = world_bounds(self.asset)
        self.dimensions = high-low
        self.focus = (low+high)/2
        # Same approved lighting ratios, scaled with physical product size.
        scale = max(self.dimensions.length/.23,.6)
        self.studio_scale = scale
        self._table()
        self._area('Large window',(-.28,-.30,.55),8,.40,(1,.94,.86),scale)
        self._area('Soft fill',(.35,-.05,.30),3,.30,(.85,.93,1),scale)
        self._area('Back reflection',(.05,.35,.45),6,.25,(1,.98,.92),scale)
        bpy.ops.object.camera_add()
        self.camera = bpy.context.object
        self.camera.name = 'Camera · product interaction'
        self.camera.data.lens = 52
        self.camera.data.clip_start = .001
        self.camera.data.clip_end = 100
        s.camera = self.camera
        self.set_camera()

    material = staticmethod(material)
    empty = staticmethod(empty)

    def native(self, mm):
        return self.asset.native_to_world(mm)

    def _table(self):
        m = material('Pale ash studio surface','#DCD6C8',.6)
        nt=m.node_tree
        noise=nt.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=55
        noise.inputs['Detail'].default_value=3
        mapping=nt.nodes.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY'
        mapping.inputs[1].default_value=(2,90,7)
        coord=nt.nodes.new('ShaderNodeTexCoord')
        nt.links.new(coord.outputs['Generated'],mapping.inputs[0])
        nt.links.new(mapping.outputs['Vector'],noise.inputs['Vector'])
        ramp=nt.nodes.new('ShaderNodeValToRGB')
        for element,color,position in zip(ramp.color_ramp.elements,('#C7BDA8','#E9E3D8'),(.15,.85)):
            element.position=position
            element.color=tuple(linear(int(color[i:i+2],16)/255) for i in (1,3,5))+(1,)
        nt.links.new(noise.outputs['Fac'],ramp.inputs[0])
        nt.links.new(ramp.outputs['Color'],nt.nodes['Principled BSDF'].inputs['Base Color'])
        bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,-.018))
        table=bpy.context.object;table.name='Studio tabletop'
        table.dimensions=(5,5,.035)
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        table.data.materials.append(m)

    def _area(self,name,pos,power,size,color,scale):
        light=bpy.data.lights.new(name,'AREA')
        light.energy=power*scale*scale;light.shape='DISK';light.size=size*scale;light.color=color
        o=bpy.data.objects.new(name,light);self.scene.collection.objects.link(o)
        o.location=Vector(pos)*scale
        o.rotation_euler=(self.focus-o.location).to_track_quat('-Z','Y').to_euler()

    def set_camera(self,direction=(3,-4,2.5),margin=1.3,target_mm=None):
        low,high=world_bounds(self.asset)
        target=self.native(target_mm) if target_mm is not None else (low+high)/2
        direction=Vector(direction).normalized()
        corners=[Vector((x,y,z)) for x in (low.x,high.x) for y in (low.y,high.y) for z in (low.z,high.z)]
        distance=max((high-low).length*1.1,.1)
        self.camera.data.type='PERSP'
        padding=(1-1/margin)/2
        for _ in range(70):
            self.camera.location=target+direction*distance
            self.camera.rotation_euler=(target-self.camera.location).to_track_quat('-Z','Y').to_euler()
            bpy.context.view_layer.update()
            projected=[world_to_camera_view(self.scene,self.camera,p) for p in corners]
            if all(padding<=p.x<=1-padding and padding<=p.y<=1-padding and p.z>0 for p in projected):
                break
            distance*=1.04
        return self.camera

    def source(self,fraction,parts=None):
        if parts is None:
            return apply_source_action(self.asset,fraction)
        # Independent control families retain the source illustrative key stroke.
        f=max(0.,min(1.,float(fraction)))
        selected=set(parts)
        first_translation=next((m.translation_mm for m in self.asset.motions if m.translation_mm is not None),None)
        by_name={m.part:m for m in self.asset.motions}
        for name in selected:
            o=self.objects[name]
            motion=by_name.get(name)
            if motion and motion.translation_mm is not None:
                delta=Vector(motion.translation_mm)*.001*f
                o.matrix_basis=Matrix.Translation(delta)@self.asset.base_matrices[name]
            elif motion:
                pivot=Vector(motion.pivot_mm)*.001
                o.matrix_basis=Matrix.Translation(pivot)@Matrix.Rotation(math.radians(motion.angle_deg)*f,4,Vector(motion.axis))@Matrix.Translation(-pivot)@self.asset.base_matrices[name]
            elif first_translation is not None:
                o.matrix_basis=Matrix.Translation(Vector(first_translation)*(.001*f))@self.asset.base_matrices[name]
                o['illustrative_reused_key_stroke']=True
            else:
                raise ValueError('No original motion available for '+name)
        bpy.context.view_layer.update()

    def pointer(self,part_name,normal=(0,0,1),wrist=None,radius_mm=None,center_mm=None,**kwargs):
        p=Pointer(self,part_name,normal,wrist,radius_mm,center_mm,**kwargs)
        self.pointers.append(p)
        return p
