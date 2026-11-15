"""Package source, offline studio, build assets and current studio evidence; no dependencies or credentials."""
from pathlib import Path
import argparse,json,zipfile
r=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
version='.'.join(json.loads((r/'package.json').read_text())['version'].split('.')[:2])
args.output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(args.output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(r.rglob('*')):
  rel=p.relative_to(r)
  if not p.is_file() or p.resolve()==args.output.resolve():continue
  if any(x in {'.git','node_modules','__pycache__','.cache','.hallmark'} for x in rel.parts):continue
  if rel.parts[0]=='artifacts' and p.suffix=='.png' and not (p.name.startswith('studio-v'+version.replace('.','')) or p.name in {'studio-v07-workspace.png','studio-v08-timeline.png'}):continue
  if p.name=='.env' or p.name.startswith('.env.'):continue
  z.write(p,Path('trolic')/rel)
print(args.output,args.output.stat().st_size,'bytes')
