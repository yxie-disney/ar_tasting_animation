// Deterministic SVG rasterization, not generative image editing.
// The source is never overwritten; typography, illustration and colors stay intact.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE||'sharp');
const source=process.argv[2];
if(!source)throw Error('Pass the approved tasting-card SVG path.');
const bytes=await fs.readFile(source);
const output='site/v3/assets/tasting-card';
await fs.mkdir(output,{recursive:true});
const texture=await sharp(bytes,{density:144}).resize({height:4096}).flatten({background:'#ffffff'}).toColourspace('srgb').webp({lossless:true,effort:6}).toBuffer();
await fs.writeFile(output+'/jiadi-cabernet-franc.webp',texture);
const info=await sharp(texture).metadata();
await fs.writeFile(output+'/source.json',JSON.stringify({sourceFile:path.basename(source),sourceSha256:createHash('sha256').update(bytes).digest('hex'),textureSha256:createHash('sha256').update(texture).digest('hex'),width:info.width,height:info.height,conversion:'Original outlined SVG rendered on white in sRGB; no redraw, retouch, text replacement, or color boost.',printMaster:false},null,2)+'\n');
console.log(JSON.stringify({output:output+'/jiadi-cabernet-franc.webp',width:info.width,height:info.height,bytes:texture.length}));
