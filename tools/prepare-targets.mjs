import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE||'sharp');
const source=process.env.AR_CARD_MASTER||'assets/printed-card/嘉地-品丽珠_立牌01.png';
const image=sharp(await fs.readFile(source)),meta=await image.metadata();
const specs=[
  {name:'garden-near',rect:[2,94,67,132]},
  {name:'garden-far',rect:[110,42,68,160]},
];
const targets=[];
for(const spec of specs){
 const [x,y,w,h]=spec.rect;
 const box={left:Math.round(x/180*meta.width),top:Math.round(y/270*meta.height),width:Math.round(w/180*meta.width),height:Math.round(h/270*meta.height)};
 // Same PLANAR grayscale/resize representation as the official target CLI.
 const crop=sharp(await image.clone().extract(box).png().toBuffer());
 const png=await crop.resize({height:480}).grayscale().png().toBuffer();
 const output=await sharp(png).metadata();
 await fs.writeFile(`site/ar/image-targets/${spec.name}.png`,png);
 const data={name:spec.name,type:'PLANAR',imagePath:`image-targets/${spec.name}.png`,properties:{left:0,top:0,width:output.width,height:output.height,isRotated:false,originalWidth:output.width,originalHeight:output.height}};
 await fs.writeFile(`site/ar/image-targets/${spec.name}.json`,JSON.stringify(data,null,2)+'\n');
 targets.push({name:spec.name,widthMm:w,offset:[x+w/2-90,135-y-h/2],file:`image-targets/${spec.name}.json`});
}
targets.push({name:'noterday-vertical-01',widthMm:180,offset:[0,0],file:'image-targets/noterday-vertical-01.json'});
const existing=JSON.parse(await fs.readFile('site/ar/targets.json','utf8').catch(()=>'[]'));
await fs.writeFile('site/ar/targets.json',JSON.stringify([...existing.filter(t=>t.name.startsWith('print-')), ...targets],null,2)+'\n');
console.log(targets);
