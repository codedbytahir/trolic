"""Reproducible source-token benchmark; does not call any AI API."""
from pathlib import Path
import json,subprocess,tiktoken,importlib.metadata
r=Path(__file__).parent;encoders={k:tiktoken.get_encoding(k) for k in ['cl100k_base','o200k_base']};rows=[]
for p in sorted((r/'examples').glob('*.trolic')):
 original=p.read_text();candidates=json.loads(subprocess.check_output(['node',str(r/'pack-candidates.mjs'),str(p)],cwd=r,text=True));default=next(c['source'] for c in candidates if all(c['options'].values()))
 row={'example':p.stem,'sourceBytes':len(original.encode()),'encodings':{}}
 chosen=min(candidates,key=lambda c:len(encoders['o200k_base'].encode(c['source'])))
 (r/'examples'/'agent'/p.name).write_text(chosen['source'])
 for name,enc in encoders.items():
  original_n=len(enc.encode(original));best=min(candidates,key=lambda c:len(enc.encode(c['source'])))
  trim='\n'.join(line.strip() for line in original.splitlines() if line.strip())+'\n'
  result={'originalTokens':original_n,'trimmedLegacyTokens':len(enc.encode(trim)),'defaultCompactTokens':len(enc.encode(default)),'bestProfileTokens':len(enc.encode(best['source'])),'distributedCompactTokens':len(enc.encode(chosen['source'])),'bestOptions':best['options']}
  result['distributedReductionPercent']=round(100*(1-result['distributedCompactTokens']/original_n),2);row['encodings'][name]=result
 rows.append(row)
summary={}
for name in encoders:
 before=sum(x['encodings'][name]['originalTokens'] for x in rows);after=sum(x['encodings'][name]['distributedCompactTokens'] for x in rows)
 summary[name]={'originalTokens':before,'compactTokens':after,'reductionPercent':round(100*(1-after/before),2)}
report={'method':'Exact source-text encoding only; no chat wrappers, system guide, tool schemas, reasoning or retries included. Equal compiled Lottie output checked for every packing candidate. Distributed examples select the least o200k_base tokens among tested lossless profiles, not a global optimum. Token counts do not establish task success or performance on other tokenizers.','tiktokenVersion':importlib.metadata.version('tiktoken'),'encodings':list(encoders),'examples':rows,'aggregate':summary}
# Simulated receipt demonstrates protocol size, not an autonomous model benchmark.
edit='edit pear r=5';receipt='{"ok":true,"revision":1,"edited":1,"nodes":124}'
report['guideTokens']={name:len(enc.encode((r/'AGENT-CARD.md').read_text())) for name,enc in encoders.items()}
report['editProtocolExample']={name:{'editTokens':len(enc.encode(edit)),'receiptTokens':len(enc.encode(receipt))}for name,enc in encoders.items()}
(r/'artifacts'/'token-benchmark.json').write_text(json.dumps(report,indent=2));print(json.dumps(summary,indent=2))
