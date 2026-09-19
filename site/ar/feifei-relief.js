// Source images are never painted or regenerated. These hand-reviewed regions
// assign depth to the ORIGINAL texels. A continuous mesh joins their edges:
// unlike separating a prop PNG, it needs no invented pixels behind the prop.
// UV annotations below use top-left origin; depths are scene millimetres.
export const RELIEF=Object.freeze({depthMm:3,breathMm:.28,periodSeconds:3.6,segmentsX:96,segmentsY:112,glowStrength:.055});
export const REGIONS=Object.freeze([
 {name:'力士',body:[.57,.56,.42,.42],prop:[[.02,.02],[.97,.03],[.99,.20],[.32,.22],[.17,.31],[.01,.24]],gold:[]},
 {name:'妙音鸟',body:[.54,.48,.39,.39],prop:[[.04,.26],[.25,.29],[.87,.43],[.94,.52],[.85,.57],[.60,.51],[.24,.43],[.02,.39]],gold:[[[.02,.27],[.26,.28],[.28,.42],[.08,.45]],[[.76,.39],[.93,.43],[.93,.55],[.78,.54]]]},
 {name:'岩画',body:[.58,.43,.37,.37],prop:[[.07,.17],[.26,.12],[.34,.24],[.29,.68],[.13,.73],[.04,.62]],gold:[]},
 {name:'螭吻',body:[.49,.65,.41,.31],prop:[[.63,.26],[.82,.27],[.91,.38],[.79,.62],[.69,.89],[.53,.89],[.53,.77],[.70,.45]],gold:[]},
 {name:'角盔',body:[.54,.55,.37,.37],prop:[[.09,.38],[.28,.32],[.44,.44],[.89,.60],[.89,.74],[.71,.76],[.25,.57],[.07,.53]],gold:[]}
]);
const clamp=x=>Math.max(0,Math.min(1,x));
function smooth(a,b,x){const t=clamp((x-a)/(b-a));return t*t*(3-2*t);}
function polygonWeight(x,y,points){
 let inside=false,distance=Infinity;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const [ax,ay]=points[j],[bx,by]=points[i],dx=bx-ax,dy=by-ay;
  if(((ay>y)!==(by>y))&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  const t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy));
  distance=Math.min(distance,Math.hypot(x-ax-t*dx,y-ay-t*dy));
 }
 return smooth(-.016,.016,inside?distance:-distance);
}
export function regionWeights(index,u,v){
 const r=REGIONS[index],x=u,y=1-v;
 const [cx,cy,rx,ry]=r.body;
 const body=smooth(1,0,((x-cx)/rx)**2+((y-cy)/ry)**2);
 const prop=polygonWeight(x,y,r.prop);
 // Feet/pedestal stay at the original plane. No world-depth or scale bobbing.
 const basePin=smooth(.015,.16,v);
 const depth=(.9*body+(RELIEF.depthMm-.9*body)*prop)*basePin;
 const breath=body*(1-prop)*basePin;
 const gold=r.gold.length?Math.max(...r.gold.map(p=>polygonWeight(x,y,p))):0;
 return {depth,breath,gold};
}

export function createReliefGeometry(THREE,index){
 const geometry=new THREE.PlaneGeometry(1,1,RELIEF.segmentsX,RELIEF.segmentsY);
 const uv=geometry.attributes.uv,depth=new Float32Array(uv.count),breath=new Float32Array(uv.count),gold=new Float32Array(uv.count);
 for(let i=0;i<uv.count;i++){
  const weights=regionWeights(index,uv.getX(i),uv.getY(i));depth[i]=weights.depth;breath[i]=weights.breath;gold[i]=weights.gold;
 }
 geometry.setAttribute('reliefDepth',new THREE.BufferAttribute(depth,1));
 geometry.setAttribute('breathWeight',new THREE.BufferAttribute(breath,1));
 geometry.setAttribute('goldWeight',new THREE.BufferAttribute(gold,1));
 return geometry;
}

export function createReliefMaterial(THREE,texture,uniforms){
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.01,depthWrite:true,toneMapped:false});
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='attribute float reliefDepth; attribute float breathWeight; attribute float goldWeight; uniform float reliefAmount; uniform float breathAmount; varying float vGoldWeight;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   transformed.z += reliefDepth * reliefAmount + breathWeight * breathAmount;
   vGoldWeight = goldWeight;`);
  shader.fragmentShader='uniform float glowPhase; uniform float glowStrength; varying float vGoldWeight;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   // Only existing warm pigment in the explicitly selected gold fittings.
   // No new lines, whole-character glow, particles or white-fur recolouring.
   float pigment = smoothstep(0.015,0.09,diffuseColor.r-diffuseColor.b) * smoothstep(0.003,0.035,diffuseColor.g-diffuseColor.b);
   float sweep = pow(max(0.0,cos(vMapUv.y*7.0-glowPhase)),12.0);
   diffuseColor.rgb *= 1.0 + glowStrength*vGoldWeight*pigment*sweep;`);
 };
 material.customProgramCacheKey=()=> 'noterday-feifei-relief-1';
 return material;
}
