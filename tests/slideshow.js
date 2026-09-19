import {loadSlideAssets,createSlideshow} from '/ar/slideshow.js';
import {STAGE} from '/ar/stage.js';
const frames=await loadSlideAssets(THREE);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(470,880);renderer.setClearColor(0x687572);
const scene=new THREE.Scene(),model=createSlideshow(THREE,frames,renderer);scene.add(model.group);
// A labelled geometry fixture, not a fabricated photo of a passing AR test.
const paper=new THREE.Mesh(new THREE.PlaneGeometry(180,270),new THREE.MeshBasicMaterial({color:0xcfc4ac,side:THREE.DoubleSide}));scene.add(paper);
model.occluder.visible=false;
const tube=new THREE.Mesh(new THREE.CylinderGeometry(14.5,14.5,215,48),new THREE.MeshBasicMaterial({color:0x302b31}));tube.position.set(0,STAGE.centerY,14.5);scene.add(tube);
const camera=new THREE.PerspectiveCamera(65,470/880,1,2000);camera.up.set(0,0,1);camera.position.set(-440,STAGE.centerY,300);camera.lookAt(30,STAGE.centerY,155);camera.updateMatrixWorld(true);
const results=[];
for(let i=0;i<5;i++){
 model.update(i);renderer.render(scene,camera);
 const canvas=document.createElement('canvas');canvas.width=470;canvas.height=880;canvas.getContext('2d').drawImage(renderer.domElement,0,0);document.querySelector('#frames').append(canvas);
 results.push({frame:i+1,station:model.character.position.y,cardPosition:model.card.position.toArray(),glError:renderer.getContext().getError()});
}
document.querySelector('#result').textContent=JSON.stringify(results,null,2);
// A sixth live canvas uses the actual time-based hard-cut updater.
document.querySelector('#frames').append(renderer.domElement);
const start=performance.now();function tick(t){model.update((t-start)/1000);renderer.render(scene,camera);requestAnimationFrame(tick);}requestAnimationFrame(tick);
