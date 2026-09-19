// A real, thin 3D card carrying the unchanged artwork, not a screen overlay.
// The paper locates the scene; it does NOT determine the reading plane.
// Card-local +Z is above the paper. Capture the viewer's side once, then keep
// the portrait card upright BEHIND the tube as the phone moves.
export const CARD_SPEC=Object.freeze({
 widthMm:216,heightMm:216*2480/1122,thicknessMm:1.2,
 baseHeightMm:12,centerY:-18,tubeLengthMm:215,tubeRadiusMm:14.5,
 rearGapMm:10
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
  // Full original artwork at a fixed, LARGE physical size. Off-screen edges
  // are intentional: the user is inspecting the available virtual space.
  // Never fit-to-screen, reflow text, crop UVs, or shrink after camera motion.
  card.scale.setScalar(1);
  card.position.z=CARD_SPEC.baseHeightMm+h/2;
  card.updateWorldMatrix(true,false);
  aligned=true;
 }
 return {group,card,alignOnce,update(){},get aligned(){return aligned}};
}
