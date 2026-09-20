import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {MIAO,PARTS,buildSharedField,sampleField,createMiaoRelief,addMiaoLighting} from '../site/ar/miaoyinniao-relief.js';
const context={console:{warn(){},log(){}}};
vm.runInNewContext(await fs.readFile('site/vendor/three.min.js','utf8'),context);
const THREE=context.THREE;
function fixture(){
 const width=128,height=168,owners=new Uint8Array(width*height);
 for(let y=2;y<height-2;y++)for(let x=2;x<width-2;x++)owners[y*width+x]=1+Math.min(4,Math.floor((x-2)/(width-4)*5));
 return buildSharedField(owners,width,height);
}
test('3mm includes all static displacement and both breathing extrema',()=>{
 const f=fixture();let peak=0;
 for(let i=0;i<f.width*f.height;i++){
  const low=3*(f.bytes[4*i]-f.bytes[4*i+1])/255,high=3*(f.bytes[4*i]+f.bytes[4*i+1])/255;
  assert.ok(low>=0);assert.ok(high<=3);peak=Math.max(peak,high);
  if(f.distance[i]===0){assert.equal(low,0);assert.equal(high,0);}
 }
 assert.ok(peak>1,'test is not vacuous flat field');
 for(const p of PARTS)assert.ok(p.peak+p.breath<=MIAO.envelopeMm);
});
test('continuous sampling, pinned margins and shared seam coordinates',()=>{
 const f=fixture();
 for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){
  const i=y*f.width+x,u=(x+.5)/f.width,v=(y+.5)/f.height;
  if(f.distance[i]===0)for(const phase of [-1,0,1])assert.ok(Math.abs(sampleField(f,u,v,phase))<1e-6);
 }
});
test('five independently owned components use exactly one geometry and shared uniforms',()=>{
 const f=fixture(),r=createMiaoRelief(THREE,{source:new THREE.Texture(),ownership:{bytes:new Uint8Array(16),width:2,height:2},field:f});
 assert.equal(r.group.children.length,5);
 for(const mesh of r.group.children){
  assert.equal(mesh.geometry,r.geometry);assert.equal(mesh.position.z,0);assert.equal(mesh.position.y,40);
  assert.equal(mesh.scale.x,1);assert.equal(mesh.scale.y,1);assert.ok(mesh.material.isMeshStandardMaterial);
  assert.equal(mesh.material.roughness,1);assert.equal(mesh.material.metalness,0);
  assert.equal(mesh.material.depthTest,true);assert.equal(mesh.material.depthWrite,true);
 }
 const before=r.group.children.map(m=>m.position.toArray().join(','));
 r.update(.9);assert.ok(r.uniforms.miaoPhase.value>.99);r.update(2,false);assert.equal(r.uniforms.miaoPhase.value,0);
 assert.deepEqual(r.group.children.map(m=>m.position.toArray().join(',')),before);
 r.dispose();
});
test('r160 Standard shader updates object normals BEFORE normalMatrix and preserves source alpha',()=>{
 const r=createMiaoRelief(THREE,{source:new THREE.Texture(),ownership:{bytes:new Uint8Array(16),width:2,height:2},field:fixture()});
 for(const m of r.materials){
  const s={vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader,uniforms:{}};m.onBeforeCompile(s);
  assert.match(s.vertexShader,/objectNormal=normalize/);assert.match(s.vertexShader,/transformed.z=miaoHeight\(uv\)/);
  assert.match(s.vertexShader,/return clamp\(3\.0\*miaoAmount/);
  assert.ok(s.vertexShader.indexOf('objectNormal=normalize')<s.vertexShader.indexOf('#include <defaultnormal_vertex>'));
  assert.match(s.fragmentShader,/miaoOwner/);assert.match(s.fragmentShader,/#include <map_fragment>/);assert.match(s.fragmentShader,/#include <alphatest_fragment>/);
  assert.equal(s.uniforms.miaoPhase,r.uniforms.miaoPhase);
 }
 r.dispose();
});
test('fixed stage lamp, far-side envelope, and explicit 4/5 original card baseline',()=>{
 const scene=new THREE.Scene(),{fill,key}=addMiaoLighting(THREE,scene);
 assert.equal(key.parent,scene);assert.equal(fill.parent,scene);
 assert.ok(MIAO.characterPaperX-MIAO.envelopeMm>MIAO.tubeRadiusMm);
 assert.ok(MIAO.characterPaperX<MIAO.cardPaperX);
 assert.equal(MIAO.cardOriginalWidthMm*MIAO.cardScale,172.8);
});
