// Local photo replay only. Real XR8 detection; never synthesize found events.
const replay=document.createElement('canvas');replay.width=1280;replay.height=720;
const context=replay.getContext('2d');
const photo=new Image();photo.src='/_test/tie-photo.jpg';
const fullControl=new URLSearchParams(location.search).has('full-control');
const targetImage=new Image();targetImage.src=fullControl?'/ar/image-targets/noterday-vertical-01_luminance.png':'/ar/image-targets/tie-label.png';
if(fullControl){const fetchOriginal=window.fetch;window.fetch=(url,...args)=>String(url)==='targets.json'?Promise.resolve(new Response(JSON.stringify([{name:'noterday-vertical-01',widthMm:180,file:'image-targets/noterday-vertical-01.json'}]))):fetchOriginal(url,...args);}
const ready=Promise.all([photo.decode(),targetImage.decode()]);let blank=false,useTarget=false;
function draw(){
 context.fillStyle='#777';context.fillRect(0,0,replay.width,replay.height);
 const image=useTarget?targetImage:photo;
 if(image.complete&&image.naturalWidth&&!blank){
  const s=Math.min(replay.width/image.naturalWidth,replay.height/image.naturalHeight)*(useTarget?.6:1);
  // A 2-pixel translation models hand motion and forces fresh captureStream frames.
  const t=performance.now()/1000;
  context.drawImage(image,(replay.width-image.naturalWidth*s)/2+2*Math.sin(t),(replay.height-image.naturalHeight*s)/2+2*Math.cos(t),image.naturalWidth*s,image.naturalHeight*s);
 }
 requestAnimationFrame(draw);
}
draw();
Object.defineProperty(navigator.mediaDevices,'enumerateDevices',{value:async()=>[{kind:'videoinput',deviceId:'photo-replay',groupId:'local',label:'Supplied photo, not live camera'}]});
Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{await ready;return replay.captureStream(30);}});
const report={found:0,updated:0,lost:0,lastTarget:null,errors:[]};
const nativeInterval=window.setInterval,nativeClear=window.clearInterval,playbackTimers=new Set();
window.setInterval=(callback,delay,...args)=>{const id=nativeInterval(callback,delay,...args);if(delay===1000)playbackTimers.add(id);return id;};
window.clearInterval=id=>{playbackTimers.delete(id);nativeClear(id);};
addEventListener('error',e=>report.errors.push(String(e.message)));
addEventListener('unhandledrejection',e=>report.errors.push(String(e.reason)));
addEventListener('xrloaded',()=>{
 if(new URLSearchParams(location.search).has('tracker-only')){
  const add=XR8.addCameraPipelineModules;
  XR8.addCameraPipelineModules=modules=>add(modules.filter(m=>m.name!=='threejsrenderer'&&m.name!=='noterday-feifei'));
 }
 XR8.addCameraPipelineModule({name:'private-replay-observer',onProcessGpu:({frameStartResult:f})=>{report.input={width:f.textureWidth,height:f.textureHeight,repeat:f.repeatFrame,time:f.videoTime,texture:f.cameraTexture?.name,orientation:f.orientation};},onUpdate:({processCpuResult})=>{const r=processCpuResult?.reality;report.status=r?.trackingStatus;report.reason=r?.trackingReason;report.meanRGB=r?.meanRGB;report.lighting=r?.lighting;report.points=r?.worldPoints?.length;report.detected=r?.detectedImages?.length;},listeners:[
  {event:'reality.imageloading',process:()=>report.scan='loading'},
  {event:'reality.imagescanning',process:()=>report.scan='scanning'},
  {event:'reality.imagefound',process:({detail})=>{report.found++;report.lastTarget=detail.name;}},
  {event:'reality.imageupdated',process:()=>report.updated++},
  {event:'reality.imagelost',process:()=>report.lost++},
 ]});
});
addEventListener('DOMContentLoaded',()=>{
 const panel=document.createElement('section');
 panel.style='position:fixed;z-index:1000;left:0;bottom:0;background:#000b;color:white;padding:8px;font:11px monospace';
 panel.innerHTML='<details><summary>Private photo replay checks</summary><button id="blank-replay">Blank / restore photo</button><button id="target-replay">Photo / target control</button><pre id="replay-report"></pre></details>';
 document.body.append(panel);panel.querySelector('button').onclick=()=>{blank=!blank;};
 panel.querySelector('#target-replay').onclick=()=>{useTarget=!useTarget;};
 setInterval(()=>{
  const canvas=document.querySelector('#camera'),rect=canvas.getBoundingClientRect();
  const scene=window.XR8?.Threejs?.xrScene();
  const anchor=scene?.scene.children.find(child=>child.name==='feifei-anchor');
  const stage=anchor?.getObjectByName('feifei-stage');
  report.blank=blank;report.useTarget=useTarget;report.viewport=[innerWidth,innerHeight];report.canvasCSS=[rect.width,rect.height];report.buffer=[canvas.width,canvas.height];
  report.anchorVisible=anchor?.visible;report.stageVisible=stage?.visible;
  report.frame=stage?.children.filter(c=>c.isGroup&&c.visible).map(c=>c.name);
  const frame=report.stageVisible?report.frame?.join(','):null;
  if(frame&&report.lastFrame===null)(report.starts??=[]).push(frame);
  report.playbackTimers=playbackTimers.size;
  if(frame!==report.lastFrame){report.lastFrame=frame;(report.cuts??=[]).push({frame,atMs:Math.round(performance.now())});if(report.cuts.length>12)report.cuts.shift();}
  panel.querySelector('pre').textContent=JSON.stringify(report,null,2);
 },100);
});
