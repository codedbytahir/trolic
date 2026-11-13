"""Optional pixel-comparison report; requires Pillow (pip install Pillow)."""
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
import json
root=Path(__file__).parent/'artifacts'
results=[]
for path in sorted(root.glob('compare-*-lottie.png')):
    left=Image.open(path).convert('RGB')
    right=Image.open(str(path).replace('-lottie.png','-trolic.png')).convert('RGB')
    error=sum(ImageStat.Stat(ImageChops.difference(left,right)).mean)/3
    results.append({'pair':path.stem.replace('compare-','').replace('-lottie',''),'mean_absolute_rgb_error_0_255':round(error,5)})
assert len(results)==24, 'Run node compare-renderers.mjs first'
(root/'renderer-comparison.json').write_text(json.dumps(results,indent=2))
assert max(x['mean_absolute_rgb_error_0_255'] for x in results)<0.2, 'Visual regression exceeds tolerance'
print('PASS: 24 pairs, largest mean RGB error:',max(x['mean_absolute_rgb_error_0_255'] for x in results))
