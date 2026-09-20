import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root = 'assets/feifei-layers/';
const manifest = JSON.parse(await fs.readFile(root + 'manifest.json'));
const frames = [];
for (const [i, frame] of manifest.frames.entries()) {
 const state = JSON.parse(await fs.readFile(`${root}${frame.id}/surface/state.json`));
 const source = `assets/slides/feifei-${i+1}.png`;
 const bytes = await fs.readFile('site/ar/' + source);
 const hash = createHash('sha256').update(bytes).digest('hex');
 if (hash !== frame.sourceSha256) throw Error('Source changed: ' + frame.id);
 const canvas = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
 if (canvas.some((v,i) => v !== frame.canvas[i])) throw Error('Canvas mismatch');
 const destination = `site/ar/assets/relief/${frame.id}/`;
 await fs.mkdir(destination, {recursive:true});
 for (const name of ['ownership.u8','control.rgba8']) await fs.copyFile(`${root}${frame.id}/surface/${name}`, destination + name);
 // Only geometry inputs; obsolete horizontal placement stays out of the runtime.
 const spec = Object.fromEntries(['heightMm','widthMm','envelopeMm','taperMm','periodSeconds','segmentsX','segmentsY'].map(k => [k,state.spec[k]]));
 frames.push({id:frame.id,name:frame.name,source,sourceSha256:hash,canvas,spec,
   parts:state.components.map(({id,peak,breath})=>({id,peak,breath})),
   controlWidth:state.control.width,controlHeight:state.control.height});
}
await fs.writeFile('site/ar/assets/relief/manifest.json', JSON.stringify({frames},null,2)+'\n');
console.log(frames.map(f=>`${f.id}: ${f.canvas.join('×')} (unchanged)`).join('\n'));
