"""Build the original tabletop set and render plates used by finish.py.
Run Blender 4.5 in background with -P scene.py -- <plate directory>.
"""
import math, os, sys
from pathlib import Path
import bpy
from mathutils import Vector
from math import sin, cos, pi

out = Path(sys.argv[sys.argv.index('--') + 1])
out.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
s = bpy.context.scene
s.render.engine = 'CYCLES'
s.cycles.samples = 14
s.cycles.use_denoising = True
prefs = bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type = 'CUDA'
    prefs.refresh_devices()
    for device in prefs.devices:
        device.use = device.type == 'CUDA'
    if any(d.use for d in prefs.devices):
        s.cycles.device = 'GPU'
except TypeError:
    pass
s.render.resolution_x, s.render.resolution_y = 1104, 828
s.render.resolution_percentage = 100
s.world = bpy.data.worlds.new('Blue hour')
s.world.use_nodes = True
s.world.node_tree.nodes['Background'].inputs[0].default_value = (.17,.23,.32,1)
s.world.node_tree.nodes['Background'].inputs[1].default_value = .19

def material(name, hue, rough=.35, grain=False, metal=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    tree = m.node_tree
    p = tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*hue,1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    if grain:
        coord = tree.nodes.new('ShaderNodeTexCoord')
        scale = tree.nodes.new('ShaderNodeVectorMath')
        scale.operation = 'MULTIPLY'
        scale.inputs[1].default_value = (1.2,32,3)
        tree.links.new(coord.outputs['Object'],scale.inputs[0])
        noise = tree.nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 2.3
        tree.links.new(scale.outputs[0], noise.inputs[0])
        ramp = tree.nodes.new('ShaderNodeValToRGB')
        for el,v in zip(ramp.color_ramp.elements,(.52,1.2)):
            el.color = (*[min(1,k*v) for k in hue],1)
        tree.links.new(noise.outputs[0],ramp.inputs[0])
        tree.links.new(ramp.outputs[0],p.inputs['Base Color'])
    return m

walnut = material('Oiled walnut',(.125,.049,.022),.36,True)
dark = material('Smoked oak',(.105,.064,.041),.38,True)
light = material('Honey maple',(.53,.35,.19),.41,True)
ivory = material('Boxwood',(.73,.52,.27),.27,True)
black = material('Ebonised pear',(.033,.023,.019),.23,True)
brass = material('Waxed brass',(.44,.24,.083),.27,False,.66)
coat = material('Wool jacket',(.031,.046,.049),.88)
cuff = material('Linen cuff',(.45,.38,.28),.86)
skin = material('Hand in half light',(.36,.17,.085),.55)
def finish(obj,m):
    obj.data.materials.append(m)
    return obj
def box(name,loc,dims,m,bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=bpy.context.object
    o.name=name
    o.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    b=o.modifiers.new('Roundover','BEVEL')
    b.width,b.segments=bevel,3
    o.modifiers.new('Normals','WEIGHTED_NORMAL')
    return finish(o,m)
def ell(name,pos,scale,m):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=pos)
    o=bpy.context.object
    o.name=name
    o.scale=scale
    for f in o.data.polygons:f.use_smooth=True
    return finish(o,m)
def between(name,a,b,width,height,m):
    delta=Vector(b)-Vector(a)
    o=ell(name,(Vector(a)+Vector(b))/2,(width,height,delta.length/2+.06),m)
    o.rotation_euler=delta.to_track_quat('Z','Y').to_euler()
    return o
def revolve(name,profile,m):
    verts=[]; faces=[]; n=48
    for z,r in profile:
        for i in range(n):
            verts.append((r*cos(i*2*pi/n),r*sin(i*2*pi/n),z))
    for j in range(len(profile)-1):
        for i in range(n):
            a=j*n+i; b=j*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);s.collection.objects.link(o)
    for f in mesh.polygons:f.use_smooth=True
    return finish(o,m)
