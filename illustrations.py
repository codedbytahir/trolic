"""Original v0.3 illustration fixtures. Pure vector; no external artwork or image generation."""
from pathlib import Path
import json,random,math
root=Path(__file__).parent
class Scene:
 def __init__(self,name,bg):self.lines=[f'scene {json.dumps(name)} {{','  size: [800, 680]','  duration: 6','  fps: 60',f'  background: "{bg}"']
 def node(self,kind,id,motion=None,**props):
  self.lines.append(f'  {kind} "{id}" {{')
  for k,v in props.items():self.lines.append(f'    {k}: {json.dumps(v,separators=(",",":"))}')
  for m in motion or []:self.lines.append('    '+m)
  self.lines.append('  }')
 def save(self,id):(root/'examples'/f'{id}.trolic').write_text('\n'.join(self.lines+['}'])+'\n')
def grad(a,b,stops,type='linear'):return {'type':type,'from':a,'to':b,'stops':stops}
s=Scene('Orchard — shaded pear study','#eee9dc')
s.node('circle','paper-light',position=[365,280],size=[780,710],gradient=grad([0,-80],[380,0],[[0,'#fffdf6',.85],[1,'#fffdf6',0]],'radial'))
s.node('circle','soft-shadow',position=[420,542],size=[370,76],gradient=grad([0,0],[185,0],[[0,'#393a21',.28],[.45,'#393a21',.14],[1,'#393a21',0]],'radial'))
s.node('circle','contact-shadow',position=[407,540],size=[205,25],gradient=grad([0,0],[102,0],[[0,'#41412d',.33],[1,'#41412d',0]],'radial'))
s.node('group','pear',position=[397,356])
body='M -4 -153 C -39 -153 -43 -111 -54 -69 C -67 -21 -125 13 -126 83 C -129 159 -63 190 1 189 C 76 188 137 157 133 85 C 128 20 73 -19 55 -68 C 41 -112 35 -154 -4 -153 Z'
s.node('path','skin',parent='pear',position=[0,0],path=body,gradient=grad([-64,-70],[130,120],[[0,'#e4d762'],[.32,'#b8bb45'],[.68,'#8c9c30'],[1,'#556926']]))
s.node('path','warm-shoulder',parent='pear',position=[0,0],path=body,gradient=grad([-65,45],[105,55],[[0,'#fff3a0',.58],[.6,'#ead360',.14],[1,'#ead360',0]],'radial'))
s.node('path','lower-shade',parent='pear',position=[0,0],path=body,gradient=grad([0,65],[0,190],[[0,'#435322',0],[.72,'#435322',.05],[1,'#435322',.42]]))
s.node('path','edge-shade',parent='pear',position=[0,0],path=body,gradient=grad([42,0],[138,20],[[0,'#355629',0],[1,'#355629',.4]]))
s.node('path','soft-highlight',parent='pear',position=[0,0],path='M -18 -126 C -33 -99 -27 -64 -47 -30 C -76 12 -101 44 -92 85 C -84 99 -73 80 -66 48 C -52 0 -18 -27 -13 -69 C -8 -94 -8 -119 -18 -126 Z',gradient=grad([-44,-30],[40,-30],[[0,'#ffffcb',.35],[1,'#ffffcb',0]],'radial'))
rng=random.Random(73)
for i in range(105):
 y=rng.uniform(-115,160);limit=30 if y<-55 else (65 if y<0 else 103*math.sqrt(max(.1,1-((y-75)/120)**2)));x=rng.uniform(-limit,limit)
 s.node('circle',f'lenticel-{i}',parent='pear',position=[round(x,2),round(y,2)],size=[round(rng.uniform(1.0,2.3),2)]*2,fill='#6d7130',opacity=round(rng.uniform(.12,.34),2))
