"""Matte ergonomic head reference; this is context, not validated fit geometry.

Modified Infinite 3D Head Scan by Lee Perry-Smith, CC BY 3.0, from the
three.js r173 examples / LeePerrySmith model. Colour and scale are modified.
Attribution is retained in film metadata and the linked website media credits.
"""
from pathlib import Path
import bpy
from mathutils import Vector,Matrix

def head_reference(stage, *, width=.135, height=.205, top=.160, location=(0,0,0)):
    file=stage.rootpath/'work/concept-demos-3d/three-source/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb'
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(file))
    meshes=[o for o in set(bpy.data.objects)-before if o.type=='MESH']
    parent=stage.empty('Matte use-context head reference')
    mat=stage.material('Neutral ceramic use context','#A9A8A0',.72)
    for obj in meshes:
        points=[obj.matrix_world@v.co for v in obj.data.vertices]
        low=Vector(tuple(min(v[k]for v in points)for k in range(3)))
        high=Vector(tuple(max(v[k]for v in points)for k in range(3)))
        # The scan includes shoulders. Fit the cranial/ear region, never the
        # much wider bust, when expressing a neutral head-width reference.
        cranial=[p for p in points if p.z>low.z+(high.z-low.z)*.40]
        cranial_width=max(p.x for p in cranial)-min(p.x for p in cranial)
        sx=width/cranial_width
        sz=(height/(high.z-low.z)) if height is not None else sx
        for vertex,point in zip(obj.data.vertices,points):
            vertex.co=((point.x-(low.x+high.x)/2)*sx,
                       (point.y-(low.y+high.y)/2)*sx,
                       top+(point.z-high.z)*sz)
        obj.matrix_world=Matrix.Identity(4)
        obj.parent=parent
        obj.name='Matte anatomical reference · modified Lee Perry-Smith'
        obj.data.materials.clear();obj.data.materials.append(mat)
        for polygon in obj.data.polygons:polygon.use_smooth=True
        sub=obj.modifiers.new('Smooth reference surface','SUBSURF');sub.levels=sub.render_levels=1
    parent.location=location
    parent['source_credit']='Infinite 3D Head Scan by Lee Perry-Smith, CC BY 3.0; modified neutral colour and proportions'
    points=[v.co.copy()for o in meshes for v in o.data.vertices]
    low=Vector(tuple(min(p[k]for p in points)for k in range(3)))
    high=Vector(tuple(max(p[k]for p in points)for k in range(3)))
    ear_band=[p for p in points if low.z+(high.z-low.z)*.61<p.z<low.z+(high.z-low.z)*.86]
    xmax=max(p.x for p in ear_band)
    ear_points=[p for p in ear_band if p.x>xmax-.003]
    ear=sum(ear_points,Vector())/len(ear_points)
    mouth_z=ear.z-(high.z-low.z)*.12
    mouth_points=[p for p in points if abs(p.x)<width*.11 and abs(p.z-mouth_z)<.006]
    mouth_y=min(p.y for p in mouth_points)
    parent['ear_local']=list(ear)
    parent['mouth_local']=[0,mouth_y,mouth_z]
    return parent,meshes