def horse(m):
    # Sculpted side profile, with a separately turned collar.
    outline=[(-.27,.48),(-.23,.77),(-.16,1.02),(-.09,1.21),(.02,1.38),(.05,1.51),(.12,1.39),(.19,1.46),(.19,1.29),(.28,1.19),(.37,1.04),(.36,.96),(.29,.92),(.12,.98),(.04,.94),(.08,.83),(.22,.66),(.25,.48)]
    verts=[(x,y,z) for y in (-.125,.125) for x,z in outline]
    n=len(outline)
    faces=[tuple(range(n))[::-1],tuple(range(n,n*2))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    mesh=bpy.data.meshes.new('Knight carving');mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new('Carved horse',mesh);s.collection.objects.link(o)
    bevel=o.modifiers.new('Carved edges','BEVEL');bevel.width=.055;bevel.segments=4
    o.modifiers.new('Normals','WEIGHTED_NORMAL')
    return finish(o,m)

base=[(.012,.22),(.025,.31),(.06,.34),(.1,.34),(.13,.30),(.16,.29),(.19,.31),(.22,.28),(.24,.24)]
def piece(kind,col,x,y):
    m=(ivory,black)[col]
    root=bpy.data.objects.new(kind,None);s.collection.objects.link(root)
    root.location=(x-3.5,y-3.5,.012)
    profile=base+[(.29,.23),(.35,.19),(.46,.16),(.55,.14),(.63,.15),(.67,.21),(.71,.23),(.75,.19)]
    if kind=='N': profile=base+[(.3,.22),(.4,.21),(.44,.28),(.49,.26),(.51,.21)]
    elif kind=='R':profile+= [(.81,.26),(.94,.27),(.96,.22),(.95,.14),(.91,.001)]
    elif kind in ('Q','K','B'):profile=base+[(.32,.21),(.46,.17),(.66,.13),(.85,.15),(.9,.25),(.96,.25),(1,.16),(1.07,.16)]
    body=revolve(kind,profile,m);body.parent=root
    def part(o):o.parent=root
    if kind=='N':
        part(horse(m))
        for side in [-1,1]:
            part(ell('Inlaid eye',(.16,side*.128,1.22),(.034,.021,.034),black if not col else brass))
        root.rotation_euler.z= .3 if not col else pi+.3
    if kind=='P':part(ell('Pawn bead',(0,0,.88),(.208,.208,.22),m))
    if kind=='B':part(ell('Mitre',(0,0,1.23),(.23,.23,.30),m));part(ell('Finial',(0,0,1.51),(.073,.073,.08),m))
    if kind=='K':
        part(ell('Kings crown',(0,0,1.22),(.235,.235,.2),m))
        part(box('Cross',(0,0,1.51),(.095,.1,.32),m))
        part(box('Cross arm',(0,0,1.54),(.27,.09,.078),m))
    if kind=='Q':
        part(revolve('Queen crown',[(1.05,.15),(1.16,.16),(1.32,.26),(1.35,.24),(1.36,.14),(1.38,.01)],m))
        part(ell('Finial',(0,0,1.43),(.094,.094,.11),m))
    if kind=='R':
        for i in range(6):
            t=i*pi/3
            b=box('Merlon',(.204*cos(t),.204*sin(t),1.00),(.12,.13,.13),m)
            b.rotation_euler.z=t;part(b)
    return root
box('Refectory table',(0,0,-.61),(70,60,.6),walnut,.13)
box('Walnut playing board',(0,0,-.17),(8.55,8.55,.31),walnut,.08)
for x in range(8):
    for y in range(8):
        box('Square',(x-3.5,y-3.5,-.029),(1,1,.058),[dark,light][(x+y)%2],.008)
for i in (-1,1):
    box('Stringing',(i*4.09,0,-.009),(.021,8.17,.011),brass,.004)
    box('Stringing',(0,i*4.09,-.009),(8.17,.021,.011),brass,.004)
for col in (0,1):
    for x,kind in enumerate('RNBQKBNR'):
        o=piece(kind,col,x,7 if col else 0)
        if not col and x==6: knight=o
        o=piece('P',col,x,6 if col else 1)
        if col and x==3: pawn=o
# Seated figures sit beyond the frame; loosely resting hands bookend the board.
def hand(name,location,rotation):
    root=bpy.data.objects.new(name,None);s.collection.objects.link(root)
    root.location=location;root.rotation_euler.z=rotation
    parts=[between('Sleeve',(0,14,1.5),(0,.18,.35),.69,.52,coat),
           between('Cuff',(0,.9,.45),(0,.41,.34),.36,.24,cuff),
           ell('Palm',(0,.19,.28),(.36,.53,.23),skin)]
    for i in range(4):
        x=(i-1.5)*.155
        end=-.72+abs(i-1.3)*.095
        parts.append(between('Finger',(x,-.06,.28),(x*1.16,end,.16),.082,.083,skin))
    parts.append(between('Thumb',(-.24,.27,.25),(-.52,-.18,.15),.116,.12,skin))
    for o in parts:o.parent=root
    return root
hand('Teacher',(-1.6,4.95,.02),-.36)
pupil=hand('Pupil',(5.15,-1.3,.02),-1.65)
def area(name,pos,dest,power,color,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    o=bpy.data.objects.new(name,data);s.collection.objects.link(o);o.location=pos
    o.rotation_euler=(Vector(dest)-o.location).to_track_quat('-Z','Y').to_euler()
area('North-facing window',(-4,3.7,7),(0,0,0),1800,(1,.70,.42),2.0)
area('Cool skylight',(4,2,5),(1,0,0),360,(.48,.66,1),4.5)
area('Bounce',(-1,-6,4),(1,-2,0),85,(1,.78,.61),5)
bpy.ops.object.camera_add()
cam=s.camera=bpy.context.object
cam.data.dof.use_dof=True
cam.data.dof.aperture_fstop=4.0
cam.data.lens=52
def pose(pos,target,lens):
    cam.location=pos
    cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.dof.focus_distance=(Vector(target)-cam.location).length
    cam.data.lens=lens
def plate(name):
    s.render.filepath=str(out/(name+'.png'))
    if len(sys.argv) > sys.argv.index('--') + 2 and not name.startswith(sys.argv[-1]): return
    if not os.path.exists(s.render.filepath):bpy.ops.render.render(write_still=True)
pose((6.8,-10.5,6.8),(0,0,.46),48);plate('opening')
pose((5.05,-7.0,3.7),(2,-2.25,.71),50)
for i in range(17):
    t=i/16;ease=t*t*(3-2*t)
    knight.location=(2.5-ease,-3.5+2*ease,.012+.94*sin(pi*t))
    plate('move%02d'%i)

pose((4.4,7,4.9),(-.5,1.55,.54),54)
for i in range(9):
    t=i/8;pawn.location.y=2.5-2*t*t*(3-2*t);plate('reply%02d'%i)


# A reaction insert, at board level from the opponent's chair.
pawn.location.y=2.5
pose((4.9,3.8,2.5),(1.6,-1.0,.68),49)
for i in range(9):
    t=i/8
    pupil.location.x=5.15+.25*t
    pupil.rotation_euler.z=-1.65+.09*t
    plate('hold%02d'%i)
