// A real, thin 3D card carrying the unchanged artwork, not a screen overlay.
// The paper locates the scene; it does NOT determine the reading plane.
// Card-local +Z is above the paper. Capture the viewer's side once, then keep
// the portrait card upright BEHIND the tube as the phone moves.
export const CARD_SPEC=Object.freeze({
 widthMm:108,heightMm:108*2480/1122,thicknessMm:1.2,
 baseHeightMm:12,centerY:-18,tubeLengthMm:215,tubeRadiusMm:14.5,
 rearGapMm:10,minScale:.3,viewportMargin:.9
});
export function createTastingCard(THREE,texture,renderer){
 const group=new THREE.Group(),card=new THREE.Group();group.add(card);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 texture.minFilter=THREE.LinearMipmapLinearFilter;
 texture.magFilter=THREE.LinearFilter;
 const face=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
 const side=new THREE.MeshBasicMaterial({color:0xe7dfd4,toneMapped:false});
 const back=new THREE.MeshBasicMaterial({color:0xfffdf8,toneMapped:false});
 const {widthMm:w,heightMm:h,thicknessMm:d}=CARD_SPEC;
 const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[side,side,side,side,face,back]);
 card.add(body);
 let aligned=false;
 function alignOnce(anchor,camera){
  if(aligned)return;
  anchor.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  const tubeCenter=new THREE.Vector3(0,CARD_SPEC.centerY,0);
  const normal=anchor.worldToLocal(camera.getWorldPosition(new THREE.Vector3())).sub(tubeCenter);
  normal.z=0;
  if(normal.lengthSq()<1e-6)normal.set(-1,0,0);
  normal.normalize();
  // Card up is the physical paper's normal, NEVER camera up or paper Y.
  // This remains correct when the phone is held in portrait or rolled.
  const up=new THREE.Vector3(0,0,1);
  const right=new THREE.Vector3().crossVectors(up,normal).normalize();
  card.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,normal));
  // Conservative tube footprint support along the viewing direction. The
  // WHOLE virtual card is behind its far edge, including at oblique azimuths.
  const tubeExtent=Math.abs(normal.x)*CARD_SPEC.tubeRadiusMm+Math.abs(normal.y)*CARD_SPEC.tubeLengthMm/2;
  const setback=tubeExtent+CARD_SPEC.rearGapMm+d/2;
  card.position.copy(tubeCenter).addScaledVector(normal,-setback);
  // Fit around a fixed bottom edge, without laying the card down, shifting it
  // toward the viewer, cropping artwork, or shrinking it without a lower bound.
  const corner=new THREE.Vector3();
  function placeAtScale(scale){
   card.scale.setScalar(scale);
   card.position.z=CARD_SPEC.baseHeightMm+h*scale/2;
   card.updateWorldMatrix(true,false);
  }
  function fits(){
   for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
    corner.set(x*w/2,y*h/2,z*d/2).applyMatrix4(card.matrixWorld).project(camera);
    if(Math.abs(corner.x)>=CARD_SPEC.viewportMargin||Math.abs(corner.y)>=CARD_SPEC.viewportMargin||corner.z<=-1||corner.z>=1)return false;
   }
   return true;
  }
  placeAtScale(1);
  while(!fits()&&card.scale.x>CARD_SPEC.minScale){
   placeAtScale(Math.max(CARD_SPEC.minScale,card.scale.x*.96));
  }
  aligned=true;
 }
 return {group,card,alignOnce,update(){},get aligned(){return aligned}};
}
