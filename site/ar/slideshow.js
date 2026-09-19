import {STAGE} from './stage.js?release=20260919-feifei-relief';
import {createTastingCard} from './tasting-card.js?release=20260919-feifei-relief';
import {RELIEF,createReliefGeometry,createReliefMaterial} from './feifei-relief.js?release=20260919-feifei-relief';

// Five equal tube segments, using their centres in the approved viewer's
// left-to-right direction. All dimensions share the existing paper frame.
export const SLIDESHOW=Object.freeze({
 frameMs:1000,count:5,characterHeightMm:80,
 characterX:(STAGE.tubeRadiusMm+STAGE.centerX)/2,
 baseHeightMm:STAGE.baseHeightMm
});
export function frameAt(seconds){
 return Math.floor(Math.max(0,Number.isFinite(seconds)?seconds:0)*1000/SLIDESHOW.frameMs)%SLIDESHOW.count;
}
export function stationY(index){return STAGE.centerY-(index-2)*STAGE.tubeLengthMm/SLIDESHOW.count;}

export async function loadSlideAssets(THREE){
 const response=await fetch(new URL('assets/slides/manifest.json?release=20260919-feifei-relief',import.meta.url));
 if(!response.ok)throw Error('Slide manifest unavailable');
 const manifest=await response.json();
 if(manifest.frames.length!==SLIDESHOW.count)throw Error('Exactly five frames required');
 const loader=new THREE.TextureLoader();
 return Promise.all(manifest.frames.map(async frame=>{
  const [character,sourceCard]=await Promise.all([frame.character,frame.card].map(file=>loader.loadAsync(new URL(file,import.meta.url).href)));
  // Original print PNGs contain transparency. Composite on white paper, not
  // black WebGL RGB. No cropping, reflow, colour enhancement or generated art.
  const canvas=document.createElement('canvas');
  canvas.width=sourceCard.image.width;canvas.height=sourceCard.image.height;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(sourceCard.image,0,0);
  const card=new THREE.CanvasTexture(canvas);sourceCard.dispose();
  return {...frame,character,card};
 }));
}

export function createSlideshow(THREE,frames,renderer){
 if(frames.length!==SLIDESHOW.count)throw Error('Exactly five loaded frames required');
 for(const frame of frames)for(const texture of [frame.card,frame.character]){
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
  texture.needsUpdate=true;
  // Upload every texture before starting the loop; no network/decoding work
  // is allowed at a one-second boundary.
  renderer.initTexture?.(texture);
 }
 const model=createTastingCard(THREE,frames[0].card,renderer);
 const character=new THREE.Group();character.quaternion.copy(model.card.quaternion);model.group.add(character);
 const uniforms={reliefAmount:{value:1},breathAmount:{value:0},glowPhase:{value:0},glowStrength:{value:RELIEF.glowStrength}};
 const material=createReliefMaterial(THREE,frames[0].character,uniforms);
 const geometries=frames.map((_,i)=>createReliefGeometry(THREE,i));
 // Shallow continuous relief uses original texture UVs on both sides. The
 // missing art behind a separated hand/prop is never hallucinated or exposed.
 const geometry=geometries[0];
 const front=new THREE.Mesh(geometry,material),back=new THREE.Mesh(geometry,material);
 front.position.z=.01;back.position.z=-.01;back.rotation.y=Math.PI;character.add(front,back);
 let frameIndex=-1;
 function update(seconds){
  const t=Number.isFinite(seconds)?Math.max(0,seconds):0;
  uniforms.breathAmount.value=RELIEF.breathMm*Math.sin(2*Math.PI*t/RELIEF.periodSeconds);
  // Sweep stays over the existing fittings even during their one-second slot;
  // a global five-second phase would miss them on every repeated cycle.
  uniforms.glowPhase.value=4.2+.7*Math.sin(2*Math.PI*t/3.6);
  const next=frameAt(t);if(next===frameIndex)return;
  const frame=frames[next],image=frame.character.image;
  material.map=frame.character;
  front.geometry=geometries[next];back.geometry=geometries[next];
  model.card.children[0].material[4].map=frame.card;
  model.card.children[0].material[5].map=frame.card;
  character.scale.set(SLIDESHOW.characterHeightMm*image.width/image.height,SLIDESHOW.characterHeightMm,1);
  character.position.set(SLIDESHOW.characterX,stationY(next),SLIDESHOW.baseHeightMm+SLIDESHOW.characterHeightMm/2);
  frameIndex=next;
 }
 update(0);
 return {...model,character,update,reliefUniforms:uniforms,get aligned(){return model.aligned;},get frameIndex(){return frameIndex;}};
}