s.node('path','bottom-dimple',parent='pear',position=[0,0],path='M -11 180 Q 0 174 13 180 Q 0 182 -11 180 Z',fill='#596426',opacity=.6)
s.node('path','stem',parent='pear',position=[0,0],path='M -6 -148 C -11 -171 -4 -187 9 -204 Q 15 -209 20 -201 C 8 -181 6 -168 8 -150 Z',gradient=grad([-5,-175],[13,-175],[[0,'#51412b'],[.5,'#887047'],[1,'#3f3725']]))
s.node('path','stem-ridge',parent='pear',position=[0,0],path='M 0 -156 Q -2 -182 13 -201',fill='none',stroke='#b1a06d',stroke_width=1.2,opacity=.7)
s.node('path','leaf',parent='pear',position=[0,0],path='M 7 -168 C 48 -227 106 -236 145 -219 C 123 -177 68 -142 7 -168 Z',gradient=grad([25,-180],[114,-214],[[0,'#304b28'],[.48,'#597b36'],[1,'#a2b557']]))
s.node('path','leaf-vein',parent='pear',position=[0,0],path='M 10 -169 Q 79 -192 139 -217',fill='none',stroke='#c5cf88',stroke_width=1.2,opacity=.7)
for i in range(5):
 x=38+i*16;y=-179-i*6
 s.node('path',f'leaf-vein-{i}',parent='pear',position=[0,0],path=f'M {x} {y} q 4 -11 6 -22 M {x} {y} q 13 4 22 0',fill='none',stroke='#a5b775',stroke_width=.65,opacity=.45)
s.save('orchard')

s=Scene('Milo — woodland explorer','#f6ebdc')
s.node('circle','backdrop',position=[400,320],size=[520,520],gradient=grad([0,-130],[250,80],[[0,'#fff9e9'],[1,'#e8d5bd']],'radial'))
s.node('circle','ground',position=[405,601],size=[325,46],gradient=grad([0,0],[165,0],[[0,'#5e6657',.19],[1,'#5e6657',0]],'radial'))
s.node('group','milo',position=[390,342],motion=['keyframes rotation [[0,-2],[1.5,1],[3,-2],[4.5,1],[6,-2]] ease_in_out'])
outline='#513a34'
def node(kind,id,**p):
 p.setdefault('parent','milo');p.setdefault('position',[0,0]);p.setdefault('stroke',outline);p.setdefault('stroke_width',3.5);s.node(kind,id,**p)
