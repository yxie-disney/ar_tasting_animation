import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {STAGE} from '../site/ar/stage.js';
import {createSlideshow,frameAt,stationY,SLIDESHOW} from '../site/ar/slideshow.js';
let THREE;
try{THREE=await import('three');}catch{
 const context={console:{warn(){},log(){}}};vm.runInNewContext(await fs.readFile('site/vendor/three.min.js','utf8'),context);THREE=context.THREE;
}
function setup(){
 const frames=Array.from({length:5},(_,i)=>({character:new THREE.Texture({width:1252+i*10,height:1436}),card:new THREE.Texture({width:1683,height:3720})}));
 let uploads=0;
 const model=createSlideshow(THREE,frames,{capabilities:{getMaxAnisotropy:()=>8},initTexture(){uploads++;}});
 return {model,frames,uploads};
}
test('exactly one frame per second, hard wrap 5 to 1, no fractional station',()=>{
 for(let cycle=0;cycle<10;cycle++)for(let i=0;i<5;i++){
  assert.equal(frameAt(cycle*5+i),i);assert.equal(frameAt(cycle*5+i+.999),i);
 }
 assert.equal(frameAt(NaN),0);assert.equal(frameAt(-1),0);
});
test('all ten textures upload first; card/character/station switch atomically',()=>{
 const {model,frames,uploads}=setup();assert.equal(uploads,10);
 const pos=model.card.position.clone(),rotation=model.card.quaternion.clone(),scale=model.card.scale.clone();
 for(const second of [0,.999,1,1.999,2,3,4,4.999,5,6,9,10]){
  model.update(second);const i=frameAt(second);assert.equal(model.frameIndex,i);
  assert.equal(model.card.children[0].material[4].map,frames[i].card);
  assert.equal(model.card.children[0].material[5].map,frames[i].card);
  assert.equal(model.character.children[0].material.map,frames[i].character);
  assert.equal(model.character.position.y,stationY(i));
  assert.ok(model.card.position.equals(pos));assert.ok(model.card.quaternion.equals(rotation));assert.ok(model.card.scale.equals(scale));
  assert.ok(Math.abs(model.character.scale.x/model.character.scale.y-frames[i].character.image.width/frames[i].character.image.height)<1e-12);
 }
});
test('character stands between tube and unchanged card with real depth',()=>{
 const {model}=setup();const x=model.character.position.x;
 assert.ok(x>STAGE.tubeRadiusMm);assert.ok(x<model.card.position.x-1);
 assert.equal(model.character.position.z-SLIDESHOW.characterHeightMm/2,STAGE.baseHeightMm);
 assert.ok(model.character.quaternion.equals(model.card.quaternion));
 assert.equal(model.character.children[0].material.transparent,true);
 assert.equal(model.character.children[0].material.depthWrite,true);
 assert.ok(model.occluder.renderOrder<model.character.children[0].renderOrder);
 const stations=Array.from({length:5},(_,i)=>stationY(i));
 for(let i=1;i<5;i++)assert.ok(Math.abs(stations[i-1]-stations[i]-43)<1e-10);
 assert.equal(stations[0],STAGE.centerY+86);assert.equal(stations[4],STAGE.centerY-86);
 const camera=new THREE.PerspectiveCamera(55,9/16,1,2000);camera.up.set(0,0,1);
 camera.position.set(-500,STAGE.centerY,250);camera.lookAt(0,STAGE.centerY,80);camera.updateMatrixWorld(true);
 const projected=stations.map(y=>new THREE.Vector3(x,y,75).project(camera).x);
 for(let i=1;i<5;i++)assert.ok(projected[i]>projected[i-1],'station order must be viewer left to right');
});
test('five complete source card PNGs and five alpha character PNGs are available',async()=>{
 const manifest=JSON.parse(await fs.readFile('site/ar/assets/slides/manifest.json'));
 assert.equal(manifest.frames.length,5);
 for(const frame of manifest.frames)for(const key of ['character','card']){
  const bytes=await fs.readFile('site/ar/'+frame[key]);
  assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes[25],6,'preserve original RGBA data');
  const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
  if(key==='card')assert.equal(w/h,1122/2480);
 }
});
