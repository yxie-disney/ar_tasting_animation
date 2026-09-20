import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
test('printed QR, cached AR URL and root redirect to animation without losing parameters',async()=>{
 assert.deepEqual(await fs.readdir('site/v3'),['index.html']);
 for(const [file,base] of [['site/v3/index.html','v3/'],['site/ar/index.html','ar/'],['site/index.html','']]){
 const html=await fs.readFile(file,'utf8');
 const script=html.match(/<script>(.*?)<\/script>/s)[1];
 let destination;
 vm.runInNewContext(script,{location:{search:'?release=check',hash:'#scene',replace:value=>{destination=value;}}});
 const url=new URL(destination,'https://local/ar_tasting_animation/'+base);
 assert.equal(url.pathname,'/ar_tasting_animation/animation/');
 assert.equal(url.search,'?release=check');assert.equal(url.hash,'#scene');
 assert.doesNotMatch(html,/camera|getUserMedia|vendor|app\.js/);
 assert.match(html,/http-equiv="refresh" content="0;url=(\.\.\/)?animation\/"/);
 }
 await assert.rejects(fs.access('site/ar/garnish.js'));
});
test('animation destination loads automatically without camera or positioning controls',async()=>{
 const html=await fs.readFile('site/animation/index.html','utf8');
 assert.doesNotMatch(html,/登记|瓶底|瓶盖|重置|测试记录|fixture|preview-controls/);
 const buttons=[...html.matchAll(/<button\b[^>]*>(.*?)<\/button>/gs)];
 assert.equal(buttons.length,1);
 assert.equal(buttons[0][1].trim(),'暂停');
 assert.match(html,/src="viewer.js"/);
 const viewer=await fs.readFile('site/animation/viewer.js','utf8');
 assert.match(viewer,/playback\.targetFound\(\)/);
 assert.doesNotMatch(viewer,/getUserMedia|MindAR|\.mind|vertical-label/);
});

test('deferred AR adapter uses MindAR but is not loaded by the published entry',async()=>{
 const html=await fs.readFile('site/ar/index.html','utf8'),app=await fs.readFile('site/ar/app.js','utf8');
 const imports=[...app.matchAll(/from '\.\/([^']+)'/g)].map(m=>m[1]);
 assert.deepEqual(imports,['vertical-stage.js','vertical-playback.js']);
 for(const file of imports)await fs.access('site/ar/'+file);
 assert.match(app,/mindar-image-three/);
 assert.doesNotMatch(html,/app\.js|mindar/);
 assert.doesNotMatch(html+app,/XR8|vendor\/xr|occupancy|createSlideshow|PoseFilter/);
 assert.match(app,/missTolerance: 0/);
 assert.match(app,/anchor\.onTargetFound = playback\.targetFound/);
 assert.match(app,/anchor\.onTargetLost = playback\.targetLost/);
});
test('every configured target and its image exist',async()=>{
 const specs=JSON.parse(await fs.readFile('site/ar/targets.json','utf8'));
 assert.ok(specs.length>0&&specs.length<=5);
 for(const s of specs){const t=JSON.parse(await fs.readFile('site/ar/'+s.file));assert.equal(t.name,s.name);assert.ok(s.widthMm>0);await fs.access('site/ar/'+t.imagePath);}
});
test('private test harness is not a published page',async()=>{
 await assert.rejects(fs.access('site/tests/mock-camera.js'));
 for(const file of ['card-material.html','card-material.js'])await assert.rejects(fs.access('site/'+file));
 const app=await fs.readFile('site/ar/app.js','utf8');
 assert.doesNotMatch(app,/getUserMedia\s*=|_test\/|Image_2026|C:\\/);
});
