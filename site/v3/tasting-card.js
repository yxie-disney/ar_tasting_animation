// A real, thin 3D card carrying the unchanged artwork, not a screen overlay.
// Its reading orientation is captured once; moving the phone reveals parallax.
export const CARD_SPEC=Object.freeze({widthMm:108,heightMm:108*2480/1122,thicknessMm:1.2,liftMm:68,centerY:-18,viewerOffsetMm:30});
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
 card.add(body);card.position.set(0,CARD_SPEC.centerY,CARD_SPEC.liftMm);
 let aligned=false;
 const qAnchor=new THREE.Quaternion(),qCamera=new THREE.Quaternion();
 function alignOnce(anchor,camera){
  if(aligned)return;
  anchor.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  anchor.getWorldQuaternion(qAnchor);camera.getWorldQuaternion(qCamera);
  // A small viewer-side offset gives the tall card headroom in the same view;
  // it does not alter the physical tube placement or tracking target.
  const towardViewer=anchor.worldToLocal(camera.getWorldPosition(new THREE.Vector3()));towardViewer.z=0;towardViewer.normalize().multiplyScalar(CARD_SPEC.viewerOffsetMm);
  card.position.set(towardViewer.x,CARD_SPEC.centerY+towardViewer.y,CARD_SPEC.liftMm);
  const relative=qAnchor.invert().multiply(qCamera);
  const normal=new THREE.Vector3(0,0,1).applyQuaternion(relative);
  // Tilt at most 25 degrees from the physical card; keep every corner above
  // the tube instead of letting a tall camera-facing card intersect the table.
  const angle=Math.acos(THREE.MathUtils.clamp(normal.z,-1,1));
  if(angle>25*Math.PI/180){const axis=new THREE.Vector3(-normal.y,normal.x,0).normalize();normal.set(0,0,1).applyAxisAngle(axis,25*Math.PI/180);}
  const up=new THREE.Vector3(0,1,0).applyQuaternion(relative).projectOnPlane(normal).normalize();
  const right=new THREE.Vector3().crossVectors(up,normal).normalize();up.crossVectors(normal,right).normalize();
  card.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,normal));
  // Fit the full original portrait card in the initial viewport. Then freeze
  // its physical dimensions/orientation; no camera-following billboard effect.
  const center=card.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse);
  const distance=Math.abs(center.z),scale=anchor.getWorldScale(new THREE.Vector3()).x;
  const vertical=2*distance/Math.abs(camera.projectionMatrix.elements[5]);
  const horizontal=2*distance/Math.abs(camera.projectionMatrix.elements[0]);
  card.scale.setScalar(Math.max(.65,Math.min(1.35,.78*vertical/(h*scale),.8*horizontal/(w*scale))));
  const corner=new THREE.Vector3();
  for(let attempt=0;attempt<28;attempt++){
   const halfDepth=(Math.abs(right.z)*w+Math.abs(up.z)*h)*card.scale.x/2;
   card.position.z=Math.max(CARD_SPEC.liftMm,29+14+halfDepth);
   card.updateWorldMatrix(true,false);
   const fits=[[-1,-1],[-1,1],[1,-1],[1,1]].every(([x,y])=>{
    corner.set(x*w/2,y*h/2,0).applyMatrix4(card.matrixWorld).project(camera);
    return Math.abs(corner.x)<.9&&Math.abs(corner.y)<.9&&corner.z<1;
   });
   if(fits)break;
   card.scale.multiplyScalar(.94);
  }
  aligned=true;
 }
 return {group,card,alignOnce,update(){},get aligned(){return aligned}};
}
