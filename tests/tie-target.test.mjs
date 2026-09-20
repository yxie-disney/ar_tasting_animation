import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

test('production tracks only the existing tie crop, never the obsolete full card', async()=>{
 const specs=JSON.parse(await fs.readFile('site/ar/targets.json','utf8'));
 assert.equal(specs.length,1);assert.equal(specs[0].name,'tie-label');
 assert.ok(Math.abs(specs[0].widthMm-432/2126*180)<1e-9);
 const target=JSON.parse(await fs.readFile('site/ar/'+specs[0].file,'utf8'));
 assert.equal(target.type,'PLANAR');assert.equal(target.name,'tie-label');
 const bytes=await fs.readFile('site/ar/'+target.imagePath);
 assert.equal(bytes.readUInt32BE(16),542);assert.equal(bytes.readUInt32BE(20),640);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'d5b5a250d028a9aadf14488ce4a6a47f8cff8a36f7d856c24ebf843a320c1325');
 assert.equal(target.properties.width,542);assert.equal(target.properties.height,640);
});
test('XR8 alone owns renderer DPR; canvas starts viewport-sized and CSS cannot shrink to 300x150',async()=>{
 const app=await fs.readFile('site/ar/app.js','utf8');
 const css=await fs.readFile('site/ar/style.css','utf8');
 assert.doesNotMatch(app,/renderer\.(setPixelRatio|setSize|setViewport)\s*\(/);
 assert.match(app,/canvas\.width = Math\.max\(1, Math\.round\(canvas\.clientWidth\)\)/);
 assert.match(app,/canvas\.height = Math\.max\(1, Math\.round\(canvas\.clientHeight\)\)/);
 assert.match(app,/addEventListener\('resize', resizeCanvas\)/);
 assert.match(app,/removeEventListener\('resize', resizeCanvas\)/);
 assert.match(css,/#camera\{[^}]*width:100%!important;height:100%!important/);
});
test('local replay and private photos are not published',async()=>{
 await assert.rejects(fs.access('site/tests/tie-replay.js'));
 const app=await fs.readFile('site/ar/app.js','utf8');
 assert.doesNotMatch(app,/captureStream|photo-replay|tie-photo|_test/);
});
