// Private WebGL regression only: use the production geometry/material factory.
// Intentionally isolate face rendering from image tracking and scene placement.
import {createTastingCard,CARD_SPEC} from '/v3/tasting-card.js';
const output=document.querySelector('#result');
try{
 const texture=await new THREE.TextureLoader().loadAsync('/v3/assets/tasting-card/jiadi-cabernet-franc.webp');
 const results=[];
 for(const [id,sign] of [['front',1],['back',-1]]){
  const renderer=new THREE.WebGLRenderer({canvas:document.getElementById(id),antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(680,1500,false);renderer.setClearColor(0x343638);
  const scene=new THREE.Scene(),model=createTastingCard(THREE,texture,renderer),body=model.card.children[0];scene.add(body);
  const camera=new THREE.PerspectiveCamera(45,680/1500,.1,2000);
  camera.position.z=sign*650;camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  renderer.render(scene,camera);
  const gl=renderer.getContext(),pixels=new Uint8Array(680*1500*4);
  gl.readPixels(0,0,680,1500,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  let colored=0;
  for(let i=0;i<pixels.length;i+=4)if(Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2])>40)colored++;
  results.push({face:id,artworkMapped:body.material[sign===1?4:5].map===texture,coloredPixels:colored,glError:gl.getError()});
 }
 // Deliberately lower the test card into the tube's screen region to exercise
 // the actual depth-only material. Production keeps the raised bottom edge.
 const renderer=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});
 renderer.setSize(256,256);renderer.setClearColor(0x163844);
 const model=createTastingCard(THREE,texture,renderer),scene=new THREE.Scene();scene.add(model.group);
 model.card.position.z-=CARD_SPEC.baseHeightMm;
 const camera=new THREE.PerspectiveCamera(45,1,1,2000);camera.position.set(-400,CARD_SPEC.centerY,80);camera.up.set(0,0,1);camera.lookAt(0,CARD_SPEC.centerY,14.5);
 const gl=renderer.getContext(),pixel=()=>{renderer.render(scene,camera);const p=new Uint8Array(4);gl.readPixels(128,128,1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);return [...p];};
 const withDepth=pixel();model.occluder.visible=false;const withoutDepth=pixel();
 const depthPass=withDepth[0]===22&&withDepth[1]===56&&withDepth[2]===68&&withoutDepth[0]>200;
 output.textContent=JSON.stringify({texture:[texture.image.width,texture.image.height],widthMm:CARD_SPEC.widthMm,heightMm:CARD_SPEC.heightMm,results,depth:{withDepth,withoutDepth,pass:depthPass}},null,2);
 if(!depthPass)throw Error('Real-tube depth protection failed');
}catch(error){output.textContent=String(error);throw error;}
