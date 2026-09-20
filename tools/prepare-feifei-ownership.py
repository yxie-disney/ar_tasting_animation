"""Lossless ORA export recovery + exclusive original-pixel ownership, no redraw."""
from pathlib import Path
import json, zipfile, io, hashlib
import numpy as np
from PIL import Image
repo=Path(__file__).resolve().parent.parent
root=repo/'assets/feifei-layers'
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
for number,frame in enumerate(manifest['frames'],1):
    folder=root/frame['id']; out=folder/'surface';out.mkdir(exist_ok=True)
    original=repo/f'site/ar/assets/slides/feifei-{number}.png'
    assert hashlib.sha256(original.read_bytes()).hexdigest()==frame['sourceSha256']
    source=np.array(Image.open(root/frame['source']).convert('RGBA'))
    assert np.array_equal(source,np.array(Image.open(original).convert('RGBA')))
    owners=np.zeros(source.shape[:2],np.uint8); reconstructed=np.zeros_like(source)
    with zipfile.ZipFile(root/frame['ora']) as archive:
        for i,layer in enumerate(frame['layers']):
            raw=archive.read(f'data/layer-{i}.png');target=root/layer['file']
            if not target.exists():target.write_bytes(raw)
            assert target.read_bytes()==raw, 'Do not overwrite changed cut '+str(target)
            rgba=np.array(Image.open(io.BytesIO(raw)).convert('RGBA'));selected=rgba[:,:,3]>0
            assert not np.any(owners[selected]), 'overlapping cuts'
            owners[selected]=i+1;reconstructed[selected]=rgba[selected]
    visible=source[:,:,3]>0
    assert np.array_equal(reconstructed[visible],source[visible])
    assert np.array_equal(reconstructed[:,:,3],source[:,:,3])
    (out/'ownership.u8').write_bytes(owners[::-1].tobytes())
    report={'id':frame['id'],'sourceSha256':frame['sourceSha256'],
      'width':source.shape[1],'height':source.shape[0],'rowOrder':'bottom-to-top',
      'componentCount':len(frame['layers']),'visiblePixels':int(visible.sum()),
      'changedVisiblePixels':0,'changedAlphaPixels':0,'overlappingPixels':0}
    (out/'source-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(frame['id'],len(frame['layers']),'components; unchanged RGBA and alpha')
