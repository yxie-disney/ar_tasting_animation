// A real, thin 3D card carrying the unchanged artwork, not a screen overlay.
// The paper locates the scene; it does NOT determine the reading plane.
// Paper-local +Z is up; +X is the far artwork wing in the approved QR-side view.
// Placement is a property of this printed layout, not the first camera frame.
export const CARD_SPEC=Object.freeze({
 widthMm:95,heightMm:95*2480/1122,thicknessMm:1.2,
 baseHeightMm:35,centerX:55,centerY:-18,tubeLengthMm:215,tubeRadiusMm:14.5
});
export function createTastingCard(THREE,texture,renderer){
 const group=new THREE.Group(),card=new THREE.Group();group.add(card);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 texture.minFilter=THREE.LinearMipmapLinearFilter;
 texture.magFilter=THREE.LinearFilter;
 const face=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
 const side=new THREE.MeshBasicMaterial({color:0xe7dfd4,toneMapped:false});
 const {widthMm:w,heightMm:h,thicknessMm:d}=CARD_SPEC;
 // Both broad faces carry the original image. BoxGeometry supplies outward
 // UVs per face, so the reverse reads normally rather than mirroring text.
 // Never expose a blank backing when the viewer sees the opposite side.
 const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[side,side,side,side,face,face]);
 card.add(body);
 card.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
  new THREE.Vector3(0,-1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(-1,0,0)
 ));
 card.position.set(CARD_SPEC.centerX,CARD_SPEC.centerY,CARD_SPEC.baseHeightMm+h/2);
 // Camera video has no scene depth. This invisible, known-layout tube proxy
 // writes depth BEFORE the card so the real tube can occlude virtual content.
 // It is not real-time segmentation or a claim of arbitrary bottle tracking.
 const occluder=new THREE.Mesh(
  new THREE.CylinderGeometry(CARD_SPEC.tubeRadiusMm,CARD_SPEC.tubeRadiusMm,CARD_SPEC.tubeLengthMm,48),
  new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true,depthTest:true})
 );
 occluder.position.set(0,CARD_SPEC.centerY,CARD_SPEC.tubeRadiusMm);
 occluder.renderOrder=-10;group.add(occluder);
 let aligned=false;
 function alignOnce(){
  if(aligned)return;
  card.updateWorldMatrix(true,false);
  aligned=true;
 }
 return {group,card,occluder,alignOnce,update(){},get aligned(){return aligned}};
}
