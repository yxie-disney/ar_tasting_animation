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
  const scene=new THREE.Scene(),model=createTastingCard(THREE,texture,renderer);scene.add(model.group);
  const camera=new THREE.PerspectiveCamera(45,680/1500,.1,2000);
  camera.position.z=sign*650;camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  renderer.render(scene,camera);
  const gl=renderer.getContext(),pixels=new Uint8Array(680*1500*4);
  gl.readPixels(0,0,680,1500,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  let colored=0;
  for(let i=0;i<pixels.length;i+=4)if(Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2])>40)colored++;
  results.push({face:id,artworkMapped:model.card.children[0].material[sign===1?4:5].map===texture,coloredPixels:colored,glError:gl.getError()});
 }
 output.textContent=JSON.stringify({texture:[texture.image.width,texture.image.height],widthMm:CARD_SPEC.widthMm,heightMm:CARD_SPEC.heightMm,results},null,2);
}catch(error){output.textContent=String(error);throw error;}
