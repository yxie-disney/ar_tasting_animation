import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createTargetPlayback} from '../site/ar/vertical-playback.js';
import {stagePlacement} from '../site/ar/vertical-stage.js';

function fixture() {
 const jobs = new Map(); let id = 0;
 const clock = {setInterval(fn,ms){assert.equal(ms,1000);jobs.set(++id,fn);return id;},clearInterval(i){jobs.delete(i);}};
 const frames = Array.from({length:5},()=>({visible:true})),stage={visible:true};
 const playback = createTargetPlayback(frames,stage,clock);
 const tick = () => { for (const fn of jobs.values()) fn(); };
 return {playback,frames,stage,jobs,tick};
}
test('no timer before found; exactly 1,2,3,4,5,1 hard-cut sequence',()=>{
 const f=fixture();assert.equal(f.jobs.size,0);assert.equal(f.stage.visible,false);
 f.playback.targetFound();assert.equal(f.jobs.size,1);assert.equal(f.stage.visible,true);
 for (const expected of [0,1,2,3,4,0,1]) {
  assert.equal(f.playback.index,expected);
  assert.deepEqual(f.frames.map(x=>x.visible),f.frames.map((_,i)=>i===expected));f.tick();
 }
});
test('duplicate found is idempotent; lost clears synchronously and reacquires at zero',()=>{
 const f=fixture();f.playback.targetFound();f.tick();f.playback.targetFound();
 assert.equal(f.jobs.size,1);assert.equal(f.playback.index,1);
 const queued=[...f.jobs.values()][0];f.playback.targetLost();
 assert.equal(f.jobs.size,0);assert.equal(f.stage.visible,false);assert.ok(f.frames.every(x=>!x.visible));
 queued();assert.ok(f.frames.every(x=>!x.visible));
 f.playback.targetLost();f.playback.targetFound();assert.equal(f.jobs.size,1);assert.equal(f.playback.index,0);
});
test('1000 acquire/loss cycles never accumulate timers',()=>{
 const f=fixture();for(let i=0;i<1000;i++){f.playback.targetFound();f.playback.targetFound();assert.equal(f.jobs.size,1);f.playback.targetLost();assert.equal(f.jobs.size,0);}
});
test('five measured PNG ratios retain approved 80mm geometry without a target',async()=>{
 for(let i=1;i<=5;i++){
  const bytes=await fs.readFile(`site/ar/assets/slides/feifei-${i}.png`);
  const canvas=[bytes.readUInt32BE(16),bytes.readUInt32BE(20)],p=stagePlacement(canvas);
  assert.ok(Math.abs(p.widthMm/p.heightMm-canvas[0]/canvas[1])<1e-12);
  assert.equal(p.heightMm,80);
  assert.equal(p.frontMm,3);assert.equal(p.depthMm,3);
 }
 assert.throws(()=>stagePlacement([0,1436]));
});
test('animation loader and build do not depend on physical label dimensions or compilation',async()=>{
 const stage=await fs.readFile('site/ar/vertical-stage.js','utf8');
 assert.doesNotMatch(stage,/target\.(width|height)|labelHeight|widthPx|\.mind/);
 const pkg=JSON.parse(await fs.readFile('package.json'));
 assert.doesNotMatch(pkg.scripts.build,/verify-vertical-target/);
});
