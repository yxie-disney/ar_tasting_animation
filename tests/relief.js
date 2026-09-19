import {loadSlideAssets,createSlideshow} from '/ar/slideshow.js';
const frames=await loadSlideAssets(THREE),results=[];
const renderer=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setSize(470,520);renderer.setClearColor(0x52605a);
const model=createSlideshow(THREE,frames,renderer),scene=new THREE.Scene();scene.add(model.character);
const camera=new THREE.OrthographicCamera(-47,47,52,-52,.1,1000);
function shot(index,depth,phase,angle,label,glow=0){
 model.update(index);model.character.position.set(0,0,0);model.character.quaternion.identity();
 model.reliefUniforms.reliefAmount.value=depth;model.reliefUniforms.breathAmount.value=phase;model.reliefUniforms.glowStrength.value=glow;model.reliefUniforms.glowPhase.value=4.5;
 camera.position.set(200*Math.sin(angle),0,200*Math.cos(angle));camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
 renderer.render(scene,camera);
 const gl=renderer.getContext(),pixels=new Uint8Array(470*520*4);gl.readPixels(0,0,470,520,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
 if(label){const fig=document.createElement('figure'),canvas=document.createElement('canvas');canvas.width=470;canvas.height=520;canvas.getContext('2d').drawImage(renderer.domElement,0,0);const caption=document.createElement('figcaption');caption.textContent=label;fig.append(canvas,caption);document.querySelector('#images').append(fig);}
 return {pixels,error:gl.getError()};
}
function changed(a,b){let n=0;for(let i=0;i<a.length;i+=4)if(Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]))>3)n++;return n;}
for(let i=0;i<5;i++){
 const flat=shot(i,0,0,0,`${i+1} original`),front=shot(i,1,0,0,`${i+1} relief front`);
 const flatSide=shot(i,0,0,.5),side=shot(i,1,0,.5,`${i+1} relief oblique`);
 const inhale=shot(i,1,.28,.5),exhale=shot(i,1,-.28,.5);
 const back=shot(i,1,0,Math.PI),glow=shot(i,1,0,0,i===1?'2 existing gold fittings, glow on':null,.055);
 results.push({frame:i+1,frontPixelsChanged:changed(flat.pixels,front.pixels),backPixelsChanged:changed(front.pixels,back.pixels),obliquePixelsChanged:changed(flatSide.pixels,side.pixels),breathingPixelsChanged:changed(inhale.pixels,exhale.pixels),glowPixelsChanged:changed(front.pixels,glow.pixels),glErrors:[flat.error,front.error,side.error,inhale.error,exhale.error,back.error,glow.error]});
}
document.querySelector('#result').textContent=JSON.stringify({results,programs:renderer.info.programs.map(p=>({diagnostics:p.diagnostics||null}))},null,2);
