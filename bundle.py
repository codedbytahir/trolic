"""Build the self-contained offline studio using only Python's standard library."""
from pathlib import Path
import json
r=Path(__file__).parent
geometry=(r/'geometry.js').read_text().replace('export ','').replace('const rgb=', 'const geometryRGB=').replace('...rgb(', '...geometryRGB(')
motion=(r/'motion.js').read_text().replace('export ','')
agent='\n'.join(line for line in (r/'agent.js').read_text().splitlines() if not line.startswith('import ')).replace('export ','')
compiler='\n'.join(line for line in (r/'compiler.js').read_text().splitlines() if not line.startswith('import ')).replace('export ','')
examples={str(p.relative_to(r/'examples').with_suffix('')):p.read_text() for p in (r/'examples').rglob('*.trolic')}
html=(r/'index.html').read_text().replace('<script src="vendor/lottie_light.min.js"></script>','<script>'+(r/'vendor/lottie_light.min.js').read_text().replace('</script','<\\/script')+'</script>')
html=html.replace("import {compile,svg,compact,readable,createRenderer,reframe,retime} from './compiler.js';",motion+'\n'+geometry+'\n'+agent+'\n'+compiler+'\nconst embeddedExamples='+json.dumps(examples).replace('</','<\\/')+';')
html=html.replace("const r=await fetch(`examples/${$('example').value}.trolic`);$('editor').value=await r.text();", "$('editor').value=embeddedExamples[$('example').value];")
(r/'trolic-studio.html').write_text(html)
