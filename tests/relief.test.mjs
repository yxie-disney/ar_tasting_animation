import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {RELIEF,REGIONS,regionWeights,createReliefGeometry,createReliefMaterial} from '../site/ar/feifei-relief.js';
import {PaperPoseFilter} from '../site/ar/pose-filter.js';
import {createSlideshow,SLIDESHOW} from '../site/ar/slideshow.js';
import {STAGE} from '../site/ar/stage.js';
const context={console:{warn(){},log(){}}};vm.runInNewContext(await fs.readFile('site/vendor/three.min.js','utf8'),context);const THREE=context.THREE;

test('all five continuous reliefs retain original UVs, bounded thickness and pinned feet',()=>{
 assert.equal(REGIONS.length,5);
 for(let index=0;index<5;index++){
  const g=createReliefGeometry(THREE,index);let maximum=0;
  for(let i=0;i<g.attributes.uv.count;i++){
   const u=g.attributes.uv.getX(i),v=g.attributes.uv.getY(i),d=g.attributes.reliefDepth.getX(i),b=g.attributes.breathWeight.getX(i);
   assert.ok(u>=0&&u<=1&&v>=0&&v<=1);
   assert.ok(d>=0&&d<=RELIEF.depthMm+1e-6);assert.ok(b>=0&&b<=1);
   assert.ok(Math.abs(g.attributes.position.getX(i)-(u-.5))<1e-6);
   assert.ok(Math.abs(g.attributes.position.getY(i)-(v-.5))<1e-6);
   if(v===0){assert.equal(d,0);assert.equal(b,0);}
   maximum=Math.max(maximum,d);
  }
  assert.ok(maximum>2,'prop actually receives depth');
  assert.ok(SLIDESHOW.characterX-maximum-RELIEF.breathMm>STAGE.tubeRadiusMm);
  assert.ok(SLIDESHOW.characterX+maximum+RELIEF.breathMm<STAGE.centerX-1);
 }
});
test('motion cannot translate/scale the root or change the fixed stage',()=>{
 const frames=Array.from({length:5},()=>({character:new THREE.Texture({width:1252,height:1436}),card:new THREE.Texture()}));
 const m=createSlideshow(THREE,frames,{capabilities:{getMaxAnisotropy:()=>8}});
 const p=m.character.position.clone(),s=m.character.scale.clone(),q=m.character.quaternion.clone();
 m.update(.9);assert.ok(m.character.position.equals(p));assert.ok(m.character.scale.equals(s));assert.ok(m.character.quaternion.equals(q));
 assert.ok(Math.abs(m.reliefUniforms.breathAmount.value)>0);
 for(let i=0;i<5;i++){
  m.update(i+.4);assert.equal(m.character.position.x,p.x);assert.equal(m.character.position.z,p.z);
 }
 for(let i=0;i<5;i++)for(const u of [0,.25,.5,.75,1])assert.equal(regionWeights(i,u,0).breath,0);
});
test('glow is absent except on existing annotated gold fittings',()=>{
 for(const i of [0,2,3,4])for(let u=0;u<=1;u+=.05)for(let v=0;v<=1;v+=.05)assert.equal(regionWeights(i,u,v).gold,0);
 assert.ok(regionWeights(1,.85,.52).gold>0);
 assert.equal(regionWeights(1,.5,.7).gold,0,'white face is not gold');
});
test('shader patch uses production r160 chunks, preserves alpha and texture sampling',()=>{
 const material=createReliefMaterial(THREE,new THREE.Texture(),{});
 const shader={vertexShader:THREE.ShaderLib.basic.vertexShader,fragmentShader:THREE.ShaderLib.basic.fragmentShader,uniforms:{}};
 material.onBeforeCompile(shader);
 assert.match(shader.vertexShader,/transformed.z \+= reliefDepth/);assert.match(shader.fragmentShader,/diffuseColor.rgb \*=/);
 assert.match(shader.fragmentShader,/#include <map_fragment>/);assert.match(shader.fragmentShader,/#include <alphatest_fragment>/);
 assert.equal(material.depthWrite,true);assert.equal(material.depthTest,true);assert.equal(material.alphaTest,.01);
});
const pose=(x,scale=1,angle=0)=>({position:new THREE.Vector3(x,0,0),quaternion:new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),angle),scale});
test('pose filter reduces stationary depth jitter versus old fixed half-step smoothing',()=>{
 const filter=new PaperPoseFilter(THREE);let old=0,oldEnergy=0,newEnergy=0;
 for(let i=0;i<240;i++){
  const raw=i%2?1:-1;old+=(raw-old)*.5;
  const next=filter.sample({...pose(raw),t:i*1000/60,fresh:i>0});
  if(i>60){oldEnergy+=old*old;newEnergy+=next.position.x**2;}
 }
 assert.ok(newEnergy<oldEnergy*.3,`${newEnergy} vs ${oldEnergy}`);
});
test('pose filter follows deliberate movement and snaps on a genuinely new acquisition',()=>{
 const filter=new PaperPoseFilter(THREE);filter.sample({...pose(0),t:0,fresh:false});
 let result;
 for(let i=1;i<=12;i++)result=filter.sample({...pose(50,1.1,.2),t:i*1000/60,fresh:true});
 assert.ok(result.position.x>49);assert.ok(result.scale>1.09);
 result=filter.sample({...pose(-100,2,.5),t:300,fresh:false});
 assert.equal(result.position.x,-100);assert.equal(result.scale,2);
 result=filter.sample({...pose(120),t:900,fresh:true});assert.equal(result.position.x,120);
});
