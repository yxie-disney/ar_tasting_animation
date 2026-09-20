import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import vm from 'node:vm';import {createHash} from 'node:crypto';
import {profileFor,buildSharedField,createSurfaceRelief} from '../site/ar/feifei-surface.js';
const root='assets/feifei-layers/',manifest=JSON.parse(await fs.readFile(root+'manifest.json','utf8'));
const ctx={console:{warn(){}}};vm.runInNewContext(await fs.readFile('site/vendor/three.min.js','utf8'),ctx);const THREE=ctx.THREE;
for(const [idx,frame] of manifest.frames.entries())test(frame.id+': generated mesh, RGBA controls, physical bounds and component states',async()=>{
 const dir=root+frame.id+'/surface/',state=JSON.parse(await fs.readFile(dir+'state.json','utf8'));
 const {spec,parts}=profileFor(frame),raw=new Uint8Array(await fs.readFile(dir+'ownership.u8'));
 const [w,h]=frame.canvas,fw=256,fh=340,owners=new Uint8Array(fw*fh);
 assert.equal(raw.length,w*h);
 for(let y=0;y<fh;y++)for(let x=0;x<fw;x++)owners[y*fw+x]=raw[Math.min(h-1,Math.floor((y+.5)/fh*h))*w+Math.min(w-1,Math.floor((x+.5)/fw*w))];
 const field=buildSharedField(owners,fw,fh,spec,parts),bytes=await fs.readFile(dir+'control.rgba8');
 assert.deepEqual(Buffer.from(field.bytes),bytes,'offline bytes equal runtime formula');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),state.control.sha256);
 if(idx===1)assert.deepEqual(Buffer.from(buildSharedField(owners,fw,fh).bytes),bytes,'Miao baseline unchanged');
 for(let i=0;i<owners.length;i++){
  assert.ok(3*(bytes[4*i]+bytes[4*i+1])/255<=3);assert.ok(bytes[4*i]>=bytes[4*i+1]);
  if(field.distance[i]===0){assert.equal(bytes[4*i],0);assert.equal(bytes[4*i+1],0);}
 }
 const geometry=new THREE.BufferGeometryLoader().parse(JSON.parse(await fs.readFile(dir+'mesh.json','utf8')));
 const r=createSurfaceRelief(THREE,{source:new THREE.Texture(),ownership:{bytes:new Uint8Array(4),width:1,height:1},field,spec,parts,geometry});
 assert.equal(geometry.attributes.position.count,12513);assert.equal(geometry.index.count/3,24576);
 assert.equal(r.group.children.length,frame.layers.length);
 for(const [i,m] of r.group.children.entries()){assert.equal(m.name,frame.layers[i].id);assert.equal(m.geometry,geometry);assert.equal(m.position.z,0);}
 const uv=geometry.attributes.uv,pos=geometry.attributes.position;
 for(let i=0;i<uv.count;i++){assert.ok(Math.abs(pos.getX(i)-(uv.getX(i)-.5)*spec.widthMm)<1e-4);assert.ok(Math.abs(pos.getY(i)-(uv.getY(i)-.5)*80)<1e-4);}
 assert.ok(state.numericChecks.frontmostPaperX>14.5);assert.equal(state.playback.station,idx);assert.equal(state.playback.frameDurationSeconds,1);
 for(const p of parts)if(!['body','wings-rear','cape-rear'].includes(p.id))assert.equal(p.breath,0,'rigid prop/hand does not breathe');
 assert.equal(spec.cardOriginalWidthMm*spec.cardScale,172.8);
 const hash=createHash('sha256').update(await fs.readFile(`site/ar/assets/slides/feifei-${idx+1}.png`)).digest('hex');assert.equal(hash,frame.sourceSha256);
 r.dispose();
});
test('all 23 components are inventoried, no new artwork or online mutation claim',async()=>{
 const index=JSON.parse(await fs.readFile(root+'surfaces.json','utf8'));assert.equal(index.components,23);assert.equal(index.frames.length,5);assert.equal(index.onlineChanged,false);
});
