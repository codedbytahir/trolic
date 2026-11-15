from pathlib import Path
import json,html
r=Path(__file__).resolve().parent.parent;src=r
template=(Path(__file__).parent/'site-template.html').read_text()
for name in ['aurelia','orchard','milo','solstice','tidal','sunwheel']:
    svg=(src/'artifacts'/f'{name}.svg').read_text()
    import base64
    template=template.replace('@@'+name.upper()+'@@','data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode())
import base64
for name in ['orbit','neon','story']:
    svg=(src/'artifacts'/f'v05-{name}.svg').read_bytes()
    template=template.replace('@@MOTION_'+name.upper()+'@@','data:image/svg+xml;base64,'+base64.b64encode(svg).decode())
for name in ['lagoon','chroma','atelier']:
    svg=(src/'artifacts'/f'v06-{name}.svg').read_bytes()
    template=template.replace('@@EXPRESSIVE_'+name.upper()+'@@','data:image/svg+xml;base64,'+base64.b64encode(svg).decode())
template=template.replace('@@STUDIO_V07@@','data:image/png;base64,'+base64.b64encode((src/'artifacts'/'studio-v07-workspace.png').read_bytes()).decode())
template=template.replace('@@STUDIO_V08@@','data:image/png;base64,'+base64.b64encode((src/'artifacts'/'studio-v08-timeline.png').read_bytes()).decode())
examples={name:(src/'examples'/'agent'/f'{name}.trolic').read_text() for name in ['aurelia','orchard','milo','solstice','tidal','sunwheel']}
examples.update({'v05/'+name:(src/'examples'/'v05'/f'{name}.trolic').read_text() for name in ['orbit','neon','story']})
examples.update({'v06/'+name:(src/'examples'/'v06'/f'{name}.trolic').read_text() for name in ['lagoon','chroma','atelier']})
examples['v07/workbench']=(src/'examples'/'v07'/'workbench.trolic').read_text()
examples.update({'v08/'+name:(src/'examples'/'v08'/f'{name}.trolic').read_text() for name in ['tempo','curves']})
syntax={'readable':(src/'examples'/'bounce.trolic').read_text(),'agent':(src/'examples'/'agent'/'bounce.trolic').read_text()}
report=json.loads((src/'artifacts/token-benchmark.json').read_text())
data=json.dumps({'examples':examples,'syntax':syntax,'report':report}).replace('</','<\\/')
template=template.replace('@@DATA@@',data)
(r/'docs/index.html').write_text(template)
# Same-origin host integration for the published embedded studio only.
p=r/'docs/studio.html';s=(src/'trolic-studio.html').read_text()
listener="\nwindow.addEventListener('message',event=>{if(event.origin!==location.origin)return;if(event.data?.type==='trolic:load'&&typeof event.data.source==='string'&&event.data.source.length<=1000000){$('editor').value=event.data.source;build();}});\n"
pos=s.rfind('</script>');s=s[:pos]+listener+s[pos:];p.write_text(s)
print('Built launch site:',r/'docs/index.html')
