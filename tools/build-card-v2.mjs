import fs from 'node:fs/promises'
import path from 'node:path'
import QRCode from 'qrcode'
import opentype from 'opentype.js'
import jsQR from 'jsqr'
import {applyCrop} from '@8thwall/image-target-cli/src/apply.js'
import sharp from 'sharp'
const root = process.cwd()
const out = path.resolve(process.env.AR_PRINT_OUTPUT ?? 'design/card-marker/v2')
const site = path.join(root,'site')
const source = process.env.AR_CARD_SOURCE
if(!source)throw Error('Set AR_CARD_SOURCE to the original 嘉地-品丽珠_已转曲.svg. Run from the repo root.')
await fs.mkdir(out,{recursive:true})
await fs.mkdir(path.join(site,'image-targets'),{recursive:true})
await fs.mkdir(path.join(site,'assets'),{recursive:true})
const cn = opentype.loadSync(process.env.AR_CJK_FONT ?? 'C:/Windows/Fonts/simhei.ttf')
const en = opentype.loadSync(process.env.AR_LATIN_FONT ?? 'C:/Windows/Fonts/arialbd.ttf')
function type(text,x,y,size,font=cn,fill='#241e1b',align='start'){
  for(const ch of text) if(ch !== ' ' && !font.charToGlyphIndex(ch)) throw Error('Missing glyph: '+ch)
  if(align==='middle') x-=font.getAdvanceWidth(text,size)/2
  return font.getPath(text,x,y,size).toSVG(3).replace('<path ','<path fill="'+fill+'" ')
}
// Preserve the v1 viewBox, physical page dimensions and exact placement-ring geometry.
const unit=1122/140
const module={x:561-32*unit,y:1904,width:64*unit,height:48*unit}
const url='https://yxie-disney.github.io/ar_tasting_animation/?sku=jiadi-2021'
const qr=QRCode.create(url,{errorCorrectionLevel:'M'})
const qsize=34,quiet=4,step=qsize/(qr.modules.size+quiet*2)
let qrRects=''
for(let row=0;row<qr.modules.size;row++)for(let col=0;col<qr.modules.size;col++){
  if(qr.modules.get(row,col)) qrRects+=`<rect x="${(15+(col+quiet)*step).toFixed(5)}" y="${(7+(row+quiet)*step).toFixed(5)}" width="${step.toFixed(5)}" height="${step.toFixed(5)}"/>`
}
// Fixed, asymmetric typographic landmarks surround an intact QR quiet zone.
// Same surround across SKUs; each page loads its own full target, including its QR.
const marker=`<rect width="64" height="48" fill="white"/>
<g fill="#111111">${qrRects}</g>
${type('NOTERDAY',2,4.6,3.8,en,'#111')}
${type('AR',2,18,7,en,'#111')}
${type('昨',2,28.5,8,cn,'#111')}${type('非',3.5,38,8,cn,'#111')}
<g fill="#111"><path d="M52 3h10v3h-7v5h-3z"/><path d="M53 17l8 -4v8l-5 2z"/>
<rect x="52" y="27" width="3" height="7"/><rect x="57" y="27" width="5" height="3"/>
<path d="M54 37h8v7h-3v-4h-5z"/><path d="M2 42h5v4H2zM9 44h3v2H9z"/></g>
${type('TASTING / 01',16,46,2.8,en,'#111')}`
const markerSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="64mm" height="48mm" viewBox="0 0 64 48">${marker}</svg>`
await fs.writeFile(path.join(out,'noterday-ar-module-v2.svg'),markerSvg)
const markerPng=await sharp(Buffer.from(markerSvg)).resize(1280,960,{fit:'fill'}).png().toBuffer()
await fs.writeFile(path.join(out,'noterday-ar-module-v2.png'),markerPng)
const raw=await sharp(markerPng).ensureAlpha().raw().toBuffer({resolveWithObject:true})
const decoded=jsQR(new Uint8ClampedArray(raw.data),raw.info.width,raw.info.height)
if(decoded?.data!==url)throw Error('QR failed roundtrip decode')
let svg=await fs.readFile(source,'utf8')
svg=svg.replace(/<svg[^>]*>/,s=>s.replace('width="1122"','width="140mm"').replace('height="2480"','height="310mm"')+'<rect width="1122" height="2480" fill="white"/>')
const bottom=`<g id="ar-zone-v2"><rect x="0" y="1408" width="1122" height="1072" fill="white"/>
<circle id="tube-placement-ring-30mm" cx="561" cy="1688" r="${(15*unit).toFixed(4)}" fill="none" stroke="#A7191F" stroke-width="${(.45*unit).toFixed(4)}"/>
${type('试管放圆环内 · 手机从下方斜拍',561,1868,23,cn,'#241e1b','middle')}
<g id="ar-planar-target" transform="translate(${module.x} ${module.y}) scale(${unit})">${marker}</g>
${type('扫码开启香气动画',561,2330,25,cn,'#241e1b','middle')}
${type('NOTERDAY  /  AR TASTING  /  V2',561,2390,17,en,'#777','middle')}</g>`
svg=svg.replace('</svg>',bottom+'</svg>')
await fs.writeFile(path.join(out,'嘉地-品丽珠_AR测试卡_v2.svg'),svg)
const fullRaster=await sharp(Buffer.from(svg),{density:96}).resize(1683,3720,{fit:'fill'}).raw().toBuffer({resolveWithObject:true})
const png=await sharp(fullRaster.data,{raw:{width:1683,height:3720,channels:fullRaster.info.channels}}).png().toBuffer()
// Chrome's v1 PNG has no physical-density chunk. Preserve that exact print-metadata contract.
const chunks=[png.subarray(0,8)]
for(let i=8;i<png.length;){const length=png.readUInt32BE(i)+12;if(png.toString('ascii',i+4,i+8)!=='pHYs')chunks.push(png.subarray(i,i+length));i+=length}
await fs.writeFile(path.join(out,'嘉地-品丽珠_AR测试卡_v2.png'),Buffer.concat(chunks))
// Supply an explicitly clockwise-rotated portrait bitmap to the official processor.
// isRotated:false avoids hidden engine rotations: target +X = card top, +Y = card left.
const portrait=await sharp(markerPng).rotate(90).png().toBuffer()
await applyCrop(sharp(portrait),{type:'PLANAR',geometry:{left:0,top:0,width:960,height:1280,isRotated:false,originalWidth:960,originalHeight:1280}},path.join(site,'image-targets'),'noterday-jiadi-v2',true)
const dimensions={page:{widthMm:140,heightMm:310,viewBox:[1122,2480]},ring:{cx:561,cy:1688,diameterMm:30},module:{...module,widthMm:64,heightMm:48},ringFromModuleCenterMm:{x:0,y:(module.y+module.height/2-1688)/unit},tube:{diameterMm:29,heightMm:215},targetName:'noterday-jiadi-v2',targetWidthMm:48,targetHeightMm:64,cardToTargetRotationDeg:-90,qrUrl:url,qrSizeMm:34,qrVersion:qr.version,qrModules:qr.modules.size,phase:'P1-card-anchor-manual-tube-confirmation'}
await fs.writeFile(path.join(site,'geometry.json'),JSON.stringify(dimensions,null,2)+'\n')
await fs.writeFile(path.join(out,'geometry.json'),JSON.stringify(dimensions,null,2)+'\n')
// Derive garnish textures from the existing artwork; retain transparent source pixels.
const originalSvg=await fs.readFile(source,'utf8')
// The two flavor rows stay on paper. Animated flavor sprites use those same illustrations.
for(const [name,box] of Object.entries({pepper:[95,1070,170,190],berries:[320,1070,200,190],clove:[578,1080,200,180],forest:[800,1080,220,190]})){
  const [x,y,w,h]=box
  const crop=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}">${originalSvg.replace(/<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'')}</svg>`
  await sharp(Buffer.from(crop),{density:144}).resize(320,320,{fit:'inside'}).webp({quality:90}).toFile(path.join(site,'assets',name+'.webp'))
}
console.log(JSON.stringify({out,url,qrDecoded:decoded.data,geometry:dimensions},null,2))
