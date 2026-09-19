import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createTastingCard,CARD_SPEC} from '../site/v3/tasting-card.js';
let THREE;
try{THREE=await import('three');}catch{
 const context={console:{warn(){},log(){}}};vm.runInNewContext(await fs.readFile('site/vendor/three.min.js','utf8'),context);THREE=context.THREE;
}
function setup(aspect){
 const anchor=new THREE.Group();anchor.scale.setScalar(.001);
 const camera=new THREE.PerspectiveCamera(55,aspect,.01,100);camera.position.set(0,-.3,.4);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
 const texture=new THREE.Texture();const model=createTastingCard(THREE,texture,{capabilities:{getMaxAnisotropy:()=>16}});anchor.add(model.group);model.alignOnce(anchor,camera);anchor.updateMatrixWorld(true);
 return {anchor,camera,texture,model};
}
test('original artwork is a lossless full-aspect texture, not regenerated content',async()=>{
 const dir='site/v3/assets/tasting-card/';const source=JSON.parse(await fs.readFile(dir+'source.json'));
 assert.equal(source.height,4096);assert.ok(Math.abs(source.width/source.height-1122/2480)<.001);
 assert.equal(createHash('sha256').update(await fs.readFile(dir+'jiadi-cabernet-franc.webp')).digest('hex'),source.textureSha256);
 const {texture,model}=setup(9/16);assert.equal(texture.colorSpace,THREE.SRGBColorSpace);assert.equal(model.card.children[0].material[4].toneMapped,false);
});
for(const aspect of [16/9,9/16])test(`initial card is fully visible and all corners clear the tube (${aspect})`,()=>{
 const {camera,model}=setup(aspect);const {widthMm:w,heightMm:h}=CARD_SPEC;
 for(const x of [-1,1])for(const y of [-1,1]){
  const p=new THREE.Vector3(x*w/2,y*h/2,0).applyMatrix4(model.card.matrixWorld);
  assert.ok(p.z>=.043-.001);p.project(camera);assert.ok(Math.abs(p.x)<.9&&Math.abs(p.y)<.9&&p.z<1);
 }
});
test('phone movement changes perspective without moving or billboarding the card',()=>{
 const {camera,model}=setup(9/16),position=model.card.position.clone(),rotation=model.card.quaternion.clone();
 const world=model.card.getWorldPosition(new THREE.Vector3()),before=world.clone().project(camera);
 camera.position.x+=.03;camera.lookAt(0,0,0);camera.updateMatrixWorld(true);model.alignOnce(model.group.parent,camera);
 assert.ok(model.card.position.equals(position));assert.ok(model.card.quaternion.equals(rotation));
 assert.ok(world.clone().project(camera).distanceTo(before)>.001);
});
test('real-camera evidence is sampled before opaque virtual content',async()=>{
 const app=await fs.readFile('site/v3/app.js','utf8');
 const background=app.indexOf('XR8.GlTextureRenderer.pipelineModule()'),probe=app.indexOf("name:'noterday-camera-evidence'"),content=app.indexOf('XR8.Threejs.pipelineModule()');
 assert.ok(background<probe&&probe<content);
 assert.doesNotMatch(app,/import .*createGarnish/);
});
