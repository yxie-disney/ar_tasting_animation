// Local development only; not included in the published site directory.
const source=document.createElement('canvas');source.width=1280;source.height=720;
const ctx=source.getContext('2d');let fixture='scene';let zoom=1;let requests=0;let frameCount=0;
const images={};const ready=Promise.all(['scene','card'].map(name=>new Promise((resolve,reject)=>{
 const image=new Image();image.onload=()=>{images[name]=image;resolve();};image.onerror=reject;image.src=name==='scene'?'/_test/scene.jpg':'/_test/card.png';
})));
function draw(){
 frameCount++;
 ctx.fillStyle='#c5c0b5';ctx.fillRect(0,0,1280,720);
 if(fixture==='empty'&&images.card){
   const image=images.card;ctx.save();ctx.translate(640,360);ctx.rotate(-Math.PI/2);const fit=Math.min(640/image.width,1150/image.height)*zoom;
   ctx.drawImage(image,-image.width*fit/2,-image.height*fit/2,image.width*fit,image.height*fit);ctx.restore();
 }else if(images.scene){const image=images.scene;const fit=Math.min(1280/image.width,720/image.height)*zoom;ctx.drawImage(image,640-image.width*fit/2,360-image.height*fit/2,image.width*fit,image.height*fit);}
 requestAnimationFrame(draw);
}
draw();
const device={kind:'videoinput',deviceId:'local-fixture',groupId:'fixture',label:'Local photo replay'};
Object.defineProperty(navigator.mediaDevices,'enumerateDevices',{value:async()=>[device]});
Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{requests++;await ready;return source.captureStream(30);}});
addEventListener('DOMContentLoaded',()=>{
 const panel=document.createElement('div');panel.style='position:fixed;z-index:1000;top:0;left:0;color:white;background:#000b;padding:8px;font:12px monospace;max-width:100%';
 panel.innerHTML='<label>Local replay <select id="fixture"><option value="scene">Actual user photograph</option><option value="empty">Empty printed card</option></select></label> <label>Frame scale <input id="zoom" type="range" min="0.65" max="1.3" step="0.05" value="1"></label><pre id="test-report"></pre>';
 document.body.append(panel);panel.querySelector('#fixture').onchange=e=>fixture=e.target.value;panel.querySelector('#zoom').oninput=e=>zoom=Number(e.target.value);
 setInterval(()=>{const d=window.__noterday;
 const project=(x,y)=>{const v=new THREE.Vector3(x,y,0).applyMatrix4(d.anchor.matrixWorld).project(d.camera);return [Math.round((v.x+1)*innerWidth/2),Math.round((1-v.y)*innerHeight/2)];};
 const corners=d?.pose?[[ -90,135],[90,135],[90,-135],[-90,-135]].map(([x,y])=>project(x,y)):null;
 panel.querySelector('#test-report').textContent=JSON.stringify({fixture,requests,frameCount,stage:d?.stage,scanStage:d?.scanStage,acquisitions:d?.acquisitions,state:d?.state,evidence:d?.evidence,target:d?.pose?.target,corners,whitePoint:d?.pose?project(0,96):null},null,2);},500);
});