node('path','tail',path='M 62 129 C 171 142 204 83 187 22 C 243 82 229 179 165 199 Q 97 217 54 182 Z',gradient=grad([95,130],[209,140],[[0,'#e1873f'],[1,'#c86632']]))
node('path','tail-tip',path='M 187 22 C 211 49 225 81 224 112 Q 199 99 182 113 Q 203 79 187 22 Z',fill='#fff0d1')
node('rect','left-boot',position=[-47,222],size=[68,48],radius=17,fill='#4c5a50')
node('rect','right-boot',position=[47,222],size=[68,48],radius=17,fill='#4c5a50')
node('rect','backpack',position=[47,104],size=[127,157],radius=28,fill='#bda85e')
node('path','left-arm',path='M -60 56 C -100 64 -105 113 -91 149 Q -74 164 -64 147 L -43 94 Z',fill='#e99850')
node('path','jacket',path='M -51 49 Q 0 30 53 49 Q 81 100 68 190 Q 0 214 -69 188 Q -78 102 -51 49 Z',gradient=grad([-60,60],[70,170],[[0,'#86b5a0'],[1,'#507c6d']]))
node('path','jacket-seam',path='M 0 68 L 0 196 M -56 144 Q -38 153 -18 144 M 18 144 Q 40 153 57 144',fill='none',stroke='#335d51',stroke_width=2)
node('path','badge-ring',position=[-37,108],path='M -13 0 C -13 -17 13 -17 13 0 C 13 17 -13 17 -13 0 Z M -7 0 C -7 -9 7 -9 7 0 C 7 9 -7 9 -7 0 Z',fill='#ebd5a1',fill_rule='evenodd',stroke='none')
node('path','scarf',path='M -63 32 Q 0 58 62 32 L 57 63 Q 0 90 -61 64 Z',fill='#d8aa56')
node('path','scarf-end',path='M 20 67 L 51 70 L 59 117 L 42 110 L 26 120 Z',fill='#e3bd6a')
s.node('group','wave',parent='milo',position=[66,62],motion=['keyframes rotation [[0,12],[1,0],[2,12],[3,0],[4,12],[5,0],[6,12]] ease_in_out'])
s.node('path','wave-arm',parent='wave',position=[0,0],path='M -11 15 C 12 20 32 -9 31 -36 Q 40 -60 56 -48 C 75 -22 57 31 26 48 Q -1 61 -19 42 Z',fill='#e99850',stroke=outline,stroke_width=3.5)
s.node('path','wave-paw',parent='wave',position=[0,0],path='M 31 -36 Q 23 -56 34 -66 Q 40 -72 45 -59 Q 48 -79 58 -73 Q 66 -70 60 -57 Q 78 -66 79 -53 Q 79 -42 64 -33 L 56 -22 Z',fill='#5b4239',stroke=outline,stroke_width=3)
node('path','ear-left',path='M -91 -93 Q -126 -142 -111 -214 Q -55 -194 -35 -148 Z',fill='#d77c3c')
node('path','ear-left-inner',path='M -88 -131 Q -107 -165 -103 -192 Q -70 -175 -56 -148 Z',fill='#66423d',stroke_width=2)
node('path','ear-right',path='M 41 -149 Q 72 -200 113 -211 Q 126 -151 93 -98 Z',fill='#d77c3c')
node('path','ear-right-inner',path='M 64 -148 Q 80 -177 104 -190 Q 108 -158 89 -130 Z',fill='#66423d',stroke_width=2)
node('path','head',path='M 0 -172 C -70 -174 -102 -135 -111 -88 L -132 -64 L -104 -57 L -111 -36 Q -57 19 0 35 Q 65 19 112 -36 L 103 -56 L 131 -64 L 111 -87 C 102 -136 64 -174 0 -172 Z',gradient=grad([-55,-125],[92,-15],[[0,'#efad62'],[1,'#d77a3c']]))
node('path','muzzle-left',path='M -106 -61 Q -81 -96 -55 -67 Q -31 -34 0 -25 L 0 29 Q -60 11 -106 -36 L -91 -42 Z',fill='#fff0d2',stroke='none')
node('path','muzzle-right',path='M 106 -61 Q 81 -96 55 -67 Q 31 -34 0 -25 L 0 29 Q 60 11 106 -36 L 91 -42 Z',fill='#fff0d2',stroke='none')
for side in [-1,1]:
 x=side*43
 node('circle',f'eye-white-{side}',position=[x,-88],size=[35,42],fill='#fff8e7',stroke_width=2.5)
 node('circle',f'pupil-{side}',position=[x+3,-84],size=[18,25],fill='#4b3733',stroke='none')
 node('circle',f'eye-shine-{side}',position=[x+6,-91],size=[7,8],fill='#ffffff',stroke='none')
 node('path',f'brow-{side}',path=f'M {x-17} -119 Q {x} -130 {x+15} -120',fill='none',stroke_width=3)
 node('circle',f'cheek-{side}',position=[side*75,-38],size=[22,11],fill='#dd8863',opacity=.45,stroke='none')
node('path','nose',path='M -17 -32 Q 0 -44 17 -32 Q 12 -15 0 -14 Q -12 -15 -17 -32 Z',fill='#513a34',stroke_width=2)
node('path','nose-glint',path='M -8 -31 Q -1 -35 5 -31',fill='none',stroke='#b9957f',stroke_width=2)
node('path','smile',path='M 0 -14 L 0 -4 Q -14 5 -24 -5 M 0 -4 Q 14 5 24 -5',fill='none',stroke_width=2.5)
node('path','hair',path='M -22 -167 L -9 -190 L 1 -174 L 17 -188 L 19 -166',fill='#efad62',stroke_width=3)
for i in range(5):
 x,y=[(150,240),(642,167),(681,368),(142,490),(620,552)][i]
 s.node('path',f'star-{i}',position=[x,y],path='M 0 -10 Q 1 -1 9 0 Q 1 1 0 10 Q -1 1 -9 0 Q -1 -1 0 -10 Z',fill='#bd984e')
s.save('milo')
