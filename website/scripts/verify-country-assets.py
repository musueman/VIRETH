"""Check provenance, alpha, and exact source RGB for all delivered cutouts."""
from pathlib import Path
import hashlib, json
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'public/assets/explore/all-country-provenance.json').read_text(encoding='utf-8'))
assert len(manifest['assets'])==20
for asset in manifest['assets']:
    source=Path(asset['crestSource'])
    output=root/'public'/asset['crestOutput']
    assert hashlib.sha256(source.read_bytes()).hexdigest()==asset['crestSourceSHA256']
    assert hashlib.sha256(output.read_bytes()).hexdigest()==asset['crestSHA256']
    rgb=np.array(Image.open(source).convert('RGB'))
    rgba=np.array(Image.open(output).convert('RGBA'))
    x,y,w,h=asset['crop']
    assert np.array_equal(rgb[y:y+h,x:x+w],rgba[:,:,:3]), asset['id']
    alpha=rgba[:,:,3]
    assert (alpha==0).any() and (alpha==255).any()
    assert np.any(alpha[:,0]) and np.any(alpha[:,-1]), 'Visible width must be tight'
    for key in ['citySource','cityOutput']:
        path=Path(asset[key]) if key=='citySource' else root/'public'/asset[key]
        hashkey='citySourceSHA256' if key=='citySource' else 'citySHA256'
        assert hashlib.sha256(path.read_bytes()).hexdigest()==asset[hashkey]
print('PASS: 20 cutouts have transparency, tight visible width, unchanged RGB, and matching source/output hashes; 20 city derivatives verified.')
