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
function setup(aspect,{distance=.4,elevation=45,azimuth=180,roll=0,anchorRotation=0}={}){
 const anchor=new THREE.Group();anchor.scale.setScalar(.001);
 anchor.rotation.set(anchorRotation*.4,anchorRotation*.2,anchorRotation);anchor.updateMatrixWorld(true);
 const rad=Math.PI/180,center=new THREE.Vector3(0,CARD_SPEC.centerY*.001,0);
 const camera=new THREE.PerspectiveCamera(55,aspect,.01,100);
 camera.position.set(distance*Math.cos(elevation*rad)*Math.cos(azimuth*rad),distance*Math.cos(elevation*rad)*Math.sin(azimuth*rad),distance*Math.sin(elevation*rad)).add(center).applyQuaternion(anchor.quaternion);
 camera.up.set(0,0,1).applyQuaternion(anchor.quaternion);
 camera.lookAt(center.applyQuaternion(anchor.quaternion));camera.rotateZ(roll*rad);camera.updateMatrixWorld(true);
 const texture=new THREE.Texture();const model=createTastingCard(THREE,texture,{capabilities:{getMaxAnisotropy:()=>16}});anchor.add(model.group);model.alignOnce(anchor,camera);anchor.updateMatrixWorld(true);
 return {anchor,camera,texture,model};
}
test('original artwork is a lossless full-aspect texture, not regenerated content',async()=>{
 const dir='site/v3/assets/tasting-card/';const source=JSON.parse(await fs.readFile(dir+'source.json'));
 assert.equal(source.height,4096);assert.ok(Math.abs(source.width/source.height-1122/2480)<.001);
 assert.equal(createHash('sha256').update(await fs.readFile(dir+'jiadi-cabernet-franc.webp')).digest('hex'),source.textureSha256);
 const {texture,model}=setup(9/16);assert.equal(texture.colorSpace,THREE.SRGBColorSpace);assert.equal(model.card.children[0].material[4].toneMapped,false);
});

test('both broad faces show the complete original artwork, readable from either side',()=>{
 const {texture,model}=setup(9/16),body=model.card.children[0];
 const {geometry,material}=body;
 for(const [materialIndex,viewZ] of [[4,1000],[5,-1000]]){
  assert.equal(material[materialIndex].map,texture,`face ${materialIndex} must not be a blank backing`);
  assert.equal(material[materialIndex].toneMapped,false);
  // Inspect each actual BoxGeometry face from outside, not a DoubleSide plane
  // whose back shows mirrored text. UV right/up must remain screen right/up.
  const camera=new THREE.PerspectiveCamera(55,9/16,.1,10000);
  camera.position.set(0,0,viewZ);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  const group=geometry.groups.find(g=>g.materialIndex===materialIndex);
  const vertices=new Map();
  for(let i=group.start;i<group.start+group.count;i++){
   const index=geometry.index.getX(i),uv=new THREE.Vector2().fromBufferAttribute(geometry.attributes.uv,index);
   vertices.set(`${uv.x},${uv.y}`,new THREE.Vector3().fromBufferAttribute(geometry.attributes.position,index).project(camera));
  }
  assert.equal(vertices.size,4,'each face retains all four artwork corners');
  for(const v of [0,1])assert.ok(vertices.get(`1,${v}`).x>vertices.get(`0,${v}`).x,'text reads left to right');
  for(const u of [0,1])assert.ok(vertices.get(`${u},1`).y>vertices.get(`${u},0`).y,'artwork is upright');
 }
});
test('reading plane is upright, faces the viewer, and is entirely behind the horizontal tube',()=>{
 const {widthMm:w,heightMm:h,thicknessMm:d}=CARD_SPEC;
 for(const azimuth of [0,45,90,160,180,210,270]){
  const {anchor,camera,model}=setup(9/16,{azimuth}),card=model.card;
  const up=new THREE.Vector3(0,1,0).applyQuaternion(card.quaternion);
  const normal=new THREE.Vector3(0,0,1).applyQuaternion(card.quaternion);
  assert.ok(up.distanceTo(new THREE.Vector3(0,0,1))<1e-10,'portrait top must follow paper +Z, not lie along the paper');
  assert.ok(Math.abs(normal.z)<1e-10,'reading plane must be perpendicular to paper');
  const center=new THREE.Vector3(0,CARD_SPEC.centerY,0);
  const viewer=anchor.worldToLocal(camera.position.clone()).sub(center);viewer.z=0;viewer.normalize();
  assert.ok(normal.dot(viewer)>.999999,'front artwork must face the viewer');
  const extent=Math.abs(viewer.x)*CARD_SPEC.tubeRadiusMm+Math.abs(viewer.y)*CARD_SPEC.tubeLengthMm/2;
  for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
   const p=new THREE.Vector3(x*w/2,y*h/2,z*d/2).applyMatrix4(card.matrix);
   assert.ok(p.clone().sub(center).dot(viewer)<=-extent-CARD_SPEC.rearGapMm+1e-8,'all card corners must be behind the tube, never over it');
   assert.ok(p.z>=CARD_SPEC.baseHeightMm-1e-8,'card must not intersect the paper');
   if(y===-1)assert.ok(Math.abs(p.z-CARD_SPEC.baseHeightMm)<1e-8,'bottom stays fixed while fitting');
  }
 }
});
for(const aspect of [16/9,9/16])test(`full original card retains fixed large dimensions, not viewport-fit (${aspect})`,()=>{
 assert.equal(CARD_SPEC.widthMm,216);
 assert.ok(Math.abs(CARD_SPEC.heightMm/CARD_SPEC.widthMm-2480/1122)<1e-12);
 for(const distance of [.3,.4,.5])for(const elevation of [35,45,60])for(const azimuth of [160,180,200]){
  const {model}=setup(aspect,{distance,elevation,azimuth}),card=model.card;
  assert.equal(card.scale.x,1);assert.equal(card.scale.y,1);assert.equal(card.scale.z,1);
  assert.equal(card.children[0].geometry.parameters.width,216);
  assert.equal(card.children[0].geometry.parameters.height,CARD_SPEC.heightMm);
  assert.equal(card.position.z,CARD_SPEC.baseHeightMm+CARD_SPEC.heightMm/2);
 }
});

