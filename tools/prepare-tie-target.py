"""Extract unchanged print pixels; no generated art or published room photo."""
from pathlib import Path
from PIL import Image
import json, hashlib
root = Path(__file__).resolve().parents[1]
source = root / 'assets/printed-card/嘉地-品丽珠_立牌01.png'
assert hashlib.sha256(source.read_bytes()).hexdigest() == '465b05be25619a66d1ea851d92103b00e7825aaaff2e3a7b6273fda471fb41e3'
im = Image.open(source)
assert im.size == (2126, 3189)
# Inside the surviving rectangle, excluding the hand-torn top silhouette.
box = (45, 2640, 477, 3150)
crop = im.crop(box).convert('L')
# Official CLI's luminance output is height 640 (minimum crop 480x640).
# Normalize this smaller source region without changing its aspect ratio.
crop = crop.resize((round(crop.width * 640 / crop.height),640),Image.Resampling.LANCZOS)
destination = root / 'site/ar/image-targets/tie-label.png'
crop.save(destination)
w,h = crop.size
target = {'name':'tie-label', 'type':'PLANAR', 'imagePath':'image-targets/tie-label.png',
 'properties':{'left':0,'top':0,'width':w,'height':h,'isRotated':False,'originalWidth':w,'originalHeight':h}}
destination.with_suffix('.json').write_text(json.dumps(target,indent=2)+'\n',encoding='utf-8')
spec = {'name':'tie-label','widthMm':(box[2]-box[0])/2126*180,'file':'image-targets/tie-label.json',
 'scaleBasis':'nominal source print at 180mm wide; not a new physical measurement'}
(root/'site/ar/targets.json').write_text(json.dumps([spec],indent=2)+'\n',encoding='utf-8')
print(json.dumps({'cropPixels':box,'targetPixels':[w,h],'nominalWidthMm':spec['widthMm'],'sha256':hashlib.sha256(destination.read_bytes()).hexdigest()}))
