import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
test('printed QR endpoint contains no manual positioning or debug controls',async()=>{
 const html=await fs.readFile('site/v3/index.html','utf8');
 assert.doesNotMatch(html,/登记|瓶底|瓶盖|重置|测试记录|fixture|preview-controls/);
 const buttons=[...html.matchAll(/<button\b[^>]*>(.*?)<\/button>/gs)];
 assert.equal(buttons.length,1);
 assert.equal(buttons[0][1].trim(),'开启相机');
 assert.match(html,/id="start" hidden/);
 assert.match(html,/src="app.js"/);
});
test('every configured target and its image exist',async()=>{
 const specs=JSON.parse(await fs.readFile('site/v3/targets.json','utf8'));
 assert.ok(specs.length>0&&specs.length<=5);
 for(const s of specs){const t=JSON.parse(await fs.readFile('site/v3/'+s.file));assert.equal(t.name,s.name);assert.ok(s.widthMm>0);await fs.access('site/v3/'+t.imagePath);}
});
test('private test harness is not a published page',async()=>{
 await assert.rejects(fs.access('site/tests/mock-camera.js'));
 const app=await fs.readFile('site/v3/app.js','utf8');
 assert.doesNotMatch(app,/getUserMedia\s*=|_test\/|Image_2026|C:\\/);
});