test('off-screen edges do not trigger shrinkage, hiding, or artwork cropping',()=>{
 const {camera,texture,model}=setup(9/16),card=model.card;
 const {widthMm:w,heightMm:h}=CARD_SPEC;
 const points=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,y])=>new THREE.Vector3(x*w/2,y*h/2,0).applyMatrix4(card.matrixWorld).project(camera));
 assert.ok(points.some(p=>Math.abs(p.x)>1||Math.abs(p.y)>1||p.z<-1||p.z>1),'fixture intentionally exceeds viewport');
 assert.equal(card.scale.x,1);assert.equal(card.visible,true);assert.equal(model.group.visible,true);
 assert.equal(texture.repeat.x,1);assert.equal(texture.repeat.y,1);
 assert.equal(texture.offset.x,0);assert.equal(texture.offset.y,0);assert.equal(texture.rotation,0);
 const uv=card.children[0].geometry.attributes.uv.array;
 assert.equal(Math.min(...uv),0);assert.equal(Math.max(...uv),1);
 const before=card.matrix.clone();camera.aspect=16/9;camera.updateProjectionMatrix();model.alignOnce(model.group.parent,camera);
 assert.ok(card.matrix.equals(before),'viewport change cannot resize the card');
});

test('phone roll and world-anchor rotation cannot lay the card down or change its viewer-side placement',()=>{
 const baseline=setup(9/16).model.card;
 for(const roll of [0,90,180,-90])for(const anchorRotation of [0,.7]){
  const {model}=setup(9/16,{roll,anchorRotation}),card=model.card;
  assert.ok(1-Math.abs(card.quaternion.dot(baseline.quaternion))<1e-10);
  assert.ok(Math.abs(card.position.x-baseline.position.x)<1e-8);
  assert.ok(Math.abs(card.position.y-baseline.position.y)<1e-8);
 }
});
test('phone movement changes perspective without moving or billboarding the card',()=>{
 const {camera,model}=setup(9/16),position=model.card.position.clone(),rotation=model.card.quaternion.clone();
 const world=model.card.getWorldPosition(new THREE.Vector3()),before=world.clone().project(camera);
 const scale=model.card.scale.clone();
 camera.position.y+=.03;camera.lookAt(0,0,0);camera.updateMatrixWorld(true);model.alignOnce(model.group.parent,camera);
 assert.ok(model.card.position.equals(position));assert.ok(model.card.quaternion.equals(rotation));
 assert.ok(model.card.scale.equals(scale));
 assert.ok(world.clone().project(camera).distanceTo(before)>.001);
});
test('real-camera evidence is sampled before opaque virtual content',async()=>{
 const app=await fs.readFile('site/v3/app.js','utf8');
 const background=app.indexOf('XR8.GlTextureRenderer.pipelineModule()'),probe=app.indexOf("name:'noterday-camera-evidence'"),content=app.indexOf('XR8.Threejs.pipelineModule()');
 assert.ok(background<probe&&probe<content);
 assert.doesNotMatch(app,/import .*createGarnish/);
});
