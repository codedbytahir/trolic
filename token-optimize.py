"""Optional exact-token profile selector. Requires Python tiktoken and Node 20+."""
import argparse,json,subprocess,pathlib,tiktoken
p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('--encoding',choices=['o200k_base','cl100k_base'],default='o200k_base');p.add_argument('--output',required=True);a=p.parse_args()
root=pathlib.Path(__file__).parent;encoding=tiktoken.get_encoding(a.encoding)
raw=subprocess.check_output(['node',str(root/'pack-candidates.mjs'),str(pathlib.Path(a.source).resolve())],cwd=root,text=True);candidates=json.loads(raw)
for item in candidates:item['tokens']=len(encoding.encode(item['source']))
best=min(candidates,key=lambda c:c['tokens']);pathlib.Path(a.output).write_text(best['source']);original=pathlib.Path(a.source).read_text();before=len(encoding.encode(original))
print(json.dumps({'encoding':a.encoding,'candidates':len(candidates),'beforeTokens':before,'afterTokens':best['tokens'],'reductionPercent':round((1-best['tokens']/before)*100,2),'options':best['options'],'output':a.output}))
