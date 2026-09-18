import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import {applyCrop} from '@8thwall/image-target-cli/src/apply.js'
const root=process.cwd(),out=path.resolve(process.env.AR_PRINT_OUTPUT ?? 'design/card-marker/vertical-01'),site=path.join(root,'site/v3')
await fs.mkdir(out,{recursive:true});await fs.mkdir(path.join(site,'image-targets'),{recursive:true})
if(!process.env.AR_VERTICAL_ART)throw Error('Set AR_VERTICAL_ART to the selected illustration PNG, and run from the repo root.');const art=await fs.readFile(process.env.AR_VERTICAL_ART)
const url='https://yxie-disney.github.io/ar_tasting_animation/v3/'
const qr=QRCode.create(url,{errorCorrectionLevel:'M'}),qrMm=29,qrX=6.2,qrY=230.1,q=4,step=qrMm/(qr.modules.size+2*q)
let cells='';for(let y=0;y<qr.modules.size;y++)for(let x=0;x<qr.modules.size;x++)if(qr.modules.get(y,x))cells+=`<rect x="${qrX+(x+q)*step}" y="${qrY+(y+q)*step}" width="${step}" height="${step}"/>`
// Keep generated illustration intact. Exact engineering marks/QR are separate vector layers.
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="180mm" height="270mm" viewBox="0 0 180 270"><title>嘉地品丽珠立牌定位样稿 01</title><image width="180" height="270" href="data:image/png;base64,${art.toString('base64')}"/><g id="qr-entry"><rect x="${qrX}" y="${qrY}" width="${qrMm}" height="${qrMm}" fill="white"/><g fill="#2b2723">${cells}</g></g><g id="tube-register" fill="none" stroke="#9c8980" stroke-width="0.18"><path d="M72.5 54v-4h4 M103.5 50h4v4 M72.5 266v4h4 M103.5 270h4v-4 M90 267v3"/></g></svg>`
await fs.writeFile(path.join(out,'嘉地-品丽珠_立牌01.svg'),svg)
const png=await sharp(Buffer.from(svg),{density:300}).resize(2126,3189,{fit:'fill'}).png().toBuffer()
await fs.writeFile(path.join(out,'嘉地-品丽珠_立牌01.png'),png)
const raw=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});const decoded=jsQR(new Uint8ClampedArray(raw.data),raw.info.width,raw.info.height)
if(decoded?.data!==url)throw Error('QR round trip failed')
const target=await sharp(png).resize(960,1440).png().toBuffer()
await applyCrop(sharp(target),{type:'PLANAR',geometry:{left:0,top:0,width:960,height:1440,isRotated:false,originalWidth:960,originalHeight:1440}},path.join(site,'image-targets'),'noterday-vertical-01',true)
await sharp(png).resize(720,1080).webp({quality:88}).toFile(path.join(site,'card.webp'))
const g={version:'vertical-01',card:{widthMm:180,heightMm:270},tube:{heightMm:215,diameterMm:29,centerX:0,placement:'manual two-point registration; tube touching board, axis parallel to board plane',previewBaseY:-160,centerZ:14.5,backGapMm:0},reserve:{widthMm:35,heightMm:220},targetName:'noterday-vertical-01',targetWidthMm:180,qr:{url,xMm:qrX,yMm:qrY,sizeMm:qrMm,modules:qr.modules.size,quietModules:q},proposedView:{distanceMm:500,yawDeg:[-25,0,25],pitchDeg:10},phase:'vertical calibration only; no automatic tube detection; no final garnish'}
await fs.writeFile(path.join(site,'geometry.json'),JSON.stringify(g,null,2));await fs.writeFile(path.join(out,'geometry.json'),JSON.stringify(g,null,2))
console.log(JSON.stringify({out,site,qrDecoded:decoded.data,cardMm:[180,270],qrModules:qr.modules.size}))
