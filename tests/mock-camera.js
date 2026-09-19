// Local development only; not included in the published site directory.
const source=document.createElement('canvas');source.width=innerWidth<innerHeight?720:1280;source.height=innerWidth<innerHeight?1280:720;
const W=source.width,H=source.height;
const ctx=source.getContext('2d');let fixture='scene';let zoom=1;let requests=0;let frameCount=0;
const images={};const ready=Promise.all(['scene','card'].map(name=>new Promise((resolve,reject)=>{
 const image=new Image();image.onload=()=>{images[name]=image;resolve();};image.onerror=reject;image.src=name==='scene'?'/_test/scene.jpg':'/_test/card.png';
})));
// Explicit startup fault injection verifies automatic image-only fallback.
// It is NOT evidence that real SLAM works in this desktop/photo replay.
let worldSessionFaults=0;
if(new URLSearchParams(location.search).has('world-session-failure'))addEventListener('xrloaded',()=>{
 const run=XR8.run,compatible=XR8.XrDevice.isDeviceBrowserCompatible;
 XR8.XrDevice.isDeviceBrowserCompatible=args=>worldSessionFaults?compatible(args):true;
 XR8.run=options=>{if(!worldSessionFaults){worldSessionFaults++;return Promise.reject(Error('No valid session manager to handle this session.'));}return run(options);};
},{once:true});
function draw(){
 frameCount++;
 ctx.fillStyle='#c5c0b5';ctx.fillRect(0,0,W,H);
 if(fixture==='empty'&&images.card){
   const image=images.card;ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-Math.PI/2);const fit=Math.min(H*.89/image.width,W*.9/image.height)*zoom;
   ctx.drawImage(image,-image.width*fit/2,-image.height*fit/2,image.width*fit,image.height*fit);ctx.restore();
 }else if(images.scene){const image=images.scene;const fit=Math.min(W/image.width,H/image.height)*zoom;ctx.drawImage(image,W/2-image.width*fit/2,H/2-image.height*fit/2,image.width*fit,image.height*fit);}
 requestAnimationFrame(draw);
}
draw();
const device={kind:'videoinput',deviceId:'local-fixture',groupId:'fixture',label:'Local photo replay'};
Object.defineProperty(navigator.mediaDevices,'enumerateDevices',{value:async()=>[device]});
Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{requests++;await ready;return source.captureStream(30);}});
addEventListener('DOMContentLoaded',()=>{
 const panel=document.createElement('div');panel.style='position:fixed;z-index:1000;top:0;left:0;color:white;background:#000b;padding:8px;font:12px monospace;max-width:100%';
 panel.innerHTML='<details open><summary>Local test panel (not published)</summary><label>Local replay <select id="fixture"><option value="scene">Actual user photograph</option><option value="empty">Empty printed card</option></select></label> <label>Frame scale <input id="zoom" type="range" min="0.65" max="1.3" step="0.05" value="1"></label><pre id="test-report"></pre></details>';
 document.body.append(panel);panel.querySelector('#fixture').onchange=e=>fixture=e.target.value;panel.querySelector('#zoom').oninput=e=>zoom=Number(e.target.value);
 setInterval(()=>{const d=window.__noterday;
 const project=(x,y)=>{const v=new THREE.Vector3(x,y,0).applyMatrix4(d.anchor.matrixWorld).project(d.camera);return [Math.round((v.x+1)*innerWidth/2),Math.round((1-v.y)*innerHeight/2)];};
 const corners=d?.pose?[[ -90,135],[90,135],[90,-135],[-90,-135]].map(([x,y])=>project(x,y)):null;
 const virtual=d?.content?.aligned?d.content.card:null;
 const reading=virtual?(()=>{
  const {width,height}=virtual.children[0].geometry.parameters;
  const points=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,y])=>new THREE.Vector3(x*width/2,y*height/2,0).applyMatrix4(virtual.matrixWorld).project(d.camera));
  return {scale:virtual.scale.x,position:virtual.position.toArray(),paperUp:new THREE.Vector3(0,1,0).applyQuaternion(virtual.quaternion).toArray(),viewer:d.anchor.worldToLocal(d.camera.getWorldPosition(new THREE.Vector3())).toArray(),corners:points.map(p=>p.toArray()),fullyVisible:points.every(p=>Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z>-1&&p.z<1)};
 })():null;
 panel.querySelector('#test-report').textContent=JSON.stringify({fixture,requests,frameCount,worldSessionFaults,stage:d?.stage,scanStage:d?.scanStage,worldEnabled:d?.worldEnabled,acquisitions:d?.acquisitions,state:d?.state,evidence:d?.evidence,target:d?.pose?.target,corners,whitePoint:d?.pose?project(0,96):null,reading},null,2);},500);
});
