"""Original hand-designed procedural compositions; no downloaded artwork/source used."""
from pathlib import Path
import json,math
root=Path(__file__).parent
class Scene:
 def __init__(self,name,bg):self.lines=[f'scene {json.dumps(name)} {{','  size: [800, 640]','  fps: 60','  duration: 6',f'  background: "{bg}"']
 def node(self,kind,id,anim=None,**props):
  self.lines.append(f'  {kind} "{id}" {{')
  for k,v in props.items():self.lines.append(f'    {k}: {json.dumps(v,separators=(",",":"))}')
  for a in anim or []:self.lines.append('    '+a)
  self.lines.append('  }')
 def save(self,id):(root/'examples'/f'{id}.trolic').write_text('\n'.join(self.lines+['}'])+'\n')
def gradient(a,b,stops,type='linear'):return dict(type=type,**{'from':a,'to':b},stops=stops)
s=Scene('Aurelia — botanical study','#101e27')
s.node('circle','halo',position=[400,315],size=[510,510],fill='none',stroke='#29414a',stroke_width=1)
s.node('circle','halo-inner',position=[400,315],size=[430,430],fill='none',stroke='#203940',stroke_width=1)
s.node('group','flower',position=[400,315],anim=['animate rotation -12 -> 12 over 6s ease_in_out'])
for ring,count,length,width in [(0,12,215,67),(1,10,157,54)]:
 for i in range(count):
  angle=i*360/count+(15 if ring else 0)
  path=f'M 0 0 C {-width} {-length*.38} {-width*.75} {-length*.9} 0 {-length} C {width*.75} {-length*.9} {width} {-length*.38} 0 0 Z'
  colors=[[0,'#154d55'],[.5,'#4bafa1'],[1,'#d4f0a2']] if not ring else [[0,'#24766c'],[.55,'#9ed69d'],[1,'#f5edbb']]
  s.node('path',f'petal-{ring}-{i}',parent='flower',position=[0,0],path=path,rotation=angle,gradient=gradient([0,0],[0,-length],colors),anim=[f'animate scale [0.55,0.55] -> [1,1] over 2s delay {round(i*.065+ring*.4,3)}s ease_out'])
  s.node('path',f'vein-{ring}-{i}',parent='flower',position=[0,0],path=f'M 0 -12 Q 8 {-length*.5} 0 {-length*.88}',rotation=angle,fill='none',stroke='#b8e3b1',stroke_width=.65,opacity=.5)
s.node('circle','heart',parent='flower',position=[0,0],size=[75,75],gradient=gradient([-12,-15],[36,20],[[0,'#fff0be'],[.5,'#deb85d'],[1,'#836035']],'radial'))
for i in range(22):
 a=i*2.39996;r=5*math.sqrt(i)
 s.node('circle',f'seed-{i}',parent='flower',position=[round(math.cos(a)*r,2),round(math.sin(a)*r,2)],size=[3,3],fill='#674d30')
for i in range(16):
 a=i*math.tau/16
 x,y=400+290*math.cos(a),315+270*math.sin(a)
 s.node('path',f'spark-{i}',position=[round(x,2),round(y,2)],path='M 0 -5 L 2 0 L 0 5 L -2 0 Z',fill='#e1c481',opacity=.65)
s.save('aurelia')

s=Scene('Tidal — koi in a quiet pond','#071d2b')
for i in range(6):
 s.node('circle',f'water-ring-{i}',position=[400,325],size=[210+i*105,120+i*68],fill='none',stroke='#174051',stroke_width=1,rotation=-18)
for i,(x,y,r) in enumerate([(145,145,60),(645,455,72),(620,125,35)]):
 s.node('path',f'lily-{i}',position=[x,y],path=f'M 0 0 L {r} {-r*.2} C {r*.6} {-r*1.4} {-r*1.3} {-r*.7} {-r} {r*.2} C {-r*.5} {r*1.3} {r*1.2} {r} {r} 5 Z',gradient=gradient([-r,-r],[r,r],[[0,'#367c69'],[1,'#123f43']]))
 s.node('path',f'lily-vein-{i}',position=[x,y],path=f'M {-r*.7} {r*.4} Q 0 {r*.3} {r*.6} 0',fill='none',stroke='#6fa483',stroke_width=1)
