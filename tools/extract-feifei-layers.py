"""Exclusive original-pixel extraction; not generative editing or inpainting.

All masks are hand-authored in cuts.json. Every source pixel belongs to exactly
one layer, so coincident source-over compositing recovers original visible RGBA.
Transparent source RGB is not meaningful and is zeroed outside each cutout.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, hashlib, zipfile, io, xml.etree.ElementTree as ET
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/feifei-layers'
SOURCE = ROOT / 'site/ar/assets/slides'
CUTS = json.loads((OUT / 'cuts.json').read_text(encoding='utf-8'))
FONT = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 20)
SMALL = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 16)
TITLE = ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc', 28)
manifest = {'status':'extracted-visible-pixels; hidden surfaces NOT reconstructed; NOT deployed',
 'units':'nominal scene mm, matching existing 80mm character height',
 'axes':{'characterLocalZ':'positive towards viewer; body=0','paperFrame':'paper +Z is up; paper +X is away from approved viewer',
 'mapping':'paperX = 34.75 - characterLocalZ; feet paperZ=35; existing card paperX=55'},
 'depthsAre':'local preview candidates, NOT applied to production', 'frames':[]}
reports=[]

def mask_for(entry, size, reference):
    mask=Image.new('L',size)
    draw=ImageDraw.Draw(mask)
    sx,sy=size[0]/reference[0],size[1]/reference[1]
    for poly in entry.get('polygons',[]):
        draw.polygon([(round(x*sx),round(y*sy)) for x,y in poly],fill=255)
    for poly in entry.get('exclude',[]):
        draw.polygon([(round(x*sx),round(y*sy)) for x,y in poly],fill=0)
    return np.array(mask)>0

def checker(size):
    im=Image.new('RGB',size,'#e6e9e6');d=ImageDraw.Draw(im)
    for y in range(0,size[1],16):
        for x in range(0,size[0],16):
            if (x//16+y//16)%2:d.rectangle((x,y,x+15,y+15),fill='#c8d1cc')
    return im

def tile(image,label,size=(244,335),note=None):
    result=Image.new('RGB',size,'#f4f5f1');d=ImageDraw.Draw(result)
    d.text((8,7),label,font=SMALL,fill='#152c23')
    area=checker((size[0]-16,size[1]-66))
    fit=image.copy();fit.thumbnail((area.width-12,area.height-12),Image.Resampling.LANCZOS)
    area.paste(fit,((area.width-fit.width)//2,(area.height-fit.height)//2),fit)
    result.paste(area,(8,35))
    if note:d.text((8,size[1]-24),note,font=SMALL,fill='#69483d')
    return result

def png_bytes(img):
    buffer=io.BytesIO();img.save(buffer,format='PNG');return buffer.getvalue()

for frame in CUTS['frames']:
    dest=OUT/frame['id'];dest.mkdir(parents=True,exist_ok=True)
    source=Image.open(SOURCE/frame['source']).convert('RGBA');rgba=np.array(source)
    h,w=rgba.shape[:2];alpha=rgba[:,:,3];visible=alpha>0
    entries=frame['layers'];body_idx=next(i for i,e in enumerate(entries) if e.get('default'))
    for entry in entries:
        refine=CUTS.get('refinements',{}).get(frame['id'],{}).get(entry['id'],{})
        entry['polygons']=refine.get('replace',entry.get('polygons',[]))+refine.get('add',[])
        entry['exclude']=entry.get('exclude',[])+refine.get('exclude',[])
    owner=np.full((h,w),body_idx,dtype=np.uint8)
    # default is the complement, never overwrites explicitly selected masks.
    for i,entry in enumerate(entries):
        if not entry.get('default'):owner[mask_for(entry,(w,h),frame['reference'])]=i
    layers=[];layer_meta=[];merged=Image.new('RGBA',(w,h));coverage=np.zeros((h,w),np.uint8)
    for i,entry in enumerate(entries):
        selected=owner==i;coverage+=selected.astype(np.uint8)
        data=np.zeros_like(rgba);data[selected]=rgba[selected]
        # Keep every visible source pixel's exact original RGBA, no edge blur.
        layer=Image.fromarray(data);layers.append(layer)
        name=entry['id']+'.png';layer.save(dest/name)
        Image.fromarray(np.where(selected&visible,255,0).astype(np.uint8)).save(dest/(entry['id']+'.mask.png'))
        merged=Image.alpha_composite(merged,layer)
        bbox=layer.getbbox()
        layer_meta.append({'id':entry['id'],'label':entry['label'],'file':frame['id']+'/'+name,
          'mask':frame['id']+'/'+entry['id']+'.mask.png','zMm':entry['zMm'],
          'pixels':int((selected&visible).sum()),'bbox':bbox,'fullCanvas':[w,h]})
    rebuilt=np.array(merged);pixel_mismatch=int(np.any(rebuilt[visible]!=rgba[visible],axis=1).sum())
    alpha_mismatch=int((rebuilt[:,:,3]!=alpha).sum())
    assert pixel_mismatch==0 and alpha_mismatch==0 and np.all(coverage==1)
    source.save(dest/'source.png');merged.save(dest/'reassembled.png')
    # Red shows the removed foreground footprint, NOT invented hidden anatomy.
    fg=np.zeros((h,w),bool)
    for i,e in enumerate(entries):
        if e['zMm']>0:fg|=(owner==i)&visible
    risk=np.zeros_like(rgba);risk[fg]=[218,40,72,210]
    Image.fromarray(risk).save(dest/'foreground-coverage.png')
    review=Image.alpha_composite(layers[body_idx],Image.fromarray(risk));review.save(dest/'body-missing-map.png')
    # Render boundary bands with source pixels, useful for inspecting cut quality.
    edge=(owner!=np.roll(owner,1,axis=0))|(owner!=np.roll(owner,1,axis=1));edge&=visible
    boundary=rgba.copy();boundary[edge]=[233,45,112,255]
    Image.fromarray(boundary).save(dest/'cut-boundaries.png')
    root=ET.Element('image',{'w':str(w),'h':str(h),'name':frame['name'],'version':'0.0.3'})
    stack=ET.SubElement(root,'stack')
    for i in reversed(range(len(entries))):
        ET.SubElement(stack,'layer',{'name':entries[i]['label'],'src':f'data/layer-{i}.png','opacity':'1.0','visibility':'visible','composite-op':'svg:src-over','x':'0','y':'0'})
    with zipfile.ZipFile(dest/(frame['id']+'.ora'),'w') as z:
        z.writestr('mimetype','image/openraster',compress_type=zipfile.ZIP_STORED)
        z.writestr('stack.xml',ET.tostring(root,encoding='utf-8'))
        z.writestr('mergedimage.png',png_bytes(merged))
        for i,layer in enumerate(layers):z.writestr(f'data/layer-{i}.png',png_bytes(layer))
    row_width=244*(len(layers)+2)
    sheet=Image.new('RGB',(row_width,410),'#f4f5f1');d=ImageDraw.Draw(sheet)
    d.text((12,7),frame['name']+' / 原像素切片 · 未补画遮挡面',font=TITLE,fill='#152c23')
    cells=[tile(source,'原图')]+[tile(im,e['label'],note=f"局部 Z {e['zMm']:+g} mm") for im,e in zip(layers,entries)]+[tile(merged,'叠回原图',note='可见像素差：0')]
    for k,cell in enumerate(cells):sheet.paste(cell,(244*k,54))
    sheet.save(dest/'layers-contact.png')
    result={**{k:frame[k] for k in ('id','name','missing')},'source':frame['id']+'/source.png',
      'sourceSha256':hashlib.sha256((SOURCE/frame['source']).read_bytes()).hexdigest(),
      'canvas':[w,h],'heightMm':80,'layers':layer_meta,'sourceVisiblePixels':int(visible.sum()),
      'changedVisiblePixels':pixel_mismatch,'changedAlphaPixels':alpha_mismatch,
      'bodyCompletion':'visible-only, missing occluded pixels',
      'ora':frame['id']+'/'+frame['id']+'.ora','reassembled':frame['id']+'/reassembled.png',
      'contact':frame['id']+'/layers-contact.png','missingMap':frame['id']+'/body-missing-map.png'}
    (dest/'layers.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    manifest['frames'].append(result);reports.append({'name':frame['name'],'layers':len(layers),'canvas':[w,h],
      'changedVisiblePixels':pixel_mismatch,'changedAlphaPixels':alpha_mismatch})

(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'verification.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2),encoding='utf-8')
overview=Image.new('RGB',(1464,5*350+65),'#f4f5f1');d=ImageDraw.Draw(overview)
d.text((12,10),'五张朏朏 · 独立切片总览（每块均为真实导出 PNG）',font=TITLE,fill='#152c23')
for row,frame in enumerate(manifest['frames']):
    images=[('原图 · '+frame['name'],Image.open(OUT/frame['source']))]
    images += [(e['label'],Image.open(OUT/e['file'])) for e in frame['layers']]
    for col,(label,im) in enumerate(images):overview.paste(tile(im,label),(244*col,65+350*row))
overview.save(OUT/'all-five-layers.png')
print(json.dumps(reports,ensure_ascii=False))

if '--package' in __import__('sys').argv:
    archive=OUT/'feifei-layers.zip'
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as z:
        for file in OUT.rglob('*'):
            if file.is_file() and file!=archive:z.write(file,file.relative_to(OUT).as_posix())
        z.write(Path(__file__),'tools/extract-feifei-layers.py')
        z.write(ROOT/'tools/serve-feifei-layers.mjs','tools/serve-feifei-layers.mjs')
    print(str(archive))
