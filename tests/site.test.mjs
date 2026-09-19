import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
test('existing printed QR redirects to the only runtime without losing parameters',async()=>{
 const html=await fs.readFile('site/v3/index.html','utf8');
 assert.deepEqual(await fs.readdir('site/v3'),['index.html']);
 const script=html.match(/<script>(.*?)<\/script>/s)[1];
 let destination;
 vm.runInNewContext(script,{location:{search:'?release=check',hash:'#scene',replace:value=>{destination=value;}}});
 assert.equal(new URL(destination,'https://local/ar_tasting_animation/v3/').pathname,'/ar_tasting_animation/ar/');
 assert.equal(destination,'../ar/?release=check#scene');
 assert.doesNotMatch(html,/camera|getUserMedia|vendor|app\.js/);
 await assert.rejects(fs.access('site/ar/garnish.js'));
});
test('printed QR endpoint contains no manual positioning or debug controls',async()=>{
 const html=await fs.readFile('site/ar/index.html','utf8');
 assert.doesNotMatch(html,/登记|瓶底|瓶盖|重置|测试记录|fixture|preview-controls/);
 const buttons=[...html.matchAll(/<button\b[^>]*>(.*?)<\/button>/gs)];
 assert.equal(buttons.length,1);
 assert.equal(buttons[0][1].trim(),'开启相机');
 assert.match(html,/id="start" hidden/);
 assert.match(html,/src="app.js\?release=[\w-]+"/);
});

test('entry point and local modules share an explicit release cache key',async()=>{
 const html=await fs.readFile('site/ar/index.html','utf8'),app=await fs.readFile('site/ar/app.js','utf8');
 const release=html.match(/app\.js\?release=([\w-]+)/)?.[1];
 assert.ok(release);
 const imports=[...app.matchAll(/from '\.\/([^']+)'/g)].map(m=>m[1]);
 assert.equal(imports.length,3);
 for(const file of imports){assert.equal(new URL(file,'https://local/').searchParams.get('release'),release);await fs.access('site/ar/'+file.split('?')[0]);}
 const occupancy=await fs.readFile('site/ar/occupancy.js','utf8');
 assert.equal(new URL(occupancy.match(/from '\.\/([^']+)'/)[1],'https://local/').searchParams.get('release'),release);
 const card=await fs.readFile('site/ar/tasting-card.js','utf8');
 assert.equal(new URL(card.match(/from '\.\/([^']+)'/)[1],'https://local/').searchParams.get('release'),release);
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