for j,(pos,rot,light,dark) in enumerate([([330,290],-35,'#fff1d4','#d65b39'),([505,355],145,'#f6c46e','#dc7135')]):
 g=f'fish-{j}'
 s.node('group',g,position=pos,rotation=rot,anim=[f'animate position {json.dumps(pos)} -> {json.dumps([pos[0]-25,pos[1]+20])} over 6s ease_in_out'])
 s.node('path',g+'-tail',parent=g,position=[0,0],path='M 0 58 C -18 80 -38 84 -48 108 Q -10 100 0 85 Q 15 102 44 106 C 30 76 14 78 0 58 Z',gradient=gradient([0,60],[0,110],[[0,dark],[1,light]]))
 for side in [-1,1]:
  s.node('path',g+f'-fin-{side}',parent=g,position=[0,0],path=f'M {side*17} -15 Q {side*66} 0 {side*42} 35 Q {side*23} 25 {side*15} 16 Z',fill=light,opacity=.7)
 s.node('path',g+'-body',parent=g,position=[0,0],path='M 0 -77 C -46 -65 -40 21 0 75 C 39 20 46 -65 0 -77 Z',gradient=gradient([-30,-10],[34,10],[[0,dark],[.47,light],[1,dark]]))
 for z in range(3):
  y=-44+z*29
  s.node('path',g+f'-mark-{z}',parent=g,position=[0,y],path='M -15 -8 Q 4 -19 21 -4 Q 7 16 -15 8 Z',fill=dark,opacity=.9)
 for x in [-15,15]:s.node('circle',g+f'-eye-{x}',parent=g,position=[x,-53],size=[5,5],fill='#0b2530')
 s.node('path',g+'-spine',parent=g,position=[0,0],path='M 0 -57 Q -6 6 0 59',fill='none',stroke=light,stroke_width=1.3,opacity=.7)
for i in range(12):
 x=70+(i*137)%670;y=80+(i*83)%475
 s.node('circle',f'bubble-{i}',position=[x,y],size=[4+(i%3)*3]*2,fill='none',stroke='#548b98',stroke_width=1,opacity=.55)
s.save('tidal')

s=Scene('Solstice — paper landscape','#f4e8d3')
s.node('rect','sky',position=[400,320],size=[800,640],gradient=gradient([0,-320],[0,320],[[0,'#233955'],[.58,'#c98273'],[1,'#edc28d']]))
s.node('circle','sun',position=[495,220],size=[156,156],gradient=gradient([0,-78],[0,78],[[0,'#fff0c4'],[1,'#eeaf73']]),anim=['animate position [495,240] -> [495,200] over 6s ease_in_out'])
for i,(y,c) in enumerate([(310,'#68798e'),(355,'#3d6178'),(415,'#254a61'),(480,'#16364d')]):
 s.node('path',f'ridge-{i}',position=[0,0],path=f'M 0 {y+30} Q 90 {y-65} 180 {y} Q 280 {y+45} 360 {y-40} Q 460 {y-110} 560 {y-20} Q 690 {y+50} 800 {y-45} L 800 640 L 0 640 Z',fill=c)
s.node('path','river',position=[0,0],path='M 420 400 C 630 450 220 465 420 520 C 500 545 610 565 720 640 L 210 640 C 205 570 350 550 315 520 C 180 465 590 445 410 400 Z',gradient=gradient([400,410],[400,640],[[0,'#98b7b5'],[1,'#efd3a6']]))
for i in range(14):
 x=(i*149)%800;y=525+(i%4)*25;h=24+(i%3)*12
 s.node('path',f'pine-{i}',position=[x,y],path=f'M 0 {-h} L {-h*.35} {-h*.4} L {-h*.17} {-h*.4} L {-h*.5} 0 L {h*.5} 0 L {h*.17} {-h*.4} L {h*.35} {-h*.4} Z',fill='#102c3e')
for i in range(3):s.node('path',f'bird-{i}',position=[200+i*33,160-i*12],path='M -9 0 Q -4 -6 0 0 Q 4 -6 9 0',fill='none',stroke='#e8d9c2',stroke_width=1.5)
s.save('solstice')
