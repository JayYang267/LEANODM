"""Conservative native-state cache: reuse pixels only for identical scene states.

The immutable digest covers geometry, bind weights, modifiers, shader graph,
world and render configuration. Per-frame state covers visible objects, skin
poses, shader values and camera/light parameters. No interpolation is used.
"""
import array,hashlib,json
import bpy

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def value(v):
    if isinstance(v,(str,int,float,bool)) or v is None:return v
    try:return [value(x)for x in v]
    except TypeError:return str(v.name) if hasattr(v,'name')else str(v)

def properties(data):
    out={}
    for prop in data.bl_rna.properties:
        name=prop.identifier
        if name in {'rna_type','name','name_full','filepath','filepath_raw'}or prop.type in {'COLLECTION'}:continue
        try:out[name]=value(getattr(data,name))
        except (TypeError,ValueError,AttributeError):pass
    return out

def nodes(tree,include_values):
    if not tree:return None
    return {'nodes':[[n.name,n.bl_idname,
        [[s.name,value(s.default_value)]for s in n.inputs if hasattr(s,'default_value')] if include_values else [s.name for s in n.inputs],
        getattr(n,'operation',None),getattr(n,'blend_type',None),
        getattr(n.image,'filepath',None)if hasattr(n,'image')and n.image else None]
        for n in sorted(tree.nodes,key=lambda n:n.name)],
        'links':sorted([l.from_node.name,l.from_socket.identifier,l.to_node.name,l.to_socket.identifier]for l in tree.links)}

def immutable_digest(scene,details=False):
    rows=[]
    for obj in sorted(bpy.data.objects,key=lambda o:o.name):
        row=[obj.name,obj.type]
        if obj.type=='MESH':
            mesh=obj.data
            coordinates=array.array('f',[0])*(len(mesh.vertices)*3)
            mesh.vertices.foreach_get('co',coordinates)
            topology=array.array('I',[0])*len(mesh.loops)
            mesh.loops.foreach_get('vertex_index',topology)
            faces=[[p.loop_start,p.loop_total,p.material_index,p.use_smooth]for p in mesh.polygons]
            row.extend([hashlib.sha256(coordinates.tobytes()+topology.tobytes()).hexdigest(),faces,
                [[v.index,[[g.group,g.weight]for g in v.groups]]for v in mesh.vertices if v.groups],
                [[g.name,g.index]for g in obj.vertex_groups],
                [properties(m)for m in obj.modifiers],
                [m.name if m else None for m in mesh.materials]])
        elif obj.type=='ARMATURE':
            row.append([[b.name,list(v for r in b.matrix_local for v in r)]for b in obj.data.bones])
        elif obj.type in {'CURVE','FONT'}:row.append(properties(obj.data))
        rows.append(row)
    materials=[[m.name,nodes(m.node_tree,False)]for m in sorted(bpy.data.materials,key=lambda m:m.name)if m.users]
    settings={k:getattr(scene.render,k)for k in ('engine','resolution_x','resolution_y','resolution_percentage','film_transparent')}
    settings['cycles']={k:getattr(scene.cycles,k)for k in ('samples','seed','use_animated_seed','use_denoising','denoiser','use_adaptive_sampling','adaptive_threshold','max_bounces','diffuse_bounces','glossy_bounces','transmission_bounces','transparent_max_bounces')}
    settings['view']={k:getattr(scene.view_settings,k)for k in ('view_transform','look','exposure','gamma')}
    if details:
        return {**{row[0]:digest(row)for row in rows},'SHADERS':digest(materials),'WORLD':digest(nodes(scene.world.node_tree,False)),'RENDER':digest(settings)}
    return digest([rows,materials,nodes(scene.world.node_tree,False),settings])

def frame_digest(scene,immutable):
    rows=[]
    for obj in sorted(bpy.data.objects,key=lambda o:o.name):
        if obj.hide_render or obj.type not in {'MESH','CURVE','FONT','LIGHT','CAMERA'}:continue
        row=[obj.name,[v for r in obj.matrix_world for v in r]]
        for mod in obj.modifiers:
            if mod.type=='ARMATURE' and mod.object:
                row.append([[b.name,[v for r in b.matrix for v in r]]for b in mod.object.pose.bones])
        if obj.type=='CAMERA':
            row.append({k:getattr(obj.data,k)for k in ('type','lens','ortho_scale','shift_x','shift_y','sensor_width','sensor_height','sensor_fit','clip_start','clip_end')})
            row.append({k:getattr(obj.data.dof,k)for k in ('use_dof','focus_distance','aperture_fstop','aperture_blades','aperture_rotation','aperture_ratio')})
        elif obj.type=='LIGHT':
            row.append({k:value(getattr(obj.data,k))for k in ('type','energy','color','shadow_soft_size','size','size_y','shape','spread')if hasattr(obj.data,k)})
            row.append(nodes(obj.data.node_tree,True))
        rows.append(row)
    materials=[[m.name,nodes(m.node_tree,True)]for m in sorted(bpy.data.materials,key=lambda m:m.name)if m.users]
    return digest([immutable,rows,materials,nodes(scene.world.node_tree,True)])
