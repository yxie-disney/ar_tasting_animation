import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
test('printed QR and root enter AR without losing parameters',async()=>{
 assert.deepEqual(await fs.readdir('site/v3'),['index.html']);
 for(const [file,base] of [['site/v3/index.html','v3/'],['site/index.html','']]){
 const html=await fs.readFile(file,'utf8');
 const script=html.match(/<script>(.*?)<\/script>/s)[1];
 let destination;
 vm.runInNewContext(script,{location:{search:'?release=check',hash:'#scene',replace:value=>{destination=value;}}});
 const url=new URL(destination,'https://local/ar_tasting_animation/'+base);
 assert.equal(url.pathname,'/ar_tasting_animation/ar/');
 assert.equal(url.search,'?release=check');assert.equal(url.hash,'#scene');
 assert.doesNotMatch(html,/camera|getUserMedia|vendor|app\.js/);
 assert.match(html,/http-equiv="refresh" content="0;url=(\.\.\/)?ar\/"/);
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

test('AR entry uses the established 8th Wall camera pipeline and fixed metre-space stage',async()=>{
 const html=await fs.readFile('site/ar/index.html','utf8'),app=await fs.readFile('site/ar/app.js','utf8');
 const imports=[...app.matchAll(/from '\.\/([^']+)'/g)].map(m=>m[1]);
 assert.deepEqual(imports,['vertical-stage.js','vertical-playback.js','xr8-anchor.js','xr8-session.js']);
 for(const file of imports)await fs.access('site/ar/'+file);
 assert.match(app,/XR8\.GlTextureRenderer\.pipelineModule/);
 assert.match(html,/src="app\.js"/);
 assert.match(html,/vendor\/xr\/xr\.js/);
 assert.match(html,/id="camera"/);
 assert.doesNotMatch(html,/location\.replace|animation\/|<button/);
 assert.match(app,/slideshow\.position\.set\(0, 0, 0\.015\)/);
 assert.doesNotMatch(app,/startButton|entry-message|playback\.targetFound\(\)/);
 assert.doesNotMatch(html+app,/MindAR|mindar|\.mind|vertical-label|occupancy/);
 assert.match(app,/millimetres\.scale\.setScalar\(\.001\)/);
 for (const event of ['imagefound','imageupdated','imagelost']) assert.ok(app.includes('reality.'+event));
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
