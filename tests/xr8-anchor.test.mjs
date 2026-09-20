import test from 'node:test';
import assert from 'node:assert/strict';
import {createXR8Anchor} from '../site/ar/xr8-anchor.js';
import {createTargetPlayback} from '../site/ar/vertical-playback.js';

function fixture(worldEnabled=false) {
  const jobs = new Map(),timeouts=new Map(); let id = 0,t=0;
  const clock={setTimeout(fn,ms){timeouts.set(++id,{fn,at:t+ms});return id;},clearTimeout(key){timeouts.delete(key);}};
  const frames = Array.from({length:5}, () => ({visible:false}));
  const stage = {visible:false};
  const playback = createTargetPlayback(frames, stage, {
    setInterval(fn, ms) { assert.equal(ms,1000); jobs.set(++id,fn); return id; },
    clearInterval(key) { jobs.delete(key); },
  });
  const vector = () => ({set(...values) { this.values = values; }});
  const anchor = {visible:false,position:vector(),quaternion:vector(),scale:{setScalar(value){this.value=value;}}};
  const tracker = createXR8Anchor(anchor,[{name:'label',widthMm:50}],playback,{worldEnabled,clock,now:()=>t});
  const event = {detail:{name:'label',position:{x:1,y:2,z:3},rotation:{x:0,y:0,z:0,w:1},scale:2,scaledWidth:.025}};
  const world=status=>({trackingStatus:status,position:{x:0,y:2,z:0},rotation:{x:0,y:0,z:0,w:1}});
  const advance=ms=>{t+=ms;for(const [key,job] of [...timeouts])if(t>=job.at){timeouts.delete(key);job.fn();}};
  return {tracker,event,anchor,stage,jobs,frames,timeouts,playback,world,advance};
}

test('XR8 width calibration makes local 0.015 metres equal 15mm, without changing the content transform', () => {
  const f=fixture();f.tracker.found(f.event);
  assert.equal(f.anchor.scale.value,1);
  assert.deepEqual(f.anchor.position.values,[1,2,3]);
  assert.deepEqual(f.anchor.quaternion.values,[0,0,0,1]);
  assert.equal(f.stage.visible,true);assert.equal(f.jobs.size,1);
});
test('image-only loss suspends immediately, short reacquisition preserves the current frame', () => {
  const f=fixture();f.tracker.updated(f.event);assert.equal(f.jobs.size,0);
  f.tracker.found(f.event);f.tracker.found(f.event);f.tracker.updated(f.event);
  assert.equal(f.jobs.size,1);
  f.tracker.lost({detail:{name:'other'}});assert.equal(f.jobs.size,1);
  f.tracker.lost(f.event);
  assert.equal(f.jobs.size,0);assert.equal(f.anchor.visible,false);assert.equal(f.stage.visible,false);
  assert.ok(f.frames.every(frame=>!frame.visible));
  f.advance(200);f.tracker.updated(f.event);assert.equal(f.jobs.size,1);
  assert.equal(f.timeouts.size,0);
  f.tracker.reset();f.tracker.updated(f.event);assert.equal(f.jobs.size,0);
});

test('healthy world tracking bridges brief image loss and reacquires without resetting the slideshow',()=>{
 const f=fixture(true);f.tracker.tick(f.world('NORMAL'));f.tracker.found(f.event);f.tracker.tick(f.world('NORMAL'));
 [...f.jobs.values()][0]();assert.equal(f.playback.index,1);
 f.tracker.lost(f.event);assert.equal(f.stage.visible,true);assert.equal(f.jobs.size,1);
 f.advance(600);f.tracker.tick(f.world('NORMAL'));assert.equal(f.anchor.visible,true);
 f.tracker.found(f.event);assert.equal(f.playback.index,1);assert.equal(f.timeouts.size,0);
 f.tracker.reset();
});

test('lost events cannot extend the 1500ms deadline; expiry clears both timers',()=>{
 const f=fixture(true);f.tracker.found(f.event);f.tracker.tick(f.world('NORMAL'));f.tracker.lost(f.event);
 f.advance(1200);f.tracker.lost(f.event);assert.equal(f.timeouts.size,1);
 f.advance(300);assert.equal(f.timeouts.size,0);assert.equal(f.jobs.size,0);assert.equal(f.anchor.visible,false);
 f.tracker.tick(f.world('NORMAL'));assert.equal(f.stage.visible,false);
 f.tracker.found(f.event);assert.equal(f.playback.index,0);f.tracker.reset();
});

test('LIMITED, invalid or stale world poses cannot carry a lost marker or resurrect an invalid anchor',()=>{
 for(const reality of [{trackingStatus:'LIMITED'}, {trackingStatus:'NORMAL',position:{x:NaN},rotation:{}}, undefined]){
  const f=fixture(true);f.tracker.found(f.event);f.tracker.tick(f.world('NORMAL'));f.tracker.lost(f.event);
  f.advance(251);f.tracker.tick(reality);assert.equal(f.anchor.visible,false);assert.equal(f.jobs.size,0);
  f.tracker.tick(f.world('NORMAL'));assert.equal(f.anchor.visible,false);
  f.tracker.found(f.event);f.tracker.tick(f.world('NORMAL'));assert.equal(f.anchor.visible,true);f.tracker.reset();
 }
});

test('world tracking alone never starts content; missing image events expire; identical measured poses stay fresh',()=>{
 const f=fixture(true);f.tracker.tick(f.world('NORMAL'));assert.equal(f.jobs.size,0);
 f.tracker.found(f.event);
 for(let i=0;i<10;i++){f.advance(200);f.tracker.tick({...f.world('NORMAL'),detectedImages:[f.event.detail]});}
 assert.equal(f.timeouts.size,0);assert.equal(f.anchor.visible,true);
 f.advance(401);f.tracker.tick(f.world('NORMAL'));assert.equal(f.timeouts.size,1);
 f.advance(1500);assert.equal(f.anchor.visible,false);assert.equal(f.jobs.size,0);
});

test('1000 brief loss/reacquisition cycles and reset never accumulate expiry or playback timers',()=>{
 const f=fixture();f.tracker.found(f.event);
 for(let i=0;i<1000;i++){f.tracker.lost(f.event);assert.equal(f.timeouts.size,1);assert.equal(f.jobs.size,0);f.tracker.found(f.event);assert.equal(f.timeouts.size,0);assert.equal(f.jobs.size,1);}
 f.tracker.lost(f.event);const queued=[...f.timeouts.values()][0].fn;
 f.tracker.reset();f.tracker.found(f.event);queued();assert.equal(f.jobs.size,1);assert.equal(f.anchor.visible,true);
 f.tracker.reset();assert.equal(f.jobs.size,0);assert.equal(f.timeouts.size,0);
});
test('unknown and invalid XR8 poses cannot start content; backgrounding clears active state', () => {
  const f=fixture();f.tracker.found({detail:{...f.event.detail,name:'other'}});
  f.tracker.found({detail:{...f.event.detail,scale:NaN}});assert.equal(f.jobs.size,0);
  f.tracker.found(f.event);f.tracker.reset();assert.equal(f.jobs.size,0);
  f.tracker.found(f.event);assert.equal(f.jobs.size,1);
});
