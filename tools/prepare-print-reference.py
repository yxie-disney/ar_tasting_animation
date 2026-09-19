"""Rectify only the unobscured printed artwork; never include the tube or surroundings.

Local-only dependencies: opencv-python-headless, numpy, Pillow.
Usage: python tools/prepare-print-reference.py MASTER_PNG PRIVATE_SCENE_PHOTO
The calibration photograph is not a held-out tracking test.
"""
import sys, json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageOps

master, scene = map(Path, sys.argv[1:3])
source = cv2.resize(np.array(Image.open(master).convert('RGB')), (720, 1080))
photo = np.array(ImageOps.exif_transpose(Image.open(scene)).convert('RGB'))
photo = cv2.resize(photo, (1600, round(photo.shape[0] * 1600 / photo.shape[1])))
a = cv2.cvtColor(source, cv2.COLOR_RGB2GRAY)
b = cv2.cvtColor(photo, cv2.COLOR_RGB2GRAY)
sift = cv2.SIFT_create(nfeatures=7000)
ka, da = sift.detectAndCompute(a, None)
kb, db = sift.detectAndCompute(b, None)
good = [m for m, n in cv2.BFMatcher().knnMatch(da, db, k=2) if m.distance < .73 * n.distance]
if len(good) < 50:
    raise RuntimeError('Insufficient source-to-print correspondences')
src = np.float32([ka[m.queryIdx].pt for m in good])
dst = np.float32([kb[m.trainIdx].pt for m in good])
H, mask = cv2.findHomography(src, dst, cv2.RANSAC, 4)
if H is None or mask.sum() < 50:
    raise RuntimeError('Unable to establish a reliable artwork homography')
reference = cv2.warpPerspective(b, np.linalg.inv(H), (720, 1080))
out = Path('site/v3')
targets = []
for name, (x,y,w,h) in [('print-near',(2,94,67,132)), ('print-far',(110,42,68,160))]:
    patch = cv2.resize(reference[y*4:(y+h)*4, x*4:(x+w)*4], (round(w/h*480),480))
    cv2.imencode('.png', patch)[1].tofile(str(out/'image-targets'/f'{name}.png'))
    ph, pw = patch.shape
    data = {'name':name,'type':'PLANAR','imagePath':f'image-targets/{name}.png','properties':{
        'left':0,'top':0,'width':pw,'height':ph,'originalWidth':pw,'originalHeight':ph,'isRotated':False}}
    (out/'image-targets'/f'{name}.json').write_text(json.dumps(data,indent=2),encoding='utf8')
    targets.append({'name':name,'widthMm':w,'offset':[x+w/2-90,135-y-h/2],'file':f'image-targets/{name}.json'})
existing = json.loads((out/'targets.json').read_text())
targets.extend(t for t in existing if t['name'] in ['garden-near','garden-far','noterday-vertical-01'])
(out/'targets.json').write_text(json.dumps(targets,indent=2),encoding='utf8')
print(json.dumps({'matches':len(good),'inliers':int(mask.sum()),'note':'Calibration, not held-out accuracy'}))
