import {classifyOccupancy} from './tracking.js?release=20260919-feifei-relief';

// Reads the camera background BEFORE virtual content is rendered. This shares the
// exact displayed camera projection, including rotation and cover-cropping.
// No second camera stream, frame upload, or screen-coordinate calibration.
export function createOccupancyProbe(THREE,renderer,camera,anchor){
  const gl=renderer.getContext(), point=new THREE.Vector3();
  let buffer=new Uint8Array(0);
  function project(x,y){
    point.set(x,y,0).applyMatrix4(anchor.matrixWorld).project(camera);
    return {x:Math.round((point.x+1)*.5*gl.drawingBufferWidth),y:Math.round((point.y+1)*.5*gl.drawingBufferHeight),ok:point.z>=-1&&point.z<=1};
  }
  function sample(){
    anchor.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const rows=[];const all=[];
    for(let y=-120;y<=72;y+=6){
      const points=[];for(let x=-12;x<=12;x+=3){const p=project(x,y);points.push(p);all.push(p);}
      rows.push({y,points});
    }
    // Estimate the paper/exposure from the bright tail of BOTH illustration
    // wings. Never assume a fixed bottle cap position or an uncovered title.
    const white=[];for(const x of [-78,-62,-45,45,62,78])for(let y=-112;y<=112;y+=28){const p=project(x,y);white.push(p);all.push(p);}
    const inBounds=p=>p.ok&&p.x>=1&&p.x<gl.drawingBufferWidth-1&&p.y>=1&&p.y<gl.drawingBufferHeight-1;
    const visible=all.filter(inBounds);if(visible.length<100)return {present:false,reason:'out-of-frame'};
    const x0=Math.max(0,Math.min(...visible.map(p=>p.x))-1),y0=Math.max(0,Math.min(...visible.map(p=>p.y))-1);
    const width=Math.min(gl.drawingBufferWidth-x0,Math.max(...visible.map(p=>p.x))-x0+2);
    const height=Math.min(gl.drawingBufferHeight-y0,Math.max(...visible.map(p=>p.y))-y0+2);
    const required=width*height*4;if(buffer.length<required)buffer=new Uint8Array(required);
    const previous=gl.getParameter(gl.FRAMEBUFFER_BINDING);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.readPixels(x0,y0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,buffer);gl.bindFramebuffer(gl.FRAMEBUFFER,previous);
    function luminance(p){
      if(!inBounds(p))return null;
      let sum=0;for(const dx of [-1,0,1]){const i=((p.y-y0)*width+p.x-x0+dx)*4;sum+=.2126*buffer[i]+.7152*buffer[i+1]+.0722*buffer[i+2];}
      return sum/3;
    }
    const reference=white.map(luminance).filter(v=>v!==null).sort((a,b)=>a-b);
    if(reference.length<7)return {present:false,reason:'no-exposure-reference'};
    const paper=reference[Math.floor(reference.length*.85)];
    if(paper<55)return {present:false,reason:'too-dark'};
    const threshold=Math.min(paper*.67,paper-38);
    const features=rows.map(row=>{const values=row.points.map(luminance).filter(v=>v!==null);return {y:row.y,valid:values.length,dark:values.filter(v=>v<threshold).length};});
    return {...classifyOccupancy(features),paper:Math.round(paper),threshold:Math.round(threshold)};
  }
  return {sample};
}
