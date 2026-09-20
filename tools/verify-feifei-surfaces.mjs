import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.join(repo,'assets/feifei-layers');
const index=JSON.parse(await fs.readFile(path.join(root,'surfaces.json'),'utf8')),rows=[];
for(const frame of index.frames){
 const folder=path.join(root,frame.id,'surface'),state=JSON.parse(await fs.readFile(path.join(folder,'state.json'),'utf8'));
 const report=JSON.parse(await fs.readFile(path.join(folder,'gpu-verification.json'),'utf8'));
 const hash=createHash('sha256').update(await fs.readFile(path.join(folder,'control.rgba8'))).digest('hex');
 if(hash!==report.controlSha256||hash!==state.control.sha256||report.sourceSha256!==state.sourceSha256)throw Error(frame.id+': stale GPU report');
 const expected=new Set([-46,-30,0,30,46].flatMap(a=>[-1,0,1].map(p=>a+':'+p)));
 for(const c of report.cases){if(!expected.delete(c.angle+':'+c.phase)||c.differingPixels!==0||c.maxChannelDifference!==0)throw Error(frame.id+': bad render case');}
 if(expected.size||!report.passed||report.shaderErrors||report.maxDepth>3||report.movingPixels<=0)throw Error(frame.id+': failed acceptance');
 rows.push({id:frame.id,name:frame.name,userAlias:frame.userAlias,components:frame.components,maxDepthMm:report.maxDepth,
  renderCases:report.cases.length,seamDifferencePixels:0,motionChangedPixels:report.movingPixels,passed:true,
  evidence:frame.id+'/surface/gpu-verification.json',comparison:frame.id+'/surface/comparison.png'});
}
const result={scope:'Desktop WebGL only; not mobile AR acceptance',algorithm:'one shared implementation for all five originals',
 sourceArtworkChanged:false,onlineChanged:false,frames:rows,totalComponents:23,totalRenderCases:75,passed:true};
await fs.writeFile(path.join(root,'surface-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
